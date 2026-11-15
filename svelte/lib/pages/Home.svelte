<script lang="ts">
  import { apiState } from "$lib/api.svelte.ts";
  import Hero from "$lib/components/home/Hero.svelte";
  import HomeCta from "$lib/components/home/HomeCta.svelte";
  import HomeDirectorySection from "$lib/components/home/HomeDirectorySection.svelte";
  import ProductCard from "$lib/components/ProductCard.svelte";
  import { type Category } from "$server/db/categorydb.ts";
  import { type Product } from "$server/db/productdb.ts";
  import { link } from "@milizt/runeway";
  
  const categories = $derived(apiState.categories);
  const products = $derived(apiState.products);
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<main>
  <Hero />

  <HomeDirectorySection
    eyebrow="Explore"
    label="Shop by Category"
    items={categories}
  >
    {#snippet renderItem(category: Category)}
      <a href="/category/{category.id}" class="category-card" use:link>
        <div
          style="display: flex; align-items: center; justify-content: space-between; gap: calc(var(--spacing) * 4);"
        >
          <h3 class="category-card__label">
            {category.label}
          </h3>

          <svg
            class="category-card__arrow"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
          </svg>
        </div>

        <p class="category-card__desc">
          {category.desc || "Explore products in this category."}
        </p>
      </a>
    {/snippet}
  </HomeDirectorySection>

  <HomeDirectorySection
    eyebrow="Our Collection"
    label="Latest Products"
    items={products.slice(0, 8)}
  >
    {#snippet renderEmpty()}
      <div
        class="rounded-2xl bg-white/80 p-12 text-center shadow-sm backdrop-blur"
      >
        <h3 class="text-lg font-semibold text-slate-800">No products yet</h3>

        <p class="mt-1 text-sm text-slate-500">
          Check back later for new products.
        </p>
      </div>
    {/snippet}
    {#snippet renderItem(product: Product)}
      <ProductCard product={product} />
    {/snippet}
  </HomeDirectorySection>

  <HomeCta />
</main>

<footer class="footer">Senpai Store</footer>

<style>
  .category-card {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-rows: auto 1fr;
    align-items: center;
    column-gap: calc(var(--spacing) * 4);
    row-gap: calc(var(--spacing) * 3);
    aspect-ratio: 16 / 9;
    border-radius: var(--radius-2xl);
    border-width: 1px;
    border-style: solid;
    border-color: color-mix(in oklab, white 20%, transparent);
    background-color: color-mix(in oklab, white 10%, transparent);
    padding: calc(var(--spacing) * 6);
    box-shadow: var(--shadow-sm);
    backdrop-filter: blur(8px);
    transition-property: background-color, box-shadow, transform;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }

  .category-card:hover {
    transform: translateY(calc(var(--spacing) * -1));
    background-color: color-mix(in oklab, white 20%, transparent);
    box-shadow:
      0 20px 25px -5px rgb(0 0 0 / 0.1),
      0 8px 10px -6px rgb(0 0 0 / 0.1);
  }

  .category-card__label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--text-lg);
    line-height: var(--text-lg--line-height);
    font-weight: 700;
    color: white;
    transition: color cubic-bezier(0.4, 0, 0.2, 1) 150ms;
  }

  .category-card:hover .category-card__label {
    color: var(--color-blue-100);
  }

  .category-card__arrow {
    color: color-mix(in oklab, var(--color-white) 40%, transparent);
    transition-property: color, transform;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }

  .category-card:hover .category-card__arrow {
    transform: translateX(var(--spacing));
    color: white;
  }

  .category-card__desc {
    grid-column: 1 / -1;
    align-self: start;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    font-size: var(--text-sm);
    line-height: var(--leading-relaxed);
    color: var(--color-slate-200);
  }

  .footer {
    border-top: 1px solid color-mix(in oklab, white 10%, transparent);
    padding: calc(var(--spacing) * 6);
    text-align: center;
    font-size: var(--text-sm);
    color: var(--color-slate-300);
  }
</style>
