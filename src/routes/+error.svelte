<script>
  import { page } from '$app/stores';
</script>

<div class="container mx-auto px-4 py-16 text-center">
  <h1 class="text-4xl font-bold mb-6">
    {$page.status}: {$page.error?.message || 'Page not found'}
  </h1>
  
  <p class="text-lg text-gray-600 mb-8">
    {#if $page.status === 404}
      We couldn't find the page you're looking for.
    {:else}
      Something went wrong. Please try again later.
    {/if}
  </p>
  
  <div>
    <a href="/" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
      Return to Home
    </a>
  </div>
</div>
