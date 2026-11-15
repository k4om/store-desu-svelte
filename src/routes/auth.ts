import Elysia, { t } from "elysia";
import argon2 from "argon2";

import { userdb, type userid } from "../db/userdb.ts";
import { DBError } from "../db/core.ts";
import { authCookie } from "../auth.ts";
import { userJWT } from "../jwt.ts";

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

const redirectQuery = t.Object({
  on_success_redirect_to: t.Optional(t.Nullable(t.String({ format: "uri-reference" })))
});

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

const api = new Elysia({ prefix: "/auth" })
  .use(userJWT)
  .post(
    "/register",
    async ({ userjwt, body, query, cookie: { auth }, status, redirect }) => {
      const email = body.email.trim().toLowerCase();

      if (await userdb.getBy("email", email)) {
        return status(409, Errors.emailTaken);
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
          ? status(409, Errors.emailTaken)
          : status(500, Errors.createFailed);
      }

      const publicUser = toPublicUser(created);
      auth.value = await userjwt.sign(publicUser);

      return redirect(query.on_success_redirect_to || "/");
    },
    { body: registerBody, query: redirectQuery, cookie: authCookie },
  )
  .post(
    "/login",
    async ({ userjwt, body, query, cookie: { auth }, status, redirect }) => {
      const email = body.email.trim().toLowerCase();

      const found = await userdb.getBy("email", email);
      const user = found && !(found instanceof DBError) ? found : null;

      // Always run a verify so both failure paths cost about the same.
      const valid = await argon2.verify(
        user?.pwhash ?? DUMMY_HASH,
        body.password,
      );

      if (!user || !valid) {
        return status(401, Errors.invalidCredentials);
      }

      const publicUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      auth.value = await userjwt.sign(publicUser);
      console.log("Self verification:", await userjwt.verify(auth.value));

      return redirect(query.on_success_redirect_to || "/");
    },
    { body: loginBody, query: redirectQuery, cookie: authCookie },
  )
  .post(
    "/logout",
    ({ cookie: { auth } }) => {
      auth.remove();
      return { ok: true };
    },
    { cookie: authCookie },
  )

export default api;