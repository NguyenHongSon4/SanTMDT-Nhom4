import { useState } from "react";
import type { AppUser } from "../App";
import { mockReviews, type Review } from "../data/mockData";

interface ReviewSectionProps {
  productId: number;
  productRating: number;
  totalReviews: number;
  user: AppUser | null;
  navigate: (p: any) => void;
}

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
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
          className="transition-transform hover:scale-110"
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
        <svg key={s} width={size} height={size} viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? "var(--color-gold)" : "none"}
          stroke="var(--color-gold)" strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

const ratingLabel: Record<number, string> = {
  5: "Xuất Sắc",
  4: "Tốt",
  3: "Ổn",
  2: "Không Tốt",
  1: "Rất Tệ",
};

export default function ReviewSection({ productId, productRating, totalReviews, user, navigate }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(
    mockReviews.filter((r) => r.productId === productId)
  );
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "lowest" | "helpful">("newest");
  const [filterRating, setFilterRating] = useState(0);
  const [helpfulClicked, setHelpfulClicked] = useState<Set<number>>(new Set());

  // New review state
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; comment?: string }>({});

  // Rating breakdown
  const counts = [5, 4, 3, 2, 1].map((r) => ({
    r,
    count: reviews.filter((rv) => rv.rating === r).length,
  }));
  const maxCount = Math.max(...counts.map((c) => c.count), 1);

  // Filter + sort
  const filtered = reviews
    .filter((r) => (filterRating === 0 ? true : r.rating === filterRating))
    .slice()
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "highest") return b.rating - a.rating;
      if (sortBy === "lowest") return a.rating - b.rating;
      if (sortBy === "helpful") return b.helpful - a.helpful;
      return 0;
    });

  const handleHelpful = (id: number) => {
    if (helpfulClicked.has(id)) return;
    setHelpfulClicked((prev) => new Set(prev).add(id));
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, helpful: r.helpful + 1 } : r));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { title?: string; comment?: string } = {};
    if (!title.trim()) errs.title = "Vui lòng nhập tiêu đề đánh giá";
    if (comment.trim().length < 10) errs.comment = "Nhận xét phải có ít nhất 10 ký tự";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const newReview: Review = {
      id: Date.now(),
      productId,
      userId: 99,
      userName: user!.name,
      userInitial: user!.name[0],
      rating,
      title: title.trim(),
      comment: comment.trim(),
      createdAt: new Date().toISOString().split("T")[0],
      verified: false,
      helpful: 0,
    };
    setReviews((prev) => [newReview, ...prev]);
    setSubmitted(true);
    setShowForm(false);
    setTitle("");
    setComment("");
    setRating(5);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const inputStyle = {
    fontFamily: "var(--font-body)",
    border: "1px solid var(--color-champagne)",
    background: "var(--color-mist)",
    color: "var(--color-charcoal)",
  };

  return (
    <div style={{ borderTop: "1px solid var(--color-champagne)" }} className="pt-12 mt-4">
      {/* Section header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase mb-2">
            Từ Khách Hàng
          </p>
          <h2 style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-2xl font-normal">
            Đánh Giá & Nhận Xét
          </h2>
        </div>
        {user ? (
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              background: showForm ? "var(--color-mist)" : "var(--color-charcoal)",
              color: showForm ? "var(--color-charcoal)" : "var(--color-champagne)",
              border: showForm ? "1px solid var(--color-champagne)" : "none",
              fontFamily: "var(--font-body)",
            }}
            className="px-5 py-2.5 text-xs tracking-widest uppercase hover:opacity-80 transition-all"
          >
            {showForm ? "Huỷ" : "✏ Viết Đánh Giá"}
          </button>
        ) : (
          <button
            onClick={() => navigate("login")}
            style={{ color: "var(--color-gold)", fontFamily: "var(--font-body)", borderBottom: "1px solid var(--color-gold)" }}
            className="text-xs tracking-widest uppercase hover:opacity-70 transition-opacity"
          >
            Đăng nhập để đánh giá
          </button>
        )}
      </div>

      {/* Success toast */}
      {submitted && (
        <div style={{ background: "rgba(90,138,106,0.12)", border: "1px solid rgba(90,138,106,0.35)" }} className="p-3 mb-6 flex items-center gap-2">
          <span style={{ color: "#5a8a6a" }}>✓</span>
          <p style={{ color: "#5a8a6a", fontFamily: "var(--font-body)" }} className="text-sm">Cảm ơn bạn! Đánh giá của bạn đã được ghi nhận.</p>
        </div>
      )}

      {/* Write review form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{ background: "var(--color-mist)", border: "1px solid var(--color-champagne)" }}
          className="p-6 mb-10"
        >
          <h3 style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-lg font-normal mb-5">
            Đánh Giá Của Bạn
          </h3>

          {/* Star rating */}
          <div className="mb-5">
            <label style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="block text-xs tracking-widest uppercase mb-3">
              Xếp Hạng *
            </label>
            <div className="flex items-center gap-4">
              <StarSelector value={rating} onChange={setRating} />
              <span style={{ color: "var(--color-gold)", fontFamily: "var(--font-display)" }} className="text-lg font-normal italic">
                {ratingLabel[rating]}
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="block text-xs tracking-widest uppercase mb-2">
              Tiêu Đề *
            </label>
            <input
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: "" })); }}
              placeholder="Tóm tắt trải nghiệm của bạn..."
              style={inputStyle}
              className="w-full px-4 py-3 text-sm outline-none focus:border-[var(--color-charcoal)] transition-colors placeholder:opacity-40"
            />
            {errors.title && <p style={{ color: "#c0392b", fontFamily: "var(--font-body)" }} className="text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Comment */}
          <div className="mb-5">
            <label style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="block text-xs tracking-widest uppercase mb-2">
              Nhận Xét *
            </label>
            <textarea
              value={comment}
              onChange={(e) => { setComment(e.target.value); setErrors((p) => ({ ...p, comment: "" })); }}
              placeholder="Chia sẻ chi tiết về trải nghiệm sử dụng sản phẩm, hiệu quả, kết cấu, mùi hương..."
              rows={5}
              style={inputStyle}
              className="w-full px-4 py-3 text-sm outline-none resize-none focus:border-[var(--color-charcoal)] transition-colors placeholder:opacity-40"
            />
            <div className="flex justify-between items-center mt-1">
              {errors.comment
                ? <p style={{ color: "#c0392b", fontFamily: "var(--font-body)" }} className="text-xs">{errors.comment}</p>
                : <span />
              }
              <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs">{comment.length} ký tự</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              style={{ background: "var(--color-charcoal)", color: "var(--color-champagne)", fontFamily: "var(--font-body)" }}
              className="px-8 py-3 text-xs tracking-widest uppercase hover:opacity-80 transition-opacity"
            >
              Gửi Đánh Giá
            </button>
            <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs font-light">
              Đánh giá với tư cách: <span style={{ color: "var(--color-charcoal)" }}>{user?.name}</span>
            </p>
          </div>
        </form>
      )}

      {/* Summary + breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10" style={{ borderBottom: "1px solid var(--color-champagne)", paddingBottom: "32px" }}>
        {/* Average score */}
        <div className="flex flex-col items-center justify-center py-4">
          <p style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-7xl font-normal leading-none mb-3">
            {productRating.toFixed(1)}
          </p>
          <StarDisplay rating={productRating} size={18} />
          <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs mt-2">
            {reviews.length} đánh giá
          </p>
        </div>

        {/* Rating bars */}
        <div className="md:col-span-2 space-y-2 py-4">
          {counts.map(({ r, count }) => (
            <button
              key={r}
              onClick={() => setFilterRating(filterRating === r ? 0 : r)}
              className="w-full flex items-center gap-3 group"
            >
              <span style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)", minWidth: "20px" }} className="text-xs text-right">
                {r}★
              </span>
              <div style={{ flex: 1, height: "8px", background: "var(--color-champagne)", borderRadius: "4px", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${(count / maxCount) * 100}%`,
                    height: "100%",
                    background: filterRating === r ? "var(--color-gold)" : "var(--color-charcoal)",
                    borderRadius: "4px",
                    transition: "width 0.4s, background 0.2s",
                  }}
                />
              </div>
              <span style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)", minWidth: "16px" }} className="text-xs">
                {count}
              </span>
            </button>
          ))}
          {filterRating > 0 && (
            <button
              onClick={() => setFilterRating(0)}
              style={{ color: "var(--color-gold)", fontFamily: "var(--font-body)", borderBottom: "1px solid var(--color-gold)" }}
              className="text-xs tracking-widest uppercase mt-2 hover:opacity-70"
            >
              Xem tất cả
            </button>
          )}
        </div>
      </div>

      {/* Sort controls */}
      {reviews.length > 0 && (
        <div className="flex items-center justify-between mb-6">
          <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs">
            {filtered.length} nhận xét{filterRating > 0 ? ` · ${filterRating} sao` : ""}
          </p>
          <div className="flex gap-2">
            {([
              ["newest", "Mới Nhất"],
              ["helpful", "Hữu Ích"],
              ["highest", "Cao Nhất"],
              ["lowest", "Thấp Nhất"],
            ] as const).map(([v, l]) => (
              <button
                key={v}
                onClick={() => setSortBy(v)}
                style={{
                  fontFamily: "var(--font-body)",
                  color: sortBy === v ? "var(--color-charcoal)" : "var(--color-warm-gray)",
                  borderBottom: sortBy === v ? "1px solid var(--color-charcoal)" : "1px solid transparent",
                }}
                className="text-xs tracking-widest uppercase pb-0.5 transition-colors hover:text-[var(--color-charcoal)]"
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Review cards */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p style={{ fontFamily: "var(--font-display)", color: "var(--color-warm-gray)" }} className="text-xl font-normal italic">
            {reviews.length === 0 ? "Chưa có đánh giá nào. Hãy là người đầu tiên!" : "Không có đánh giá phù hợp."}
          </p>
        </div>
      ) : (
        <div className="space-y-0">
          {filtered.map((review, i) => (
            <div
              key={review.id}
              style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--color-champagne)" : "none" }}
              className="py-7"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div
                  style={{ width: "40px", height: "40px", background: "var(--color-charcoal)", borderRadius: "50%", flexShrink: 0 }}
                  className="flex items-center justify-center"
                >
                  <span style={{ color: "var(--color-gold)", fontFamily: "var(--font-display)" }} className="text-sm font-normal">
                    {review.userInitial}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-sm font-medium">
                        {review.userName}
                      </p>
                      {review.verified && (
                        <span style={{ color: "#5a8a6a", background: "rgba(90,138,106,0.1)", border: "1px solid rgba(90,138,106,0.25)", fontFamily: "var(--font-body)" }} className="text-xs px-2 py-0.5 flex items-center gap-1">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                          Đã mua hàng
                        </span>
                      )}
                    </div>
                    <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs flex-shrink-0">
                      {review.createdAt}
                    </p>
                  </div>

                  {/* Stars + title */}
                  <div className="flex items-center gap-3 mb-2">
                    <StarDisplay rating={review.rating} size={13} />
                    <p style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="font-normal text-sm">
                      {review.title}
                    </p>
                  </div>

                  {/* Comment */}
                  <p style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-sm font-light leading-relaxed mb-4">
                    {review.comment}
                  </p>

                  {/* Helpful */}
                  <div className="flex items-center gap-3">
                    <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs">
                      Có hữu ích không?
                    </p>
                    <button
                      onClick={() => handleHelpful(review.id)}
                      disabled={helpfulClicked.has(review.id)}
                      style={{
                        fontFamily: "var(--font-body)",
                        color: helpfulClicked.has(review.id) ? "var(--color-gold)" : "var(--color-warm-gray)",
                        border: `1px solid ${helpfulClicked.has(review.id) ? "var(--color-gold)" : "var(--color-champagne)"}`,
                        background: helpfulClicked.has(review.id) ? "rgba(201,168,130,0.1)" : "transparent",
                      }}
                      className="text-xs px-3 py-1 tracking-widest uppercase transition-all hover:opacity-80 flex items-center gap-1.5 disabled:cursor-default"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z"/>
                        <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                      </svg>
                      Có ({review.helpful})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
