<script lang="ts">
  import AuthHeader from "$lib/components/auth/AuthHeader.svelte";
  import AuthInput from "$lib/components/input/Input.svelte";
  import AuthSubmitButton from "$lib/components/auth/AuthSubmitButton.svelte";
  import { router, link } from "@milizt/runeway";

  const redirectTo = new URLSearchParams(router.qs).get("on_success_redirect_to") ?? "/category/all";
</script>

<svelte:head>
  <title>Login - SenpaiStore</title>
</svelte:head>

<AuthHeader />

<main class="mt-8">
  <form action="/api/auth/login?on_success_redirect_to={redirectTo}" method="POST">
    <AuthInput
      type="email"
      label="Email"
      id="email"
      placeholder="johnsmith@gmail.com"
      required
      autocomplete="email"
    />

    <AuthInput
      type="password"
      label="Password"
      id="password"
      required
      minlength={8}
      placeholder="strong password"
      pattern={/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/.source}
    />

    <AuthSubmitButton>Log In</AuthSubmitButton>

    <div
      id="formStatus"
      role="status"
      aria-live="assertive"
      class="error-message mt-4"
    ></div>
  </form>

  <p class="mt-8 text-sm text-right">
    Don't have an account?
    <a href="/register" class="underlined-link" use:link
      >Sign Up for an account!</a
    >
  </p>
</main>
