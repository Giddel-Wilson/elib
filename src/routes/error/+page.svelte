<script>
  import { page } from '$app/stores';
  import { Button } from "$lib/components/ui/button";
</script>

<div class="container flex h-[80vh] flex-col items-center justify-center px-4 text-center">
  <h1 class="text-4xl font-bold mb-4">
    {$page.status}: {$page.error?.message || 'Page not found'}
  </h1>
  
  <p class="text-muted-foreground mb-8 max-w-md">
    {#if $page.status === 404}
      We couldn't find the page you're looking for.
    {:else}
      Something went wrong. Please try again later.
    {/if}
  </p>
  
  <div class="flex gap-4">
    <Button href="/" variant="default">Return Home</Button>
    <Button variant="outline" on:click={() => history.back()}>
      Go Back
    </Button>
  </div>
</div>
