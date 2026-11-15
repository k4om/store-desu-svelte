import { Type as t, type Static } from "@sinclair/typebox";
import { defineTable, col } from "./Database.ts";
import { productdb, type Product } from "./productdb.ts";
import { DBError } from "./core.ts";

const transactionItemTable = defineTable({
  table: "transaction_items",
  primaryKey: ["transactionId", "productId"],
  fields: {
    transactionId: col("transaction_id", t.Number()),
    productId: col("transaction_product_id", t.Number()),
    quantity: col("transaction_item_qty", t.Number()),
    price: col("transaction_item_price", t.Number(), Number),
  },
});

export type BaseTransactionItem = Static<typeof transactionItemTable.schema.entity>;

export type TransactionItem = Omit<
  Static<typeof transactionItemTable.schema.create> & { product: Product },
  "transactionId" | "productId"
>;

export const transactionItemdb = {
  ...transactionItemTable,

  schema: {
    ...transactionItemTable.schema,
    create: t.Object({
      productId: t.Number(),
      quantity: t.Number(),
      price: t.Number(),
    }),
  },

  async wrapMany(rows: BaseTransactionItem[]): Promise<TransactionItem[]> {
    if (!rows.length) return [];

    const products = await productdb.getIn(
      "id",
      [...new Set(rows.map(({ productId }) => productId))],
    );
    const productById = new Map(products.map((product) => [product.id, product]));

    return rows.map(({ productId, quantity, price }) => {
      const product = productById.get(productId);
      if (!product) throw DBError.NotFound;

      return { quantity, price, product: product as unknown as Product };
    });
  },
};
