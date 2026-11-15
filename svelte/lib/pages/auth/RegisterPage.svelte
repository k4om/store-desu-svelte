<script lang="ts">
  import AuthHeader from "$lib/components/auth/AuthHeader.svelte";
  import AuthSubmitButton from "$lib/components/auth/AuthSubmitButton.svelte";
  import Input from "$lib/components/input/Input.svelte";
  import { router, link } from "@milizt/runeway";

  const redirectTo = new URLSearchParams(router.qs).get("on_success_redirect_to") ?? "/category/all";
</script>

<svelte:head>
  <title>Register Account - SenpaiStore</title>
</svelte:head>

<AuthHeader />

<main class="mt-8">
  <form action="/api/auth/register?on_success_redirect_to={redirectTo}" method="POST">
    <div class="flex gap-4 w-full flex-col xxs:flex-row">
      <Input
        type="text"
        label="First Name"
        id="firstName"
        placeholder="John"
        required
        autocomplete="given-name"
        class="flex-1"
      />

      <Input
        type="text"
        label="Last Name"
        id="lastName"
        placeholder="Smith"
        autocomplete="family-name"
        class="flex-1"
      />
    </div>

    <Input
      type="email"
      label="Email"
      id="email"
      placeholder="johnsmith@gmail.com"
      required
      autocomplete="email"
    />

    <Input
      type="password"
      label="Password"
      id="password"
      required
      minlength={8}
      placeholder="strong password"
      pattern={/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/.source}
      hint="Minimum 8 character, contains capitalized letter, small letter, and number."
    />

    <div class="mt-4 text-slate-100 align-text-top">
      <input
        type="checkbox"
        id="agreeTermsPolicy"
        required
        aria-describedby="disagreeError"
      />
      <label for="agreeTermsPolicy" class="ml-2">
        I agree with
        <a href="/terms" class="underline"> Terms & Condition </a>
        and
        <a href="/policy" class="underline">Policy</a>
      </label>
      <span class="error-message" id="disagreeError" aria-live="polite"></span>
    </div>

    <AuthSubmitButton>
      Register Account
    </AuthSubmitButton>

    <div
      id="formStatus"
      role="status"
      aria-live="assertive"
      class="error-message mt-4"
    ></div>
  </form>

  <p class="mt-8 text-sm text-right">
    Already have an account?
    <a href="/login" class="underlined-link" use:link>Sign In!</a>
  </p>
</main>
