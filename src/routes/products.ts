import Elysia, { t } from "elysia";

import { productdb } from "../db/productdb.ts";
import { roleBasedAccessLimiter } from "../auth.ts";
import { DBError } from "../db/core.ts";

const Errors = {
  nameTaken: { message: "Product name already registered" },
  notFound: { message: "Product not found" },
  saveFailed: { message: "Failed to save product" },
} as const;

const Id = t.Integer({ minimum: 1 });
const idParams = t.Object({ id: Id });

const productBody = t.Object({
  label: t.String({ minLength: 1, maxLength: 64 }),
  desc: t.Optional(t.String({ maxLength: 512 })),
  price: t.Integer({ minimum: 0, maximum: Number.MAX_SAFE_INTEGER }),
  stock: t.Integer({ minimum: 0, maximum: Number.MAX_SAFE_INTEGER }),
  categoryId: Id,
});

const ok = (data?: unknown) => ({ message: "OK", data });

const api = new Elysia({ prefix: "/product" })
  .use(roleBasedAccessLimiter)
  .post(
    "/",
    async ({ body, status }) => {
      const created = await productdb.create(body);

      if (created instanceof DBError) {
        return created.code === "ALREADY_EXISTS"
          ? status(409, Errors.nameTaken)
          : status(500, Errors.saveFailed);
      }

      return ok(created);
    },
    { role: "admin", body: productBody },
  )
  .put(
    "/:id",
    async ({ body, params, status }) => {
      const updated = await productdb.update({ ...body, id: params.id });

      if (updated instanceof DBError) {
        switch (updated.code) {
          case "NOT_FOUND":
            return status(404, Errors.notFound);
          case "ALREADY_EXISTS":
            return status(409, Errors.nameTaken);
          default:
            return status(500, Errors.saveFailed);
        }
      }

      return ok(updated);
    },
    { role: "admin", body: productBody, params: idParams },
  )
  .delete(
    "/:id",
    async ({ params, status }) => {
      const original = await productdb.getBy("id", params.id);
      if (!original) return status(404, Errors.notFound);

      await productdb.delete(original.id);
      return ok();
    },
    { role: "admin", params: idParams },
  )
  .get(
    "/:id",
    async ({ params, status }) => {
      const data = await productdb.getBy("id", params.id);
      if (!data) return status(404, Errors.notFound);

      return ok(data);
    },
    { params: idParams },
  )
  .get("/", async () => ok(await productdb.getAll()))
  .post("/purchase", async () => {
    
  });

export default api;