import { Router } from "express";
import { Type as t, type Static } from "@sinclair/typebox";

import { userdb } from "../db/userdb.ts";
import { transactiondb } from "../db/transactiondb.ts";
import { requireRole } from "../auth.ts";
import { validate } from "../validate.ts";
import { DBError } from "../db/core.ts";
import { productdb } from "../db/productdb.ts";
import { categorydb } from "../db/categorydb.ts";
import { transactionItemdb } from "../db/transactionitemdb.ts";

/* ---------------------------------- Schemas --------------------------------- */

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

/* --------------------------------- Helpers ---------------------------------- */

const toPublicUser = (user: Awaited<ReturnType<typeof userdb.getBy>>) => {
  if (!user) return null;

  const { id, email, firstName, lastName, role } = user;
  return { id, email, firstName, lastName, role };
};

/* ---------------------------------- Router ---------------------------------- */

const api = Router();

// Every route in this router is admin-only.
// requireRole must verify the JWT cookie and check the role (see notes).
api.use(requireRole("admin"));

api.get("/account", async (_req, res) => {
  const users = await userdb.getAll({ sort: { by: "id" } });

  res.json({
    message: "OK",
    data: users.map((user) => toPublicUser(user)),
  });
});

api.get(
  "/account/:id",
  validate({ params: idParams }),
  async (req, res) => {
    const id = Number(req.params.id);
    const user = await userdb.getBy("id", id);

    if (!user) return res.status(404).json(Errors.notFound);

    res.json({
      message: "OK",
      data: toPublicUser(user),
    });
  },
);

api.put(
  "/account/:id",
  validate({ params: idParams, body: updateAccountBody }),
  async (req, res) => {
    const id = Number(req.params.id);
    const body = req.body as Static<typeof updateAccountBody>;

    const existing = await userdb.getBy("id", id);

    if (!existing) return res.status(404).json(Errors.notFound);

    const email = body.email?.trim().toLowerCase();

    if (email) {
      const emailOwner = await userdb.getBy("email", email);

      if (emailOwner && emailOwner.id !== id) {
        return res.status(409).json(Errors.emailTaken);
      }
    }

    const updated = await userdb.update({
      id,
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
        return res.status(409).json(Errors.emailTaken);
      }

      return res.status(500).json(Errors.updateFailed);
    }

    res.json({
      message: "OK",
      data: toPublicUser(updated),
    });
  },
);

api.delete(
  "/account/:id",
  validate({ params: idParams }),
  async (req, res) => {
    const deleted = await userdb.delete(Number(req.params.id));

    if (!deleted) return res.status(404).json(Errors.notFound);

    res.json({ message: "OK" });
  },
);

api.get(
  "/account/:id/transaction",
  validate({ params: idParams }),
  async (req, res) => {
    const id = Number(req.params.id);
    const user = await userdb.getBy("id", id);

    if (!user) return res.status(404).json(Errors.notFound);

    res.json({
      message: "OK",
      data: await transactiondb.wrapMany(
        await transactiondb.getAllBy("id", id),
      ),
    });
  },
);

api.get("/stats", async (_req, res) => {
  const [userCount, productCount, categoryCount, transactionCount, revenue] =
    await Promise.all([
      userdb.count("id"),
      productdb.count("id"),
      categorydb.count("id"),
      transactiondb.count("id"),
      transactiondb.sum("total"),
    ]);

  res.json({
    message: "OK",
    data: {
      userCount,
      productCount,
      categoryCount,
      transactionCount,
      revenue,
    },
  });
});

api.get("/report", async (_req, res) => {
  const [transactions, revenue, itemsSold, customers] = await Promise.all([
    transactiondb.count("id"),
    transactiondb.sum("total"),
    transactionItemdb.sum("quantity"),
    transactiondb.count("buyerId", { distinct: true }),
  ]);

  res.json({
    message: "OK",
    data: { transactions, revenue, itemsSold, customers },
  });
});

api.get("/global-transaction/recent", async (_req, res) => {
  const recentTransactions = await transactiondb.wrapMany(
    await transactiondb.getAll({
      sort: { by: "id", order: "DESC" },
      limit: 10,
    }),
  );

  res.json({ message: "OK", data: recentTransactions });
});

api.get("/global-transaction/all", async (_req, res) => {
  const allTransactions = await transactiondb.wrapMany(
    await transactiondb.getAll({
      sort: { by: "id", order: "DESC" },
    }),
  );

  res.json({ message: "OK", data: allTransactions });
});

export default api;

/* ------------------------------ Usage (app.ts) ------------------------------ */
// import express from "express";
// import cookieParser from "cookie-parser";
// import admin from "./routes/admin.ts";
//
// const app = express();
// app.use(express.json());
// app.use(cookieParser());
// app.use("/admin", admin);   // replaces `new Elysia({ prefix: "/admin" })`
// app.listen(3000);