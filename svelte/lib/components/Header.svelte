<script lang="ts">
  import type Sidebar from "./Sidebar.svelte";

  const { sidebar }: { sidebar: Sidebar | null } = $props();
</script>

<header class="header">
  <!-- LEFT -->
  <img src="/images/icon.png" alt="Senpai Store's Icon" width="128" />

  <!-- RIGHT -->
  <div class="header-actions">
    <button
      type="button"
      class="hamburger"
      onclick={() => sidebar?.toggle()}
      aria-label="Toggle menu"
      aria-expanded={false}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        aria-hidden="true"
      >
        <path d="M5 8h22M5 16h22M5 24h22" />
      </svg>
    </button>
  </div>
</header>

<style>
  .header {
    position: sticky;
    top: 0;
    z-index: 50;

    display: flex;
    align-items: center;
    justify-content: space-between;

    height: 6rem;
    padding-inline: 2rem;

    color: white;
    background: var(--nav-surface);

    -webkit-backdrop-filter: blur(12px);
    backdrop-filter: blur(12px);
    box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
  }

  .header-actions {
    display: flex;
  }

  .hamburger {
    display: flex;
    align-items: center;
    justify-content: center;

    padding: 0.5rem;
    border: 0;
    z-index: 100;

    background: transparent;
    color: inherit;
    cursor: pointer;
  }

  .hamburger:hover {
    opacity: 0.75;
  }

  .hamburger:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 3px;
  }

  :global(.sm) .hamburger {
    display: none;
  }
</style>
