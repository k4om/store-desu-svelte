import { Type as t, type Static } from "@sinclair/typebox";
import type { PoolClient } from "pg";
import { defineTable, col } from "./Database.ts";

export const productdb = defineTable(
  {
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
  },
  ({ pool }) => ({
    /**
     * Atomically subtracts `quantity` from a product's stock, only if enough is left.
     * Returns false if the product doesn't exist or doesn't have enough stock.
     *
     * Pass the `client` of an open transaction so the decrement commits or rolls
     * back together with the order.
     *
     * The check and the subtraction are one statement, so concurrent orders can't
     * both pass the check and oversell: Postgres locks the row, and the second
     * UPDATE re-evaluates `product_stock >= $1` against the already-reduced value.
     */
    async decrementStock(
      id: number,
      quantity: number,
      { client }: { client?: PoolClient } = {},
    ): Promise<boolean> {
      const result = await (client ?? pool).query(
        `UPDATE products
            SET product_stock = product_stock - $1
          WHERE product_id = $2
            AND product_stock >= $1`,
        [quantity, id],
      );

      return result.rowCount === 1;
    },
  }),
);

export type Product = Static<typeof productdb.schema.entity>;
export type productid = Product["id"];