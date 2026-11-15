import { treaty } from "@elysiajs/eden";
import type { App } from "../../src";

import type { Category } from "$server/db/categorydb";
import type { Product } from "$server/db/productdb";
import type { User } from "$server/routes/user.ts";
import type { Transaction } from "$server/db/transactiondb";

export const api = treaty<App>(window.location.origin, {
  fetch: { credentials: "include" },
}).api;

type AnyFetcher = () => Promise<{ data: unknown; error: unknown }>;

export function query<F extends AnyFetcher>(fetcher: F) {
  type R = Awaited<ReturnType<F>>;
  type Data = Extract<R, { error: null }>["data"];
  type Err = Exclude<R, { error: null }>["error"];

  let data = $state<Data | null>(null);
  let error = $state<Err | null>(null);
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

          data = res.data as Data | null;
          error = res.error as Err | null;
        })
        .catch((e) => {
          if (!cancelled) error = e as Err;
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
    return userQuery.data?.data as User ?? null;
  },

  get categories() {
    return (categoriesQuery.data?.data as Category[] | undefined) ?? [];
  },

  get products() {
    return (productsQuery.data?.data as Product[] | undefined) ?? [];
  },

  get transactions() {
    return (transactionsQuery.data?.data as Transaction[] | undefined) ?? [];
  },
};
