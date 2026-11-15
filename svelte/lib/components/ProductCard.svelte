<script lang="js">
  import { link } from "@milizt/runeway";

  const { product } = $props();
</script>

<article class="product-card">
  <div class="product-card-header">
    <div class="mb-3 flex items-start justify-between gap-3">
      <h3 class="product-card-title">
        {product.label}
      </h3>

      {#if product.stock > 0}
        <span
          class="shrink-0 rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold uppercase text-green-700"
        >
          Available
        </span>
      {:else}
        <span
          class="shrink-0 rounded-full bg-red-100 px-2 py-1 text-[10px] font-bold uppercase text-red-600"
        >
          Sold Out
        </span>
      {/if}
    </div>

    <p class="product-card-description">
      {product.desc}
    </p>
  </div>

  <div class="product-card-info">
    <div class="product-card-info-row">
      <span class="product-card-info-label"> Category </span>

      <span class="product-card-info-value">
        {product.categoryLabel ?? "-"}
      </span>
    </div>

    <div class="product-card-info-row">
      <span class="product-card-info-label"> Stock </span>

      <span class="product-card-info-value">
        {product.stock}
      </span>
    </div>

    <div class="product-card-info-row">
      <span class="product-card-info-label"> Price </span>

      <span class="product-card-info-value">
        Rp{product.price.toLocaleString("id-ID")}
      </span>
    </div>
  </div>

  <a href="/product/{product.id}" class="product-card-buy text-center" use:link>
    View Product
  </a>
</article>

<style>
  .product-list {
    min-height: 0;
    flex: 1;
    width: 100%;
    overflow-y: auto;

    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    gap: 1.25rem;

    justify-content: center;
  }

  @media (min-width: 1024px) {
    .product-list {
      justify-content: flex-start;
    }
  }

  .product-card {
    display: flex;
    width: 100%;
    min-width: 0;
    max-width: 320px;
    flex: 1 1 320px;
    flex-direction: column;

    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
    background: rgb(255 255 255 / 95%);
    padding: 1rem;

    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  }

  .product-card-header {
    margin-bottom: 0.75rem;
  }

  .product-card-title {
    font-size: 1.125rem;
    line-height: 1.75rem;
    font-weight: 600;
    color: #111827;
  }

  .product-card-description {
    margin-top: 0.5rem;
    margin-bottom: 1rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: #4b5563;
  }

  .product-card-info {
    margin-bottom: 1rem;
  }

  .product-card-info-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;

    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  .product-card-info-row + .product-card-info-row {
    margin-top: 0.25rem;
  }

  .product-card-info-label {
    color: #6b7280;
  }

  .product-card-info-value {
    font-weight: 500;
    color: #111827;
  }

  .product-card-buy {
    display: block;
    width: 100%;
    cursor: pointer;

    border-radius: 0.25rem;
    background-color: var(--color-navy, #001f3f);
    padding: 0.5rem 0.75rem;

    font-size: 0.875rem;
    line-height: 1.25rem;
    font-weight: 500;
    color: white;
    text-align: center;

    transition: opacity 150ms;
  }

  .product-card-buy:hover {
    opacity: 0.9;
  }

  .product-card-buy:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
</style>
