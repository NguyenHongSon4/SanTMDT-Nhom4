import { apiRequest, getToken } from "./api";

const API_BASE = "http://localhost:5000/api";
const FILE_BASE = "http://localhost:5000";

export interface ReviewView {
  id: string;
  productId: string;
  userName: string;
  userInitial: string;
  rating: number;
  comment: string;
  images: string[];
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  verified: boolean;
  adminReply?: string;
  repliedAt?: string;
}

interface ApiReview {
  _id: string;
  productId: string | { _id: string; name?: string; images?: string[] };
  userId: string | { _id: string; name?: string; email?: string };
  rating: number;
  comment: string;
  images?: string[];
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
  orderId?: string | null;
  adminReply?: string;
  repliedAt?: string;
}

function mapReview(r: ApiReview): ReviewView {
  const user =
    typeof r.userId === "object" && r.userId
      ? r.userId
      : { name: "Khách" };
  const name = (user as any).name || "Khách";
  const productId =
    typeof r.productId === "object" && r.productId
      ? r.productId._id
      : String(r.productId);

  return {
    id: r._id,
    productId,
    userName: name,
    userInitial: name[0] || "?",
    rating: r.rating,
    comment: r.comment,
    images: (r.images || []).map((src) =>
      src.startsWith("http") ? src : `${FILE_BASE}${src}`
    ),
    status: r.status,
    createdAt: r.createdAt ? r.createdAt.slice(0, 10) : "",
    verified: Boolean(r.orderId),
    adminReply: r.adminReply || "",
    repliedAt: r.repliedAt ? String(r.repliedAt).slice(0, 10) : "",
  };
}

/** Public — chỉ approved */
export async function fetchProductReviews(
  productId: string
): Promise<ReviewView[]> {
  const res = await apiRequest<{ success: boolean; data: ApiReview[] }>(
    `/reviews/product/${productId}`
  );
  return res.data.map(mapReview);
}

/** User gửi review + ảnh (multipart) */
export async function createReview(payload: {
  productId: string;
  rating: number;
  comment: string;
  images?: File[];
}) {
  const token = getToken();
  const form = new FormData();
  form.append("productId", payload.productId);
  form.append("rating", String(payload.rating));
  form.append("comment", payload.comment);
  (payload.images || []).slice(0, 3).forEach((file) => {
    form.append("images", file);
  });

  const res = await fetch(`${API_BASE}/reviews`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    // Không set Content-Type — browser tự multipart boundary
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gửi đánh giá thất bại");
  return mapReview(data.data);
}

/** Admin */
export async function fetchAdminReviews(status?: string) {
  const qs = status && status !== "all" ? `?status=${status}` : "";
  const res = await apiRequest<{ success: boolean; data: ApiReview[] }>(
    `/reviews${qs}`
  );
  return res.data.map((r) => ({
    ...mapReview(r),
    productName:
      typeof r.productId === "object" && r.productId
        ? (r.productId as any).name || "—"
        : "—",
    userEmail:
      typeof r.userId === "object" && r.userId
        ? (r.userId as any).email || ""
        : "",
  }));
}

export async function updateReviewStatus(
  id: string,
  status: "approved" | "rejected" | "pending"
) {
  const res = await apiRequest<{ success: boolean; data: ApiReview }>(
    `/reviews/${id}/status`,
    {
      method: "PUT",
      body: JSON.stringify({ status }),
    }
  );
  return mapReview(res.data);
}

export async function deleteReview(id: string) {
  await apiRequest(`/reviews/${id}`, { method: "DELETE" });
}

export async function replyToReview(id: string, reply: string) {
  const res = await apiRequest<{ success: boolean; data: ApiReview }>(
    `/reviews/${id}/reply`,
    {
      method: "PUT",
      body: JSON.stringify({ reply }),
    }
  );
  return mapReview(res.data);
}