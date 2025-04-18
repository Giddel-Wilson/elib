<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { ExternalLink, Trash2 } from 'lucide-svelte';

	// Mock data - replace with actual data later
	const downloads = [
		{
			title: 'Advanced Calculus Notes',
			downloadDate: '2024-02-15',
			size: '2.4 MB',
			status: 'Completed'
		},
		{
			title: 'Computer Networks Lab Report',
			downloadDate: '2024-02-14',
			size: '1.8 MB',
			status: 'Completed'
		},
		{
			title: 'Physics Experiment Data',
			downloadDate: '2024-02-13',
			size: '3.2 MB',
			status: 'Completed'
		}
	];
</script>

<div class="space-y-8 py-4 md:py-6">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Downloads</h1>
		<p class="text-muted-foreground">View and manage your downloaded documents.</p>
	</div>

	<div class="grid gap-4">
		{#each downloads as download}
			<Card class="p-6">
				<div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<h3 class="font-semibold">{download.title}</h3>
						<div class="mt-1 space-y-1">
							<p class="text-sm text-muted-foreground">
								Downloaded: {download.downloadDate} • Size: {download.size}
							</p>
							<p class="text-sm text-muted-foreground">Status: {download.status}</p>
						</div>
					</div>
					<div class="flex items-center gap-2">
						<Button variant="ghost" size="icon">
							<ExternalLink class="h-4 w-4" />
						</Button>
						<Button variant="ghost" size="icon">
							<Trash2 class="h-4 w-4" />
						</Button>
					</div>
				</div>
			</Card>
		{/each}
	</div>
</div>
