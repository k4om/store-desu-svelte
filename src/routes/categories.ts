import Elysia, { t } from "elysia";

import { categorydb } from "../db/categorydb.ts";
import { authCookie, roleBasedAccessLimiter, Unauthorized } from "../auth.ts";
import { DBError } from "../db/core.ts";

const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // seconds

const Errors = {
  nameTaken: { message: "Name already registered" },
  notFound: { message: "Category not found" },
  createFailed: { message: "Failed to create category" },
} as const;

const Id = t.Integer({ minimum: 1 });
const idParams = t.Object({ id: Id });

const mutateBody = t.Object({
  label: t.String({ maxLength: 64 }),
  desc: t.Optional(t.String()),
});

const ok = (data?: unknown) => ({ message: "OK", data });

const api = new Elysia({ prefix: "/category" })
  .use(roleBasedAccessLimiter)
  .post(
    "/",
    async ({ body, status }) => {
      const created = await categorydb.create({
        label: body.label,
        desc: body.desc,
      });

      if (created instanceof DBError) {
        return created.code === "ALREADY_EXISTS"
          ? status(409, Errors.nameTaken)
          : status(500, Errors.createFailed);
      }

      return ok(created);
    },
    { role: "admin", body: mutateBody, cookie: authCookie },
  )
  .put(
    "/:id",
    async ({ body, params, status }) => {
      const original = await categorydb.getBy("id", params.id);
      if (!original) {
        return status(409, Errors.notFound);
      }

      const updated = await categorydb.update({
        ...body,
        id: original.id,
      });

      if (updated instanceof DBError) {
        return updated.code === "NOT_FOUND"
          ? status(409, Errors.notFound)
          : status(500, Errors.createFailed);
      }

      return ok(updated);
    },
    {
      role: "admin",
      body: mutateBody,
      params: idParams,
      cookie: authCookie,
    },
  )
  .delete(
    "/:id",
    async ({ params, status }) => {
      const original = await categorydb.getBy("id", params.id);
      if (!original) {
        return status(409, Errors.notFound);
      }

      await categorydb.delete(original.id);

      return ok();
    },
    { role: "admin", params: idParams, cookie: authCookie },
  )
  .get(
    "/:id",
    async ({ params, status }) => {
      const data = await categorydb.getBy("id", params.id);
      if (!data) {
        return status(409, Errors.notFound);
      }

      return ok(data);
    },
    { params: idParams, cookie: authCookie },
  )
  .get("/", async () => ok(await categorydb.getAll()), {
    cookie: authCookie,
  });

export default api;
