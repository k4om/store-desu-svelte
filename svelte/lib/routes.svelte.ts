import type { Component } from "svelte";
import { RoutingTable } from "@milizt/runeway";
import { apiState, userQuery } from "$lib/api.svelte";

import PrimaryLayout from "$lib/layouts/PrimaryLayout.svelte";
import HomeLayout from "$lib/layouts/HomeLayout.svelte";
import AuthLayout from "$lib/layouts/AuthLayout.svelte";

import Home from "$lib/pages/Home.svelte";
import NotFound from "$lib/pages/NotFound.svelte";

import LoginPage from "$lib/pages/auth/LoginPage.svelte";
import RegisterPage from "$lib/pages/auth/RegisterPage.svelte";

import TransactionHistory from "$lib/pages/feature/TransactionHistory.svelte";
import ProductList from "$lib/pages/feature/ProductList.svelte";
import ProductDetail from "$lib/pages/feature/ProductDetail.svelte";
import ManageCategory from "$lib/pages/admin/ManageCategory.svelte";
import ManageProduct from "$lib/pages/admin/ManageProduct.svelte";
import UserProfile from "./pages/feature/UserProfile.svelte";
import Dashboard from "./pages/admin/Dashboard.svelte";
import Report from "./pages/admin/Report.svelte";
import ManageUser from "./pages/admin/ManageUser.svelte";

const user = $derived(apiState.user);
const isAdmin = $derived(user?.role === "admin");

export function refresh() {
  userQuery.reload();
}

export const routesMap: Record<string, Component<any>> = {
  "/": Home,

  "/login": LoginPage,
  "/register": RegisterPage,

  "/transaction": TransactionHistory,
  "/category/:id": ProductList,
  "/product/:id": ProductDetail,
  "/profile": UserProfile,

  "/admin/dashboard": Dashboard,
  "/admin/report": Report,
  "/admin/manage/category": ManageCategory,
  "/admin/manage/product": ManageProduct,
  "/admin/manage/user": ManageUser,

  "*": NotFound,
};

export const routes = new RoutingTable(Object.keys(routesMap));

const defaultLayout = PrimaryLayout;

const layoutOverrides = new Map<Component<any>, Component<any>>([
  [Home, HomeLayout],
  [NotFound, HomeLayout],
  [LoginPage, AuthLayout],
  [RegisterPage, AuthLayout],
]);

const adminOnly = new Set<Component<any>>([
  ManageCategory,
  ManageProduct,
  ManageUser,
  Dashboard,
  Report,
]);

export function pageOf(
  pattern: string | null,
  isAdmin: boolean,
): Component<any> {
  if (pattern === null) return NotFound;

  console.log("pageOf", pattern);
  const page = routesMap[pattern] ?? NotFound;

  console.log("aa", { isAdmin, user });

  // Non-admins get NotFound instead of an admin page inside the wrong layout.
  if (adminOnly.has(page) && !isAdmin) return NotFound;

  return page;
}

export function layoutOf(component: Component<any>): Component<any> {
  return layoutOverrides.get(component) ?? defaultLayout;
}

const Page = $derived(pageOf(routes.match?.pattern ?? null, isAdmin));

const PageLayout = $derived(layoutOf(Page));

// Getters, not values: destructuring or `{ Page }` would snapshot the derived.
export const view = {
  get Page() {
    return Page;
  },
  get PageLayout() {
    return PageLayout;
  },
};

$effect.root(() => {
  $inspect({ routes, match: routes.match });
});
