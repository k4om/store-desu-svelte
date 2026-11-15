<script lang="ts">
  import { api, apiState, categoriesQuery } from "$lib/api.svelte";
  import Button from "$lib/components/input/Button.svelte";
  import Input from "$lib/components/input/Input.svelte";
  import Modal from "$lib/components/modal/Modal.svelte";
  import ModalNavigator from "$lib/components/modal/ModalNavigator.svelte";
  import Table from "$lib/components/Table.svelte";
  import Textarea from "$lib/components/input/Textarea.svelte";
  import type { Category } from "$server/db/categorydb";

  let categories = $derived(apiState.categories);

  let modal: Modal;
  let label: string = $state("");
  let desc: string = $state("");
  let mode: "add" | "edit" | undefined = undefined;
  let editedCategory: Category;

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (mode === "add") {
      await api.category.post({ label, desc });
      categoriesQuery.reload();
    } else if (mode === "edit") {
      await api.category({ id: editedCategory.id }).put({ label, desc });
      categoriesQuery.reload();
    }

    modal.close();
  }

  async function addCategory() {
    mode = "add";
    modal.open("Add Category");
  }

  async function editCategory(category: Category) {
    mode = "edit";
    editedCategory = category;
    label = category.label;
    desc = category.desc || "";
    modal.open(category.label);
  }

  async function deleteCategory(category: Category) {
    await api.category({ id: category.id }).delete();
    categoriesQuery.reload();
  }
</script>

<svelte:head>
  <title>Manage Product Category - SenpaiStore</title>
</svelte:head>

<main class="page-content">
  <h1>Manage Product Category</h1>

  <p class="page-description">
    Create, update, and organize product categories.
  </p>

  <div class="page-actions">
    <Button
      raised={true}
      onclick={() => addCategory()}
    >
      New Category
    </Button>
  </div>

  <Table
    title="Product categories"
    items={categories}
    emptyMessage="No categories found."
    key="id"
  >
    {#snippet header()}
      <th class="table-no">No</th>
      <th>Category</th>
      <th>Description</th>
      <th class="table-action">Action</th>
    {/snippet}

    {#snippet row(category: Category, index: number)}
      <td style="text-align: center; width: 64px;">{index + 1}</td>
      <td>{category.label}</td>
      <td>{category.desc || "-"}</td>
      <td style="text-align: center; width: 128px;">
        <div class="table-actions">
          <Button variant="secondary" onclick={() => editCategory(category)}>
            Edit
          </Button>

          <Button variant="danger" onclick={() => deleteCategory(category)}>
            Delete
          </Button>
        </div>
      </td>
    {/snippet}
  </Table>
</main>

<Modal bind:this={modal}>
  <form onsubmit={handleSubmit}>
    <Input
      label="Category Name"
      type="text"
      id="input-name"
      name="label"
      placeholder="category name"
      required
      bind:value={label}
    />

    <Textarea
      label="Description"
      id="input-desc"
      name="desc"
      placeholder="this category is about [...]"
      bind:value={desc}
    />

    <ModalNavigator>
      <Button variant="cancel" onclick={() => modal.close()}>Cancel</Button>
      <Button variant="confirm" type="submit">Confirm</Button>
    </ModalNavigator>
  </form>
</Modal>

<style>
  .page-content {
    flex: 1;
    overflow: auto;
    padding: 1.5rem 1.75rem;
  }

  .page-content h1 {
    margin-bottom: 1rem;
    color: var(--text-primary, #0f172a);
    font-size: 1.5rem;
    font-weight: 700;
  }

  .page-description {
    margin-top: 0.25rem;
    color: #4b5563;
    font-size: 0.875rem;
  }

  .page-actions {
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    margin-bottom: 1rem;
  }

  .table-actions {
    display: flex;
    gap: 0.5rem;
  }

  :global(.sm) .page-content {
    padding: 1.5rem 1.75rem;
  }

  @media (max-width: 640px) {
    .page-content {
      padding: 1rem;
    }

    .page-content h1 {
      font-size: 1.25rem;
    }
  }
</style>
