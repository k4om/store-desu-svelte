
<script lang="ts">
  import type { HTMLSelectAttributes } from "svelte/elements";

  export interface Option {
    label: string;
    value: string | number;
    disabled?: boolean;
  }

  interface Props extends HTMLSelectAttributes {
    label: string;
    id: string;
    options: Option[];
    value?: string | number;
    placeholder?: string;
    hint?: string;
    class?: string;
  }

  let {
    label,
    id,
    options = [],
    value = $bindable(""),
    name = id,
    required = false,
    placeholder = "Select an option",
    hint,
    class: classes,
    ...props
  }: Props = $props();

  let select: HTMLSelectElement;
  let error = $state("");

  function validate() {
    if (!select.checkValidity()) {
      error = select.validity.valueMissing
        ? "This section must be filled."
        : "Invalid selection.";

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

  <select
    bind:this={select}
    {id}
    {name}
    bind:value
    {required}
    aria-describedby={[`${id}-error`, hint ? `${id}-help` : ""].join(" ")}
    onfocusout={validate}
    {...props}
  >
    <option value="" disabled>{placeholder}</option>

    {#each options as option}
      <option value={option.value} disabled={option.disabled}>
        {option.label}
      </option>
    {/each}
  </select>

  <span class="error-message" id={`${id}-error`} aria-live="polite">
    {error}
  </span>
</div>

<style>
  .input-wrapper {
    display: flex;
    flex-direction: column;
    margin-top: calc(var(--spacing) * 4);
    color: black;
  }

  select {
    margin-top: calc(var(--spacing) * 2);
    padding: calc(var(--spacing) * 2) calc(var(--spacing) * 4);
    background-color: var(--color-blue-100);
    width: 100%;

    border-radius: var(--radius-lg);
    border: 1px solid var(--color-slate-200);

    outline: none;
    color: var(--color-black);
    cursor: pointer;

    &:hover,
    &:focus {
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
