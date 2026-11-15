<script lang="ts">
  let modal: HTMLDialogElement;
  let headerTitle = $state("Modal Title");

  let { children } = $props();

  export function open(title: string) {
    headerTitle = title;
    modal.showModal();
  }

  export function close() {
    modal.close();
  }
</script>

<dialog bind:this={modal} class="modal" aria-labelledby="modalTitle">
  <header>
    <h2 class="modal-title">
      {headerTitle}
    </h2>
  </header>

  {@render children?.()}
</dialog>

<style>
  .modal {
    position: fixed;
    align-items: flex-start;
    justify-content: center;
    margin-top: 8vh;
    padding: 1.5rem;

    left: 50%;
    transform: translateX(-50%);

    width: 480px;
    max-width: 92%;

    color: black;
    background: rgb(255 255 255 / 75%);

    backdrop-filter: blur(16px);
    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 25%);
    border-radius: 0.5rem;
  }

  .modal::backdrop {
  background: rgb(0 0 0 / 40%);
  backdrop-filter: blur(4px);
  }

  .modal:not([open]) {
    display: none;
    z-index: 500;
  }

  .modal > * {
    width: 100%;
  }

  .modal-title {
    margin-bottom: calc(var(--spacing) * 5);
    font-size: var(--text-xl);
    line-height: var(--tw-leading, var(--text-xl--line-height));
    font-weight: bold;
    color: var(--color-gray-900);
  }
</style>
