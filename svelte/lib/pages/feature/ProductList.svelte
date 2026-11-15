<script lang="ts">
  import { apiState, productsQuery } from "$lib/api.svelte";
  import ProductCard from "$lib/components/ProductCard.svelte";
  import { routes } from "$lib/routes.svelte";
  import { link } from "@milizt/runeway";

  // Fallback must be the string "all", not an object
  const paramid = $derived(
    routes.match ? (routes.match.params as { id: string }).id : "all",
  );

  const isAll = $derived(paramid === "all");

  const currentCategory = $derived.by(() => {
    if (isAll) return null;

    const id = Number(paramid);
    if (!paramid || !Number.isInteger(id) || id < 1) return null;

    return apiState.categories.find((category) => category.id === id) ?? null;
  });

  // Anything that isn't "all" and doesn't resolve to a real category is a 404
  const notFound = $derived(!isAll && currentCategory === null);

  const products = $derived(
    currentCategory
      ? apiState.products.filter(
          (product) => product.categoryId === currentCategory.id,
        )
      : apiState.products,
  );

  const title = $derived(
    productsQuery.loading && !isAll
      ? "Loading"
      : notFound
        ? "Category not found"
        : (currentCategory?.label ?? "All Products"),
  );
</script>

<svelte:head>
  <title>{title + " - SenpaiStore"}</title>
</svelte:head>

<main class="page-content">
  {#if !isAll && productsQuery.loading}
    <div class="panel message">Loading category...</div>
  {:else if notFound}
    <div class="panel message">
      <h1>Category not found</h1>
      <p>This category doesn't exist or may have been removed.</p>
      <a href="/category/all" use:link>Browse all products</a>
    </div>
  {:else}
    <header class="page-header">
      <h1 id="categoryTitle">
        {currentCategory?.label ?? "All Products"}
      </h1>

      <p id="categoryDescription">
        {#if currentCategory}
          {currentCategory.desc || "No description available."}
        {/if}
      </p>
    </header>

    <section
      aria-labelledby="categoryTitle"
      class="product-list"
      id="productList"
    >
      {#each products as product (product.id)}
        <ProductCard {product} />
      {:else}
        <p class="empty">No products in this category yet.</p>
      {/each}
    </section>
  {/if}
</main>

<style>
  .page-content {
    flex: 1;
    overflow: auto;
    padding: 1.5rem 1.75rem;
  }

  .page-header {
    margin: 0 1rem 1.5rem;
  }

  .page-header h1 {
    color: #111827;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .page-header p {
    margin-top: 0.25rem;
    color: #4b5563;
    font-size: 0.875rem;
  }

  .product-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
    gap: 1rem;
  }

  .empty {
    grid-column: 1 / -1;
    margin: 0;
    color: #374151;
    font-size: 0.9375rem;
  }

  /* Not found / loading: same frosted card as the profile and product pages */
  .panel {
    width: 100%;
    max-width: 32rem;
    margin: 3rem auto 0;
    padding: 2.5rem 1.5rem;
    border-radius: 0.5rem;
    background-color: rgb(255 255 255 / 65%);
    color: #111827;
    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 25%);
    backdrop-filter: blur(16px);
  }

  .message {
    text-align: center;
  }

  .message h1 {
    font-size: 1.5rem;
    font-weight: 700;
  }

  .message p {
    margin: 0.5rem 0 1.25rem;
    color: #374151;
    font-size: 0.9375rem;
  }

  .message a {
    color: #1e3a8a;
    font-weight: 600;
    text-underline-offset: 3px;
  }

  @media (max-width: 640px) {
    .page-content {
      padding: 1rem;
    }

    .page-header h1 {
      font-size: 1.25rem;
    }

    .panel {
      margin-top: 1.5rem;
    }
  }
</style>