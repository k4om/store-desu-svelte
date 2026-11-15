<script lang="ts">
  import type { User } from "$server/routes/user";
  import { link } from "@milizt/runeway";

  const { user }: { user: User } = $props();
</script>

<a href="/profile" class="wrapper" use:link>
  <span
    class="flex h-9 w-9 items-center justify-center rounded-lg bg-white font-bold text-primary"
  >
    {user.firstName.charAt(0).toUpperCase()}
  </span>

  <span class="hidden text-left sm:block">
    <span class="block text-xs text-white/60"> Welcome back </span>

    <span class="block max-w-35 truncate text-sm font-semibold">
      {user.firstName}
      {#if user.lastName}
        {user.lastName}
      {/if}
    </span>
  </span>

  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="arrow"
    aria-hidden="true"
  >
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
</a>

<style>
  .wrapper {
    display: flex;
    align-items: center;
    gap: calc(var(--spacing) * 3);
    border-radius: var(--radius-xl);
    padding-block: calc(var(--spacing) * 2);
    padding-inline: calc(var(--spacing) * 3);
    background-color: color-mix(in oklab, white 10%, transparent);
    color: white;
    -webkit-backdrop-filter: blur(8px);
    backdrop-filter: blur(8px);
    transition: background-color cubic-bezier(0.4, 0, 0.2, 1) 150ms;
  }

  .wrapper:hover {
    background-color: color-mix(in oklab, white 20%, transparent);
  }

  .arrow {
    transition-property: color, transform, translate;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;

    color: color-mix(in oklab, white 50%, transparent);
  }

  .wrapper:hover .arrow {
    transform: translateX(calc(var(--spacing) * 0.5));
    color: white;
  }
</style>
