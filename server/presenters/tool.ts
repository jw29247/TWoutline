import { Tool } from "@server/models";
import { APIContext } from "@server/types";

export default function presentTool(ctx: APIContext, tool: Tool) {
  return {
    id: tool.id,
    title: tool.title,
    icon: tool.icon,
    url: tool.url,
    position: tool.position,
    teamId: tool.teamId,
    createdById: tool.createdById,
    createdAt: tool.createdAt,
    updatedAt: tool.updatedAt,
  };
}
