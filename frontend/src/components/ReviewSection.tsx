import { useState, useEffect } from "react";
import type { AppUser, Page } from "../App";
import {
  fetchProductReviews,
  createReview,
  type ReviewView,
} from "../services/reviewService";

interface ReviewSectionProps {
  productId: string;
  productRating: number;
  totalReviews: number;
  user: AppUser | null;
  navigate: (p: Page) => void;
  onStatsChange?: (avg: number, count: number) => void;
  openFormOnLoad?: boolean;
}

function StarSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill={star <= (hovered || value) ? "var(--color-gold)" : "none"}
            stroke="var(--color-gold)"
            strokeWidth="1.5"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? "var(--color-gold)" : "none"}
          stroke="var(--color-gold)"
          strokeWidth="1.5"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewSection({
  productId,
  productRating,
  totalReviews,
  user,
  navigate,
  onStatsChange,
  openFormOnLoad = false,
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<ReviewView[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(openFormOnLoad);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchProductReviews(productId);
      setReviews(data);
      const avg = data.length > 0 ? data.reduce((s, r) => s + r.rating, 0) / data.length : 0;
      onStatsChange?.(avg, data.length);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [productId]);

  useEffect(() => {
    if (!openFormOnLoad) return;
    const timer = window.setTimeout(() => {
      document.getElementById("product-reviews")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => window.clearTimeout(timer);
  }, [openFormOnLoad, productId]);

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || []).slice(0, 3);
    setFiles(list);
    setPreviews(list.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("login");
      return;
    }
    if (comment.trim().length < 10) {
      setFormError("Nhận xét tối thiểu 10 ký tự");
      return;
    }
    setFormError("");
    setSubmitting(true);
    try {
      await createReview({
        productId,
        rating,
        comment: comment.trim(),
        images: files,
      });
      setSubmitted(true);
      setShowForm(false);
      setComment("");
      setFiles([]);
      setPreviews([]);
      setRating(5);
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err: any) {
      setFormError(err.message || "Gửi đánh giá thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : productRating || 0;

  return (
    <div
      id="product-reviews"
      style={{ borderTop: "1px solid var(--color-champagne)" }}
      className="pt-12 mt-4 scroll-mt-24"
    >
      <div className="flex items-start justify-between mb-10 flex-wrap gap-3">
        <div>
          <p
            style={{
              color: "var(--color-warm-gray)",
              fontFamily: "var(--font-body)",
            }}
            className="text-xs tracking-widest uppercase mb-2"
          >
            Từ Khách Hàng
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-charcoal)",
            }}
            className="text-2xl font-normal"
          >
            Đánh Giá & Nhận Xét
          </h2>
        </div>
        {user ? (
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            style={{
              background: showForm
                ? "var(--color-mist)"
                : "var(--color-charcoal)",
              color: showForm
                ? "var(--color-charcoal)"
                : "var(--color-champagne)",
              border: showForm
                ? "1px solid var(--color-champagne)"
                : "none",
              fontFamily: "var(--font-body)",
            }}
            className="px-5 py-2.5 text-xs tracking-widest uppercase"
          >
            {showForm ? "Huỷ" : "✏ Viết Đánh Giá"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate("login")}
            style={{
              color: "var(--color-gold)",
              fontFamily: "var(--font-body)",
              borderBottom: "1px solid var(--color-gold)",
            }}
            className="text-xs tracking-widest uppercase"
          >
            Đăng nhập để đánh giá
          </button>
        )}
      </div>

      {submitted && (
        <div
          style={{
            background: "rgba(90,138,106,0.12)",
            border: "1px solid rgba(90,138,106,0.35)",
          }}
          className="p-3 mb-6"
        >
          <p style={{ color: "#5a8a6a" }} className="text-sm">
            ✓ Đã gửi đánh giá. Sẽ hiển thị sau khi Admin duyệt.
          </p>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: "var(--color-mist)",
            border: "1px solid var(--color-champagne)",
          }}
          className="p-6 mb-10 space-y-4"
        >
          <p className="text-xs opacity-60">
            Chỉ đánh giá sản phẩm đã mua (đơn hoàn tất). Tối đa 3 ảnh.
          </p>
          <div>
            <label className="block text-xs tracking-widest uppercase mb-2">
              Xếp hạng *
            </label>
            <StarSelector value={rating} onChange={setRating} />
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase mb-2">
              Nhận xét *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 text-sm outline-none resize-none"
              style={{
                border: "1px solid var(--color-champagne)",
                background: "white",
              }}
              placeholder="Tối thiểu 10 ký tự..."
            />
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase mb-2">
              Ảnh (tuỳ chọn)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={onPickFiles}
            />
            {previews.length > 0 && (
              <div className="flex gap-2 mt-2">
                {previews.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="w-16 h-16 object-cover"
                  />
                ))}
              </div>
            )}
          </div>
          {formError && (
            <p className="text-xs" style={{ color: "#c0392b" }}>
              {formError}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            style={{
              background: "var(--color-charcoal)",
              color: "var(--color-champagne)",
            }}
            className="px-8 py-3 text-xs tracking-widest uppercase disabled:opacity-50"
          >
            {submitting ? "Đang gửi..." : "Gửi Đánh Giá"}
          </button>
        </form>
      )}

      <div className="flex items-center gap-4 mb-8">
        <p style={{ fontFamily: "var(--font-display)" }} className="text-5xl">
          {(avg || 0).toFixed(1)}
        </p>
        <div>
          <StarDisplay rating={avg} size={18} />
          <p className="text-xs opacity-60 mt-1">
            {loading ? "..." : `${reviews.length} đánh giá đã duyệt`}
            {totalReviews > 0 && reviews.length === 0
              ? ` · SP ghi nhận ${totalReviews}`
              : ""}
          </p>
        </div>
      </div>

      {loading && <p className="opacity-50 text-sm">Đang tải đánh giá...</p>}

      {!loading && reviews.length === 0 && (
        <p className="py-8 text-center opacity-50 italic">
          Chưa có đánh giá công khai.
        </p>
      )}

      <div className="space-y-0">
        {reviews.map((review, i) => (
          <div
            key={review.id}
            style={{
              borderBottom:
                i < reviews.length - 1
                  ? "1px solid var(--color-champagne)"
                  : "none",
            }}
            className="py-7"
          >
            <div className="flex gap-4">
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "var(--color-charcoal)",
                }}
                className="flex items-center justify-center flex-shrink-0"
              >
                <span style={{ color: "var(--color-gold)" }}>
                  {review.userInitial}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{review.userName}</span>
                  {review.verified && (
                    <span
                      className="text-xs px-2 py-0.5"
                      style={{
                        color: "#5a8a6a",
                        background: "rgba(90,138,106,0.1)",
                      }}
                    >
                      Đã mua hàng
                    </span>
                  )}
                  <span className="text-xs opacity-50 ml-auto">
                    {review.createdAt}
                  </span>
                </div>
                <StarDisplay rating={review.rating} size={13} />
                <p className="text-sm font-light mt-2 leading-relaxed">
                  {review.comment}
                </p>
                {review.images.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {review.images.map((src, idx) => (
                      <a key={idx} href={src} target="_blank" rel="noreferrer">
                        <img
                          src={src}
                          alt=""
                          className="w-20 h-20 object-cover"
                          style={{ border: "1px solid var(--color-champagne)" }}
                        />
                      </a>
                    ))}
                  </div>
                )}

                {/* Phản hồi Admin */}
                {review.adminReply && (
                  <div
                    className="mt-3 p-3"
                    style={{
                      background: "var(--color-mist)",
                      borderLeft: "2px solid var(--color-gold)",
                    }}
                  >
                    <p
                      className="text-xs tracking-widest uppercase mb-1"
                      style={{
                        color: "var(--color-gold)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      Phản hồi từ LUMIÈRE
                      {review.repliedAt ? ` · ${review.repliedAt}` : ""}
                    </p>
                    <p
                      className="text-sm font-light leading-relaxed"
                      style={{
                        color: "var(--color-charcoal)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {review.adminReply}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
