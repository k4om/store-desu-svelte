import { t } from "elysia";
import { defineTable, col, type InferEntity } from "./Database.ts";

export const categorydb = defineTable({
  table: "categories",
  primaryKey: "id",
  fields: {
    id: col("category_id", t.Number()),
    label: col("category_name", t.String()),
    desc: col("category_desc", t.Optional(t.String())),
  },
});

export type Category = InferEntity<typeof categorydb>;