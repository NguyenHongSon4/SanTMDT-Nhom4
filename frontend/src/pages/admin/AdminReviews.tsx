import { useState, useEffect } from "react";
import {
  fetchAdminReviews,
  updateReviewStatus,
  deleteReview,
  replyToReview,
} from "../../services/reviewService";

type Row = Awaited<ReturnType<typeof fetchAdminReviews>>[number];

export default function AdminReviews() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");

  const [replyTarget, setReplyTarget] = useState<Row | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAdminReviews(
        statusFilter === "all" ? undefined : statusFilter
      );
      setRows(data);
    } catch (err: any) {
      setError(err.message || "Không tải được đánh giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const setStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      await updateReviewStatus(id, status);
      await load();
    } catch (err: any) {
      alert(err.message || "Lỗi cập nhật");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Xóa đánh giá này?")) return;
    try {
      await deleteReview(id);
      await load();
    } catch (err: any) {
      alert(err.message || "Lỗi xóa");
    }
  };

  const openReply = (r: Row) => {
    setReplyTarget(r);
    setReplyText(r.adminReply || "");
  };

  const submitReply = async () => {
    if (!replyTarget) return;
    if (replyText.trim().length < 5) {
      alert("Nội dung trả lời tối thiểu 5 ký tự");
      return;
    }
    setReplying(true);
    try {
      await replyToReview(replyTarget.id, replyText.trim());
      setReplyTarget(null);
      setReplyText("");
      await load();
    } catch (err: any) {
      alert(err.message || "Gửi trả lời thất bại");
    } finally {
      setReplying(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <p
          style={{
            color: "var(--color-warm-gray)",
            fontFamily: "var(--font-body)",
          }}
          className="text-xs tracking-widest uppercase mb-1"
        >
          Quản Lý
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-charcoal)",
          }}
          className="text-3xl font-normal"
        >
          Đánh Giá
        </h1>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {(
          [
            ["pending", "Chờ duyệt"],
            ["approved", "Đã duyệt"],
            ["rejected", "Từ chối"],
            ["all", "Tất cả"],
          ] as const
        ).map(([v, l]) => (
          <button
            key={v}
            type="button"
            onClick={() => setStatusFilter(v)}
            style={{
              fontFamily: "var(--font-body)",
              background:
                statusFilter === v ? "var(--color-charcoal)" : "white",
              color:
                statusFilter === v
                  ? "var(--color-champagne)"
                  : "var(--color-warm-gray)",
              border: "1px solid var(--color-champagne)",
            }}
            className="px-4 py-2 text-xs tracking-widest uppercase"
          >
            {l}
          </button>
        ))}
      </div>

      {loading && <p className="opacity-60">Đang tải...</p>}
      {error && <p style={{ color: "#c0392b" }}>{error}</p>}

      {!loading && !error && (
        <div
          style={{
            background: "white",
            border: "1px solid var(--color-champagne)",
          }}
          className="overflow-x-auto"
        >
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-champagne)" }}>
                {["Sản phẩm", "Khách", "Sao", "Nội dung", "Ảnh", "Ngày", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-xs tracking-widest uppercase text-left font-normal opacity-60"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  style={{ borderBottom: "1px solid var(--color-champagne)" }}
                >
                  <td className="px-4 py-3 text-sm">{r.productName}</td>
                  <td className="px-4 py-3 text-sm">
                    <p>{r.userName}</p>
                    <p className="text-xs opacity-50">{r.userEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-sm">{r.rating}★</td>
                  <td className="px-4 py-3 text-sm max-w-xs">
                    <p className="line-clamp-3">{r.comment}</p>
                    {r.adminReply && (
                      <p
                        className="text-xs mt-1"
                        style={{ color: "var(--color-gold)" }}
                      >
                        Admin: {r.adminReply}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {r.images.map((src, i) => (
                        <a key={i} href={src} target="_blank" rel="noreferrer">
                          <img
                            src={src}
                            alt=""
                            className="w-10 h-10 object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs opacity-60">{r.createdAt}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {r.status !== "approved" && (
                        <button
                          type="button"
                          onClick={() => setStatus(r.id, "approved")}
                          className="text-xs px-2 py-1"
                          style={{
                            background: "rgba(90,138,106,0.15)",
                            color: "#5a8a6a",
                          }}
                        >
                          Duyệt
                        </button>
                      )}
                      {r.status !== "rejected" && (
                        <button
                          type="button"
                          onClick={() => setStatus(r.id, "rejected")}
                          className="text-xs px-2 py-1"
                          style={{
                            background: "rgba(201,168,130,0.2)",
                            color: "#b7791f",
                          }}
                        >
                          Từ chối
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openReply(r)}
                        className="text-xs px-2 py-1"
                        style={{
                          border: "1px solid var(--color-champagne)",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {r.adminReply ? "Sửa TL" : "Trả lời"}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(r.id)}
                        className="text-xs px-2 py-1"
                        style={{ color: "#c0392b" }}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <p className="py-10 text-center opacity-50">Không có đánh giá</p>
          )}
        </div>
      )}

      {/* Modal trả lời — nằm trong cùng return, sau bảng */}
      {replyTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(26,26,26,0.7)",
            zIndex: 200,
          }}
          className="flex items-center justify-center p-4"
          onClick={() => !replying && setReplyTarget(null)}
        >
          <div
            style={{
              background: "var(--color-cream)",
              maxWidth: "480px",
              width: "100%",
            }}
            className="p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{ fontFamily: "var(--font-display)" }}
              className="text-xl mb-2"
            >
              Trả lời đánh giá
            </h3>
            <p className="text-xs opacity-60 mb-1">
              {replyTarget.userName} · {replyTarget.productName} ·{" "}
              {replyTarget.rating}★
            </p>
            <p className="text-sm mb-4 opacity-80 line-clamp-3">
              “{replyTarget.comment}”
            </p>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={4}
              placeholder="Nhập phản hồi từ cửa hàng..."
              className="w-full px-3 py-2 text-sm outline-none mb-4"
              style={{
                border: "1px solid var(--color-champagne)",
                fontFamily: "var(--font-body)",
              }}
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setReplyTarget(null)}
                disabled={replying}
                style={{ border: "1px solid var(--color-champagne)" }}
                className="flex-1 py-3 text-xs tracking-widest uppercase"
              >
                Huỷ
              </button>
              <button
                type="button"
                onClick={submitReply}
                disabled={replying}
                style={{
                  background: "var(--color-charcoal)",
                  color: "var(--color-champagne)",
                }}
                className="flex-[2] py-3 text-xs tracking-widest uppercase disabled:opacity-50"
              >
                {replying ? "Đang gửi..." : "Gửi trả lời"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}