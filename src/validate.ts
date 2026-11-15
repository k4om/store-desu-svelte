import type { NextFunction, Request, Response } from "express";
import { FormatRegistry, type TSchema } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

FormatRegistry.Set("email", (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
FormatRegistry.Set("uri-reference", (v) => !/[\s\u0000-\u001f]/.test(v));

const fail = (
  res: Response,
  where: "params" | "query" | "body",
  schema: TSchema,
  value: unknown,
) =>
  res.status(422).json({
    message: `Invalid ${where}`,
    errors: [...Value.Errors(schema, value)].map((e) => ({
      path: e.path,
      message: e.message,
    })),
  });

/** Validates req.params / req.query / req.body (replaces Elysia's `params` / `query` / `body`). */
export const validate =
  (schemas: { params?: TSchema; query?: TSchema; body?: TSchema }) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (schemas.params) {
      // Route params are always strings; convert ("5" -> 5) before checking, like Elysia.
      const params = Value.Convert(schemas.params, Value.Clone(req.params));
      if (!Value.Check(schemas.params, params)) {
        return fail(res, "params", schemas.params, params);
      }
      req.params = params as any;
    }

    if (schemas.query) {
      // req.query is a read-only getter in Express 5, so check it without reassigning.
      const query = Value.Convert(schemas.query, Value.Clone(req.query));
      if (!Value.Check(schemas.query, query)) {
        return fail(res, "query", schemas.query, query);
      }
    }

    if (schemas.body && !Value.Check(schemas.body, req.body)) {
      return fail(res, "body", schemas.body, req.body);
    }

    next();
  };