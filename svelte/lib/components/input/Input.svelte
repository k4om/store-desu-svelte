<script lang="ts">
  import type { FullAutoFill, HTMLInputAttributes } from "svelte/elements";

  interface Props extends HTMLInputAttributes {
    label: string;
    id: string;
    type?: string;
    name?: string;
    placeholder?: string;
    required?: boolean;
    autocomplete?: FullAutoFill;
    hint?: string;
    class?: string;
  }

  let {
    label,
    id,
    value = $bindable(),
    type = "text",
    name = id,
    placeholder = "",
    required = false,
    autocomplete,
    hint,
    class: classes,
    ...props
  }: Props = $props();

  let input: HTMLInputElement;
  let error = $state("");

  function validate() {
    if (!input.checkValidity()) {
      error = input.validity.valueMissing
        ? "This section must be filled."
        : input.validity.typeMismatch && input.type === "email"
          ? "The email was malformed."
          : "Invalid input.";

      return false;
    }

    error = "";
    return true;
  }
</script>

<div class={["input-wrapper", classes]}>
  <label for={id}>{label}</label>

  {#if hint}
    <small id={`${id}-help`} class="input-help">{hint}</small>
  {/if}

  <input
    bind:this={input}
    bind:value
    {id}
    {type}
    {name}
    {placeholder}
    {required}
    {autocomplete}
    aria-describedby={[`${id}-error`, hint ? `${id}-help` : ""].join(' ')}
    onfocusout={validate}
    {...props}
  />

  <span class="error-message" id={`${id}-error`} aria-live="polite"
    >{error}</span
  >
</div>

<style>
  .input-wrapper {
    display: flex;
    flex-direction: column;
    margin-top: calc(var(--spacing) * 4);
    color: black;
  }

  input {
    margin-top: calc(var(--spacing) * 2);
    padding: calc(var(--spacing) * 2) calc(var(--spacing) * 4);
    background-color: var(--color-blue-100);
    width: 100%;

    border-radius: var(--radius-lg);
    border: 1px solid var(--color-slate-200);

    outline: none;
    color: var(--color-black);

    &:hover,
    &:active {
      border-color: var(--color-primary-hover);
    }
  }

  .input-wrapper:has([required]) label::after {
    content: " *";
    color: var(--color-red-600);
  }

  .error-message {
    margin-top: calc(var(--spacing) * 4);
    background-color: color-mix(
      in oklab,
      var(--color-red-500) 20%,
      transparent
    );
    color: var(--color-red-500);
    padding-inline: calc(var(--spacing) * 4);
    padding-block: calc(var(--spacing) * 2);
    border-radius: var(--radius-xl);
  }

  .error-message:empty {
    display: none;
  }

  .error-message::before {
    margin-right: calc(var(--spacing) * 2);
    display: inline-flex;
    height: calc(var(--spacing) * 5);
    width: calc(var(--spacing) * 5);
    align-items: center;
    justify-content: center;
    border-radius: calc(infinity * 1px);
    border: 1px solid currentColor;
    font-weight: var(--font-weight-bold);
    line-height: 1;
    content: "!";
  }

  .input-help {
    color: var(--color-slate-200);
    font-size: var(--text-sm);
    line-height: var(--tw-leading, var(--text-sm--line-height));
  }
</style>
