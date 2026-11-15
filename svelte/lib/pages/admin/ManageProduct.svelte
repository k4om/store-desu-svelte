<script lang="ts">
  import { api, apiState, productsQuery } from "$lib/api.svelte";
  import type { Product } from "$server/db/productdb.ts";
  import Button from "$lib/components/input/Button.svelte";
  import Input from "$lib/components/input/Input.svelte";
  import Modal from "$lib/components/modal/Modal.svelte";
  import ModalNavigator from "$lib/components/modal/ModalNavigator.svelte";
  import Table from "$lib/components/Table.svelte";
  import Select, { type Option } from "$lib/components/input/Select.svelte";
  import type { Category } from "$server/db/categorydb";

  let categories = $derived(apiState.categories);
  let products = $derived(apiState.products);

  let modal: Modal;
  let label: string = $state("");
  let stock: number = $state(0);
  let price: number = $state(0);
  let categoryId: number = $state(0);
  let options: Option[] = $derived(categories.map((p: Category) => ({ label: p.label, value: p.id, disabled: false }) as Option));
  let mode: "add" | "edit" | undefined = undefined;
  let editedProduct: Product;

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (mode === "add") {
      await api.product.post({ label, stock, price, categoryId });
      productsQuery.reload();
    } else if (mode === "edit") {
      await api.product({ id: editedProduct.id }).put({ label, stock, price, categoryId });
      productsQuery.reload();
    }

    modal.close();
  }

  async function addProduct() {
    mode = "add";
    modal.open("Add Product");
  }

  async function editProduct(product: Product) {
    mode = "edit";
    editedProduct = product;
    label = product.label;
    stock = product.stock || 0;
    price = product.price || 0;
    categoryId = product.categoryId || 0;

    modal.open(product.label);
  }

  async function deleteProduct(product: Product) {
    await api.product({ id: product.id }).delete();
    productsQuery.reload();
  }
</script>

<svelte:head>
  <title>Manage Product - SenpaiStore</title>
</svelte:head>

<main class="page-content">
  <h1>Manage Product Product</h1>

  <p class="page-description">
    Create, update, and organize product products.
  </p>

  <div class="page-actions">
    <Button
      raised={true}
      onclick={() => addProduct()}
    >
      New Product
    </Button>
  </div>

  <Table
    title="Product products"
    items={products}
    emptyMessage="No products found."
    key="id"
  >
    {#snippet header()}
      <th class="table-no">No</th>
      <th>Product</th>
      <th>Stock</th>
      <th>Price</th>
      <th class="table-action">Action</th>
    {/snippet}

    {#snippet row(product: Product, index: number)}
      <td style="text-align: center; width: 64px;">{index + 1}</td>
      <td>{product.label}</td>
      <td>{product.stock}</td>
      <td>{"Rp" + Number(product.price).toLocaleString("id-ID")}</td>
      <td style="text-align: center; width: 128px;">
        <div class="table-actions">
          <Button variant="secondary" onclick={() => editProduct(product)}>
            Edit
          </Button>

          <Button variant="danger" onclick={() => deleteProduct(product)}>
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
      label="Product Name"
      type="text"
      id="input-name"
      name="label"
      placeholder="product name"
      required
      bind:value={label}
    />

    <Input
      label="Available Stock"
      type="number"
      id="input-stock"
      name="stock"
      required
      bind:value={stock}
    />

    <Input
      label="Item Price"
      type="number"
      id="input-price"
      name="price"
      required
      bind:value={price}
    />
    
    <Select
      label="Item Category"
      id="input-category"
      name="categoryId"
      {options}
      required
      bind:value={categoryId}
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
