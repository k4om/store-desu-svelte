import { Type as t, type Static } from "@sinclair/typebox";
import { defineTable, col } from "./Database.ts";

export const productdb = defineTable({
  table: "products",
  primaryKey: "id",
  fields: {
    id: col("product_id", t.Number()),
    label: col("product_name", t.String()),
    desc: col("product_desc", t.Optional(t.String())),
    price: col("product_price", t.Number(), Number),
    stock: col("product_stock", t.Number(), Number),
    categoryId: col("category_id", t.Number()),
  },
});

export type Product = Static<typeof productdb.schema.entity>;
export type productid = Product["id"];