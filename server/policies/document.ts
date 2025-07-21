import invariant from "invariant";
import filter from "lodash/filter";
import { DocumentPermission, TeamPreference } from "@shared/types";
import { Document, Revision, User, Team } from "@server/models";
import { allow, cannot, can } from "./cancan";
import { and, isTeamAdmin, isTeamModel, isTeamMutable, or } from "./utils";

allow(User, "createDocument", Team, (actor, document) =>
  and(
    //
    !actor.isGuest,
    !actor.isViewer,
    isTeamModel(actor, document),
    isTeamMutable(actor)
  )
);

allow(User, "read", Document, (actor, document) =>
  and(
    isTeamModel(actor, document),
    or(
      includesMembership(document, [
        DocumentPermission.Read,
        DocumentPermission.ReadWrite,
        DocumentPermission.Admin,
      ]),
      and(
        !!document?.isWorkspaceTemplate,
        can(actor, "readTemplate", actor.team)
      ),
      can(actor, "readDocument", document?.collection)
    )
  )
);

allow(User, ["listRevisions", "listViews"], Document, (actor, document) =>
  or(
    and(can(actor, "read", document), !actor.isGuest),
    and(can(actor, "update", document), actor.isGuest)
  )
);

allow(User, "download", Document, (actor, document) =>
  and(
    can(actor, "read", document),
    or(
      and(!actor.isGuest, !actor.isViewer),
      !!actor.team.getPreference(TeamPreference.ViewersCanExport)
    )
  )
);

allow(User, "comment", Document, (actor, document) =>
  and(
    // TODO: We'll introduce a separate permission for commenting
    or(
      and(can(actor, "read", document), !actor.isGuest),
      and(can(actor, "update", document), actor.isGuest)
    ),
    isTeamMutable(actor),
    !!document?.isActive,
    !document?.template,
    or(!document?.collection, document?.collection?.commenting !== false)
  )
);

allow(
  User,
  ["star", "unstar", "subscribe", "unsubscribe"],
  Document,
  (actor, document) =>
    and(
      //
      can(actor, "read", document),
      !document?.template
    )
);

allow(User, "share", Document, (actor, document) =>
  and(
    can(actor, "read", document),
    isTeamMutable(actor),
    !!document?.isActive,
    !document?.template,
    or(!document?.collection, can(actor, "share", document?.collection))
  )
);

allow(User, "update", Document, (actor, document) =>
  and(
    can(actor, "read", document),
    isTeamMutable(actor),
    !!document?.isActive,
    or(
      includesMembership(document, [
        DocumentPermission.ReadWrite,
        DocumentPermission.Admin,
      ]),
      or(
        can(actor, "updateDocument", document?.collection),
        and(
          !!document?.isWorkspaceTemplate,
          or(
            actor.id === document?.createdById,
            can(actor, "updateTemplate", actor.team)
          )
        )
      )
    )
  )
);

// Publishing is no longer needed - documents are always visible by default

allow(User, "manageUsers", Document, (actor, document) =>
  and(
    !document?.template,
    can(actor, "update", document),
    or(
      includesMembership(document, [DocumentPermission.Admin]),
      and(isTeamAdmin(actor, document), can(actor, "read", document)),
      can(actor, "updateDocument", document?.collection)
    )
  )
);

allow(User, "duplicate", Document, (actor, document) =>
  and(
    can(actor, "update", document),
    or(
      includesMembership(document, [DocumentPermission.Admin]),
      and(isTeamAdmin(actor, document), can(actor, "read", document)),
      can(actor, "updateDocument", document?.collection),
      and(
        !!document?.isWorkspaceTemplate,
        or(
          actor.id === document?.createdById,
          can(actor, "updateTemplate", actor.team)
        )
      )
    )
  )
);

allow(User, "move", Document, (actor, document) =>
  and(
    can(actor, "update", document),
    or(
      can(actor, "updateDocument", document?.collection),
      and(
        !!document?.isWorkspaceTemplate,
        or(
          actor.id === document?.createdById,
          can(actor, "updateTemplate", actor.team)
        )
      )
    )
  )
);

allow(User, "createChildDocument", Document, (actor, document) =>
  and(can(actor, "update", document), !document?.template)
);

allow(User, ["updateInsights", "pin", "unpin"], Document, (actor, document) =>
  and(
    can(actor, "update", document),
    can(actor, "update", document?.collection),
    !document?.template,
    !actor.isGuest
  )
);

allow(User, "pinToHome", Document, (actor, document) =>
  and(
    //
    isTeamAdmin(actor, document),
    isTeamMutable(actor),
    !document?.template,
    !!document?.isActive
  )
);

allow(User, "delete", Document, (actor, document) =>
  and(
    isTeamModel(actor, document),
    isTeamMutable(actor),
    !document?.isDeleted,
    or(
      can(actor, "unarchive", document),
      can(actor, "update", document),
      and(!document?.isWorkspaceTemplate, !document?.collection)
    )
  )
);

allow(User, ["restore", "permanentDelete"], Document, (actor, document) =>
  and(
    isTeamModel(actor, document),
    !actor.isGuest,
    !!document?.isDeleted,
    or(
      includesMembership(document, [
        DocumentPermission.ReadWrite,
        DocumentPermission.Admin,
      ]),
      can(actor, "updateDocument", document?.collection),
      and(
        !!document?.isWorkspaceTemplate,
        can(actor, "updateTemplate", actor.team)
      ),
      !document?.collection
    )
  )
);

allow(User, "archive", Document, (actor, document) =>
  and(
    !document?.template,
    !!document?.isActive,
    can(actor, "update", document),
    or(
      includesMembership(document, [DocumentPermission.Admin]),
      and(isTeamAdmin(actor, document), can(actor, "read", document)),
      can(actor, "updateDocument", document?.collection)
    )
  )
);

allow(User, "unarchive", Document, (actor, document) =>
  and(
    !document?.template,
    !document?.isDeleted,
    !!document?.archivedAt,
    can(actor, "read", document),
    or(
      includesMembership(document, [
        DocumentPermission.ReadWrite,
        DocumentPermission.Admin,
      ]),
      can(actor, "updateDocument", document?.collection)
    )
  )
);

allow(
  Document,
  "restore",
  Revision,
  (document, revision) => document.id === revision?.documentId
);

// Unpublish permission removed - documents are always visible by default

function includesMembership(
  document: Document | null,
  permissions: DocumentPermission[]
) {
  if (!document) {
    return false;
  }

  invariant(
    document.memberships,
    "Development: document memberships should be preloaded, did you forget withMembership scope?"
  );
  invariant(
    document.groupMemberships,
    "Development: document groupMemberships should be preloaded, did you forget withMembership scope?"
  );

  const membershipIds = filter(
    [...document.memberships, ...document.groupMemberships],
    (m) => permissions.includes(m.permission as DocumentPermission)
  ).map((m) => m.id);

  return membershipIds.length > 0 ? membershipIds : false;
}
