import Router from "koa-router";
import { Transaction } from "sequelize";
import auth from "@server/middlewares/authentication";
import { Tool } from "@server/models";
import { authorize } from "@server/policies";
import { presentPolicies } from "@server/presenters/policy";
import presentTool from "@server/presenters/tool";
import { APIContext } from "@server/types";
import pagination from "../middlewares/pagination";
import {
  ToolsListSchema,
  ToolsCreateSchema,
  ToolsUpdateSchema,
  ToolsDeleteSchema,
  ToolsReorderSchema,
} from "./schema";

const router = new Router();

// List all tools for the team
router.post(
  "tools.list",
  auth(),
  pagination(),
  async (ctx: APIContext<ToolsListSchema>) => {
    const { user } = ctx.state.auth;

    const tools = await Tool.findAll({
      where: {
        teamId: user.teamId,
      },
      order: [
        ["position", "ASC"],
        ["createdAt", "ASC"],
      ],
      offset: ctx.state.pagination.offset,
      limit: ctx.state.pagination.limit,
    });

    const data = tools.map((tool) => presentTool(ctx, tool));

    const policies = presentPolicies(user, tools);

    ctx.body = {
      pagination: ctx.state.pagination,
      data,
      policies,
    };
  }
);

// Create a new tool
router.post(
  "tools.create",
  auth(),
  async (ctx: APIContext<ToolsCreateSchema>) => {
    const { title, icon, url } = ctx.input.body;
    const { user } = ctx.state.auth;

    authorize(user, user.team, "createTool");

    // Get the next position
    const maxPosition = await Tool.max("position", {
      where: { teamId: user.teamId },
    });

    const tool = await Tool.create({
      title,
      icon,
      url,
      position: ((maxPosition as number) || 0) + 1,
      teamId: user.teamId,
      createdById: user.id,
    });

    const data = presentTool(ctx, tool);
    const policies = presentPolicies(user, [tool]);

    ctx.body = {
      data,
      policies,
    };
  }
);

// Update a tool
router.post(
  "tools.update",
  auth(),
  async (ctx: APIContext<ToolsUpdateSchema>) => {
    const { id, title, icon, url } = ctx.input.body;
    const { user } = ctx.state.auth;

    const tool = await Tool.findOne({
      where: {
        id,
        teamId: user.teamId,
      },
    });

    if (!tool) {
      ctx.throw(404, "Tool not found");
    }

    authorize(user, tool, "update");

    await tool.update({
      title: title ?? tool.title,
      icon: icon ?? tool.icon,
      url: url ?? tool.url,
    });

    const data = presentTool(ctx, tool);
    const policies = presentPolicies(user, [tool]);

    ctx.body = {
      data,
      policies,
    };
  }
);

// Delete a tool
router.post(
  "tools.delete",
  auth(),
  async (ctx: APIContext<ToolsDeleteSchema>) => {
    const { id } = ctx.input.body;
    const { user } = ctx.state.auth;

    const tool = await Tool.findOne({
      where: {
        id,
        teamId: user.teamId,
      },
    });

    if (!tool) {
      ctx.throw(404, "Tool not found");
    }

    authorize(user, tool, "delete");

    await tool.destroy();

    ctx.body = {
      success: true,
    };
  }
);

// Reorder tools
router.post(
  "tools.reorder",
  auth(),
  async (ctx: APIContext<ToolsReorderSchema>) => {
    const { tools } = ctx.input.body;
    const { user } = ctx.state.auth;

    authorize(user, user.team, "updateTool");

    await Tool.sequelize!.transaction(async (transaction: Transaction) => {
      await Promise.all(
        tools.map((tool) =>
          Tool.update(
            { position: tool.position },
            {
              where: {
                id: tool.id,
                teamId: user.teamId,
              },
              transaction,
            }
          )
        )
      );
    });

    ctx.body = {
      success: true,
    };
  }
);

export default router;
