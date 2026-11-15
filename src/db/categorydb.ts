import { Type as t, type Static } from "@sinclair/typebox";
import { defineTable, col } from "./Database.ts";

export const categorydb = defineTable({
  table: "categories",
  primaryKey: "id",
  fields: {
    id: col("category_id", t.Number()),
    label: col("category_name", t.String()),
    desc: col("category_desc", t.Optional(t.String())),
  },
});

export type Category = Static<typeof categorydb.schema.entity>;
export type categoryid = Category["id"];