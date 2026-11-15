import { Type as t, type Static } from "@sinclair/typebox";
import { defineTable, col } from "./Database.ts";
import { DBError } from "./core.ts";
import { productdb } from "./productdb.ts";
import {
  transactionItemdb,
  type BaseTransactionItem,
  type TransactionItem,
} from "./transactionitemdb.ts";
import { type userid, userdb, type User } from "./userdb.ts";

const createSchema = t.Object({
  buyerId: t.Number(),
  items: t.Array(transactionItemdb.schema.create, { minItems: 1 }),
});

export type CreateData = Static<typeof createSchema>;

const transactionTable = defineTable(
  {
    table: "transactions",
    primaryKey: "id",
    fields: {
      id: col("transaction_id", t.Number()),
      buyerId: col("transaction_buyer_id", t.Number()),
      total: col("transaction_price_total", t.Number(), Number),
    },
  },
  ({ base, pool }) => ({
    async create({
      buyerId,
      items,
    }: CreateData): Promise<Transaction | DBError> {
      const total = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        // Decrement stock first. Each UPDATE is conditional (stock >= quantity), so
        // if any line can't be fulfilled we throw and the ROLLBACK below undoes the
        // lines that already succeeded. Rows are locked in productId order so two
        // concurrent orders with overlapping products can't deadlock each other.
        const byProduct = [...items].sort((a, b) => a.productId - b.productId);

        for (const { productId, quantity } of byProduct) {
          const ok = await productdb.decrementStock(productId, quantity, {
            client,
          });
          if (!ok) throw DBError.DatabaseError;
        }

        const transaction = await base.create({ buyerId, total }, { client });
        if (transaction instanceof DBError) throw transaction;

        const createdItems: BaseTransactionItem[] = [];

        for (const item of items) {
          const created = await transactionItemdb.create(
            { ...item, transactionId: transaction.id },
            { client },
          );
          if (created instanceof DBError) throw created;
          createdItems.push(created);
        }

        const [wrappedItems, buyer] = await Promise.all([
          transactionItemdb.wrapMany(createdItems),
          userdb.getBy("id", buyerId),
        ]);

        if (!buyer) throw DBError.NotFound;

        await client.query("COMMIT");

        return (await wrapMany([transaction]))[0];
      } catch (err) {
        await client.query("ROLLBACK");
        if (err instanceof DBError) return err;
        console.error(err);
        return DBError.DatabaseError;
      } finally {
        client.release();
      }
    },
  }),
);

export type BaseTransaction = Static<typeof transactionTable.schema.entity>;

export type Transaction = Omit<
  BaseTransaction & {
    items: TransactionItem[];
    buyer: Omit<User, "email" | "pwhash" | "role">;
  },
  "buyerId"
>;

export type transactionid = Transaction["id"];

async function wrapMany(rawTransactions: BaseTransaction[]): Promise<Transaction[]> {
  if (!rawTransactions.length) return [];

  const [rawItems, buyers] = await Promise.all([
    transactionItemdb.getIn(
      "transactionId",
      rawTransactions.map(({ id }) => id),
    ),
    userdb.getIn("id", [...new Set(rawTransactions.map(({ buyerId }) => buyerId))]),
  ]);

  const wrappedItems = await transactionItemdb.wrapMany(rawItems);
  const itemsByTransactionId = new Map<transactionid, TransactionItem[]>();

  rawItems.forEach(({ transactionId }, i) => {
    const items = itemsByTransactionId.get(transactionId) ?? [];
    items.push(wrappedItems[i]);
    itemsByTransactionId.set(transactionId, items);
  });

  const buyersByUserId = new Map<userid, User>(
    buyers.map((buyer) => [buyer.id, buyer]),
  );

  return rawTransactions.map(({ id, buyerId, total }) => {
    const buyer = buyersByUserId.get(buyerId);
    if (!buyer) throw DBError.NotFound;

    return {
      id,
      total,
      buyer: {
        id: buyer.id,
        firstName: buyer.firstName,
        lastName: buyer.lastName,
      },

      items: itemsByTransactionId.get(id) ?? [],
    };
  });
}

export const transactiondb = {
  ...transactionTable,
  schema: { ...transactionTable.schema, create: createSchema },
  wrapMany,
  wrap: async (rawTransaction: BaseTransaction) => (await wrapMany([rawTransaction]))[0],
};