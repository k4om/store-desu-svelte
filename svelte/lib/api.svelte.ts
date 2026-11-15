import type { Category } from "$server/db/categorydb";
import type { Product } from "$server/db/productdb";
import type { User } from "$server/routes/user.ts";
import type { Transaction } from "$server/db/transactiondb";

/* ------------------------------- Types ------------------------------------- */

/** Shape of every successful JSON response from the server. */
export type ApiResponse<T = undefined> = { message: string; data: T };

/** Mirrors Eden's `{ status, value }` error so `error.status` keeps working. */
export type ApiError = { status: number; value: unknown };

export type ApiResult<T> =
  | { data: T; error: null; status: number }
  | { data: null; error: ApiError; status: number };

type UpdateProfileBody = {
  email?: string;
  firstName?: string;
  lastName?: string | null;
  password?: string;
};

type CategoryBody = { label: string; desc?: string };

type ProductBody = {
  label: string;
  desc?: string;
  price: number;
  stock: number;
  categoryId: number;
};

type AdminStats = {
  userCount: number;
  productCount: number;
  categoryCount: number;
  transactionCount: number;
  revenue: number;
};

type AdminReport = {
  transactions: number;
  revenue: number;
  itemsSold: number;
  customers: number;
};

type AdminUpdateAccountBody = {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: "user" | "admin";
};

type TransactionBody = {
  items: { productId: number; quantity: number }[];
};

/* ------------------------------- Client ------------------------------------ */

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<ApiResult<T>> {
  const res = await fetch(`/api${path}`, {
    method,
    credentials: "include",
    headers: body !== undefined ? { "Content-Type": "application/json" } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Error bodies are JSON from our API, but a proxy or crash page might not be.
  const value: unknown = await res.json().catch(() => null);

  return res.ok
    ? { data: value as T, error: null, status: res.status }
    : { data: null, error: { status: res.status, value }, status: res.status };
}

export const api = {
  me: {
    get: () => request<ApiResponse<User>>("GET", "/me"),
    put: (body: UpdateProfileBody) =>
      request<ApiResponse<User>>("PUT", "/me", body),
    transaction: {
      get: () => request<ApiResponse<Transaction[]>>("GET", "/me/transaction"),
      post: (body: TransactionBody) =>
        request<ApiResponse<Transaction>>("POST", "/me/transaction", body),
    },
    account: {
      delete: () => request<ApiResponse>("DELETE", "/me/account"),
    },
  },

  // Callable + properties, like Eden: api.category.get() and api.category({ id }).put(...)
  category: Object.assign(
    ({ id }: { id: number }) => ({
      get: () => request<ApiResponse<Category>>("GET", `/category/${id}`),
      put: (body: CategoryBody) =>
        request<ApiResponse<Category>>("PUT", `/category/${id}`, body),
      delete: () => request<ApiResponse>("DELETE", `/category/${id}`),
    }),
    {
      get: () => request<ApiResponse<Category[]>>("GET", "/category"),
      post: (body: CategoryBody) =>
        request<ApiResponse<Category>>("POST", "/category", body),
    },
  ),

  product: Object.assign(
    ({ id }: { id: number }) => ({
      get: () => request<ApiResponse<Product>>("GET", `/product/${id}`),
      put: (body: ProductBody) =>
        request<ApiResponse<Product>>("PUT", `/product/${id}`, body),
      delete: () => request<ApiResponse>("DELETE", `/product/${id}`),
    }),
    {
      get: () => request<ApiResponse<Product[]>>("GET", "/product"),
      post: (body: ProductBody) =>
        request<ApiResponse<Product>>("POST", "/product", body),
    },
  ),

  admin: {
    stats: {
      get: () => request<ApiResponse<AdminStats>>("GET", "/admin/stats"),
    },
    report: {
      get: () => request<ApiResponse<AdminReport>>("GET", "/admin/report"),
    },
    "global-transaction": {
      recent: {
        get: () =>
          request<ApiResponse<Transaction[]>>(
            "GET",
            "/admin/global-transaction/recent",
          ),
      },
      all: {
        get: () =>
          request<ApiResponse<Transaction[]>>(
            "GET",
            "/admin/global-transaction/all",
          ),
      },
    },
    account: Object.assign(
      ({ id }: { id: number }) => ({
        get: () => request<ApiResponse<User>>("GET", `/admin/account/${id}`),
        put: (body: AdminUpdateAccountBody) =>
          request<ApiResponse<User>>("PUT", `/admin/account/${id}`, body),
        delete: () => request<ApiResponse>("DELETE", `/admin/account/${id}`),
        transaction: {
          get: () =>
            request<ApiResponse<Transaction[]>>(
              "GET",
              `/admin/account/${id}/transaction`,
            ),
        },
      }),
      {
        get: () => request<ApiResponse<User[]>>("GET", "/admin/account"),
      },
    ),
  },

  auth: {
    // NOTE: login/register respond with a redirect (302), which fetch follows
    // automatically. The cookie is set, but the result is the redirect target's
    // response (usually index.html), not JSON. Reload userQuery afterwards.
    login: (body: { email: string; password: string }) =>
      request<unknown>("POST", "/auth/login", body),
    register: (body: {
      email: string;
      password: string;
      firstName: string;
      lastName?: string;
    }) => request<unknown>("POST", "/auth/register", body),
    logout: () => request<{ ok: boolean }>("POST", "/auth/logout"),
  },
};

/* ------------------------------ query() helper ----------------------------- */

/** Either an HTTP error from the server or a network failure (no status). */
export type QueryError = { status?: number; value: unknown };

export function query<T>(fetcher: () => Promise<ApiResult<T>>) {
  let data = $state<T | null>(null);
  let error = $state<QueryError | null>(null);
  let loading = $state(true);
  let revision = $state(0);

  let initialized = false;
  let resolveReady!: () => void;

  const ready = new Promise<void>((resolve) => {
    resolveReady = resolve;
  });

  $effect.root(() => {
    $effect(() => {
      revision;

      let cancelled = false;

      loading = true;
      error = null;

      fetcher()
        .then((res) => {
          if (cancelled) return;

          data = res.data;
          error = res.error;
        })
        .catch((e) => {
          // Network failure: no HTTP status, same as Eden's thrown errors.
          if (!cancelled) error = { value: e };
        })
        .finally(() => {
          if (!cancelled) loading = false;

          if (!initialized) {
            initialized = true;
            resolveReady();
          }
        });

      return () => {
        cancelled = true;
      };
    });
  });

  return {
    ready,

    get data() {
      return data;
    },
    get error() {
      return error;
    },
    get loading() {
      return loading;
    },
    reload() {
      revision++;
    },
  };
}

export const userQuery = query(() => api.me.get());
export const categoriesQuery = query(() => api.category.get());
export const productsQuery = query(() => api.product.get());
export const transactionsQuery = query(() => api.me.transaction.get());

// Derived API state

export const apiState = {
  get authorized() {
    return userQuery.error?.status === undefined;
  },

  get user() {
    return userQuery.data?.data ?? null;
  },

  get categories() {
    return categoriesQuery.data?.data ?? [];
  },

  get products() {
    return productsQuery.data?.data ?? [];
  },

  get transactions() {
    return transactionsQuery.data?.data ?? [];
  },
};