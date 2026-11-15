import { Router } from "express";
import { Type as t } from "@sinclair/typebox";

import { productdb } from "../db/productdb.ts";
import { requireRole } from "../auth.ts";
import { validate } from "../validate.ts";
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

const api = Router();

api.post(
  "/",
  requireRole("admin"),
  validate({ body: productBody }),
  async (req, res) => {
    const created = await productdb.create(req.body);

    if (created instanceof DBError) {
      return created.code === "ALREADY_EXISTS"
        ? res.status(409).json(Errors.nameTaken)
        : res.status(500).json(Errors.saveFailed);
    }

    res.json(ok(created));
  },
);

api.put(
  "/:id",
  requireRole("admin"),
  validate({ params: idParams, body: productBody }),
  async (req, res) => {
    const updated = await productdb.update({
      ...req.body,
      id: Number(req.params.id),
    });

    if (updated instanceof DBError) {
      switch (updated.code) {
        case "NOT_FOUND":
          return res.status(404).json(Errors.notFound);
        case "ALREADY_EXISTS":
          return res.status(409).json(Errors.nameTaken);
        default:
          return res.status(500).json(Errors.saveFailed);
      }
    }

    res.json(ok(updated));
  },
);

api.delete(
  "/:id",
  requireRole("admin"),
  validate({ params: idParams }),
  async (req, res) => {
    const original = await productdb.getBy("id", Number(req.params.id));
    if (!original) return res.status(404).json(Errors.notFound);

    await productdb.delete(original.id);
    res.json(ok());
  },
);

// Public routes (no role check, same as the Elysia version).
api.get("/:id", validate({ params: idParams }), async (req, res) => {
  const data = await productdb.getBy("id", Number(req.params.id));
  if (!data) return res.status(404).json(Errors.notFound);

  res.json(ok(data));
});

api.get("/", async (_req, res) => {
  res.json(ok(await productdb.getAll()));
});

export default api;

/* ------------------------------ Usage (app.ts) ------------------------------ */
// app.use("/product", productRoutes);