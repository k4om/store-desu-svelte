import { Router } from "express";
import { Type as t } from "@sinclair/typebox";

import { categorydb } from "../db/categorydb.ts";
import { requireRole } from "../auth.ts";
import { validate } from "../validate.ts";
import { DBError } from "../db/core.ts";

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

const api = Router();

api.post(
  "/",
  requireRole("admin"),
  validate({ body: mutateBody }),
  async (req, res) => {
    const body = req.body as { label: string; desc?: string };

    const created = await categorydb.create({
      label: body.label,
      desc: body.desc,
    });

    if (created instanceof DBError) {
      return created.code === "ALREADY_EXISTS"
        ? res.status(409).json(Errors.nameTaken)
        : res.status(500).json(Errors.createFailed);
    }

    res.json(ok(created));
  },
);

api.put(
  "/:id",
  requireRole("admin"),
  validate({ params: idParams, body: mutateBody }),
  async (req, res) => {
    const id = Number(req.params.id);

    const original = await categorydb.getBy("id", id);
    if (!original) {
      return res.status(409).json(Errors.notFound);
    }

    const updated = await categorydb.update({
      ...req.body,
      id: original.id,
    });

    if (updated instanceof DBError) {
      return updated.code === "NOT_FOUND"
        ? res.status(409).json(Errors.notFound)
        : res.status(500).json(Errors.createFailed);
    }

    res.json(ok(updated));
  },
);

api.delete(
  "/:id",
  requireRole("admin"),
  validate({ params: idParams }),
  async (req, res) => {
    const original = await categorydb.getBy("id", Number(req.params.id));
    if (!original) {
      return res.status(409).json(Errors.notFound);
    }

    await categorydb.delete(original.id);

    res.json(ok());
  },
);

// Public routes (no role check, same as the Elysia version).
api.get("/:id", validate({ params: idParams }), async (req, res) => {
  const data = await categorydb.getBy("id", Number(req.params.id));
  if (!data) {
    return res.status(409).json(Errors.notFound);
  }

  res.json(ok(data));
});

api.get("/", async (_req, res) => {
  res.json(ok(await categorydb.getAll()));
});

export default api;

/* ------------------------------ Usage (app.ts) ------------------------------ */
// app.use("/category", categoryRoutes);