import type { FeedbackData, FeedbackResponse } from "$lib/types/feedback";

const FORM_ENDPOINT =
  "https://formsubmit.co/ajax/7dcd6f293b856a29d8866ab98c707aeb";

export async function submitFeedback(
  data: FeedbackData
): Promise<FeedbackResponse> {
  try {
    const formData = new FormData();

    // Add form fields
    formData.append("_subject", `Faculty E-Library Feedback: ${data.category}`);
    formData.append("_template", "detailed");
    formData.append("feedback", data.feedback);
    formData.append("category", data.category);
    formData.append("rating", data.rating.toString());
    formData.append("email", data.email || "Anonymous");

    // Handle file attachment
    if (data.attachFile) {
      // Ensure file size is under 10MB (FormSubmit limit)
      if (data.attachFile.size > 10 * 1024 * 1024) {
        throw new Error("File size must be less than 10MB");
      }

      formData.append("attachment", data.attachFile);
      formData.append("_attach_file", "true");
    }

    const response = await fetch(FORM_ENDPOINT, {
      method: "POST",
      body: formData,
      mode: "no-cors", // Required for FormSubmit
    });

    return {
      success: true,
      message: "Feedback submitted successfully",
    };
  } catch (error) {
    console.error("Feedback submission failed:", error);
    throw error;
  }
}
