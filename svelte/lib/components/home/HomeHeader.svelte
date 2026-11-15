
<script lang="ts">
  import type { User } from "$server/routes/user";
  import { link } from "@milizt/runeway";
  import WelcomeBack from "./WelcomeBack.svelte";

  const { user }: { user?: User } = $props();
</script>

<header class="header">
  <div class="header__container">
    <a href="/" class="header__logo" use:link>
      <img src="/images/icon.png" alt="Senpai Store" width="96" />
    </a>

    {#if user}
      <WelcomeBack {user} />
    {:else}
      <a href="/login" class="login-link" use:link>
        Login
      </a>
    {/if}
  </div>
</header>

<style>
  .header {
    position: sticky;
    top: 0;
    z-index: 50;
    padding-inline: calc(var(--spacing) * 6);
    padding-block: calc(var(--spacing) * 4);
    border-bottom-width: 1px;
    border-bottom-style: solid;
    border-color: color-mix(in oklab, white 20%, transparent);
    background-color: var(--color-nav-surface);
    -webkit-backdrop-filter: blur(8px);
    backdrop-filter: blur(8px);
    box-shadow: var(--shadow-sm);
  }

  :global(.sm) .header {
    padding-inline: calc(var(--spacing) * 10);
  }

  .header__container {
    margin-inline: auto;
    display: flex;
    max-width: var(--container-7xl);
    align-items: center;
    justify-content: space-between;
  }

  .header__logo {
    display: flex;
    align-items: center;
  }

  .login-link {
    border-radius: 0.75rem;
    background-color: white;
    padding: 0.625rem 1.25rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-primary);
    box-shadow: var(--shadow-sm);
    transition: transform 150ms, background-color 150ms;
  }

  .login-link:hover {
    transform: translateY(-0.125rem);
    background-color: #f1f5f9;
  }
</style>
