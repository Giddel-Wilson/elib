<script lang="ts">
  export let visible = false;
</script>

{#if visible}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm"
  >
    <div class="flex flex-col items-center gap-4">
      <div
        class="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"
      ></div>
      <p class="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
{/if}
