<script lang="ts">
  import { api, apiState, query } from "$lib/api.svelte";
  import { routes } from "$lib/routes.svelte";
  import { link } from "@milizt/runeway";
  import Button from "$lib/components/input/Button.svelte";

  const productId = $derived(routes.match ? Number((routes.match.params as { id: string }).id) : 0);
  const productQuery = query(() => api.product({ id: productId }).get());
  const product = $derived(productQuery.data?.data);

  const category = $derived(
    apiState.categories.find((c) => c.id === product?.categoryId),
  );

  let quantity = $state(1);
  let purchased = $state(false);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);

  async function purchase() {
    if (!product || product.stock <= 0) return;

    await api.me.transaction.post({ items: [{ productId: product.id, quantity } ]})
    productQuery.reload()

    purchased = true;
    setTimeout(() => purchased = false, 1000);
  }
</script>

<svelte:head>
  <title>
    {`${product?.label || "Product"} - SenpaiStore`}
  </title>
</svelte:head>

<main>
  <div class="product-container">
    {#if productQuery.loading && !product}
      <div class="panel message">Loading product...</div>
    {:else if !product}
      <div class="panel message">
        <h2>Product not found</h2>
        <p>This product doesn't exist or may have been removed.</p>
        <a href="/category/all" use:link>Back to products</a>
      </div>
    {:else}
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/" use:link>Home</a>
        <span aria-hidden="true">/</span>
        <a href="/category/all" use:link>Products</a>
        <span aria-hidden="true">/</span>
        <a href={`/category/${product.categoryId}`} use:link>
          {category?.label ?? "Category"}
        </a>
        <span aria-hidden="true">/</span>
        <span class="current">{product.label}</span>
      </nav>

      <section class="panel product">
        <div class="image-placeholder">
          <span>◇</span>
          <p>No product image available</p>
        </div>

        <div class="product-info">
          <span class="category">
            {category?.label ?? "Uncategorized"}
          </span>

          <h1>{product.label}</h1>

          <div class="price">{formatPrice(product.price)}</div>

          <p class="description">
            {product.desc || "No description available."}
          </p>

          <div class="stock">
            <span
              class="stock-dot"
              class:available={product.stock > 0}
              class:unavailable={product.stock <= 0}
            ></span>

            {#if product.stock > 0}
              {product.stock} items available
            {:else}
              Out of stock
            {/if}
          </div>

          {#if product.stock > 0}
            <div class="purchase">
              <div class="quantity">
                <button
                  type="button"
                  onclick={() => (quantity = Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity">−</button
                >

                <span>{quantity}</span>

                <button
                  type="button"
                  onclick={() =>
                    (quantity = Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  aria-label="Increase quantity">+</button
                >
              </div>

              <div class="cart-action">
                <Button variant="primary" onclick={purchase}>
                  {purchased ? "Purchased ✓" : "Buy"}
                </Button>
              </div>
            </div>
          {/if}

          <div class="product-meta">
            <p>Product ID: <strong>{product.id}</strong></p>
            <p>Category ID: <strong>{product.categoryId}</strong></p>
          </div>
        </div>
      </section>
    {/if}
  </div>
</main>

<style>
  main {
    flex: 1;
    overflow: auto;
    padding: 1.5rem 1.75rem;
  }

  .product-container {
    width: 100%;
    max-width: 64rem;
    margin-inline: auto;
  }

  /* Same frosted card as the profile form */
  .panel {
    padding: 1.5rem;
    border-radius: 0.5rem;
    background-color: rgb(255 255 255 / 65%);
    color: #000;
    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 25%);
    backdrop-filter: blur(16px);
  }

  /* Breadcrumb sits on the bare gradient, so use the same dark tones as the profile header */
  .breadcrumb {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
    color: #374151;
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  .breadcrumb a {
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .breadcrumb a:hover {
    color: #111827;
  }

  .breadcrumb .current {
    color: #111827;
    font-weight: 600;
  }

  .product {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 2rem;
    align-items: start;
  }

  .image-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    aspect-ratio: 1;
    border: 1px dashed #94a3b8;
    border-radius: 0.5rem;
    background-color: rgb(255 255 255 / 50%);
    color: #475569;
  }

  .image-placeholder span {
    font-size: 4rem;
    line-height: 1;
  }

  .image-placeholder p {
    margin: 0;
    font-size: 0.875rem;
  }

  .category {
    display: inline-block;
    padding: 0.125rem 0.75rem;
    border-radius: 999px;
    background-color: #e2e8f0;
    color: #1e293b;
    font-size: 0.875rem;
    font-weight: 600;
  }

  h1 {
    margin: 0.75rem 0 0.25rem;
    color: #111827;
    font-size: 1.75rem;
    line-height: 2.25rem;
    font-weight: 700;
  }

  .price {
    margin: 0.5rem 0 1rem;
    color: #111827;
    font-size: 1.75rem;
    font-weight: 800;
  }

  .description {
    margin: 0;
    color: #374151;
    font-size: 0.9375rem;
    line-height: 1.7;
  }

  .stock {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1.25rem;
    padding-top: 1.25rem;
    border-top: 1px solid #e2e8f0;
    color: #111827;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .stock-dot {
    width: 0.625rem;
    height: 0.625rem;
    border-radius: 50%;
  }

  .available {
    background: #16a34a;
  }

  .unavailable {
    background: #dc2626;
  }

  .purchase {
    display: flex;
    gap: 0.75rem;
    margin-top: 1.25rem;
  }

  .quantity {
    display: flex;
    align-items: center;
    border: 1px solid #94a3b8;
    border-radius: 0.5rem;
    background-color: rgb(255 255 255 / 70%);
    color: #111827;
    font-weight: 600;
  }

  .quantity button {
    width: 2.5rem;
    height: 2.5rem;
    border: 0;
    border-radius: 0.5rem;
    background: transparent;
    color: inherit;
    font-size: 1.25rem;
    cursor: pointer;
  }

  .quantity button:hover:not(:disabled) {
    background-color: #e2e8f0;
  }

  .quantity button:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .quantity span {
    min-width: 2rem;
    text-align: center;
  }

  .cart-action {
    flex: 1;
  }

  .product-meta {
    margin-top: 1.5rem;
    padding-top: 1.25rem;
    border-top: 1px solid #e2e8f0;
    color: #4b5563;
    font-size: 0.8125rem;
  }

  .product-meta p {
    margin: 0.125rem 0;
  }

  .product-meta strong {
    color: #111827;
  }

  .message {
    padding: 3rem 1.5rem;
    text-align: center;
    color: #111827;
  }

  .message p {
    color: #374151;
  }

  .message a {
    color: #1e3a8a;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    main {
      padding: 1rem;
    }

    .product {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }
</style>