import type { MaterialUploadData } from "$lib/types/material";

const API_BASE_URL = "https://foc-e-library-backend.onrender.com/api/v1";

export async function uploadMaterial(data: MaterialUploadData, token: string) {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== null) formData.append(key, value);
  });

  const response = await fetch(`${API_BASE_URL}/materials`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Upload failed");
  }

  return response.json();
}
