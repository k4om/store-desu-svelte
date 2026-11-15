import { Router } from "express";
import { Type as t, type Static } from "@sinclair/typebox";
import argon2 from "argon2";

import {
  AUTH_COOKIE,
  authCookieOptions,
  requireRole,
  signToken,
} from "../auth.ts";
import { validate } from "../validate.ts";
import { userdb } from "../db/userdb.ts";
import { transactiondb } from "../db/transactiondb.ts";
import { DBError } from "../db/core.ts";
import { productdb } from "../db/productdb.ts";

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName?: string;
  role: string;
}

const Errors = {
  createTransactionFailed: { message: "Failed to create transaction" },
  emailTaken: { message: "Email already taken" },
  updateFailed: { message: "Failed to update profile" },
} as const;

const updateProfileBody = t.Object({
  email: t.Optional(t.String({ format: "email" })),
  firstName: t.Optional(t.String({ minLength: 1 })),
  lastName: t.Optional(t.Union([t.String(), t.Null()])),
  password: t.Optional(t.String({ minLength: 8, maxLength: 128 })),
});

const createTransactionBody = t.Object({
  items: t.Array(
    t.Object({
      productId: t.Number(),
      quantity: t.Integer({ minimum: 1 }),
    }),
    { minItems: 1 },
  ),
});

const api = Router();

// Every route here requires a logged-in user. requireRole verifies the cookie,
// loads the user from the DB, and sets req.user (without pwhash), which replaces
// the manual `userjwt.verify(auth.value)` calls in each Elysia handler.
api.use(requireRole("user"));

api.get("/", (req, res) => {
  const { id, email, firstName, lastName, role } = req.user!;

  res.json({
    message: "OK",
    data: { id, email, firstName, lastName, role } satisfies User,
  });
});

api.put("/", validate({ body: updateProfileBody }), async (req, res) => {
  const profile = req.user!;
  const body = req.body as Static<typeof updateProfileBody>;

  const email = body.email?.trim().toLowerCase();
  const firstName = body.firstName?.trim();
  const lastName = body.lastName?.trim() || undefined;
  const pwhash =
    body.password !== undefined ? await argon2.hash(body.password) : undefined;

  if (email) {
    const existing = await userdb.getBy("email", email);

    if (existing && existing.id !== profile.id) {
      return res.status(409).json(Errors.emailTaken);
    }
  }

  const updated = await userdb.update({
    id: profile.id,
    ...(email !== undefined && { email }),
    ...(firstName !== undefined && { firstName }),
    ...(pwhash !== undefined && { pwhash }),
    ...(body.lastName !== undefined && {
      lastName: lastName || undefined,
    }),
  });

  if (updated instanceof DBError) {
    return res.status(500).json(Errors.updateFailed);
  }

  const publicUser = {
    id: updated.id,
    email: updated.email,
    firstName: updated.firstName,
    lastName: updated.lastName,
    role: updated.role,
  } satisfies User;

  // Refresh JWT with updated user information.
  res.cookie(AUTH_COOKIE, await signToken(publicUser), authCookieOptions);

  res.json({ message: "OK", data: publicUser });
});

api.get("/transaction", async (req, res) => {
  res.json({
    message: "OK",
    data: await transactiondb.wrapMany(
      await transactiondb.getAllBy("buyerId", req.user!.id, {
        sort: { by: "id", order: "DESC" },
      }),
    ),
  });
});

api.post(
  "/transaction",
  validate({ body: createTransactionBody }),
  async (req, res) => {
    const body = req.body as Static<typeof createTransactionBody>;

    // Merge duplicate lines (same productId twice) so the stock check below is correct.
    const wanted = new Map<number, number>();
    for (const { productId, quantity } of body.items) {
      wanted.set(productId, (wanted.get(productId) ?? 0) + quantity);
    }

    const products = await Promise.all(
      [...wanted.keys()].map((id) => productdb.getBy("id", id)),
    );

    if (products.some((p) => !p)) {
      return res.status(400).json({ message: "Invalid product" });
    }

    const items = [...wanted].map(([productId, quantity], i) => ({
      productId,
      quantity,
      price: products[i]!.price,
    }));

    // Fast-fail check. This is NOT race-safe on its own: two buyers can both pass it.
    // The real guard is the conditional decrement inside transactiondb.create (see notes).
    const insufficient = items
      .filter((item, i) => products[i]!.stock < item.quantity)
      .map((item) => item.productId);

    if (insufficient.length > 0) {
      return res
        .status(409)
        .json({ message: "Insufficient stock", data: insufficient });
    }

    const created = await transactiondb.create({
      buyerId: req.user!.id,
      items,
    });

    if (created instanceof DBError) {
      // Lost a race: another order took the stock after the pre-check above.
      return created.code === "DATABASE_ERROR"
        ? res.status(409).json({ message: "Insufficient stock" })
        : res.status(500).json(Errors.createTransactionFailed);
    }

    res.status(201).json({ message: "OK", data: created });
  },
);

api.delete("/account", async (req, res) => {
  // The Elysia version didn't await this, so failures were silently ignored.
  await userdb.delete(req.user!.id);

  res.json({ message: "OK" });
});

export default api;

/* ------------------------------ Usage (app.ts) ------------------------------ */
// app.use("/me", userRoutes);