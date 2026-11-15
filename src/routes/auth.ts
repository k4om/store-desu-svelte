import { Router } from "express";
import { Type as t } from "@sinclair/typebox";
import argon2 from "argon2";

import { userdb, type userid } from "../db/userdb.ts";
import { DBError } from "../db/core.ts";
import {
  AUTH_COOKIE,
  authCookieOptions,
  signToken,
} from "../auth.ts";
import { validate } from "../validate.ts";

const DUMMY_HASH = await argon2.hash("dummy-password");

const Errors = {
  emailTaken: { message: "Email already registered" },
  createFailed: { message: "Failed to create user" },
  invalidCredentials: { message: "Invalid email or password" },
} as const;

const registerBody = t.Object({
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 8, maxLength: 128 }),
  firstName: t.String({ minLength: 1 }),
  lastName: t.Optional(t.String()),
});

const loginBody = t.Object({
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 1 }),
});

// t.Nullable is an Elysia helper; in plain TypeBox it's a union with Null.
const redirectQuery = t.Object({
  on_success_redirect_to: t.Optional(
    t.Union([t.String({ format: "uri-reference" }), t.Null()]),
  ),
});

/**
 * Only allow same-site relative paths. Rejects "https://evil.com" and
 * protocol-relative "//evil.com" (or "/\evil.com"), which browsers treat as external.
 */
const safeRedirect = (target: unknown): string =>
  typeof target === "string" &&
  target.startsWith("/") &&
  !target.startsWith("//") &&
  !target.startsWith("/\\")
    ? target
    : "/";

const toPublicUser = (u: {
  id: userid;
  email: string;
  firstName: string;
  lastName?: string | undefined;
}) => ({
  id: u.id,
  email: u.email,
  firstName: u.firstName,
  lastName: u.lastName,
});

const api = Router();

api.post(
  "/register",
  validate({ body: registerBody, query: redirectQuery }),
  async (req, res) => {
    const body = req.body as {
      email: string;
      password: string;
      firstName: string;
      lastName?: string;
    };
    const email = body.email.trim().toLowerCase();

    if (await userdb.getBy("email", email)) {
      return res.status(409).json(Errors.emailTaken);
    }

    const created = await userdb.create({
      email,
      pwhash: await argon2.hash(body.password),
      firstName: body.firstName.trim(),
      lastName: body.lastName?.trim() || undefined,
      role: "user",
    });

    // The DB unique constraint is the real guard against races,
    // so ALREADY_EXISTS must still be handled here.
    if (created instanceof DBError) {
      return created.code === "ALREADY_EXISTS"
        ? res.status(409).json(Errors.emailTaken)
        : res.status(500).json(Errors.createFailed);
    }

    const token = await signToken(toPublicUser(created));
    res.cookie(AUTH_COOKIE, token, authCookieOptions);

    res.redirect(safeRedirect(req.query.on_success_redirect_to));
  },
);

api.post(
  "/login",
  validate({ body: loginBody, query: redirectQuery }),
  async (req, res) => {
    const body = req.body as { email: string; password: string };
    const email = body.email.trim().toLowerCase();

    const found = await userdb.getBy("email", email);
    const user = found && !(found instanceof DBError) ? found : null;

    // Always run a verify so both failure paths cost about the same.
    const valid = await argon2.verify(
      user?.pwhash ?? DUMMY_HASH,
      body.password,
    );

    if (!user || !valid) {
      return res.status(401).json(Errors.invalidCredentials);
    }

    const token = await signToken(toPublicUser(user));
    res.cookie(AUTH_COOKIE, token, authCookieOptions);

    res.redirect(safeRedirect(req.query.on_success_redirect_to));
  },
);

api.post("/logout", (_req, res) => {
  // clearCookie must receive the same path/sameSite/etc. the cookie was set with.
  const { maxAge: _maxAge, ...clearOptions } = authCookieOptions;
  res.clearCookie(AUTH_COOKIE, clearOptions);
  res.json({ ok: true });
});

export default api;

/* ------------------------------ Usage (app.ts) ------------------------------ */
// app.use("/auth", authRoutes);