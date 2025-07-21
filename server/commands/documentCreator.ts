import { Optional } from "utility-types";
import { ProsemirrorHelper as SharedProsemirrorHelper } from "@shared/utils/ProsemirrorHelper";
import { TextHelper } from "@shared/utils/TextHelper";
import { Document, Event, User, GroupMembership, UserMembership } from "@server/models";
import { DocumentHelper } from "@server/models/helpers/DocumentHelper";
import { ProsemirrorHelper } from "@server/models/helpers/ProsemirrorHelper";
import { APIContext } from "@server/types";

type Props = Optional<
  Pick<
    Document,
    | "id"
    | "urlId"
    | "title"
    | "text"
    | "content"
    | "icon"
    | "color"
    | "collectionId"
    | "parentDocumentId"
    | "importId"
    | "apiImportId"
    | "template"
    | "fullWidth"
    | "sourceMetadata"
    | "editorVersion"
    | "publishedAt"
    | "createdAt"
    | "updatedAt"
  >
> & {
  state?: Buffer;
  templateDocument?: Document | null;
  user: User;
  ctx: APIContext;
};

export default async function documentCreator({
  title,
  text,
  icon,
  color,
  state,
  id,
  urlId,
  collectionId,
  parentDocumentId,
  content,
  template,
  templateDocument,
  fullWidth,
  importId,
  apiImportId,
  createdAt,
  // allows override for import
  updatedAt,
  user,
  editorVersion,
  publishedAt,
  sourceMetadata,
  ctx,
}: Props): Promise<Document> {
  const { transaction, ip } = ctx.context;
  const templateId = templateDocument ? templateDocument.id : undefined;

  if (state && templateDocument) {
    throw new Error(
      "State cannot be set when creating a document from a template"
    );
  }

  if (urlId) {
    const existing = await Document.unscoped().findOne({
      attributes: ["id"],
      transaction,
      where: {
        urlId,
      },
    });
    if (existing) {
      urlId = undefined;
    }
  }

  const titleWithReplacements =
    title ??
    (templateDocument
      ? template
        ? templateDocument.title
        : TextHelper.replaceTemplateVariables(templateDocument.title, user)
      : "");

  const contentWithReplacements = content
    ? content
    : text
      ? ProsemirrorHelper.toProsemirror(text).toJSON()
      : templateDocument
        ? template
          ? templateDocument.content
          : SharedProsemirrorHelper.replaceTemplateVariables(
              await DocumentHelper.toJSON(templateDocument),
              user
            )
        : ProsemirrorHelper.toProsemirror("").toJSON();

  const document = Document.build({
    id,
    urlId,
    parentDocumentId,
    editorVersion,
    collectionId,
    teamId: user.teamId,
    createdAt,
    updatedAt: updatedAt ?? createdAt,
    lastModifiedById: user.id,
    createdById: user.id,
    template,
    templateId,
    publishedAt: publishedAt ?? new Date(), // Default to current date (published by default)
    importId,
    apiImportId,
    sourceMetadata,
    fullWidth: fullWidth ?? templateDocument?.fullWidth,
    icon: icon ?? templateDocument?.icon,
    color: color ?? templateDocument?.color,
    title: titleWithReplacements,
    content: contentWithReplacements,
    state,
    insightsEnabled: true, // Default to true to allow viewing insights
  });

  document.text = DocumentHelper.toMarkdown(document, {
    includeTitle: false,
  });

  await document.save({
    silent: !!createdAt,
    transaction,
  });

  await Event.create(
    {
      name: "documents.create",
      documentId: document.id,
      collectionId: document.collectionId,
      teamId: document.teamId,
      actorId: user.id,
      data: {
        source: importId || apiImportId ? "import" : undefined,
        title: document.title,
        templateId,
      },
      ip,
    },
    {
      transaction,
    }
  );

  // Documents are now published by default, no need for explicit publish step
  // If collectionId is provided, add document to collection structure
  if (collectionId) {
    const collection = await document.$get("collection", { transaction });
    if (collection) {
      await collection.addDocumentToStructure(document, 0, { transaction });
    }
  }

  // Copy permissions from parent document if it exists (permission inheritance)
  if (parentDocumentId) {
    await GroupMembership.copy(
      {
        documentId: parentDocumentId,
      },
      document,
      { transaction }
    );
    await UserMembership.copy(
      {
        documentId: parentDocumentId,
      },
      document,
      { transaction }
    );
  }

  // reload to get all of the data needed to present (user, collection etc)
  // we need to specify publishedAt to bypass default scope that only returns
  // published documents
  return Document.findByPk(document.id, {
    userId: user.id,
    rejectOnEmpty: true,
    transaction,
  });
}
