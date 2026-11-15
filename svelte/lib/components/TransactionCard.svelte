
<script lang="ts">
  import { apiState } from "$lib/api.svelte";
  import type { Product } from "$server/db/productdb.ts";
  import type { Transaction } from "$server/db/transactiondb";

  interface Props {
    transaction: Transaction;
  }

  const products = $derived(apiState.products);
  let { transaction }: Props = $props();

  const formatPrice = (price: number) =>
    `Rp${price.toLocaleString("id-ID")}`;

  function getProduct(id: number) {
    return products.find((product) => product.id === id);
  }
</script>

<article class="transaction-card">
  <header class="transaction-card-header">
    <div>
      <h2 class="transaction-card-title">
        Transaction #{transaction.id}
      </h2>

      <p class="transaction-card-description">
        {transaction.items.length} item(s)
      </p>
    </div>

    <span class="transaction-status">
      completed
    </span>
  </header>

  <div class="transaction-items">
    {#each transaction.items as item}
      {@const product = getProduct(item.transactionId)}

      <div class="transaction-item">
        <div class="transaction-item-info">
          <h3>{product?.label ?? `Product #${item.transactionId}`}</h3>
          <span>Qty: {item.quantity}</span>
        </div>

        <div class="transaction-item-price">
          {formatPrice(item.price)}
        </div>
      </div>
    {/each}
  </div>

  <footer class="transaction-card-footer">
    <span>Total</span>
    <strong>{formatPrice(transaction.total)}</strong>
  </footer>
</article>

<style>
  .transaction-card {
    overflow: hidden;
    border-radius: 0.75rem;
    background-color: rgb(239 246 255 / 50%);
    backdrop-filter: blur(12px);
    box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
  }

  .transaction-card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;
    border-bottom: 1px solid rgb(203 213 225 / 50%);
  }

  .transaction-card-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: #0f172a;
  }

  .transaction-card-description {
    margin-top: 0.25rem;
    font-size: 0.8rem;
    color: #5a6574;
  }

  .transaction-status {
    padding: 0.25rem 0.625rem;
    border-radius: 999px;
    background-color: rgb(34 197 94 / 10%);
    color: #15803d;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: capitalize;
  }

  .transaction-items {
    padding: 0 1rem;
  }

  .transaction-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.875rem 0;
    border-bottom: 1px solid rgb(203 213 225 / 40%);
  }

  .transaction-item-info h3 {
    margin: 0;
    color: #334155;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .transaction-item-info span {
    display: block;
    margin-top: 0.25rem;
    color: #5a6574;
    font-size: 0.75rem;
  }

  .transaction-item-price {
    color: #334155;
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
  }

  .transaction-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background-color: rgb(248 250 252 / 50%);
    color: #334155;
    font-size: 0.875rem;
  }

  .transaction-card-footer strong {
    color: #0f172a;
    font-size: 1rem;
    font-weight: 700;
  }
</style>
