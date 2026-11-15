<script lang="ts">
  import { locale } from '$lib/i18n/index.svelte.js'
</script>

<svelte:head>
  <title>{locale.message.page_not_found}</title>
</svelte:head>

<div class="container-page py-24 sm:py-32">
  <div class="mx-auto max-w-xl text-center">
    <p class="text-7xl font-semibold tracking-tighter text-primary">404</p>
    <h1 class="mt-6 text-3xl font-semibold">{locale.message.page_not_found}</h1>
    <p class="mt-3 text-muted-foreground">
      {locale.message.page_not_found_message}
    </p>
    <div class="mt-8 flex justify-center gap-3">
      <a href="#/">{locale.message.return_home}</a>
    </div>
  </div>
</div>
