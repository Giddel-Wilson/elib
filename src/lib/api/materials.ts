import type { Material } from "$lib/stores/materials";

const API_BASE_URL = "https://focbackend.emmanuelngoka.work/api/v1";

export async function fetchMaterials(): Promise<Material[]> {
  const response = await fetch(`${API_BASE_URL}/materials`);
  if (!response.ok) {
    throw new Error("Failed to fetch materials");
  }
  return response.json();
}

export async function getMaterial(id: string): Promise<Material> {
  const response = await fetch(`${API_BASE_URL}/materials/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch material");
  }
  return response.json();
}

export async function downloadMaterial(
  id: string
): Promise<{ blob: Blob; filename: string }> {
  const response = await fetch(`${API_BASE_URL}/materials/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to download material");
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get("content-disposition");
  const filename =
    contentDisposition?.split("filename=")[1]?.replace(/["']/g, "") ||
    "document.pdf";

  return { blob, filename };
}

export async function uploadMaterial(data: MaterialUploadData, token: string) {
  if (!token) {
    throw new Error("Authentication token is required");
  }

  const formData = new FormData();

  // Ensure all required fields are present
  if (
    !data.level ||
    !data.courseCode ||
    !data.courseTitle ||
    !data.description ||
    !data.material
  ) {
    throw new Error("Missing required fields");
  }

  // Add file and other data to FormData
  formData.append("material", data.material);
  formData.append("level", data.level.toString());
  formData.append("courseCode", data.courseCode);
  formData.append("courseTitle", data.courseTitle);
  formData.append("description", data.description);

  try {
    const response = await fetch(`${API_BASE_URL}/materials`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type, let browser set it with boundary for multipart/form-data
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Upload failed");
    }

    return response.json();
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}
