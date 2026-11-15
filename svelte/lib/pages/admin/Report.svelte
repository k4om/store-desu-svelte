<script module lang="ts">
  import { api, query } from "$lib/api.svelte";

  const reportQuery = query(() => api.admin.report.get());
  const allTransactionsQuery = query(() => api.admin["global-transaction"].all.get());
</script>

<script lang="ts">
  import { apiState } from "$lib/api.svelte";

  const user = $derived(apiState.user);
  const report = $derived(reportQuery.data?.data ?? null);
  const allTransactions = $derived(allTransactionsQuery.data?.data ?? []);
</script>

<svelte:head>
  <title>Admin Report - SenpaiStore</title>
</svelte:head>

<main class="report-">
  <header class="report--header">
    <h1 class="report--title">Report-</h1>

    <p class="report--subtitle">
      Welcome back, {user?.firstName}. Here's an overview of your store.
    </p>
  </header>

  <section class="product-list section-padded">
    <article class="product-card">
      <header class="product-card-header">
        <h2 class="product-card-title">Revenue</h2>
      </header>

      <p class="stat-value">
        Rp{report?.revenue.toLocaleString("id-ID")}
      </p>

      <p class="product-card-description">Total completed sales.</p>
    </article>

    <article class="product-card">
      <header class="product-card-header">
        <h2 class="product-card-title">Transactions</h2>
      </header>

      <p class="stat-value">
        {report?.transactions}
      </p>

      <p class="product-card-description">Completed transactions.</p>
    </article>

    <article class="product-card">
      <header class="product-card-header">
        <h2 class="product-card-title">Items sold</h2>
      </header>

      <p class="stat-value">
        {report?.itemsSold}
      </p>

      <p class="product-card-description">Total products sold.</p>
    </article>

    <article class="product-card">
      <header class="product-card-header">
        <h2 class="product-card-title">Customers</h2>
      </header>

      <p class="stat-value">
        {report?.customers}
      </p>

      <p class="product-card-description">Customers who made purchases.</p>
    </article>
  </section>

  <section class="recent-section section-padded">
    <div class="section-header">
      <h2 class="section-title">Recent Transactions</h2>

      <p class="section-subtitle">Latest activity in your store.</p>
    </div>

    {#if !allTransactions.length}
      <div class="empty-state">
        <p class="empty-state-text">No transactions yet.</p>
      </div>
    {:else}
      <div class="product-list">
        {#each allTransactions as transaction}
          <article class="product-card">
            <header class="product-card-header">
              <h3 class="product-card-title">
                {#if transaction.buyer}
                  {transaction.buyer.firstName}
                  {transaction.buyer.lastName || ""}
                {/if}
              </h3>
            </header>

            <p class="product-card-description">
              {transaction.items[0].product.label}
              x {transaction.items[0].quantity}
            </p>

            <dl class="product-card-info">
              <div class="product-card-info-row">
                <dt class="product-card-info-label">Total</dt>

                <dd class="product-card-info-value">
                  Rp{transaction.total.toLocaleString("id-ID")}
                </dd>
              </div>

              <div class="product-card-info-row">
                <dt class="product-card-info-label">Status</dt>

                <dd class="product-card-info-value">completed</dd>
              </div>
            </dl>
          </article>
        {/each}
      </div>
    {/if}
  </section>
</main>

<style>
  /* ---------- Page layout ---------- */
  .report- {
    flex: 1 1 0%;
    overflow: auto;
    padding: 1.5rem 0;
  }

  .report--header {
    margin-left: 1.75rem;
    margin-right: 1.75rem;
    margin-bottom: 1.5rem;
  }

  .report--title {
    font-size: 1.5rem;
    line-height: 2rem;
    font-weight: 700;
    color: #111827; /* gray-900 */
  }

  .report--subtitle {
    margin-top: 0.25rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: #4b5563; /* gray-600 */
  }

  .section-padded {
    padding-left: 1.75rem;
    padding-right: 1.75rem;
  }

  .recent-section {
    margin-top: 1.75rem;
  }

  .section-header {
    margin-bottom: 1rem;
  }

  .section-title {
    font-size: 1.25rem;
    line-height: 1.75rem;
    font-weight: 700;
    color: #111827;
  }

  .section-subtitle {
    margin-top: 0.25rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: #4b5563;
  }

  .stat-value {
    font-size: 1.875rem;
    line-height: 2.25rem;
    font-weight: 700;
    color: #111827;
  }

  /* ---------- Empty state ---------- */
  .empty-state {
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb; /* gray-200 */
    background-color: #ffffff;
    padding: 2rem;
    text-align: center;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  }

  .empty-state-text {
    color: #6b7280; /* gray-500 */
  }

  /* ---------- Product list / cards ---------- */
  .product-list {
    min-height: 0;
    flex: 1 1 0%;
    width: 100%;
    overflow-y: auto;
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    gap: 1.25rem;
    justify-content: center;
  }

  :global(.lg) .product-list {
    justify-content: flex-start;
  }

  .product-card {
    display: flex;
    flex-direction: column;
    flex: 1 1 320px;
    width: 100%;
    min-width: 0;
    max-width: 320px;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
    background-color: rgb(255 255 255 / 0.95);
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

  /* Not used in this file, so :global keeps Svelte from stripping it */
  :global(.product-card-buy) {
    width: 100%;
    cursor: pointer;
    border-radius: 0.25rem;
    background-color: var(--color-navy); /* see note below */
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    font-weight: 500;
    color: #ffffff;
    transition-property: opacity;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }

  :global(.product-card-buy:hover) {
    opacity: 0.9;
  }

  :global(.product-card-buy:disabled) {
    cursor: not-allowed;
    opacity: 0.5;
  }
</style>