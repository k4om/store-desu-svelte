<script lang="ts">
  import { link } from "@milizt/runeway";
</script>

<svelte:head>
  <title>Page not found - SenpaiStore</title>
</svelte:head>

<main class="page-content">
  <div class="panel">
    <p class="code">404</p>
    <h1>Page not found</h1>
    <p class="message">
      The address that you opened didn't exist. Try checking if there is any
      typo, or start from home.
    </p>
    <a class="home-link" href="/" use:link>Return to Home</a>
  </div>
</main>

<style>
  .page-content {
    flex: 1;
    overflow: auto;
    padding: 1.5rem 1.75rem;
  }

  /* Same frosted card as the profile, product and category pages */
  .panel {
    width: 100%;
    max-width: 32rem;
    margin: 4rem auto 0;
    padding: 2.5rem 1.5rem;
    border-radius: 0.5rem;
    background-color: rgb(255 255 255 / 65%);
    color: #111827;
    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 25%);
    backdrop-filter: blur(16px);
    text-align: center;
  }

  .code {
    margin: 0;
    color: #1e3a8a;
    font-size: 4.5rem;
    line-height: 1;
    font-weight: 700;
    letter-spacing: -0.05em;
  }

  h1 {
    margin-top: 1rem;
    color: #111827;
    font-size: 1.75rem;
    line-height: 2.25rem;
    font-weight: 700;
  }

  .message {
    margin: 0.75rem 0 1.5rem;
    color: #374151;
    font-size: 0.9375rem;
    line-height: 1.6;
  }

  .home-link {
    display: inline-block;
    padding: 0.625rem 1.25rem;
    border-radius: 0.5rem;
    background-color: #1e3a8a;
    color: #fff;
    font-weight: 600;
    text-decoration: none;
  }

  .home-link:hover {
    background-color: #1e40af;
  }

  .home-link:focus-visible {
    outline: 3px solid #1e3a8a;
    outline-offset: 2px;
  }

  @media (max-width: 640px) {
    .page-content {
      padding: 1rem;
    }

    .panel {
      margin-top: 2rem;
    }
  }
</style>