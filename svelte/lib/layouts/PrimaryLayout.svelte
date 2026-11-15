<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Sidebar from "$lib/components/Sidebar.svelte";
  import { router } from "@milizt/runeway";

  let { children } = $props();
  let sidebar: Sidebar | null = $state(null);

  // Hash routing doesn't reset scoll on its own
  $effect(() => {
    router.path;
    window.scrollTo({ top: 0 });
  });
</script>

<Header {sidebar} />
<div class="root">
  <Sidebar bind:this={sidebar} />
  {@render children?.()}
</div>

<style>
  .root {
    display: flex;
    flex: 1;
    min-height: 0;
  }
</style>
