<script lang="ts">
  import { api, apiState } from "$lib/api.svelte";
  import SidebarProfile from "./SidebarProfile.svelte";
  import type { Category } from "$server/db/categorydb";
  import { router, link } from "@milizt/runeway";

  let show = $state(false);
  const user = $derived(apiState.user);
  const categories = $derived(apiState.categories);
  const activePage = $derived(router.path);

  const links: { label: string; url: string }[] = $derived([
    { label: "Transaction History", url: "/transaction" },
    { label: "All Products", url: "/category/all" },
    ...categories.map((c: Category) => ({
      label: `-> ${c.label}`,
      url: `/category/${c.id}`,
    })),
  ]);

  const adminLinks = [
    { label: "User Management", url: "/admin/manage/user" },
    { label: "Category", url: "/admin/manage/category" },
    { label: "Product", url: "/admin/manage/product" },
    { label: "Dashboard", url: "/admin/dashboard" },
    { label: "Report", url: "/admin/report" },
  ];

  function close() {
    show = false;
  }

  export function toggle() {
    show = !show;
  }

  $effect(() => {
    document.body.classList.toggle("scroll-lock", show);
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
  class="backdrop"
  class:show
  role="presentation"
  aria-hidden="true"
  onclick={() => close()}
></div>

<aside class="sidebar" class:show>
  <div class="sidebar-content">
    <nav class="sidebar-nav" aria-label="Product Categories">
      {#each links as linkmeta}
        <a
          href={linkmeta.url}
          class="nav-item"
          class:active={activePage === linkmeta.url}
          use:link
        >
          {linkmeta.label}
        </a>
      {/each}
    </nav>

    {#if user?.role === "admin"}
      <hr class="sidebar-divider" />

      <nav class="sidebar-nav" aria-label="Admin">
        {#each adminLinks as linkmeta}
          <a
            href={linkmeta.url}
            class="nav-item"
            class:active={activePage === linkmeta.url}
            use:link
          >
            {linkmeta.label}
          </a>
        {/each}
      </nav>
    {/if}

    <SidebarProfile />
  </div>
</aside>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 40;
    background-color: color-mix(in oklab, black 50%, transparent);
    -webkit-backdrop-filter: blur(8px);
    backdrop-filter: blur(8px);
  }

  .backdrop:not(.show) {
    visibility: hidden;
  }

  .backdrop.show {
    display: flex;
    transform: translateX(0);
  }

  .sidebar {
    position: fixed;
    inset-block: 0;
    left: 0;
    z-index: 10;

    display: flex;
    flex-direction: column;

    width: min(80vw, 300px);

    overflow-y: auto;

    background-color: var(--color-nav-surface);
    box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
    backdrop-filter: blur(8px);

    transform: translateX(-100%);
    transition: transform 200ms ease;
  }

  .sidebar.show {
    z-index: 200;
    transform: translateX(0);
  }

  .sidebar-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
  }

  .sidebar-divider {
    height: 0;
    margin: 0.75rem 1rem;
    border: 0;
    border-top: 1px solid currentColor;
    opacity: 0.15;
  }

  .sidebar-nav {
    display: flex;
    flex: 1;
    flex-direction: column;
  }

  .nav-item {
    padding: 0.75rem 0.625rem;

    border-radius: 0.25rem;

    color: white;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 13px;

    transition:
      background 150ms,
      color 150ms;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }

  .nav-item:hover {
    color: black;
    background: rgb(241 245 249 / 50%);
  }

  .nav-item.active {
    color: white;
    background-color: var(--primary);
    backdrop-filter: blur(8px);
    box-shadow: 0 2px 6px rgb(0 0 0 / 10%);
  }

  :global(.sm) .sidebar {
    position: sticky;
    top: 6rem;

    width: clamp(230px, 15vw, 300px);
    height: calc(100vh - 6rem);

    transform: none;
  }

  :global(.sm) .sidebar.show {
    transform: none;
  }
</style>
