import { apiRequest } from "./api";

export interface FeedbackMessage {
  _id: string;
  senderId: string;
  senderRole: "customer" | "admin";
  content: string;
  createdAt: string;
}

export interface FeedbackThread {
  _id: string;
  userId: string | { _id: string; name: string; email: string };
  subject: string;
  category: "question" | "order" | "product" | "other";
  status: "open" | "answered" | "closed";
  messages: FeedbackMessage[];
  createdAt: string;
  updatedAt: string;
}

export const getMyFeedback = async () => (await apiRequest<{ data: FeedbackThread[] }>("/feedback/mine")).data;
export const getAllFeedback = async () => (await apiRequest<{ data: FeedbackThread[] }>("/feedback")).data;
export const createFeedback = async (payload: { subject: string; category: FeedbackThread["category"]; content: string }) =>
  (await apiRequest<{ data: FeedbackThread }>("/feedback", { method: "POST", body: JSON.stringify(payload) })).data;
export const replyToFeedback = async (id: string, content: string) =>
  (await apiRequest<{ data: FeedbackThread }>(`/feedback/${id}/messages`, { method: "POST", body: JSON.stringify({ content }) })).data;
export const closeFeedback = async (id: string) =>
  (await apiRequest<{ data: FeedbackThread }>(`/feedback/${id}/close`, { method: "PATCH" })).data;
