<!-- This file is critical - it's the homepage -->
<script lang="ts">
  // Import components needed for homepage
  import { auth } from "$lib/stores/auth";
  import { onMount } from "svelte";
  import { Button } from "$lib/components/ui/button";
  import { Card } from "$lib/components/ui/card";
  import { Progress } from "$lib/components/ui/progress";
  import {
    BookOpen,
    Upload,
    Download,
    Users,
    ChevronRight,
    Clock,
    TrendingUp,
    MessageSquare,
  } from "lucide-svelte";
  import { dashboardStore } from "$lib/stores/dashboard-store";
  import { materials, categories } from "$lib/stores/materials";
  import { activityStore } from "$lib/stores/activity-store";

  let isLoading = $state(true);

  // Initialize dashboard data
  onMount(async () => {
    try {
      isLoading = true;
      await materials.fetchAll();
    } finally {
      isLoading = false;
    }
    materials.init();
    activityStore.init();
  });

  // Format numbers
  const formatNumber = (num: number) => new Intl.NumberFormat().format(num);

  // Get time-based greeting using $derived
  const greeting = $derived(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  });

  // Get user's name using $derived
  const userName = $derived($auth.user?.email?.split("@")[0] || "User");

  // Activity icon mapping
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "upload":
        return Upload;
      case "download":
        return Download;
      case "feedback":
        return MessageSquare;
      case "pending":
        return Clock;
      default:
        return Upload;
    }
  };

  // Activity status color
  const getStatusColor = (type: string) => {
    switch (type) {
      case "upload":
        return "text-green-500";
      case "download":
        return "text-blue-500";
      case "feedback":
        return "text-yellow-500";
      case "pending":
        return "text-orange-500";
      default:
        return "text-primary";
    }
  };

  // Get total downloads using $derived
  const totalDownloads = $derived(
    $materials.reduce((sum, item) => sum + (item.downloads || 0), 0)
  );

  // Get pending uploads using $derived - limit to 4 most recent
  const pendingUploads = $derived(
    $activityStore
      .filter(
        (activity) =>
          activity.type === "upload" && activity.metadata?.status === "pending"
      )
      .sort((a, b) => b.timestamp - a.timestamp) // Sort by newest first
      .slice(0, 4) // Limit to 4 items
      .map((activity) => ({
        id: activity.id,
        courseTitle: activity.title,
        courseCode: activity.metadata?.courseCode || "",
        fileName: activity.description,
        status: activity.metadata?.status || "pending",
        timestamp: activity.timestamp,
      }))
  );
  
  // Most recent 4 activities for display
  const recentActivities = $derived(
    $activityStore
      .slice() // Create a copy to avoid mutating the original
      .sort((a, b) => b.timestamp - a.timestamp) // Sort by newest first
      .slice(0, 4) // Limit to 4 items
  );
</script>

<div class="space-y-6">
  <!-- Keep the existing homepage content -->
  <div class="space-y-6 py-4 md:py-6">
    <!-- Welcome Section -->
    <div class="flex flex-col gap-2">
      <h1 class="text-3xl font-bold tracking-tight dark:text-white">
        {greeting()}, {userName}!
      </h1>
      <p class="text-muted-foreground">
        Here's an overview of your library activity
      </p>
    </div>

    <!-- Stats Grid -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-muted-foreground">
              Total Materials
            </p>
            <h3 class="mt-2 text-2xl font-bold">
              {#if isLoading}
                <div class="h-8 w-16 animate-pulse rounded bg-muted"></div>
              {:else}
                {formatNumber($materials.length)}
              {/if}
            </h3>
          </div>
          <div class="rounded-full bg-primary/10 p-3">
            <BookOpen class="h-5 w-5 text-primary" />
          </div>
        </div>
      </Card>
      <Card class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-muted-foreground">
              Total Downloads
            </p>
            <h3 class="mt-2 text-2xl font-bold">
              {formatNumber(totalDownloads)}
            </h3>
          </div>
          <div class="rounded-full bg-primary/10 p-3">
            <Download class="h-5 w-5 text-primary" />
          </div>
        </div>
      </Card>
    </div>

    <!-- Main Content Grid -->
    <div class="grid gap-6 lg:grid-cols-7">
      <!-- Recent Activity -->
      <Card class="p-6 lg:col-span-4">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold">Recent Activity</h2>
          <Clock class="h-5 w-5 text-muted-foreground" />
        </div>

        <div class="space-y-4">
          {#if recentActivities.length === 0}
            <div
              class="flex h-[200px] items-center justify-center rounded-lg border-2 border-dashed"
            >
              <p class="text-sm text-muted-foreground">No recent activity</p>
            </div>
          {:else}
            {#each recentActivities as activity}
              <div class="flex items-start gap-4 rounded-lg border p-4">
                <div class="mt-1 rounded-full bg-primary/10 p-2">
                  <svelte:component
                    this={getActivityIcon(activity.type)}
                    class="h-4 w-4 {getStatusColor(activity.type)}"
                  />
                </div>
                <div class="flex-1 space-y-1">
                  <p class="font-medium">{activity.title}</p>
                  <p class="text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                  <div class="flex items-center gap-4 text-sm">
                    <span class="text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                    {#if activity.metadata}
                      {#if activity.metadata.courseCode}
                        <span class="text-muted-foreground">
                          {activity.metadata.courseCode} • Level {activity
                            .metadata.level}
                        </span>
                      {/if}
                      {#if activity.metadata.downloads}
                        <span
                          class="flex items-center gap-1 text-muted-foreground"
                        >
                          <Download class="h-4 w-4" />
                          {activity.metadata.downloads}
                        </span>
                      {/if}
                      {#if activity.metadata.status}
                        <span class={getStatusColor(activity.type)}>
                          {activity.metadata.status}
                        </span>
                      {/if}
                    {/if}
                  </div>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </Card>

      <!-- Right Side Content -->
      <div class="space-y-6 lg:col-span-3">
        <!-- Pending Uploads Card -->
        <Card class="p-6">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-lg font-semibold">Pending Uploads</h2>
            <Clock class="h-5 w-5 text-orange-500" />
          </div>

          {#if pendingUploads.length === 0}
            <p class="text-muted-foreground">No pending uploads</p>
          {:else}
            <div class="space-y-3">
              {#each pendingUploads as upload}
                <div
                  class="flex items-center justify-between rounded-md border border-orange-200 bg-orange-50 p-3"
                >
                  <div>
                    <p class="font-medium">{upload.courseTitle}</p>
                    <p class="text-sm text-muted-foreground">
                      {upload.courseCode} | Status: {upload.status}
                    </p>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </Card>

        <!-- Quick Actions -->
        <Card class="p-6">
          <h2 class="mb-4 text-lg font-semibold">Quick Actions</h2>
          <div class="space-y-2">
            <Button
              variant="outline"
              class="w-full justify-between"
              href="/upload"
            >
              <span>Upload New Material</span>
              <ChevronRight class="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              class="w-full justify-between"
              href="/library"
            >
              <span>Browse Library</span>
              <ChevronRight class="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  </div>
</div>
