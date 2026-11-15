<script module lang="ts">
  import { api, apiState, query, userQuery } from "$lib/api.svelte";

  const allUsersQuery = query(() => api.admin.account.get());
</script>

<script lang="ts">
  import Button from "$lib/components/input/Button.svelte";
  import Input from "$lib/components/input/Input.svelte";
  import Modal from "$lib/components/modal/Modal.svelte";
  import ModalNavigator from "$lib/components/modal/ModalNavigator.svelte";
  import Select from "$lib/components/input/Select.svelte";
  import type { User } from "$server/routes/user";

  let users = $derived((allUsersQuery.data?.data as User[]) ?? null);
  let currentUser = $derived(apiState.user);

  let modal: Modal;
  let firstName: string = $state("");
  let lastName: string | undefined = $state("");
  let email: string = $state("");
  let role: "admin" | "user" = $state("user");
  let editedUser: User;

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    const isEditingSelf = editedUser.id === currentUser.id;

    const payload = {
      firstName,
      lastName,
      email,
      ...(!isEditingSelf && { role }),
    };

    await api.admin.account({ id: editedUser.id }).put(payload);

    userQuery.reload();
    allUsersQuery.reload();

    modal.close();
  }

  async function editUser(user: User) {
    editedUser = user;
    firstName = user.firstName;
    lastName = user.lastName;
    email = user.email;
    role = user.role as "admin" | "user";

    modal.open("Manage User");
  }
</script>

<svelte:head>
  <title>Manage User - SenpaiStore</title>
</svelte:head>

<main class="page">
  <header class="page-header">
    <h1 class="page-title">User Management</h1>

    <p class="page-subtitle">
      Manage registered users and their account roles.
    </p>
  </header>

  <section id="userList" class="card-list user-section">
    {#if !users?.length}
      <div class="empty-state">
        <p class="empty-state-text">No users found.</p>
      </div>
    {:else}
      {#each users as account}
        <article class="card">
          <header class="card-header">
            <div class="user-identity">
              <div class="user-avatar">
                {account.firstName.charAt(0).toUpperCase()}
              </div>

              <div class="user-name-wrap">
                <h2 class="card-title user-name">
                  {account.firstName}
                  {account.lastName}
                </h2>
              </div>
            </div>
          </header>

          <p class="card-description user-email">
            {account.email}
          </p>

          <dl class="card-info">
            <div class="card-info-row">
              <dt class="card-info-label">User ID</dt>

              <dd class="card-info-value">
                #{account.id}
              </dd>
            </div>

            <div class="card-info-row">
              <dt class="card-info-label">Role</dt>

              <dd class="card-info-value">
                {account.role === "admin" ? "Administrator" : "User"}
              </dd>
            </div>
          </dl>

          <div class="card-actions">
            <Button
              variant="primary"
              type="button"
              onclick={() => editUser(account)}
              style="width: 100%"
            >
              Manage
            </Button>
          </div>
        </article>
      {/each}
    {/if}
  </section>
</main>

<Modal bind:this={modal}>
  <form onsubmit={handleSubmit}>
    <Input
      label="First Name"
      type="text"
      id="firstName"
      placeholder="John"
      required
      bind:value={firstName}
    />

    <Input
      label="Last Name"
      type="text"
      id="lastName"
      placeholder="Smith"
      bind:value={lastName}
    />

    <Input
      label="Email"
      type="email"
      id="email"
      placeholder="johnsmith@gmail.com"
      required
      bind:value={email}
    />

    <Select
      label="Role"
      id="role"
      options={[
        { label: "User", value: "user" },
        { label: "Administrator", value: "admin" },
      ]}
      required
      bind:value={role}
    />

    <ModalNavigator>
      <Button variant="cancel" onclick={() => modal.close()}>Cancel</Button>
      <Button variant="confirm" type="submit">Save Changes</Button>
    </ModalNavigator>
  </form>
</Modal>

<style>
  /* ---------- Page (from markup utilities) ---------- */

  .page {
    flex: 1 1 0%;
    overflow: auto;
    padding: 1.5rem 0;
  }

  .page-header {
    margin-inline: 1.75rem;
    margin-bottom: 1.5rem;
  }

  .page-title {
    font-size: 1.5rem;
    line-height: 2rem;
    font-weight: 700;
    color: #111827;
  }

  .page-subtitle {
    margin-top: 0.25rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: #4b5563;
  }

  .user-section {
    padding-inline: 1.75rem;
  }

  .empty-state {
    width: 100%;
    padding: 2rem;
    text-align: center;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    background-color: #fff;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  }

  .empty-state-text {
    color: #6b7280;
  }

  .user-identity {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .user-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    aspect-ratio: 1 / 1;
    height: 2.5rem;
    border-radius: 0.5rem;
    background-color: var(--color-navy);
    font-weight: 700;
    color: #fff;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  }

  .user-name-wrap {
    min-width: 0;
  }

  .user-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-email {
    word-break: break-all;
  }

  .card-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  /* ---------- Product list / card (from the .css file) ---------- */

  .card-list {
    min-height: 0;
    flex: 1 1 0%;
    width: 100%;
    overflow-y: auto;
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    gap: 1.25rem;
    justify-content: center;
  }

  @media (min-width: 1024px) {
    .card-list {
      justify-content: flex-start;
    }
  }

  .card {
    display: flex;
    flex-direction: column;
    flex: 1 1 320px;
    width: 100%;
    min-width: 0;
    max-width: 320px;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    background-color: rgb(255 255 255 / 0.95);
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  }

  .card-header {
    margin-bottom: 0.75rem;
  }

  .card-title {
    font-size: 1.125rem;
    line-height: 1.75rem;
    font-weight: 600;
    color: #111827;
  }

  .card-description {
    margin-top: 0.5rem;
    margin-bottom: 1rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: #4b5563;
  }

  .card-info {
    margin-bottom: 1rem;
  }

  .card-info-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  .card-info-row + .card-info-row {
    margin-top: 0.25rem;
  }

  .card-info-label {
    color: #6b7280;
  }

  .card-info-value {
    font-weight: 500;
    color: #111827;
  }
</style>