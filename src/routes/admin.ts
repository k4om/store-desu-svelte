import Elysia, { t } from "elysia";

import { userdb } from "../db/userdb.ts";
import { transactiondb } from "../db/transactiondb.ts";
import { userJWT } from "../jwt.ts";
import { authCookie, roleBasedAccessLimiter, Unauthorized } from "../auth.ts";
import { DBError } from "../db/core.ts";
import { productdb } from "$server/db/productdb.ts";
import { categorydb } from "$server/db/categorydb.ts";
import { transactionItemdb } from "$server/db/transactionitemdb.ts";

const Id = t.Integer({ minimum: 1 });
const idParams = t.Object({ id: Id });

const updateAccountBody = t.Object({
  email: t.Optional(t.String({ format: "email" })),
  firstName: t.Optional(t.String({ minLength: 1 })),
  lastName: t.Optional(t.String()),
  role: t.Optional(t.Union([t.Literal("user"), t.Literal("admin")])),
});

const Errors = {
  emailTaken: { message: "Email already registered" },
  updateFailed: { message: "Failed to update user" },
  deleteFailed: { message: "Failed to delete user" },
  notFound: { message: "User not found" },
} as const;

const toPublicUser = (user: Awaited<ReturnType<typeof userdb.getBy>>) => {
  if (!user) return null;

  const { id, email, firstName, lastName, role } = user;
  return { id, email, firstName, lastName, role };
};

const api = new Elysia({ prefix: "/admin" })
  .use(userJWT)
  .use(roleBasedAccessLimiter)
  .get(
    "/account",
    async () => {
      const users = await userdb.getAll({ sort: { by: "id" } });

      return {
        message: "OK",
        data: users.map((user) => toPublicUser(user)),
      };
    },
    { role: "admin" },
  )
  .get(
    "/account/:id",
    async ({ params, status }) => {
      const user = await userdb.getBy("id", params.id);

      if (!user) return status(404, Errors.notFound);

      return {
        message: "OK",
        data: toPublicUser(user),
      };
    },
    { role: "admin", params: idParams },
  )
  .put(
    "/account/:id",
    async ({ params, body, status }) => {
      const existing = await userdb.getBy("id", params.id);

      if (!existing) return status(404, Errors.notFound);

      const email = body.email?.trim().toLowerCase();

      if (email) {
        const emailOwner = await userdb.getBy("email", email);

        if (emailOwner && emailOwner.id !== params.id) {
          return status(409, Errors.emailTaken);
        }
      }

      const updated = await userdb.update({
        id: params.id,
        ...(email !== undefined && { email }),
        ...(body.firstName !== undefined && {
          firstName: body.firstName.trim(),
        }),
        ...(body.lastName !== undefined && {
          lastName: body.lastName.trim(),
        }),
        ...(body.role !== undefined && { role: body.role }),
      });

      if (updated instanceof DBError) {
        if (updated.code === "ALREADY_EXISTS") {
          return status(409, Errors.emailTaken);
        }

        return status(500, Errors.updateFailed);
      }

      return {
        message: "OK",
        data: toPublicUser(updated),
      };
    },
    {
      role: "admin",
      params: idParams,
      body: updateAccountBody,
    },
  )
  .delete(
    "/account/:id",
    async ({ params, status }) => {
      const deleted = await userdb.delete(params.id);

      if (!deleted) return status(404, Errors.notFound);

      return { message: "OK" };
    },
    { role: "admin", params: idParams },
  )
  .get(
    "/account/:id/transaction",
    async ({ params, status }) => {
      const user = await userdb.getBy("id", params.id);

      if (!user) return status(404, Errors.notFound);

      return {
        message: "OK",
        data: await transactiondb.wrapMany(
          await transactiondb.getAllBy("id", params.id),
        ),
      };
    },
    { role: "admin", params: idParams },
  )
  .get(
    "/stats",
    async () => {
      const [
        userCount,
        productCount,
        categoryCount,
        transactionCount,
        revenue,
      ] = await Promise.all([
        userdb.count("id"),
        productdb.count("id"),
        categorydb.count("id"),
        transactiondb.count("id"),
        transactiondb.sum("total"),
      ]);

      return {
        message: "OK",
        data: {
          userCount,
          productCount,
          categoryCount,
          transactionCount,
          revenue,
        },
      };
    },
    { role: "admin", cookie: authCookie },
  )
  .get(
    "/report",
    async () => {
      const [transactions, revenue, itemsSold, customers] = await Promise.all([
        transactiondb.count("id"),
        transactiondb.sum("total"),
        transactionItemdb.sum("quantity"),
        transactiondb.count("buyerId", { distinct: true }),
      ]);

      return {
        message: "OK",
        data: {
          transactions,
          revenue,
          itemsSold,
          customers,
        },
      };
    },
    { role: "admin", cookie: authCookie },
  )
  .get(
    "/global-transaction/recent",
    async () => {
      const [recentTransactions] = await Promise.all([
        transactiondb.wrapMany(
          await transactiondb.getAll({
            sort: { by: "id", order: "DESC" },
            limit: 10,
          }),
        ),
      ]);

      return {
        message: "OK",
        data: recentTransactions,
      };
    },
    { role: "admin", cookie: authCookie },
  )
  .get(
    "/global-transaction/all",
    async () => {
      const [allTransactions] = await Promise.all([
        transactiondb.wrapMany(
          await transactiondb.getAll({
            sort: { by: "id", order: "DESC" },
          }),
        ),
      ]);

      return {
        message: "OK",
        data: allTransactions,
      };
    },
    { role: "admin", cookie: authCookie },
  );

export default api;
