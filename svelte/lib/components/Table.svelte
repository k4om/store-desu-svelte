<script lang="ts" generics="T">
  import type { Snippet } from "svelte";

  interface Props {
    title: string;
    items: T[];
    header: Snippet<[]>;
    row: Snippet<[T, number]>;
    key: keyof T;
    emptyMessage: string;
  }
  let {
    title,
    items = [],
    row,
    header,
    key,
    emptyMessage = "No data found.",
  }: Props = $props();
</script>

<div class="table-container">
  {#if items.length > 0}
    <table class="table">
      <caption class="sr-only">{title}</caption>

      <thead class="table-header">
        <tr class="table-row">
          {@render header()}
        </tr>
      </thead>

      <tbody class="table-body">
        {#each items as item, index (item[key])}
          <tr class="table-row">
            {@render row(item, index)}
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <div class="empty-state">
      <h3>{emptyMessage}</h3>
    </div>
  {/if}
</div>

<style>
  .table-container {
    overflow-x: auto;
    border-radius: 0.75rem;
    background-color: rgb(239 246 255 / 50%);
    backdrop-filter: blur(12px);
    box-shadow:
      0 1px 3px 0 rgb(0 0 0 / 10%),
      0 1px 2px -1px rgb(0 0 0 / 10%);
  }

  .table {
    width: 100%;
    border-collapse: collapse;
  }

  .table-header tr {
    border-bottom: 1px solid #e2e8f0;
    background-color: rgb(248 250 252 / 50%);
  }

  .table-header :global(th) {
    padding: 0.875rem 1rem;
    text-align: center;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #64748b;
  }

  .table-body {
    border-color: rgb(241 245 249 / 50%);
  }

  .table-body tr {
    transition: background-color 150ms ease-in-out;
  }

  .table-body tr:hover {
    background-color: rgb(248 250 252 / 50%);
  }

  .table-body :global(td) {
    border: 1px solid rgb(203 213 225 / 50%);
    padding: 0.625rem 0.75rem;
    font-size: 0.875rem;
  }

  .table-body tr:hover :global(td) {
    border-color: rgb(30 41 59 / 20%);
  }

  .empty-state {
    display: flex;
    min-height: 220px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2.5rem 1.5rem;
    text-align: center;
  }

  .empty-state h3 {
    margin: 0;
    color: #334155;
    font-size: 0.95rem;
    font-weight: 600;
  }
</style>
