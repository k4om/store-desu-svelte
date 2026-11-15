<script lang="ts" generics="T">
  import type { Snippet } from "svelte";

  interface Props {
    eyebrow: string;
    label: string;
    items: T[];
    renderItem: Snippet<[T]>;
    renderEmpty?: Snippet<[]>;
  }

  const { eyebrow, label, items, renderItem, renderEmpty }: Props = $props();
</script>

<section class="directory-section">
  <div class="directory-section__container">
    <div class="directory-section__header">
      <p class="directory-section__eyebrow">{eyebrow}</p>
      <h2 class="directory-section__title">{label}</h2>
      <span class="directory-section__count">{items.length} items</span>
    </div>

    <div class="directory-section__grid">
      {#if items.length}
        {#each items as item}
          {@render renderItem(item)}
        {/each}
      {:else}
        {@render renderEmpty?.()}
      {/if}
    </div>
  </div>
</section>

<style>
  .directory-section {
    padding-inline: calc(var(--spacing) * 6);
    padding-block: calc(var(--spacing) * 14);
  }

  :global(.sm) .directory-section {
    padding-inline: calc(var(--spacing) * 10);
  }

  :global(.lg) .directory-section {
    padding-inline: calc(var(--spacing) * 16);
  }

  .directory-section__container {
    margin-inline: auto;
    max-width: var(--container-7xl);
  }

  .directory-section__header {
    margin-bottom: calc(var(--spacing) * 7);
    /* display: flex;
    align-items: end;
    justify-content: space-between;
    gap: calc(var(--spacing) * 4); */
  }

  .directory-section__eyebrow {
    font-size: var(--text-xs);
    line-height: var(--text-xs--line-height);
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: color-mix(in oklab, white 60%, transparent);
  }

  .directory-section__title {
    margin-top: var(--spacing);
    font-size: var(--text-3xl);
    line-height: var(--text-3xl--line-height);
    font-weight: bold;
    color: white;
  }

  .directory-section__count {
    font-size: var(--text-sm);
    line-height: var(--text-sm--line-height);
    color: var(--color-slate-200);
  }

  .directory-section__grid {
    display: grid;
    gap: calc(var(--spacing) * 5);
  }

  :global(.sm) .directory-section__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  :global(.lg) .directory-section__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  :global(.xl) .directory-section__grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
</style>
