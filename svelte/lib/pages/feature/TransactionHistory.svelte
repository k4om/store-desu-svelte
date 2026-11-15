<script lang="ts">
  import { apiState } from "$lib/api.svelte.ts";
  import TransactionCard from "$lib/components/TransactionCard.svelte";

  const transactions = $derived(apiState.transactions);
</script>

<svelte:head>
  <title>My Transaction History - SenpaiStore</title>
</svelte:head>

<main class="page-content">
  <header class="page-header">
    <h1>My Transactions</h1>
    <p>View your purchase history.</p>
  </header>

  <section class="transaction-list" id="transactionList">
    {#if !transactions?.length}
      <div class="empty-state">
        <p>You haven't made any transactions yet.</p>
      </div>
    {:else}
      {#each transactions as transaction}
        <TransactionCard {transaction} />
      {/each}
    {/if}
  </section>
</main>

<style>
  .page-content {
    flex: 1;
    overflow: auto;
    padding: 1.5rem 1.75rem;
  }

  .page-header {
    margin: 0 0 1.5rem;
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

  .transaction-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
    gap: 1rem;
    align-items: start;
  }

  .transaction-list > :global(*) {
    min-width: 0;
  }

  .empty-state {
    width: 100%;
    padding: 2rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    background: white;
    box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
    text-align: center;
  }

  .empty-state p {
    color: #6b7280;
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
