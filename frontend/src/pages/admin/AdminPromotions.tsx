import { useState, useEffect } from "react";
import {
  fetchCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  type CouponView,
} from "../../services/couponService";

type PromotionType = "percent" | "fixed";

const fmt = (value: number) => value.toLocaleString("vi-VN") + "₫";
const formatDate = (date: string) => {
  if (!date) return "—";
  return new Date(`${date.slice(0, 10)}T00:00:00`).toLocaleDateString("vi-VN");
};

interface FormState {
  id?: string;
  code: string;
  description: string;
  type: PromotionType;
  value: number | "";
  minOrder: number | "";
  usageLimit: number | "";
  expiry: string;
  active: boolean;
}

const emptyForm = (): FormState => ({
  code: "",
  description: "",
  type: "percent",
  value: 10,
  minOrder: 0,
  usageLimit: 100,
  expiry: "",
  active: true,
});

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState<CouponView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editing, setEditing] = useState<FormState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchCoupons();
      setPromotions(data);
    } catch (err: any) {
      setError(err.message || "Không tải được mã giảm giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = promotions.filter((p) => {
    const matchesSearch =
      !search ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && p.active) ||
      (statusFilter === "inactive" && !p.active);
    return matchesSearch && matchesStatus;
  });

  const totalUsed = promotions.reduce((sum, p) => sum + p.used, 0);
  const activeCount = promotions.filter((p) => p.active).length;

  const openNew = () => {
    setEditing(emptyForm());
    setErrors({});
  };

  const openEdit = (p: CouponView) => {
    setEditing({
      id: p.id,
      code: p.code,
      description: p.description,
      type: p.type,
      value: p.value,
      minOrder: p.minOrder,
      usageLimit: p.usageLimit,
      expiry: p.expiry,
      active: p.active,
    });
    setErrors({});
  };

  const validate = () => {
    const next: Record<string, string> = {};
    const code = editing?.code?.trim().toUpperCase();
    if (!code) next.code = "Vui lòng nhập mã giảm giá";
    if (!editing?.description?.trim()) {
      next.description = "Vui lòng nhập mô tả";
    }
    if (!editing?.value || Number(editing.value) <= 0) {
      next.value = "Giá trị giảm phải lớn hơn 0";
    }
    if (editing?.type === "percent" && Number(editing.value) > 100) {
      next.value = "Phần trăm không được vượt 100%";
    }
    if (!editing?.expiry) next.expiry = "Vui lòng chọn ngày hết hạn";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!editing || !validate()) return;
    setSaving(true);
    try {
      const payload = {
        code: editing.code.trim().toUpperCase(),
        description: editing.description.trim(),
        type: editing.type,
        value: Number(editing.value),
        minOrder: Number(editing.minOrder) || 0,
        usageLimit: Number(editing.usageLimit) || 100,
        expiry: editing.expiry,
        isActive: editing.active,
      };
      if (editing.id) {
        await updateCoupon(editing.id, payload);
      } else {
        await createCoupon(payload);
      }
      setEditing(null);
      await load();
    } catch (err: any) {
      alert(err.message || "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (p: CouponView) => {
    try {
      await updateCoupon(p.id, { isActive: !p.active });
      await load();
    } catch (err: any) {
      alert(err.message || "Không đổi được trạng thái");
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deleteCoupon(id);
      setDeleteTarget(null);
      await load();
    } catch (err: any) {
      alert(err.message || "Xoá thất bại");
    } finally {
      setDeleting(false);
    }
  };

  const inputStyle = {
    fontFamily: "var(--font-body)",
    border: "1px solid var(--color-champagne)",
    background: "white",
    color: "var(--color-charcoal)",
  };
  const inputClass =
    "w-full px-3 py-2.5 text-sm outline-none focus:border-[var(--color-charcoal)] transition-colors";

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <p
            style={{
              color: "var(--color-warm-gray)",
              fontFamily: "var(--font-body)",
            }}
            className="text-xs tracking-widest uppercase mb-1"
          >
            Tiếp Thị
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-charcoal)",
            }}
            className="text-3xl font-normal"
          >
            Mã Giảm Giá
          </h1>
        </div>
        <button
          type="button"
          onClick={openNew}
          style={{
            background: "var(--color-charcoal)",
            color: "var(--color-champagne)",
            fontFamily: "var(--font-body)",
          }}
          className="px-5 py-2.5 text-xs tracking-widest uppercase hover:opacity-80"
        >
          + Tạo Mã Mới
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Tổng Mã", value: promotions.length },
          { label: "Đang Hoạt Động", value: activeCount },
          {
            label: "Lượt Sử Dụng",
            value: totalUsed.toLocaleString("vi-VN"),
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "white",
              border: "1px solid var(--color-champagne)",
            }}
            className="p-5"
          >
            <p
              style={{
                color: "var(--color-warm-gray)",
                fontFamily: "var(--font-body)",
              }}
              className="text-xs tracking-widest uppercase mb-2"
            >
              {stat.label}
            </p>
            <p
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-charcoal)",
              }}
              className="text-3xl font-normal"
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "white",
          border: "1px solid var(--color-champagne)",
        }}
        className="p-4 mb-5 flex flex-col sm:flex-row gap-3"
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo mã hoặc mô tả..."
          style={inputStyle}
          className={inputClass + " flex-1"}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ ...inputStyle, minWidth: "160px" }}
          className={inputClass}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đã tạm dừng</option>
        </select>
      </div>

      {loading && (
        <p className="py-12 text-center opacity-60">Đang tải...</p>
      )}
      {error && !loading && (
        <p className="py-12 text-center" style={{ color: "#c0392b" }}>
          {error}
        </p>
      )}

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
                {[
                  "Mã Ưu Đãi",
                  "Giá Trị",
                  "Điều Kiện",
                  "Sử Dụng",
                  "Hết Hạn",
                  "Trạng Thái",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      color: "var(--color-warm-gray)",
                      fontFamily: "var(--font-body)",
                    }}
                    className="px-4 py-3 text-xs tracking-widest uppercase text-left font-normal"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const progress =
                  p.usageLimit > 0
                    ? Math.min(100, Math.round((p.used / p.usageLimit) * 100))
                    : 0;
                return (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: "1px solid var(--color-champagne)",
                    }}
                    className="hover:bg-[var(--color-mist)]"
                  >
                    <td className="px-4 py-4">
                      <p
                        style={{
                          color: "var(--color-charcoal)",
                          fontFamily: "var(--font-body)",
                        }}
                        className="text-sm font-medium tracking-widest"
                      >
                        {p.code}
                      </p>
                      <p
                        style={{
                          color: "var(--color-warm-gray)",
                          fontFamily: "var(--font-body)",
                        }}
                        className="text-xs font-light mt-0.5"
                      >
                        {p.description || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p
                        style={{
                          color: "var(--color-gold)",
                          fontFamily: "var(--font-display)",
                        }}
                        className="text-lg"
                      >
                        {p.type === "percent" ? `${p.value}%` : fmt(p.value)}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {p.minOrder ? `Từ ${fmt(p.minOrder)}` : "Không tối thiểu"}
                    </td>
                    <td className="px-4 py-4">
                      <div className="min-w-28">
                        <div className="flex justify-between mb-1 text-xs">
                          <span>{p.used}</span>
                          <span className="opacity-60">/ {p.usageLimit}</span>
                        </div>
                        <div
                          style={{ background: "var(--color-mist)" }}
                          className="h-1.5"
                        >
                          <div
                            style={{
                              width: `${progress}%`,
                              background: "var(--color-gold)",
                            }}
                            className="h-full"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {formatDate(p.expiry)}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => toggleActive(p)}
                        style={{
                          background: p.active
                            ? "rgba(90,138,106,0.12)"
                            : "rgba(192,57,43,0.08)",
                          color: p.active ? "#5a8a6a" : "#c0392b",
                          fontFamily: "var(--font-body)",
                        }}
                        className="text-xs px-2 py-1 uppercase"
                      >
                        {p.active ? "Hoạt Động" : "Tạm Dừng"}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          style={{
                            border: "1px solid var(--color-champagne)",
                            fontFamily: "var(--font-body)",
                          }}
                          className="text-xs px-3 py-1"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(p.id)}
                          style={{
                            color: "#c0392b",
                            border: "1px solid rgba(192,57,43,0.3)",
                            fontFamily: "var(--font-body)",
                          }}
                          className="text-xs px-3 py-1"
                        >
                          Xoá
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="py-10 text-center opacity-60">
              Không tìm thấy mã giảm giá
            </p>
          )}
        </div>
      )}

      {/* Modal thêm / sửa */}
      {editing && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(26,26,26,0.75)",
            zIndex: 200,
          }}
          className="flex items-center justify-center p-4"
          onClick={() => !saving && setEditing(null)}
        >
          <div
            style={{
              background: "var(--color-cream)",
              maxWidth: "520px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            className="p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{ fontFamily: "var(--font-display)" }}
              className="text-2xl mb-6"
            >
              {editing.id ? "Sửa mã giảm giá" : "Tạo mã mới"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs tracking-widest uppercase mb-2">
                  Mã *
                </label>
                <input
                  value={editing.code}
                  onChange={(e) =>
                    setEditing((f) =>
                      f ? { ...f, code: e.target.value.toUpperCase() } : f
                    )
                  }
                  style={inputStyle}
                  className={inputClass}
                  placeholder="LUMIERE15"
                />
                {errors.code && (
                  <p className="text-xs mt-1" style={{ color: "#c0392b" }}>
                    {errors.code}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase mb-2">
                  Mô tả *
                </label>
                <input
                  value={editing.description}
                  onChange={(e) =>
                    setEditing((f) =>
                      f ? { ...f, description: e.target.value } : f
                    )
                  }
                  style={inputStyle}
                  className={inputClass}
                />
                {errors.description && (
                  <p className="text-xs mt-1" style={{ color: "#c0392b" }}>
                    {errors.description}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase mb-2">
                    Loại
                  </label>
                  <select
                    value={editing.type}
                    onChange={(e) =>
                      setEditing((f) =>
                        f
                          ? {
                              ...f,
                              type: e.target.value as PromotionType,
                            }
                          : f
                      )
                    }
                    style={inputStyle}
                    className={inputClass}
                  >
                    <option value="percent">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase mb-2">
                    Giá trị *
                  </label>
                  <input
                    type="number"
                    value={editing.value}
                    onChange={(e) =>
                      setEditing((f) =>
                        f
                          ? {
                              ...f,
                              value:
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value),
                            }
                          : f
                      )
                    }
                    style={inputStyle}
                    className={inputClass}
                  />
                  {errors.value && (
                    <p className="text-xs mt-1" style={{ color: "#c0392b" }}>
                      {errors.value}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase mb-2">
                    Đơn tối thiểu
                  </label>
                  <input
                    type="number"
                    value={editing.minOrder}
                    onChange={(e) =>
                      setEditing((f) =>
                        f
                          ? {
                              ...f,
                              minOrder:
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value),
                            }
                          : f
                      )
                    }
                    style={inputStyle}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase mb-2">
                    Giới hạn lượt
                  </label>
                  <input
                    type="number"
                    value={editing.usageLimit}
                    onChange={(e) =>
                      setEditing((f) =>
                        f
                          ? {
                              ...f,
                              usageLimit:
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value),
                            }
                          : f
                      )
                    }
                    style={inputStyle}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase mb-2">
                  Hết hạn *
                </label>
                <input
                  type="date"
                  value={editing.expiry}
                  onChange={(e) =>
                    setEditing((f) =>
                      f ? { ...f, expiry: e.target.value } : f
                    )
                  }
                  style={inputStyle}
                  className={inputClass}
                />
                {errors.expiry && (
                  <p className="text-xs mt-1" style={{ color: "#c0392b" }}>
                    {errors.expiry}
                  </p>
                )}
              </div>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.active}
                  onChange={(e) =>
                    setEditing((f) =>
                      f ? { ...f, active: e.target.checked } : f
                    )
                  }
                />
                Đang hoạt động
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setEditing(null)}
                disabled={saving}
                style={{ border: "1px solid var(--color-champagne)" }}
                className="flex-1 py-3 text-xs tracking-widest uppercase"
              >
                Huỷ
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{
                  background: "var(--color-charcoal)",
                  color: "var(--color-champagne)",
                }}
                className="flex-[2] py-3 text-xs tracking-widest uppercase disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : editing.id ? "Lưu" : "Tạo mã"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Xác nhận xoá */}
      {deleteTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(26,26,26,0.7)",
            zIndex: 200,
          }}
          className="flex items-center justify-center p-4"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            style={{
              background: "var(--color-cream)",
              maxWidth: "380px",
              width: "100%",
            }}
            className="p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{ fontFamily: "var(--font-display)" }}
              className="text-xl mb-3"
            >
              Vô hiệu mã này?
            </h3>
            <p className="text-sm opacity-70 mb-6">
              Mã sẽ chuyển sang trạng thái tạm dừng (soft delete).
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                style={{ border: "1px solid var(--color-champagne)" }}
                className="flex-1 py-3 text-xs tracking-widest uppercase"
              >
                Giữ lại
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteTarget)}
                disabled={deleting}
                style={{ background: "#c0392b", color: "white" }}
                className="flex-1 py-3 text-xs tracking-widest uppercase disabled:opacity-50"
              >
                {deleting ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}