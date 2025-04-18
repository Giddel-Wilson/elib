<script lang="ts">
  import {
    Search,
    Filter,
    Calendar,
    Download,
    ChevronDown,
    FileText,
    Eye,
	Award
  } from "lucide-svelte";
  import PreviewModal from "$lib/components/preview-modal.svelte";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
  } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
  } from "$lib/components/ui/select";
  import { toast } from "svelte-sonner";
  import { downloadMaterial } from "$lib/api/materials";
  import type { PageData } from "./$types";
  import type { Material } from "$lib/stores/materials";
  import { formatDate, getRelativeTime } from "$lib/utils/date";
  import { activityStore } from "$lib/stores/activity-store";

  const { data } = $props<{ data: PageData }>();

  // Add state for preview modal
  let previewUrl = $state("");
  let isPreviewOpen = $state(false);

  let searchQuery = $state("");
  let selectedLevel = $state<Material["level"] | null>(null);
//   let selectedCategory = $state<Material["category"] | null>(null);
  let selectedFilter = $state<"recent" | "downloads">("recent");

  const levels: Material["level"][] = [100, 200, 300, 400];
//   const categories: Material["category"][] = [
//     "Past Questions",
//     "Assignments",
//     "Notes",
//     "Handouts",
//   ];

  const filterOptions = [
    { value: "recent", label: "Most Recent" },
    { value: "downloads", label: "Most Downloaded" },
  ] as const;

  const filteredMaterials = $derived(
    data.materials
      .filter((material: Material) => {
        const matchesSearch =
          material.courseTitle
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          material.courseCode
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          material.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        return matchesSearch;
      })
      .sort((a: Material, b: Material) => {
        if (selectedFilter === "recent") {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        return (b.downloads || 0) - (a.downloads || 0);
      })
  );

  async function handleDownload(material: Material) {
    try {
      if (!material?._id) {
        toast.error("Invalid material");
        return;
      }

      toast.loading("Downloading...");
      const { blob, filename } = await downloadMaterial(material._id);

      // Create and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Add activity
      activityStore.add({
        type: "download",
        title: "Material Downloaded",
        description: `Downloaded ${material.courseTitle}`,
        metadata: {
          courseCode: material.courseCode,
          level: material.level,
          downloads: material.downloads + 1,
        },
      });

      toast.dismiss();
      toast.success("Download completed!");
    } catch (error) {
      console.error("Download error:", error);
      toast.dismiss();
      toast.error("Download failed. Please try again.");
    }
  }

  // Add preview handler
  function handlePreview(material: Material) {
    if (!material?.url) {
      toast.error("Preview not available");
      return;
    }
    previewUrl = material.url;
    isPreviewOpen = true;
  }
</script>

<div class="space-y-6 py-4 md:py-6">
  <div class="flex flex-col gap-3">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight lg:text-4xl dark:text-white">
          Document Library
        </h1>
        <p class="text-muted-foreground">
          Browse and download academic resources
        </p>
      </div>
    </div>

    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex flex-1 gap-2">
        <div class="relative flex-1">
          <Search
            class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
          />
          <Input
            type="search"
            placeholder="Search by course title, code..."
            class="pl-9 dark:text-muted-foreground"
            bind:value={searchQuery}
          />
        </div>

        <!-- <Select bind:value={selectedLevel}>
          <SelectTrigger class="w-[120px]">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>All Levels</SelectItem>
            {#each levels as level}
              <SelectItem value={level}>{level} Level</SelectItem>
            {/each}
          </SelectContent>
        </Select>

        <Select bind:value={selectedCategory}>
          <SelectTrigger class="w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>All Categories</SelectItem>
            {#each categories as category}
              <SelectItem value={category}>{category}</SelectItem>
            {/each}
          </SelectContent>
        </Select>

        <Select bind:value={selectedFilter}>
          <SelectTrigger class="w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {#each filterOptions as option}
              <SelectItem value={option.value}>{option.label}</SelectItem>
            {/each}
          </SelectContent>
        </Select> -->
      </div>
    </div>
  </div>

  <!-- Results Count -->
  <div class="text-sm text-muted-foreground">
    Found {filteredMaterials.length} document{filteredMaterials.length === 1
      ? ""
      : "s"}
  </div>

  <!-- Document Grid -->
  {#if filteredMaterials.length === 0}
    <div
      class="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center"
    >
      <div class="rounded-full bg-primary/10 p-3">
        <Search class="h-6 w-6 text-primary" />
      </div>
      <h3 class="mt-4 font-semibold">No documents found</h3>
      <p class="mt-2 text-sm text-muted-foreground">
        Try adjusting your search or filters
      </p>
    </div>
  {:else}
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each filteredMaterials as material}
        <Card class="flex flex-col">
          <CardHeader>
            <CardTitle class="flex items-start justify-between">
              <div>
                <span class="line-clamp-1">{material.courseTitle}</span>
                <span class="text-sm text-muted-foreground"
                  >{material.courseCode}</span
                >
              </div>
              <Badge variant="outline" class="ml-2 shrink-0">
                <Award class="h-4 w-4" /> Approved
              </Badge>
            </CardTitle>
            <CardDescription class="line-clamp-2"
              >{material.description}</CardDescription
            >
          </CardHeader>
          <CardContent class="flex-1">
            <div class="flex items-center gap-4 text-sm text-muted-foreground">
              <div class="flex items-center gap-1">
                <Calendar class="h-4 w-4" />
                <span
                  title={formatDate(material.createdAt, { format: "long" })}
                  class="group relative"
                >
                  {getRelativeTime(material.createdAt)}
                  {#if import.meta.env.DEV}
                    <span
                      class="absolute bottom-full left-0 hidden whitespace-nowrap rounded bg-popover p-1 text-xs text-popover-foreground shadow-lg group-hover:block"
                    >
                      Raw: {material.createdAt}<br />
                      ISO: {new Date(material.createdAt).toISOString()}
                    </span>
                  {/if}
                </span>
              </div>
              <!-- <div class="flex items-center gap-1">
                <Download class="h-4 w-4" />
                <span>{material.downloads}</span>
              </div> -->
              <Badge variant="secondary">{material.level} Level</Badge>
            </div>
          </CardContent>
          <CardFooter class="flex justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              on:click={() => handlePreview(material)}
              disabled={!material?.url}
            >
              <Eye class="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              href={material.url}
              target="_blank"
              download={material.filename}
              disabled={!material?._id || !material?.url}
            >
              <Download class="mr-2 h-4 w-4" />
              {#if !material?._id || !material?.url}
                Invalid Material
              {:else}
                Download
              {/if}
            </Button>
          </CardFooter>
        </Card>
      {/each}
    </div>
  {/if}
</div>

<PreviewModal
  url={previewUrl}
  isOpen={isPreviewOpen}
  onClose={() => (isPreviewOpen = false)}
/>
