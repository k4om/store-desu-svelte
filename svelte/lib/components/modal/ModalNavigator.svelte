<script lang="ts">
  import type { Snippet } from "svelte";

  let { children } = $props();
</script>

<footer class="modal-footer">
  {@render children()}
</footer>

<style>
    .modal-footer {
        display: flex;
        justify-content: flex-end;
        margin-top: calc(var(--spacing) * 5);
        gap: calc(var(--spacing) * 2.5);
    }
</style>
