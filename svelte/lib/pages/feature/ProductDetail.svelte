<script lang="ts">
  import { apiState, productsQuery } from "$lib/api.svelte";
  import { routes } from "$lib/routes.svelte";
  import { link } from "@milizt/runeway";

  const productId = $derived(routes.match ? Number((routes.match.params as { id: string }).id) : 0);
  const product = $derived(apiState.products.find((p) => p.id === productId));

  const category = $derived(
    apiState.categories.find((c) => c.id === product?.categoryId),
  );

  let quantity = $state(1);
  let added = $state(false);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);

  function addToCart() {
    if (!product || product.stock <= 0) return;

    console.log({
      productId: product.id,
      quantity,
    });

    added = true;
  }
</script>

<svelte:head>
  <title>
    {`${product?.label || "Product"} - SenpaiStore`}
  </title>
</svelte:head>

<main class="page">
  {#if productsQuery.loading}
    <div class="message">Loading product...</div>
  {:else if !product}
    <div class="message">
      <h2>Product not found</h2>
      <p>This product doesn't exist or may have been removed.</p>
      <a href="/category/all" use:link>Back to products</a>
    </div>
  {:else}
    <nav class="breadcrumb">
      <a href="/" use:link>Home</a>
      <span>/</span>
      <a href="/category/all" use:link>Products</a>
      <span>/</span>
      <a href={`/category/${product.categoryId}`} use:link>
        {category?.label ?? "Category"}
      </a>
      <span>/</span>
      <span>{product.label}</span>
    </nav>

    <section class="product">
      <div class="product-visual">
        <div class="image-placeholder">
          <span>◇</span>
          <p>No product image available</p>
        </div>
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

        <hr />

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
                onclick={() => (quantity = Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity">−</button
              >

              <span>{quantity}</span>

              <button
                onclick={() =>
                  (quantity = Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
                aria-label="Increase quantity">+</button
              >
            </div>

            <button class="cart-button" onclick={addToCart}>
              {added ? "Added ✓" : "Add to cart"}
            </button>
          </div>
        {/if}

        <div class="product-meta">
          <p>Product ID: <strong>{product.id}</strong></p>
          <p>Category ID: <strong>{product.categoryId}</strong></p>
        </div>
      </div>
    </section>
  {/if}
</main>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  .page {
    max-width: 1150px;
    margin: auto;
    padding: 36px 24px;
    color: var(--color, #222);
  }

  .breadcrumb {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 36px;
    font-size: 13px;
    color: #999;
  }

  .breadcrumb a {
    color: inherit;
    text-decoration: none;
  }

  .breadcrumb a:hover {
    color: var(--accent, #555);
  }

  .product {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 56px;
  }

  .image-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1;
    border-radius: 12px;
    background: var(--surface, #f2f2f2);
    color: #999;
  }

  .image-placeholder span {
    font-size: 64px;
  }

  .image-placeholder p {
    font-size: 13px;
  }

  .product-info {
    padding-top: 12px;
  }

  .category {
    color: #888;
    font-size: 13px;
  }

  h1 {
    margin: 12px 0;
    font-size: clamp(28px, 4vw, 38px);
  }

  .price {
    margin: 24px 0;
    font-size: 28px;
    font-weight: 700;
  }

  .description {
    color: #888;
    font-size: 14px;
    line-height: 1.8;
  }

  hr {
    margin: 28px 0;
    border: 0;
    border-top: 1px solid #ddd;
  }

  .stock {
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 13px;
  }

  .stock-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
  }

  .available {
    background: #36a66b;
  }

  .unavailable {
    background: #d44;
  }

  .purchase {
    display: flex;
    gap: 12px;
    margin-top: 24px;
  }

  .quantity {
    display: flex;
    align-items: center;
    border: 1px solid #ddd;
    border-radius: 8px;
  }

  .quantity button {
    width: 40px;
    height: 44px;
    border: 0;
    background: transparent;
    cursor: pointer;
  }

  .quantity button:disabled {
    color: #bbb;
    cursor: not-allowed;
  }

  .quantity span {
    min-width: 24px;
    text-align: center;
  }

  .cart-button {
    flex: 1;
    min-height: 46px;
    border: 0;
    border-radius: 8px;
    background: var(--accent, #222);
    color: white;
    cursor: pointer;
    font-weight: 600;
  }

  .cart-button:hover {
    opacity: 0.85;
  }

  .product-meta {
    margin-top: 32px;
    color: #999;
    font-size: 12px;
  }

  .message {
    padding: 80px 20px;
    text-align: center;
  }

  .message a {
    color: inherit;
  }

  @media (max-width: 768px) {
    .product {
      grid-template-columns: 1fr;
      gap: 28px;
    }

    .page {
      padding: 24px 16px;
    }
  }
</style>
