<script lang="ts">
  import { router } from "@milizt/runeway";
  import { apiState } from "$lib/api.svelte";
  import HomeHeader from "$lib/components/home/HomeHeader.svelte";

  let { children } = $props();
  const user = $derived(apiState.user);

  // Hash routing doesn't reset scroll on its own
  $effect(() => {
    router.path;
    window.scrollTo({ top: 0 });
  });
</script>

<HomeHeader {user} />
{@render children?.()}