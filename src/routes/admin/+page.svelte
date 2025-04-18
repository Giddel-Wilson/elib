<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { BookOpen, Upload, Download, Users, CheckCircle2, XCircle } from 'lucide-svelte';

	// Mock data - replace with actual data later
	const stats = [
		{
			title: 'Total Users',
			value: '1,234',
			icon: Users,
			trend: '+15%',
			trendUp: true
		},
		{
			title: 'Active Sessions',
			value: '342',
			icon: Users,
			trend: '+23%',
			trendUp: true
		},
		{
			title: 'Total Documents',
			value: '2,845',
			icon: BookOpen,
			trend: '+12%',
			trendUp: true
		},
		{
			title: 'Pending Reviews',
			value: '18',
			icon: Upload,
			trend: '-5%',
			trendUp: false
		}
	];

	const pendingUploads = [
		{
			id: 1,
			title: 'Advanced Calculus Notes',
			student: 'John Doe',
			matric: 'CSC/2020/001',
			category: 'Mathematics',
			uploadDate: '2024-02-15',
			size: '2.4 MB'
		},
		{
			id: 2,
			title: 'Computer Networks Lab Report',
			student: 'Jane Smith',
			matric: 'CSC/2020/042',
			category: 'Computer Science',
			uploadDate: '2024-02-15',
			size: '1.8 MB'
		},
		{
			id: 3,
			title: 'Physics Experiment Data',
			student: 'Mike Johnson',
			matric: 'PHY/2021/103',
			category: 'Physics',
			uploadDate: '2024-02-14',
			size: '3.2 MB'
		}
	];

	async function handleReview(id: number, approved: boolean) {
		// TODO: Implement actual review logic
		console.log(`Document ${id} ${approved ? 'approved' : 'rejected'}`);
	}
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
		<p class="text-muted-foreground">Manage uploads and monitor system activity.</p>
	</div>

	<!-- Stats Grid -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		{#each stats as stat}
			<Card class="p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-muted-foreground">{stat.title}</p>
						<h3 class="mt-2 text-2xl font-bold">{stat.value}</h3>
					</div>
					<div class="rounded-full bg-primary/10 p-3">
						<svelte:component this={stat.icon} class="h-5 w-5 text-primary" />
					</div>
				</div>
				<div class="mt-4">
					<span class={`text-sm font-medium ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
						{stat.trend}
					</span>
					<span class="text-sm text-muted-foreground"> from last month</span>
				</div>
			</Card>
		{/each}
	</div>

	<!-- Pending Reviews -->
	<div>
		<h2 class="mb-4 text-xl font-semibold">Pending Reviews</h2>
		<div class="space-y-4">
			{#each pendingUploads as upload}
				<Card class="p-6">
					<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<div>
							<h3 class="font-semibold">{upload.title}</h3>
							<div class="mt-1 space-y-1">
								<p class="text-sm text-muted-foreground">
									Student: {upload.student} ({upload.matric})
								</p>
								<p class="text-sm text-muted-foreground">
									Category: {upload.category} • Size: {upload.size}
								</p>
								<p class="text-sm text-muted-foreground">Uploaded: {upload.uploadDate}</p>
							</div>
						</div>
						<div class="flex gap-2">
							<Button
								variant="outline"
								class="w-full md:w-auto"
								onclick={() => handleReview(upload.id, false)}
							>
								<XCircle class="mr-2 h-4 w-4 text-red-500" />
								Reject
							</Button>
							<Button class="w-full md:w-auto" onclick={() => handleReview(upload.id, true)}>
								<CheckCircle2 class="mr-2 h-4 w-4" />
								Approve
							</Button>
						</div>
					</div>
				</Card>
			{/each}
		</div>
	</div>

	<!-- Analytics Chart Placeholder -->
	<Card class="p-6">
		<h2 class="mb-4 text-xl font-semibold">System Analytics</h2>
		<div class="h-[300px] rounded-lg bg-muted/20">
			<div class="flex h-full items-center justify-center text-muted-foreground">
				Analytics chart will be implemented here
			</div>
		</div>
	</Card>
</div>
