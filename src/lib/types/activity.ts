export type ActivityType = "upload" | "download" | "feedback" | "pending";

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    courseCode?: string;
    level?: string;
    downloads?: number;
    status?: string;
  };
}
