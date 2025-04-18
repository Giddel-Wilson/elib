export interface FeedbackData {
  feedback: string;
  category: string;
  rating: number;
  email?: string;
  attachFile?: File | null;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
}
