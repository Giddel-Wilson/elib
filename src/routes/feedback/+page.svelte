<script lang="ts">
  import { Card } from "$lib/components/ui/card";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import {
    MessageSquare,
    Star,
    Send,
    ThumbsUp,
    AlertCircle,
  } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  import type { FeedbackData } from "$lib/types/feedback";
  import { activityStore } from "$lib/stores/activity-store";

  let feedback = "";
  let category = "general";
  let rating = 0;
  let email = "";
  let attachFile: File | null = null;
  let submitting = false;

  const categories = [
    { value: "general", label: "General Feedback" },
    { value: "bug", label: "Bug Report" },
    { value: "feature", label: "Feature Request" },
    { value: "content", label: "Content Quality" },
    { value: "ui", label: "User Interface" },
  ];

  // Create a unique ID for the hidden iframe
  const iframeId = `hidden-iframe-${Math.random().toString(36).substring(2, 15)}`;

  async function handleSubmit() {
    if (!feedback.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    submitting = true;

    try {
      // Create a hidden iframe for form submission
      let iframe = document.getElementById(iframeId) as HTMLIFrameElement;
      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.id = iframeId;
        iframe.name = iframeId;
        iframe.style.display = "none";
        document.body.appendChild(iframe);
      }

      // Create a hidden form for submission
      const formElement = document.createElement("form");
      formElement.method = "POST";
      formElement.action =
        "https://formsubmit.co/7dcd6f293b856a29d8866ab98c707aeb";
      formElement.enctype = "multipart/form-data";
      formElement.target = iframeId; // Submit to hidden iframe
      formElement.style.display = "none";

      // Add form fields
      const addField = (name: string, value: string) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        formElement.appendChild(input);
      };

      // Required FormSubmit fields
      addField("_subject", `FoC E-Library Feedback: ${category}`);
      addField("_template", "box");
      addField("_captcha", "false");
      addField("_next", window.location.href); // Return to same page

      // Our form data
      addField("category", category);
      addField("rating", rating.toString());
      addField("feedback", feedback);
      addField("email", email || "Anonymous");

      // File attachment
      if (attachFile) {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.name = "attachment";

        // Create a DataTransfer object to set the file
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(attachFile);
        fileInput.files = dataTransfer.files;

        formElement.appendChild(fileInput);
      }

      // Add form to body and submit
      document.body.appendChild(formElement);
      formElement.submit();

      // Reset form after "submission"
      feedback = "";
      category = "general";
      rating = 0;
      email = "";
      attachFile = null;

      // Reset file input
      const fileInputElement = document.querySelector(
        "#attachment"
      ) as HTMLInputElement;
      if (fileInputElement) fileInputElement.value = "";

      // Show success message
      toast.success("Thank you for your feedback!");

      // Clean up form after submission
      setTimeout(() => {
        if (formElement && formElement.parentNode) {
          formElement.parentNode.removeChild(formElement);
        }
      }, 1000);
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit feedback"
      );
    } finally {
      submitting = false;
    }
  }

  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        input.value = "";
        return;
      }

      // Check file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error("Only images, PDFs, and Word documents are allowed");
        input.value = "";
        return;
      }

      attachFile = file;
    }
  }
</script>

<div
  class="min-h-screen space-y-6 bg-gradient-to-br from-background to-background/95 px-1 lg:px-4"
>
  <div class="space-y-6 py-4 md:py-6">
    <div>
      <h1 class="text-3xl font-bold tracking-tight lg:text-4xl dark:text-white">Feedback</h1>
      <p class="text-muted-foreground">Help us improve your experience</p>
    </div>

    <div class="grid gap-3 sm:gap-4 lg:grid-cols-[2fr,1fr]">
      <!-- Feedback Form -->
      <Card class="p-3 sm:p-4">
        <form
          class="space-y-6"
          onsubmit={(e: SubmitEvent) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div class="space-y-2">
            <Label for="category">Category</Label>
            <select
              id="category"
              class="w-full rounded-md border bg-background px-2 py-1.5 text-sm sm:px-3 sm:py-2"
              bind:value={category}
            >
              {#each categories as cat}
                <option value={cat.value}>{cat.label}</option>
              {/each}
            </select>
          </div>

          <div class="space-y-2">
            <Label>Rating</Label>
            <div class="flex gap-2">
              {#each Array(5) as _, i}
                <button
                  type="button"
                  class="focus-visible:ring-ring rounded-sm focus-visible:outline-none focus-visible:ring-2"
                  onclick={() => (rating = i + 1)}
                  onkeydown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      rating = i + 1;
                    }
                  }}
                >
                  <Star
                    class="h-5 w-5 transition-all {rating > 0 && i < rating
                      ? 'fill-primary text-primary'
                      : 'text-muted-foreground'}"
                  />
                </button>
              {/each}
            </div>
            <p class="text-sm text-muted-foreground">
              {#if rating === 0}
                Select your rating
              {:else}
                {rating} star{rating === 1 ? "" : "s"} selected
              {/if}
            </p>
          </div>

          <div class="space-y-2">
            <Label for="feedback">Your Feedback</Label>
            <Textarea
              id="feedback"
              bind:value={feedback}
              placeholder="Share your thoughts, suggestions, or report any issues..."
              rows={4}
              class="resize-none text-sm sm:text-base"
            />
          </div>

          <div class="space-y-2">
            <Label for="email">Email (optional)</Label>
            <Input
              type="email"
              id="email"
              bind:value={email}
              placeholder="Enter your email for follow-up"
              class="text-sm sm:text-base"
            />
          </div>

          <div class="space-y-2">
            <Label for="attachment">Attachment (optional)</Label>
            <div class="relative">
              <Input
                type="file"
                id="attachment"
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                onchange={handleFileSelect}
                class="cursor-pointer text-sm sm:text-base file:mr-2 sm:file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-primary file:px-2 file:py-1 sm:file:px-3 sm:file:py-1 file:text-xs sm:file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
            {#if attachFile}
              <p class="text-xs sm:text-sm text-muted-foreground">
                Selected: {attachFile.name}
              </p>
            {/if}
          </div>

          <Button
            type="submit"
            class="w-full text-sm sm:text-base"
            disabled={submitting}
          >
            {#if submitting}
              <span class="flex items-center gap-2">
                <div
                  class="h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-background border-t-foreground"
                ></div>
                Submitting...
              </span>
            {:else}
              Submit Feedback
            {/if}
          </Button>
        </form>
      </Card>

      <!-- Side Info -->
      <div class="space-y-3 sm:space-y-4">
        <Card class="p-3 sm:p-4">
          <h3 class="mb-2 text-base font-semibold sm:text-lg">
            Why Your Feedback Matters
          </h3>
          <ul class="space-y-2 sm:space-y-3 text-sm text-muted-foreground">
            <li class="flex items-start gap-2">
              <div class="mt-0.5 rounded-full bg-primary/10 p-1">
                <ThumbsUp class="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              </div>
              <div>
                <p class="font-medium text-sm sm:text-base text-foreground">
                  Improve the Platform
                </p>
                <p class="text-xs sm:text-sm">
                  Your feedback helps us enhance the user experience for
                  everyone.
                </p>
              </div>
            </li>
            <li class="flex items-start gap-2">
              <div class="mt-0.5 rounded-full bg-primary/10 p-1">
                <AlertCircle class="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              </div>
              <div>
                <p class="font-medium text-sm sm:text-base text-foreground">
                  Report Issues
                </p>
                <p class="text-xs sm:text-sm">
                  Let us know about any bugs or problems you encounter.
                </p>
              </div>
            </li>
            <li class="flex items-start gap-2">
              <div class="mt-0.5 rounded-full bg-primary/10 p-1">
                <MessageSquare class="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              </div>
              <div>
                <p class="font-medium text-sm sm:text-base text-foreground">
                  Suggest Features
                </p>
                <p class="text-xs sm:text-sm">
                  Share your ideas for new features and improvements.
                </p>
              </div>
            </li>
          </ul>
        </Card>

        <Card class="p-3 sm:p-4">
          <h3 class="mb-2 text-base font-semibold sm:text-lg">
            Contact Support
          </h3>
          <p class="text-xs sm:text-sm text-muted-foreground">
            Need immediate assistance? Our support team is here to help.
            <a
              href="mailto:focuniport@gmail.com"
              class="text-primary hover:underline">Contact us</a
            >
            or email
            <a
              href="mailto:focuniport@gmail.com"
              class="text-primary hover:underline">focuniport@gmail.com</a
            >
          </p>
        </Card>
      </div>
    </div>
  </div>
</div>

<!-- Add a hidden iframe for form submission -->
<iframe id={iframeId} name={iframeId} title="Form submission target" style="display:none;"></iframe>
