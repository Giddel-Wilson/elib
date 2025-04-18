export interface MaterialUploadData {
  level: string;
  courseCode: string;
  courseTitle: string;
  description: string;
  material: File | null;
}

export type UploadStatus = "pending" | "approved" | "rejected";

export interface PendingUpload {
  id: string;
  courseTitle: string;
  courseCode: string;
  fileName: string;
  status: UploadStatus;
  timestamp: string;
}

export interface UploadStatus {
  uploading: boolean;
  error: string | null;
  success: boolean;
}
