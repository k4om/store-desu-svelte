<script lang="ts">
  let { children } = $props();
</script>

<div class="auth-body">
  <div class="min-h-screen w-full h-full flex items-center justify-center">
    <div
      class="h-min-screen h-full md:h-auto bg-white/65 p-8 w-full shadow-xl md:rounded-4xl md:w-md"
    >
      {@render children?.()}
    </div>
  </div>
</div>

<style>
  .auth-body {
    --tw-gradient-position: to bottom left;
    min-height: 100vh;
    background-image: linear-gradient(
      var(--tw-gradient-position),
      var(--color-slate-200),
      var(--color-slate-500),
      var(--color-blue-950)
    );
    color: var(--color-slate-800);
  }

  @supports (background-image: linear-gradient(in lab, red, red)) {
    .auth-body {
      --tw-gradient-position: to bottom left in oklab;
    }
  }
</style>
