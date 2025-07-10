import { User, Team, Tool } from "@server/models";
import { allow } from "./cancan";
import { and, isTeamMember, isTeamAdmin } from "./utils";

allow(User, "createTool", Team, (actor, team) =>
  and(isTeamMember(actor, team), isTeamAdmin(actor, team))
);

allow(User, "updateTool", Team, (actor, team) =>
  and(isTeamMember(actor, team), isTeamAdmin(actor, team))
);

allow(User, "read", Tool, (actor, tool) => isTeamMember(actor, tool.teamId));

allow(User, "update", Tool, (actor, tool) =>
  and(isTeamMember(actor, tool.teamId), isTeamAdmin(actor, tool.teamId))
);

allow(User, "delete", Tool, (actor, tool) =>
  and(isTeamMember(actor, tool.teamId), isTeamAdmin(actor, tool.teamId))
);
