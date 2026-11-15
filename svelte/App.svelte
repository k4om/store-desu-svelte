<script module>
  import { router } from "@milizt/runeway";
  import { userQuery } from "$lib/api.svelte";
  import { refresh } from "$lib/routes.svelte.ts";

  userQuery.ready.then(() => {
    router.init();
    refresh();
  });
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import { MediaQuery } from "svelte/reactivity";
  import { theme } from "$lib/theme.svelte";
  import { view } from "$lib/routes.svelte.ts";

  const Layout = $derived(view.PageLayout);
  const Page = $derived(view.Page);

  onMount(() => {
    theme.init();
  });

  const isMobile = new MediaQuery("(width < 48rem)");
  const xs = new MediaQuery("(width < 40rem)");
  const sm = new MediaQuery("(width >= 40rem)");
  const md = new MediaQuery("(width >= 48rem)");
  const lg = new MediaQuery("(width >= 64rem)");
  const xl = new MediaQuery("(width >= 80rem)");
  const xxl = new MediaQuery("(width >= 96rem)");
</script>

<svelte:head>
  <title>Loading...</title>
</svelte:head>

<div
  class={[
    isMobile.current && "mobile",
    xs.current && "xs",
    sm.current && "sm",
    md.current && "md",
    lg.current && "lg",
    xl.current && "xl",
    xxl.current && "2xl",
  ]}
>
  <Layout>
    <Page />
  </Layout>
</div>
