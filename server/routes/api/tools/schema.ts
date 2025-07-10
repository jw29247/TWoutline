import { z } from "zod";
import { BaseSchema } from "@server/routes/api/schema";

export const ToolsListSchema = BaseSchema.extend({
  body: z.object({}),
});

export type ToolsListSchemaReq = z.infer<typeof ToolsListSchema>;

export const ToolsCreateSchema = BaseSchema.extend({
  body: z.object({
    title: z.string().min(1).max(255),
    icon: z.string().min(1).max(2),
    url: z.string().url(),
  }),
});

export type ToolsCreateSchemaReq = z.infer<typeof ToolsCreateSchema>;

export const ToolsUpdateSchema = BaseSchema.extend({
  body: z.object({
    id: z.string().uuid(),
    title: z.string().min(1).max(255).optional(),
    icon: z.string().min(1).max(2).optional(),
    url: z.string().url().optional(),
  }),
});

export type ToolsUpdateSchemaReq = z.infer<typeof ToolsUpdateSchema>;

export const ToolsDeleteSchema = BaseSchema.extend({
  body: z.object({
    id: z.string().uuid(),
  }),
});

export type ToolsDeleteSchemaReq = z.infer<typeof ToolsDeleteSchema>;

export const ToolsReorderSchema = BaseSchema.extend({
  body: z.object({
    tools: z.array(
      z.object({
        id: z.string().uuid(),
        position: z.number().int().min(0),
      })
    ),
  }),
});

export type ToolsReorderSchemaReq = z.infer<typeof ToolsReorderSchema>;
