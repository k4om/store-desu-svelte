<script>
  import { link } from "@milizt/runeway";

</script>
<section class="hero">
  <div class="hero__inner">
    <div>
      <p class="eyebrow">Senpai Store</p>

      <h1 class="hero__title">
        Find something
        <span class="hero__title-accent">you'll love.</span>
      </h1>

      <p class="hero__desc">
        Explore our collection of products, discover new categories, and find
        exactly what you're looking for.
      </p>

      <div class="hero__actions">
        <a href="/register" class="btn-primary" use:link>Join Us</a>

        <div class="hero__secondary">
          <a href="#products" class="btn-glass">Products</a>
          <a href="#categories" class="btn-glass">Categories</a>
        </div>
      </div>
    </div>

    <div class="hero__visual">
      <div class="hero__visual-box">
        <div class="hero__visual-circle"></div>

        <div class="hero__visual-card">
          <img
            src="/images/icon.png"
            alt="Senpai Store"
            class="hero__visual-img"
          />
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .hero {
    position: relative;
    overflow: hidden;
    padding-inline: calc(var(--spacing) * 6);
    padding-block: calc(var(--spacing) * 20);
  }

  :global(.sm) .hero {
    padding-inline: calc(var(--spacing) * 10);
    padding-block: calc(var(--spacing) * 28);
  }

  :global(.lg) .hero {
    padding-inline: calc(var(--spacing) * 16);
    padding-block: calc(var(--spacing) * 36);
  }

  .hero__inner {
    display: grid;
    align-items: center;
    gap: calc(var(--spacing) * 12);
    max-width: 80rem;
    margin-inline: auto;
  }

  :global(.lg) .hero__inner {
    grid-template-columns: 1.2fr 0.8fr;
  }

  .eyebrow {
    margin-bottom: calc(var(--spacing) * 5);
    font-size: var(--text-sm);
    line-height: var(--text-sm--line-height);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.3em;
    color: var(--color-blue-100);
  }

  .hero__title {
    max-width: 56rem;
    font-size: var(--text-5xl);
    line-height: 1.05;
    font-weight: 900;
    letter-spacing: -0.025em;
    color: white;
  }

  :global(.sm) .hero__title {
    font-size: var(--text-6xl);
  }

  :global(.lg) .hero__title {
    font-size: var(--text-7xl);
  }

  .hero__title-accent {
    color: var(--color-blue-100);
  }

  .hero__desc {
    margin-top: calc(var(--spacing) * 6);
    max-width: 42rem;
    font-size: var(--text-base);
    line-height: var(--leading-relaxed);
    color: var(--color-slate-200);
  }

  :global(.sm) .hero__desc {
    font-size: var(--text-lg);
  }

  .hero__actions {
    margin-top: calc(var(--spacing) * 8);
    max-width: 36rem;
  }

  .hero__secondary {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: calc(var(--spacing) * 3);
    margin-top: calc(var(--spacing) * 3);
    max-width: 28rem;
  }

  .btn-primary {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 28rem;
    padding: calc(var(--spacing) * 4) calc(var(--spacing) * 6);
    border-radius: var(--radius-xl);
    background-color: white;
    font-size: var(--text-base);
    font-weight: 700;
    color: var(--color-primary);
    box-shadow: var(--shadow-xl);
    transition:
      transform 150ms cubic-bezier(0.4, 0, 0.2, 1),
      background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .btn-primary:hover {
    transform: translateY(calc(var(--spacing) * -0.5));
    background-color: var(--color-slate-100);
  }

  .btn-glass {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: calc(var(--spacing) * 3) calc(var(--spacing) * 5);
    border: 1px solid color-mix(in oklab, white 30%, transparent);
    border-radius: var(--radius-xl);
    background-color: color-mix(in oklab, white 10%, transparent);
    font-weight: 600;
    color: white;
    backdrop-filter: blur(8px);
    transition:
      transform 150ms cubic-bezier(0.4, 0, 0.2, 1),
      background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .btn-glass:hover {
    transform: translateY(calc(var(--spacing) * -0.5));
    background-color: color-mix(in oklab, white 20%, transparent);
  }

  /* ---------- Hero visual (hidden lg:block) ---------- */
  .hero__visual {
    display: none;
  }

  :global(.lg) .hero__visual {
    display: block;
  }

  .hero__visual-box {
    position: relative;
    margin-inline: auto;
    max-width: 28rem;
    aspect-ratio: 1 / 1;
  }

  .hero__visual-circle {
    position: absolute;
    inset: calc(var(--spacing) * 8);
    border-radius: 9999px;
    background-color: color-mix(in oklab, white 10%, transparent);
    backdrop-filter: blur(12px);
  }

  .hero__visual-card {
    position: absolute;
    inset: calc(var(--spacing) * 20);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid color-mix(in oklab, white 20%, transparent);
    border-radius: var(--radius-3xl);
    background-color: color-mix(in oklab, white 10%, transparent);
    box-shadow: var(--shadow-2xl);
    backdrop-filter: blur(24px);
  }

  .hero__visual-img {
    width: 75%;
  }
</style>
