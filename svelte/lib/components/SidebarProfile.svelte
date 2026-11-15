<script lang="ts">
  import { api, apiState, userQuery } from "$lib/api.svelte";
  import { link } from "@milizt/runeway";

  const user = $derived(apiState.user || null);

  async function logout() {
    await api.auth.logout.post();
    userQuery.reload();
  }
</script>

<div class="profile-mini">
  {#if user !== null}
    <div class="profile-avatar">
      {user?.firstName?.charAt(0).toUpperCase() ?? ""}
    </div>

    <div class="profile-info">
      <div class="profile-name">
        {user?.firstName}

        {#if user?.lastName}
          {user.lastName}
        {/if}
      </div>

      <span class="profile-role">
        {user?.role === "admin" ? "Administrator" : "Customer"}
      </span>
    </div>

    <a
      href="/profile"
      id="openProfileButton"
      aria-label="Open Profile"
      title="Open Profile"
      class="profile-maximize"
      use:link
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="16" cy="10" r="5" />
        <path d="M6 29c1.5-6 5-9 10-9s8.5 3 10 9" />
      </svg>
    </a>

    <button
      type="button"
      onclick={logout}
      id="logoutButton"
      aria-label="Logout"
      title="Logout"
      class="profile-logout"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path
          d="M20 8V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v22a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3"
        />
        <path d="M14 16h13" />
        <path d="m23 11 4 5-4 5" />
      </svg>
    </button>
  {:else}
    <div class="no-account">
      <a href="/register" class="auth-link" use:link> Sign Up </a>
      <a href="/login" class="auth-link" use:link> Login </a>
    </div>
  {/if}
</div>

<style>
  .profile-mini {
    display: flex;
    width: 100%;
    align-items: center;
    gap: 0.75rem;
    border-top: 1px solid rgb(255 255 255 / 50%);
    background-color: rgb(239 246 255 / 30%);
    padding: 0.75rem;
    backdrop-filter: blur(12px);
  }

  .profile-avatar {
    display: flex;
    aspect-ratio: 1 / 1;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    background-color: var(--color-navy);
    font-weight: 700;
    color: white;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 5%);
    height: clamp(2.5rem, 4vw, 3.5rem);
  }

  .profile-info {
    min-width: 0;
    flex: 1;
  }

  .profile-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 600;
    line-height: 1.25;
    color: #1e293b;
    font-size: clamp(0.8rem, 1vw, 1rem);
  }

  .profile-role {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-top: 0.25rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #475569;
    font-size: clamp(0.55rem, 0.7vw, 0.7rem);
  }

  .profile-maximize,
  .profile-logout {
    display: flex;
    aspect-ratio: 1 / 1;
    height: 2.25rem;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    color: #475569;
    transition: all 150ms ease-in-out;
  }

  .profile-maximize:hover {
    background-color: #dbeafe;
    color: var(--color-navy);
  }

  .profile-logout:hover {
    background-color: #fee2e2;
    color: #dc2626;
  }

  .no-account {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: calc(var(--spacing) * 4);
    width: 100%;
  }

  .auth-link {
    border-radius: 0.75rem;
    background-color: white;
    padding: 0.625rem 1.25rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-primary);
    box-shadow: var(--shadow-sm);
    transition:
      transform 150ms,
      background-color 150ms;
  }

  .auth-link:hover {
    transform: translateY(-0.125rem);
    background-color: #f1f5f9;
  }
</style>
