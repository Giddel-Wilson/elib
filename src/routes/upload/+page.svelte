<script lang="ts">
  import { Card } from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Button } from "$lib/components/ui/button";
  import { Upload, FileText, X, MessageSquare } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  import { auth } from "$lib/stores/auth";
  import { uploadMaterial } from "$lib/api/upload";
  import { activityStore } from "$lib/stores/activity-store";
  import type {
    MaterialUploadData,
    PendingUpload,
    UploadStatus,
  } from "$lib/types/material";

  let selectedFile: File | null = null;
  let level = "200";
  let courseCode = "";
  let courseTitle = "";
  let description = "";
  let isUploading = false;
  let pendingUploads: PendingUpload[] = [];
  let status: UploadStatus = {
    uploading: false,
    error: null,
    success: false,
  };

  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      selectedFile = input.files[0];
    }
  }

  function removeFile() {
    selectedFile = null;
    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (input) input.value = "";
  }

  async function handleSubmit() {
    if (
      !selectedFile ||
      !level ||
      !courseCode ||
      !courseTitle ||
      !description
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      toast.error("File size exceeds 10MB limit");
      return;
    }

    status.uploading = true;
    isUploading = true;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const uploadData = {
        level: parseInt(level),
        courseCode,
        courseTitle,
        description,
        material: selectedFile,
      };

      const result = await uploadMaterial(uploadData, token);

      activityStore.add({
        type: "upload",
        title: courseTitle,
        description: selectedFile.name,
        metadata: {
          courseCode,
          level,
          status: "pending",
          fileName: selectedFile.name,
        },
      });

      toast.success("Material uploaded successfully!");

      // Reset form
      selectedFile = null;
      level = "200";
      courseCode = "";
      courseTitle = "";
      description = "";
      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (input) input.value = "";
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      status.uploading = false;
      isUploading = false;
    }
  }
</script>

<div
  class="min-h-screen space-y-6 bg-gradient-to-br from-background to-background/95 px-3 lg:px-4"
>
  <div class="py-4 md:py-6">
    <h1 class="text-3xl font-bold tracking-tight lg:text-4xl dark:text-white">
      Upload Document
    </h1>
    <p class="text-muted-foreground">
      Share your academic resources with the community.
    </p>
  </div>

  <div class="grid gap-3 sm:gap-4 lg:grid-cols-[2fr,1fr]">
    <!-- Main Upload Form -->
    <Card class="p-3 sm:p-4">
      <form
        class="space-y-6"
        onsubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <!-- File Upload -->
        <div class="space-y-2">
          <Label for="file">Document</Label>
          <div
            class="relative flex min-h-[120px] sm:min-h-[150px] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-3 py-4 sm:px-4 sm:py-6 hover:border-primary/50"
          >
            {#if selectedFile}
              <div class="text-center">
                <FileText
                  class="mx-auto h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground"
                />
                <p class="mt-2 font-medium">{selectedFile.name}</p>
                <p class="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  class="absolute right-2 top-2"
                  onclick={removeFile}
                  aria-label="Remove file"
                >
                  <X class="h-4 w-4" />
                </Button>
              </div>
            {:else}
              <label for="file" class="text-center">
                <Upload
                  class="mx-auto h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground"
                />
                <p class="mt-2 font-medium text-sm sm:text-base">
                  Drop your file here or click to browse
                </p>
                <p class="text-xs sm:text-sm text-muted-foreground">
                  PDF, DOC, DOCX up to 10MB
                </p>
                <input
                  type="file"
                  id="file"
                  accept=".pdf,.doc,.docx"
                  class="absolute inset-0 cursor-pointer opacity-0"
                  onchange={handleFileSelect}
                />
              </label>
            {/if}
          </div>
        </div>

        <!-- Level -->
        <div class="space-y-2">
          <Label for="level">Level *</Label>
          <select
            id="level"
            class="w-full rounded-md border bg-background px-3 py-2 text-sm"
            bind:value={level}
            required
          >
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="300">300</option>
            <option value="400">400</option>
          </select>
        </div>

        <!-- Course Code -->
        <div class="space-y-2">
          <Label for="courseCode">Course Code *</Label>
          <Input
            type="text"
            id="courseCode"
            placeholder="e.g. CSC 249.2"
            bind:value={courseCode}
            required
          />
        </div>

        <!-- Course Title -->
        <div class="space-y-2">
          <Label for="courseTitle">Course Title *</Label>
          <Input
            type="text"
            id="courseTitle"
            placeholder="e.g. Intro to Computer Science"
            bind:value={courseTitle}
            required
          />
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <Label for="description">Description *</Label>
          <textarea
            id="description"
            class="w-full rounded-md border bg-background px-3 py-2 text-sm"
            rows="4"
            placeholder="Material description..."
            bind:value={description}
            required
          ></textarea>
        </div>

        <Button
          type="submit"
          class="w-full"
          disabled={isUploading ||
            !selectedFile ||
            !level ||
            !courseCode ||
            !courseTitle ||
            !description}
        >
          {#if isUploading}
            <span class="flex items-center gap-2">
              <div
                class="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground"
              ></div>
              Uploading...
            </span>
          {:else}
            Upload
          {/if}
        </Button>
      </form>
    </Card>

    <!-- Side Info -->
    <div class="space-y-3 sm:space-y-4">
      <Card class="p-3 sm:p-4">
        <h3 class="mb-2 text-base font-semibold sm:text-lg">
          Upload Guidelines
        </h3>
        <ul class="space-y-2 text-sm text-muted-foreground">
          <li class="flex items-start gap-2">
            <div class="mt-0.5 rounded-full bg-primary/10 p-1">
              <FileText class="h-4 w-4 text-primary" />
            </div>
            <span>Accepted formats: PDF, DOC, DOCX</span>
          </li>
          <li class="flex items-start gap-2">
            <div class="mt-0.5 rounded-full bg-primary/10 p-1">
              <Upload class="h-4 w-4 text-primary" />
            </div>
            <span>Maximum file size: 10MB</span>
          </li>
          <li class="flex items-start gap-2">
            <div class="mt-0.5 rounded-full bg-primary/10 p-1">
              <MessageSquare class="h-4 w-4 text-primary" />
            </div>
            <span
              >Include clear title and description for better searchability</span
            >
          </li>
        </ul>
      </Card>

      <Card class="p-3 sm:p-4">
        <h3 class="mb-2 text-base font-semibold sm:text-lg">Need Help?</h3>
        <p class="text-sm text-muted-foreground">
          If you're having trouble uploading documents or have questions, please
          visit our
          <a href="/feedback" class="text-primary hover:underline"
            >feedback page</a
          >
          or
          <a
            href="mailto:focuniport@gmail.com"
            class="text-primary hover:underline">contact support</a
          >.
        </p>
      </Card>
    </div>
  </div>
</div>
