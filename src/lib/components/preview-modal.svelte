<script lang="ts">
    import { X } from 'lucide-svelte';
    import { Button } from '$lib/components/ui/button';
    import { 
        Card,
        CardHeader,
        CardTitle,
        CardContent 
    } from '$lib/components/ui/card';

    export let url: string;
    export let isOpen: boolean;
    export let onClose: () => void;

    function handleClose() {
        onClose();
        isOpen = false;
    }
</script>

{#if isOpen}
    <div class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <Card class="w-[90vw] max-w-4xl h-[80vh] flex flex-col">
            <CardHeader class="flex-none">
                <div class="flex justify-between items-center">
                    <CardTitle>Document Preview</CardTitle>
                    <Button variant="ghost" size="icon" on:click={handleClose}>
                        <X class="h-4 w-4" />
                        <span class="sr-only">Close</span>
                    </Button>
                </div>
            </CardHeader>
            <CardContent class="flex-1 p-0">
                <iframe
                    title="Document Preview"
                    src={`${url}#toolbar=0`}
                    class="h-full w-full"
                    loading="lazy"
                ></iframe>
            </CardContent>
        </Card>
    </div>
{/if}