import { t } from "elysia";
import type { Static, TObject, TOptional, TSchema } from "@sinclair/typebox";
import { DBError, pool } from "./core.ts";
import type { PoolClient } from "pg";

/* ------------------------------------------------------------------ */
/* Column definition                                                   */
/* ------------------------------------------------------------------ */

type Col<S extends TSchema = TSchema> = {
  column: string;
  schema: S;
  parse?: (value: any) => any;
};

type Fields = Record<string, Col>;

export const col = <S extends TSchema>(
  column: string,
  schema: S,
  parse?: (value: any) => Static<S>,
): Col<S> => ({
  column,
  schema,
  parse,
});

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type Simplify<T> = { [K in keyof T]: T[K] } & {};

type PrimaryKey<F extends Fields> =
  | (keyof F & string)
  | readonly (keyof F & string)[];

type PKFields<PK> = PK extends readonly (infer K)[] ? K & string : PK & string;

type OptionalKeys<F extends Fields> = {
  [K in keyof F]: F[K]["schema"] extends TOptional<TSchema> ? K : never;
}[keyof F];

type RequiredKeys<F extends Fields> = Exclude<keyof F, OptionalKeys<F>>;

export type EntityOf<F extends Fields> = Simplify<
  { [K in RequiredKeys<F>]: Static<F[K]["schema"]> } & {
    [K in OptionalKeys<F>]?: Static<F[K]["schema"]>;
  }
>;

type PKValue<F extends Fields, PK extends keyof F> = Static<F[PK]["schema"]>;

export type CreateData<F extends Fields, PK> = PK extends string
  ? Omit<EntityOf<F>, PK>
  : EntityOf<F>;

export type UpdateData<F extends Fields, PK extends PrimaryKey<F>> = Simplify<
  {
    [K in keyof F as K extends PKFields<PK> ? K : never]: Static<
      F[K]["schema"]
    >;
  } & {
    [K in keyof F as K extends PKFields<PK> ? never : K]?: Static<
      F[K]["schema"]
    >;
  }
>;

export type DeleteKey<
  F extends Fields,
  PK extends PrimaryKey<F>,
> = PK extends keyof F
  ? Static<F[PK]["schema"]>
  : {
      [K in PKFields<PK>]: Static<F[K]["schema"]>;
    };

export type WhereOptions<F extends Fields> = Partial<EntityOf<F>>;

export type NumericKeys<F extends Fields> = {
  [K in keyof F & string]: NonNullable<Static<F[K]["schema"]>> extends number
    ? K
    : never;
}[keyof F & string];

export type SortOption<F extends Fields> = {
  by: keyof F & string;
  order?: "ASC" | "DESC" | null;
} | null;

/* ------------------------------------------------------------------ */
/* Base table API                                                       */
/* ------------------------------------------------------------------ */

export type BaseOptions<F extends Fields> = {
  client?: PoolClient;
  where?: WhereOptions<F>;
};

export type Base<F extends Fields, PK extends PrimaryKey<F>> = {
  schema: {
    entity: TObject<{ [K in keyof F]: F[K]["schema"] }>;
    create: TObject<{
      [K in keyof F as PK extends string
        ? K extends PK
          ? never
          : K
        : K]: F[K]["schema"];
    }>;
    update: TObject<{
      [K in keyof F]: K extends PKFields<PK>
        ? F[K]["schema"]
        : TOptional<F[K]["schema"]>;
    }>;
  };

  getBy<K extends keyof F & string>(
    key: K,
    value: Static<F[K]["schema"]>,
    options?: BaseOptions<F>,
  ): Promise<EntityOf<F> | null>;

  getAll(
    options?: BaseOptions<F> & {
      sort?: SortOption<F>;
      limit?: number;
    },
  ): Promise<EntityOf<F>[]>;

  getAllBy<K extends keyof F & string>(
    key: K,
    value: Static<F[K]["schema"]>,
    options?: BaseOptions<F> & {
      sort?: SortOption<F>;
      limit?: number;
    },
  ): Promise<EntityOf<F>[]>;

  getIn<K extends keyof F & string>(
    key: K,
    values: Static<F[K]["schema"]>[],
    options?: BaseOptions<F>,
  ): Promise<EntityOf<F>[]>;

  create(
    data: CreateData<F, PK>,
    options?: BaseOptions<F>,
  ): Promise<EntityOf<F> | DBError>;

  update(
    data: UpdateData<F, PK>,
    options?: BaseOptions<F>,
  ): Promise<EntityOf<F> | DBError>;

  delete(id: DeleteKey<F, PK>, options?: BaseOptions<F>): Promise<boolean>;

  count(
    field: keyof F & string,
    options?: BaseOptions<F> & { distinct?: boolean },
  ): Promise<number>;

  sum(field: NumericKeys<F>, options?: BaseOptions<F>): Promise<number>;
};

/* ------------------------------------------------------------------ */
/* Custom method context                                                */
/* ------------------------------------------------------------------ */

export type Context<F extends Fields, PK extends PrimaryKey<F>> = {
  base: Base<F, PK>;
  pool: typeof pool;
  table: string;

  colOf: (key: keyof F & string) => string;

  fromRow: (row: any) => EntityOf<F>;

  buildWhere: (
    where?: WhereOptions<F>,
    offset?: number,
  ) => { sql: string; values: unknown[] };

  withWhere: (
    baseSql: string | null,
    baseValues: unknown[],
    where?: WhereOptions<F>,
  ) => { sql: string; values: unknown[] };

  buildSort: (sort?: SortOption<F>) => string;
  buildPKWhere: (
    key: any,
    offset?: number,
  ) => {
    sql: string;
    values: unknown[];
  };
  buildConds: (
    where?: WhereOptions<F>,
    offset?: number,
  ) => { parts: string[]; values: unknown[] };
};

export type InferEntity<T extends { schema: { entity: TSchema } }> = Static<
  T["schema"]["entity"]
>;

/* ------------------------------------------------------------------ */
/* Factory                                                              */
/* ------------------------------------------------------------------ */

export function defineTable<
  F extends Fields,
  PK extends PrimaryKey<F>,
  M extends Record<string, any> = {},
>(
  cfg: {
    table: string;
    primaryKey: PK;
    fields: F;
  },
  extend?: (ctx: Context<F, PK>) => M,
): Base<F, PK> & M {
  type Entity = EntityOf<F>;

  const entries = Object.entries(cfg.fields) as [string, Col][];

  const pkKeys = (
    Array.isArray(cfg.primaryKey) ? cfg.primaryKey : [cfg.primaryKey]
  ) as (keyof F & string)[];

  if (pkKeys.length === 0) {
    throw new TypeError("At least one primary key is required.");
  }

  for (const key of pkKeys) {
    if (!Object.hasOwn(cfg.fields, key)) {
      throw new TypeError(`Unknown primary key field: ${key}`);
    }
  }

  const isComposite = Array.isArray(cfg.primaryKey);

  const writable = entries.filter(([k]) => !pkKeys.includes(k));

  // Composite keys are supplied by the caller, not generated.
  const createFields = isComposite ? entries : writable;

  const colOf = (key: string) => {
    if (key === "*") return "*";

    const field = cfg.fields[key];
    if (!field) throw new TypeError(`Unknown field: ${key}`);
    return field.column;
  };

  const runner = (options?: { client?: PoolClient }) => options?.client ?? pool;

  const fromRow = (row: any): Entity =>
    Object.fromEntries(
      entries.map(([k, c]) => {
        const raw = row[c.column];
        return [k, raw !== undefined && c.parse ? c.parse(raw) : raw];
      }),
    ) as Entity;

  const buildSort = (sort?: SortOption<F>) => {
    if (!sort) return "";

    const { by, order } = sort;

    if (!Object.hasOwn(cfg.fields, by)) throw new TypeError(`Unknown sort field: ${by}`);
    if (order != null && order !== "ASC" && order !== "DESC") {
      throw new TypeError(`Invalid sort order: ${order}`);
    }

    return ` ORDER BY ${colOf(by)}${order ? ` ${order}` : ""}`;
  };

  const buildConds = (where?: WhereOptions<F>, offset = 0) => {
    const parts: string[] = [];
    const values: unknown[] = [];

    for (const [k, v] of Object.entries(where ?? {})) {
      if (v === undefined) continue;
      if (!Object.hasOwn(cfg.fields, k)) throw new TypeError(`Unknown field: ${k}`);

      if (v === null) {
        parts.push(`${colOf(k)} IS NULL`);
      } else {
        values.push(v);
        parts.push(`${colOf(k)} = $${values.length + offset}`);
      }
    }

    return { parts, values };
  };

  const buildWhere = (where?: WhereOptions<F>, offset = 0) => {
    const { parts, values } = buildConds(where, offset);
    return { sql: parts.length ? `WHERE ${parts.join(" AND ")}` : "", values };
  };

  function withWhere(
    baseSql: string | null,
    baseValues: unknown[],
    where?: WhereOptions<F>,
  ) {
    const extra = buildConds(where, baseValues.length);
    const conds = baseSql ? [baseSql, ...extra.parts] : extra.parts;

    return {
      sql: conds.length ? `WHERE ${conds.join(" AND ")}` : "",
      values: [...baseValues, ...extra.values],
    };
  }

  // Builds a WHERE clause from either a single PK value or a composite PK object.
  const buildPKWhere = (key: any, offset = 0) => {
    const values: unknown[] = [];

    const parts = pkKeys.map((k) => {
      const value = isComposite ? key[k] : key;

      if (value === undefined) {
        throw new TypeError(`Missing primary key field: ${k}`);
      }

      values.push(value);
      return `${colOf(k)} = $${values.length + offset}`;
    });

    return {
      sql: parts.join(" AND "),
      values,
    };
  };

  /* ---- schemas ---- */

  const schema = {
    entity: t.Object(
      Object.fromEntries(entries.map(([k, c]) => [k, c.schema])),
    ),

    create: t.Object(
      Object.fromEntries(createFields.map(([k, c]) => [k, c.schema])),
    ),

    update: t.Object({
      ...Object.fromEntries(
        entries.map(([k, c]) => [
          k,
          pkKeys.includes(k) ? c.schema : t.Optional(c.schema),
        ]),
      ),
    }),
  } as unknown as Base<F, PK>["schema"];

  /* ---- methods ---- */

  const base: Base<F, PK> = {
    schema,

    async getBy(key, value, options) {
      if (!Object.hasOwn(cfg.fields, key)) throw new TypeError(`Unknown field: ${key}`);

      const w = withWhere(`${colOf(key)} = $1`, [value], options?.where);

      const r = await runner(options).query(
        `SELECT * FROM ${cfg.table} ${w.sql} LIMIT 1`,
        w.values,
      );

      return r.rows[0] ? fromRow(r.rows[0]) : null;
    },

    async getAll(options) {
      const w = withWhere(null, [], options?.where);
      const params = [...w.values];

      if (options?.limit !== undefined) params.push(options.limit);

      const r = await runner(options).query(
        `SELECT * FROM ${cfg.table} ${w.sql}${buildSort(options?.sort)}${
          options?.limit !== undefined ? ` LIMIT $${params.length}` : ""
        }`,
        params,
      );

      return r.rows.map(fromRow);
    },

    async getAllBy(key, value, options) {
      if (!Object.hasOwn(cfg.fields, key)) throw new TypeError(`Unknown field: ${key}`);

      const w = withWhere(`${colOf(key)} = $1`, [value], options?.where);
      const params = [...w.values];

      if (options?.limit !== undefined) params.push(options.limit);

      const r = await runner(options).query(
        `SELECT * FROM ${cfg.table} ${w.sql}${buildSort(options?.sort)}${
          options?.limit !== undefined ? ` LIMIT $${params.length}` : ""
        }`,
        params,
      );

      return r.rows.map(fromRow);
    },

    async getIn(key, values, options) {
      if (!Object.hasOwn(cfg.fields, key)) throw new TypeError(`Unknown field: ${key}`);
      if (values.length === 0) return [];

      const w = withWhere(`${colOf(key)} = ANY($1)`, [values], options?.where);

      const r = await runner(options).query(
        `SELECT * FROM ${cfg.table} ${w.sql}`,
        w.values,
      );

      return r.rows.map(fromRow);
    },

    async create(data, options) {
      try {
        const d = data as Record<string, unknown>;
        const fields = createFields.filter(([k]) => d[k] !== undefined);
        const cols = fields.map(([, c]) => c.column);
        const vals = fields.map(([k]) => d[k]);
        const params = vals.map((_, i) => `$${i + 1}`);

        const r = await runner(options).query(
          cols.length
            ? `INSERT INTO ${cfg.table} (${cols.join(", ")})
           VALUES (${params.join(", ")}) RETURNING *`
            : `INSERT INTO ${cfg.table} DEFAULT VALUES RETURNING *`,
          vals,
        );

        return fromRow(r.rows[0]);
      } catch (err) {
        console.error(err);
        return DBError.DatabaseError;
      }
    },

    async update(data, options) {
      try {
        const d = data as Record<string, unknown>;
        const db = runner(options);

        const sets = writable.filter(([k]) => d[k] !== undefined);
        const setValues = sets.map(([k]) => d[k]);
        const setSQL = sets.map(([, c], i) => `${c.column} = $${i + 1}`);

        const pk = buildPKWhere(
          isComposite ? d : d[pkKeys[0]],
          setValues.length,
        );

        const w = withWhere(
          pk.sql,
          [...setValues, ...pk.values],
          options?.where,
        );

        if (sets.length === 0) {
          const r = await db.query(
            `SELECT * FROM ${cfg.table} ${w.sql} LIMIT 1`,
            w.values,
          );

          return r.rows[0] ? fromRow(r.rows[0]) : DBError.NotFound;
        }

        const r = await db.query(
          `UPDATE ${cfg.table}
       SET ${setSQL.join(", ")}
       ${w.sql}
       RETURNING *`,
          w.values,
        );

        return r.rows[0] ? fromRow(r.rows[0]) : DBError.NotFound;
      } catch (err) {
        console.error(err);
        return DBError.DatabaseError;
      }
    },

    async delete(id, options) {
      const pk = buildPKWhere(id);
      const w = withWhere(pk.sql, pk.values, options?.where);

      const r = await runner(options).query(
        `DELETE FROM ${cfg.table} ${w.sql}`,
        w.values,
      );

      return (r.rowCount ?? 0) > 0;
    },

    async count(field, options) {
      if (!Object.hasOwn(cfg.fields, field)) {
        throw new TypeError(`Unknown field: ${field}`);
      }

      const w = withWhere(null, [], options?.where);
      const distinct = options?.distinct ? "DISTINCT " : "";

      const r = await runner(options).query(
        `SELECT COUNT(${distinct}${colOf(field)}) AS count
     FROM ${cfg.table} ${w.sql}`,
        w.values,
      );

      return Number(r.rows[0].count);
    },

    async sum(field, options) {
      if (!Object.hasOwn(cfg.fields, field)) {
        throw new TypeError(`Unknown field: ${field}`);
      }

      const w = withWhere(null, [], options?.where);

      const r = await runner(options).query(
        `SELECT COALESCE(SUM(${colOf(field)}), 0) AS sum
     FROM ${cfg.table} ${w.sql}`,
        w.values,
      );

      return Number(r.rows[0].sum);
    },
  };

  /* ---- custom methods ---- */

  const custom = extend
    ? extend({
        base,
        pool,
        table: cfg.table,
        colOf,
        fromRow,
        buildWhere,
        buildSort,
        buildPKWhere,
        buildConds,
        withWhere,
      })
    : ({} as M);

  return { ...base, ...custom };
}
