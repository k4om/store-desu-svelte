<script lang="ts">
  import { apiState } from "$lib/api.svelte";
  import ProductCard from "$lib/components/ProductCard.svelte";
  import { routes } from "$lib/routes.svelte";

  const paramid = $derived(routes.match ? (routes.match.params as { id: string }).id : { id: "all" });
  const currentCategory = $derived.by(() => {
    const id = Number(paramid);

    if (!paramid || !Number.isInteger(id) || id < 1) return null;

    return apiState.categories.find((category) => category.id === id) ?? null;
  });

  const products = $derived(
    currentCategory
      ? apiState.products.filter(
          (product) => product.categoryId === currentCategory.id,
        )
      : apiState.products,
  );
</script>

<svelte:head>
  <title>{((paramid === "all" || currentCategory === null) ? "All Products" : currentCategory.label) + " - SenpaiStore"}</title>
</svelte:head>

<main class="page-content">
  <header class="page-header">
    <h1 id="categoryTitle">
      {currentCategory?.label || "All Products"}
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
    {/each}
  </section>
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

  @media (max-width: 640px) {
    .page-content {
      padding: 1rem;
    }

    .page-header h1 {
      font-size: 1.25rem;
    }
  }
</style>
