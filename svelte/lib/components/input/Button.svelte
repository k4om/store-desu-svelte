<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";

  type Variant =
    | "primary"
    | "secondary"
    | "confirm"
    | "cancel"
    | "danger"
    | "ghost";

  interface Props extends HTMLButtonAttributes {
    variant?: Variant;
    raised?: boolean;
  }

  let {
    variant = "primary",
    raised = false,
    type = "button",
    class: className = "",
    children,
    ...rest
  }: Props = $props();
</script>

<button {type} class="button {variant} {className}" class:raised={raised} {...rest}>
  {@render children?.()}
</button>

<style>
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    padding: 0.5rem 0.875rem;
    border: 1px solid transparent;
    border-radius: 0.375rem;

    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;

    transition:
      background-color 150ms,
      border-color 150ms,
      color 150ms;
  }

  .button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .primary {
    background: var(--color-navy);
    color: white;
  }

  .primary:hover:not(:disabled) {
    background: var(--color-navy-dark);
  }

  .secondary {
    background: #e5e7eb;
    border-color: #d1d5db;
    color: #1f2937;
  }

  .secondary:hover:not(:disabled) {
    background: #d1d5db;
  }

  .cancel {
    background: #e5e7eb;
    border-color: #9ca3af;
    color: #1f2937;
  }

  .cancel:hover:not(:disabled) {
    background: #d1d5db;
  }

  .confirm {
    padding: 0.5rem 0.875rem;
    border: none;
    border-radius: 0.25rem;

    background: var(--color-navy);
    color: white;

    font-size: 0.875rem;
    font-weight: 500;
  }

  .confirm:hover:not(:disabled) {
    background: var(--color-navy-dark);
  }

  .danger {
    background: #dc2626;
    color: white;
  }

  .danger:hover:not(:disabled) {
    background: #b91c1c;
  }

  .ghost {
    background: transparent;
    color: inherit;
  }

  .ghost:hover:not(:disabled) {
    background: rgb(0 0 0 / 8%);
  }

  .raised {
    border-color: white;
    border-width: 0;
    border-top-width: 2px;
    border-right-width: 1px;
    box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
    transition:
      background-color 150ms,
      border-color 150ms,
      border-width 150ms,
      color 150ms,
      box-shadow 150ms;
  }

  .raised:hover:not(:disabled) {
    border-color: #94a3b8;
    border-width: 1px;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 10%);
  }
</style>
