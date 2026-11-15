<script lang="ts">
  import { link } from "@milizt/runeway";
</script>

<section class="cta">
  <div class="cta__box">
    <p class="cta__eyebrow">Senpai Store</p>

    <h2 class="cta__title">Ready to find your next favorite?</h2>

    <p class="cta__desc">
      Browse our products and discover what Senpai Store has to offer.
    </p>

    <a href="/product/all" class="cta__btn" use:link>Start Exploring</a>
  </div>
</section>

<style>
  .cta {
    padding-inline: calc(var(--spacing) * 6);
    padding-top: calc(var(--spacing) * 10);
    padding-bottom: calc(var(--spacing) * 20);
  }

  :global(.sm) .cta {
    padding-inline: calc(var(--spacing) * 10);
  }

  :global(.lg) .cta {
    padding-inline: calc(var(--spacing) * 16);
  }

  .cta__box {
    max-width: var(--container-7xl);
    margin-inline: auto;
    overflow: hidden;
    padding: calc(var(--spacing) * 12) calc(var(--spacing) * 6);
    border-radius: var(--radius-2xl);
    background-color: color-mix(in oklab, white 10%, transparent);
    text-align: center;
    box-shadow: var(--shadow-xl);
    backdrop-filter: blur(12px);
  }

  :global(.sm) .cta__box {
    padding-inline: calc(var(--spacing) * 12);
  }

  .cta__eyebrow {
    font-size: var(--text-xs);
    line-height: var(--text-xs--line-height);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.25em;
    color: var(--color-blue-100);
  }

  .cta__title {
    margin-top: calc(var(--spacing) * 3);
    font-size: var(--text-3xl);
    line-height: var(--text-3xl--line-height);
    font-weight: 900;
    color: white;
  }

  :global(.sm) .cta__title {
    font-size: var(--text-4xl);
    line-height: var(--text-4xl--line-height);
  }

  .cta__desc {
    margin-inline: auto;
    margin-top: calc(var(--spacing) * 3);
    max-width: var(--container-xl);
    font-size: var(--text-sm);
    line-height: var(--leading-relaxed);
    color: var(--color-slate-200);
  }

  .cta__btn {
    display: inline-flex;
    margin-top: calc(var(--spacing) * 7);
    padding: calc(var(--spacing) * 3) calc(var(--spacing) * 6);
    border-radius: var(--radius-xl);
    background-color: white;
    font-weight: 600;
    color: var(--color-primary);
    box-shadow: var(--shadow-lg);
    transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .cta__btn:hover {
    background-color: var(--color-slate-100);
  }
</style>