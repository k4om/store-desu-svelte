
<script lang="ts">
  import { api, apiState, userQuery } from "$lib/api.svelte.ts";
  import Button from "$lib/components/input/Button.svelte";
  import Input from "$lib/components/input/Input.svelte";

  const user = $derived(apiState.user ?? null);

  let firstName: string | undefined = $state(undefined);
  let lastName: string | undefined = $state(undefined);
  let email: string | undefined = $state(undefined);
  let password: string | undefined = $state(undefined);

  function revert() {
    firstName = user?.firstName;
    lastName = user?.lastName;
    email = user?.email;
    password = undefined;
  }

  async function save() {
    await api.me.put({ email, firstName, lastName, password });
    userQuery.reload();
  }

  $effect(() => {
    if (userQuery.loading || user === null) return;

    firstName = user.firstName;
    lastName = user.lastName;
    email = user.email;
  });
</script>

<svelte:head>
  <title>{user?.firstName ? `${user.firstName}'s'` : "User"} Profile - SenpaiStore'</title>
</svelte:head>

<main>
  <div class="profile-container">
    <header>
      <h1>Manage Profile</h1>

      <p>
        Update your personal details and account password.
      </p>
    </header>

    <form id="profileForm" novalidate>
      <div class="profile-fields">
        <Input
          label="First Name"
          type="text"
          id="firstName"
          placeholder="John"
          bind:value={firstName}
          required
          autocomplete="given-name"
        />

        <Input
          label="Last Name"
          type="text"
          id="lastName"
          placeholder="Smith"
          bind:value={lastName}
          autocomplete="family-name"
        />

        <Input
          label="Email"
          type="email"
          id="email"
          placeholder="johnsmith@gmail.com"
          bind:value={email}
          required
          autocomplete="email"
        />

        <Input
          label="Password"
          type="password"
          id="password"
          minlength={8}
          pattern={/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/.source}
          placeholder="Enter a new password"
          bind:value={password}
          autocomplete="new-password"
          hint="Leave empty to keep your current password. New passwords require at least 8 characters, one uppercase letter, one lowercase letter, and one number."
        />
      </div>

      <div class="profile-actions">
        <p
          id="formStatus"
          role="status"
          aria-live="assertive"
        ></p>

        <Button variant="cancel" onclick={revert}>Cancel</Button>
        <Button variant="primary" onclick={save}>Save Changes</Button>
      </div>
    </form>
  </div>
</main>

<style>
  main {
    flex: 1;
    overflow: auto;
    padding: 1.5rem 1.75rem;
  }

  .profile-container {
    width: 100%;
    max-width: 48rem;
    margin-inline: auto;
  }

  header {
    margin-bottom: 1.5rem;
    text-align: center;
  }

  header h1 {
    color: #111827;
    font-size: 1.5rem;
    line-height: 2rem;
    font-weight: 700;
  }

  header p {
    margin-top: 0.25rem;
    color: #4b5563;
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  #profileForm {
    width: 100%;
    padding: 1.5rem;
    border-radius: 0.5rem;
    background-color: rgb(255 255 255 / 65%);
    color: #000;
    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 25%);
    backdrop-filter: blur(16px);
  }

  .profile-fields {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .profile-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1.5rem;
    padding-top: 1.25rem;
    border-top: 1px solid #e2e8f0;
  }

  #formStatus {
    display: none;
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  :global(.sm) .profile-actions {
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
  }

  :global(.sm) #formStatus {
    margin-right: auto;
  }
</style>
