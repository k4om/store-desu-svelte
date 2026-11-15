<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";

    interface Props extends HTMLButtonAttributes {};
    const { children, ...props }: Props = $props();
</script>

<button id="submit-button primary" type="submit" class="auth-submit" {...props}>
    {@render children?.()}
</button>

<style>
    .auth-submit {
        margin-top: calc(var(--spacing) * 8);
        padding-block: calc(var(--spacing) * 2);
        padding-inline: calc(var(--spacing) * 4);
        border-radius: var(--radius-4xl);
        width: 100%;
        background-color: var(--color-primary);
        color: white;

        transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke;
        transition-timing-function: var(--default-transition-timing-function);
        transition-duration: 550ms;
    }

    .auth-submit:hover {
        background-color: var(--color-primary-hover);
    }
</style>