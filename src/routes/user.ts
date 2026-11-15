import Elysia, { t, type Static } from "elysia";

import { userJWT } from "../jwt.ts";
import { authCookie, roleBasedAccessLimiter, Unauthorized } from "../auth.ts";
import { userdb } from "../db/userdb.ts";
import { transactiondb } from "../db/transactiondb.ts";
import { transactionItemdb } from "../db/transactionitemdb.ts";
import { DBError } from "../db/core.ts";
import { productdb } from "../db/productdb.ts";
import argon2 from "argon2";

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

const api = new Elysia({ prefix: "/me" })
  .use(userJWT)
  .use(roleBasedAccessLimiter)
  .get(
    "/",
    async ({ userjwt, cookie: { auth }, status }) => {
      const profile = auth.value && (await userjwt.verify(auth.value));
      if (!profile) return status(401, Unauthorized);

      const user = await userdb.getBy("id", profile.id);
      if (user !== null) {
        const { id, email, firstName, lastName, role } = user;
        return {
          message: "OK",
          data: { id, email, firstName, lastName, role } satisfies User,
        };
      }

      return { message: "Not Found" };
    },
    { role: "user", cookie: authCookie },
  )
  .put(
    "/",
    async ({ userjwt, body, cookie: { auth }, status }) => {
      const profile = auth.value && (await userjwt.verify(auth.value));
      if (!profile) return status(401, Unauthorized);

      const email = body.email?.trim().toLowerCase();
      const firstName = body.firstName?.trim();
      const lastName = body.lastName?.trim() || undefined;
      const pwhash =
      body.password !== undefined
        ? await argon2.hash(body.password)
        : undefined;

      if (email) {
        const existing = await userdb.getBy("email", email);

        if (existing && existing.id !== profile.id) {
          return status(409, Errors.emailTaken);
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
        return status(500, Errors.updateFailed);
      }

      const {
        id,
        email: updatedEmail,
        firstName: updatedFirstName,
        lastName: updatedLastName,
        role,
      } = updated;

      const publicUser = {
        id,
        email: updatedEmail,
        firstName: updatedFirstName,
        lastName: updatedLastName,
        role,
      } satisfies User;

      // Refresh JWT with updated user information.
      auth.value = await userjwt.sign(publicUser);

      return {
        message: "OK",
        data: publicUser,
      };
    },
    {
      role: "user",
      body: updateProfileBody,
      cookie: authCookie,
    },
  )
  .get(
    "/transaction",
    async ({ userjwt, cookie: { auth }, status }) => {
      const profile = auth.value && (await userjwt.verify(auth.value));
      if (!profile) return status(401, Unauthorized);

      return {
        message: "OK",
        data: await transactiondb.wrapMany(
          await transactiondb.getAllBy("buyerId", profile.id, {
            sort: { by: "id", order: "DESC" },
          }),
        ),
      };
    },
    { role: "user", cookie: authCookie },
  )
  .post(
    "/transaction",
    async ({ userjwt, body, cookie: { auth }, status }) => {
      const profile = auth.value && (await userjwt.verify(auth.value));
      if (!profile) return status(401, Unauthorized);

      const items = await Promise.all(
        body.items.map(async ({ productId, quantity }) => {
          const product = await productdb.getBy("id", productId);

          if (!product) return null;

          return {
            productId,
            quantity,
            price: product.price,
          };
        }),
      );

      if (items.some((item) => item === null)) {
        return status(400, { message: "Invalid product" });
      }

      const validItems = items.filter(
        (item): item is NonNullable<typeof item> => item !== null,
      );

      const created = await transactiondb.create({
        buyerId: profile.id,
        items: validItems,
      });

      if (created instanceof DBError) {
        return status(500, Errors.createTransactionFailed);
      }

      return status(201, { message: "OK", data: created });
    },
    { role: "user", body: createTransactionBody, cookie: authCookie },
  )
  .delete(
    "/account",
    async ({ userjwt, cookie: { auth }, status }) => {
      const profile = auth.value && (await userjwt.verify(auth.value));
      if (!profile) return status(401, Unauthorized);

      userdb.delete(profile.id);
      return { message: "OK" };
    },
    { role: "user", cookie: authCookie },
  );

export default api;
