import { useState } from "react";

type PromotionType = "percent" | "fixed";

interface Promotion {
  id: number;
  code: string;
  description: string;
  type: PromotionType;
  value: number;
  minOrder: number;
  usageLimit: number;
  used: number;
  expiry: string;
  active: boolean;
}

const initialPromotions: Promotion[] = [
  { id: 1, code: "LUMIERE15", description: "Giảm 15% toàn bộ đơn hàng", type: "percent", value: 15, minOrder: 0, usageLimit: 500, used: 186, expiry: "2025-12-31", active: true },
  { id: 2, code: "BEAUTY10", description: "Ưu đãi cho đơn hàng từ 1 triệu", type: "percent", value: 10, minOrder: 1000000, usageLimit: 300, used: 124, expiry: "2025-12-31", active: true },
  { id: 3, code: "VIP20", description: "Đặc quyền dành cho khách hàng VIP", type: "percent", value: 20, minOrder: 3000000, usageLimit: 100, used: 68, expiry: "2025-12-31", active: true },
  { id: 4, code: "SAVE50K", description: "Giảm trực tiếp 50.000₫", type: "fixed", value: 50000, minOrder: 500000, usageLimit: 500, used: 243, expiry: "2025-12-31", active: true },
  { id: 5, code: "WELCOME", description: "Quà chào mừng khách hàng mới", type: "fixed", value: 100000, minOrder: 0, usageLimit: 1000, used: 357, expiry: "2025-12-31", active: true },
  { id: 6, code: "FREESHIP", description: "Hỗ trợ phí vận chuyển toàn quốc", type: "fixed", value: 30000, minOrder: 0, usageLimit: 800, used: 612, expiry: "2025-12-31", active: true },
];

const fmt = (value: number) => value.toLocaleString("vi-VN") + "₫";
const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("vi-VN");

const emptyPromotion: Omit<Promotion, "id" | "used"> = {
  code: "",
  description: "",
  type: "percent",
  value: 10,
  minOrder: 0,
  usageLimit: 100,
  expiry: "2025-12-31",
  active: true,
};

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState(initialPromotions);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editing, setEditing] = useState<Partial<Promotion> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = promotions.filter((promotion) => {
    const matchesSearch =
      !search ||
      promotion.code.toLowerCase().includes(search.toLowerCase()) ||
      promotion.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && promotion.active) ||
      (statusFilter === "inactive" && !promotion.active);
    return matchesSearch && matchesStatus;
  });

  const totalUsed = promotions.reduce((sum, promotion) => sum + promotion.used, 0);
  const activeCount = promotions.filter((promotion) => promotion.active).length;

  const openNew = () => {
    setEditing({ ...emptyPromotion });
    setErrors({});
  };

  const openEdit = (promotion: Promotion) => {
    setEditing({ ...promotion });
    setErrors({});
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    const normalizedCode = editing?.code?.trim().toUpperCase();
    if (!normalizedCode) nextErrors.code = "Vui lòng nhập mã giảm giá";
    if (
      normalizedCode &&
      promotions.some(
        (promotion) =>
          promotion.code === normalizedCode && promotion.id !== editing?.id,
      )
    ) {
      nextErrors.code = "Mã giảm giá này đã tồn tại";
    }
    if (!editing?.description?.trim()) {
      nextErrors.description = "Vui lòng nhập mô tả chương trình";
    }
    if (!editing?.value || editing.value <= 0) {
      nextErrors.value = "Giá trị giảm phải lớn hơn 0";
    }
    if (editing?.type === "percent" && (editing.value ?? 0) > 100) {
      nextErrors.value = "Mức giảm phần trăm không được vượt quá 100%";
    }
    if (!editing?.expiry) nextErrors.expiry = "Vui lòng chọn ngày hết hạn";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = () => {
    if (!editing || !validate()) return;

    if (editing.id) {
      setPromotions((current) =>
        current.map((promotion) =>
          promotion.id === editing.id
            ? {
                ...promotion,
                ...editing,
                code: editing.code!.trim().toUpperCase(),
              } as Promotion
            : promotion,
        ),
      );
    } else {
      const newPromotion: Promotion = {
        ...emptyPromotion,
        ...editing,
        id: Math.max(...promotions.map((promotion) => promotion.id), 0) + 1,
        code: editing.code!.trim().toUpperCase(),
        description: editing.description!.trim(),
        used: 0,
      };
      setPromotions((current) => [newPromotion, ...current]);
    }
    setEditing(null);
  };

  const toggleActive = (id: number) => {
    setPromotions((current) =>
      current.map((promotion) =>
        promotion.id === id
          ? { ...promotion, active: !promotion.active }
          : promotion,
      ),
    );
  };

  const handleDelete = (id: number) => {
    setPromotions((current) =>
      current.filter((promotion) => promotion.id !== id),
    );
    setDeleteTarget(null);
  };

  const inputStyle = {
    fontFamily: "var(--font-body)",
    border: "1px solid var(--color-champagne)",
    background: "white",
    color: "var(--color-charcoal)",
  };
  const inputClass =
    "w-full px-3 py-2.5 text-sm outline-none focus:border-[var(--color-charcoal)] transition-colors placeholder:opacity-40";

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
          <p
            style={{
              color: "var(--color-warm-gray)",
              fontFamily: "var(--font-body)",
            }}
            className="text-sm font-light mt-2"
          >
            Tạo và theo dõi các ưu đãi dành cho khách hàng Lumière.
          </p>
        </div>
        <button
          onClick={openNew}
          style={{
            background: "var(--color-charcoal)",
            color: "var(--color-champagne)",
            fontFamily: "var(--font-body)",
          }}
          className="px-5 py-2.5 text-xs tracking-widest uppercase hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
        >
          <span className="text-base leading-none">+</span>
          Tạo Mã Mới
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Tổng Mã Giảm Giá", value: promotions.length, note: "Tất cả chương trình" },
          { label: "Đang Hoạt Động", value: activeCount, note: `${promotions.length - activeCount} mã đã tạm dừng` },
          { label: "Lượt Sử Dụng", value: totalUsed.toLocaleString("vi-VN"), note: "Tổng lượt đã áp dụng" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "white",
              border: "1px solid var(--color-champagne)",
            }}
            className="p-5"
          >
            <div className="flex items-start justify-between">
              <div>
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
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-gold)"
                strokeWidth="1.25"
              >
                <path d="M20.59 13.41 11 3.83V3H4v7h.83l9.58 9.59a2 2 0 0 0 2.82 0l3.36-3.36a2 2 0 0 0 0-2.82Z" />
                <circle cx="7.5" cy="6.5" r="1" />
              </svg>
            </div>
            <p
              style={{
                color: "var(--color-warm-gray)",
                fontFamily: "var(--font-body)",
              }}
              className="text-xs font-light mt-2"
            >
              {stat.note}
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
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-warm-gray)"
            strokeWidth="1.5"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo mã hoặc tên chương trình..."
            style={inputStyle}
            className={`${inputClass} pl-9`}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          style={{ ...inputStyle, minWidth: "180px" }}
          className={`${inputClass} cursor-pointer`}
        >
          <option value="all">Tất Cả Trạng Thái</option>
          <option value="active">Đang Hoạt Động</option>
          <option value="inactive">Đã Tạm Dừng</option>
        </select>
      </div>

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
              {["Mã Ưu Đãi", "Giá Trị", "Điều Kiện", "Sử Dụng", "Hết Hạn", "Trạng Thái", ""].map(
                (heading) => (
                  <th
                    key={heading}
                    style={{
                      color: "var(--color-warm-gray)",
                      fontFamily: "var(--font-body)",
                    }}
                    className="px-4 py-3 text-xs tracking-widest uppercase text-left font-normal whitespace-nowrap"
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((promotion) => {
              const progress = Math.min(
                100,
                Math.round((promotion.used / promotion.usageLimit) * 100),
              );
              return (
                <tr
                  key={promotion.id}
                  style={{ borderBottom: "1px solid var(--color-champagne)" }}
                  className="hover:bg-[var(--color-mist)] transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3 min-w-48">
                      <div
                        style={{
                          background: "var(--color-charcoal)",
                          color: "var(--color-gold)",
                        }}
                        className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M20.59 13.41 11 3.83V3H4v7h.83l9.58 9.59a2 2 0 0 0 2.82 0l3.36-3.36a2 2 0 0 0 0-2.82Z" />
                          <circle cx="7.5" cy="6.5" r="1" />
                        </svg>
                      </div>
                      <div>
                        <p
                          style={{
                            color: "var(--color-charcoal)",
                            fontFamily: "var(--font-body)",
                          }}
                          className="text-sm font-medium tracking-widest"
                        >
                          {promotion.code}
                        </p>
                        <p
                          style={{
                            color: "var(--color-warm-gray)",
                            fontFamily: "var(--font-body)",
                          }}
                          className="text-xs font-light mt-0.5"
                        >
                          {promotion.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <p
                      style={{
                        color: "var(--color-gold)",
                        fontFamily: "var(--font-display)",
                      }}
                      className="text-lg"
                    >
                      {promotion.type === "percent"
                        ? `${promotion.value}%`
                        : fmt(promotion.value)}
                    </p>
                    <p
                      style={{
                        color: "var(--color-warm-gray)",
                        fontFamily: "var(--font-body)",
                      }}
                      className="text-xs"
                    >
                      {promotion.type === "percent"
                        ? "Theo phần trăm"
                        : "Số tiền cố định"}
                    </p>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <p
                      style={{
                        color: "var(--color-charcoal)",
                        fontFamily: "var(--font-body)",
                      }}
                      className="text-sm"
                    >
                      {promotion.minOrder
                        ? `Từ ${fmt(promotion.minOrder)}`
                        : "Không tối thiểu"}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="min-w-28">
                      <div className="flex justify-between mb-1">
                        <span
                          style={{
                            color: "var(--color-charcoal)",
                            fontFamily: "var(--font-body)",
                          }}
                          className="text-xs"
                        >
                          {promotion.used.toLocaleString("vi-VN")}
                        </span>
                        <span
                          style={{
                            color: "var(--color-warm-gray)",
                            fontFamily: "var(--font-body)",
                          }}
                          className="text-xs"
                        >
                          / {promotion.usageLimit.toLocaleString("vi-VN")}
                        </span>
                      </div>
                      <div
                        style={{ background: "var(--color-mist)" }}
                        className="h-1.5 overflow-hidden"
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
                  <td className="px-4 py-4 whitespace-nowrap">
                    <p
                      style={{
                        color: "var(--color-charcoal)",
                        fontFamily: "var(--font-body)",
                      }}
                      className="text-sm"
                    >
                      {formatDate(promotion.expiry)}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => toggleActive(promotion.id)}
                      style={{
                        background: promotion.active
                          ? "rgba(90,138,106,0.12)"
                          : "rgba(192,57,43,0.08)",
                        color: promotion.active ? "#5a8a6a" : "#c0392b",
                        border: `1px solid ${promotion.active ? "rgba(90,138,106,0.3)" : "rgba(192,57,43,0.3)"}`,
                        fontFamily: "var(--font-body)",
                      }}
                      className="text-xs px-2.5 py-1 tracking-widest uppercase whitespace-nowrap hover:opacity-70 transition-opacity"
                    >
                      {promotion.active ? "Hoạt Động" : "Tạm Dừng"}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(promotion)}
                        style={{
                          color: "var(--color-warm-gray)",
                          border: "1px solid var(--color-champagne)",
                          fontFamily: "var(--font-body)",
                        }}
                        className="text-xs px-3 py-1 hover:text-[var(--color-charcoal)] hover:border-[var(--color-charcoal)] transition-colors"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => setDeleteTarget(promotion.id)}
                        style={{
                          color: "#c0392b",
                          border: "1px solid rgba(192,57,43,0.35)",
                          fontFamily: "var(--font-body)",
                        }}
                        className="text-xs px-3 py-1 hover:opacity-70 transition-opacity"
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
          <div className="py-12 text-center">
            <p
              style={{
                color: "var(--color-warm-gray)",
                fontFamily: "var(--font-display)",
              }}
              className="text-lg italic"
            >
              Không tìm thấy mã giảm giá phù hợp
            </p>
          </div>
        )}
      </div>
      <p
        style={{
          color: "var(--color-warm-gray)",
          fontFamily: "var(--font-body)",
        }}
        className="text-xs mt-3"
      >
        Hiển thị {filtered.length} / {promotions.length} mã giảm giá
      </p>

      {editing && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(26,26,26,0.75)",
            zIndex: 200,
          }}
          className="flex items-center justify-center p-4"
          onClick={() => setEditing(null)}
        >
          <div
            style={{
              background: "var(--color-cream)",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            className="p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <p
                  style={{
                    color: "var(--color-warm-gray)",
                    fontFamily: "var(--font-body)",
                  }}
                  className="text-xs tracking-widest uppercase mb-1"
                >
                  Chương Trình Ưu Đãi
                </p>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--color-charcoal)",
                  }}
                  className="text-2xl font-normal"
                >
                  {editing.id ? "Chỉnh Sửa Mã" : "Tạo Mã Giảm Giá"}
                </h3>
              </div>
              <button
                onClick={() => setEditing(null)}
                style={{ color: "var(--color-warm-gray)" }}
                className="hover:text-[var(--color-charcoal)] transition-colors"
                aria-label="Đóng"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  style={{
                    color: "var(--color-charcoal)",
                    fontFamily: "var(--font-body)",
                  }}
                  className="block text-xs tracking-widest uppercase mb-2"
                >
                  Mã Giảm Giá *
                </label>
                <input
                  value={editing.code ?? ""}
                  onChange={(event) => {
                    setEditing((current) => ({
                      ...current,
                      code: event.target.value.toUpperCase().replace(/\s/g, ""),
                    }));
                    setErrors((current) => ({ ...current, code: "" }));
                  }}
                  placeholder="VÍ DỤ: LUMIERE20"
                  style={{
                    ...inputStyle,
                    borderColor: errors.code
                      ? "#c0392b"
                      : "var(--color-champagne)",
                  }}
                  className={`${inputClass} tracking-widest uppercase`}
                />
                {errors.code && (
                  <p
                    style={{ color: "#c0392b", fontFamily: "var(--font-body)" }}
                    className="text-xs mt-1"
                  >
                    {errors.code}
                  </p>
                )}
              </div>

              <div>
                <label
                  style={{
                    color: "var(--color-charcoal)",
                    fontFamily: "var(--font-body)",
                  }}
                  className="block text-xs tracking-widest uppercase mb-2"
                >
                  Mô Tả Chương Trình *
                </label>
                <input
                  value={editing.description ?? ""}
                  onChange={(event) => {
                    setEditing((current) => ({
                      ...current,
                      description: event.target.value,
                    }));
                    setErrors((current) => ({
                      ...current,
                      description: "",
                    }));
                  }}
                  placeholder="Mô tả ngắn về ưu đãi..."
                  style={inputStyle}
                  className={inputClass}
                />
                {errors.description && (
                  <p
                    style={{ color: "#c0392b", fontFamily: "var(--font-body)" }}
                    className="text-xs mt-1"
                  >
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label
                  style={{
                    color: "var(--color-charcoal)",
                    fontFamily: "var(--font-body)",
                  }}
                  className="block text-xs tracking-widest uppercase mb-2"
                >
                  Loại Giảm Giá
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "percent", label: "Phần Trăm", note: "Giảm theo % đơn hàng" },
                    { value: "fixed", label: "Số Tiền", note: "Giảm số tiền cố định" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setEditing((current) => ({
                          ...current,
                          type: option.value as PromotionType,
                          value: option.value === "percent" ? 10 : 50000,
                        }))
                      }
                      style={{
                        textAlign: "left",
                        border:
                          editing.type === option.value
                            ? "1.5px solid var(--color-charcoal)"
                            : "1px solid var(--color-champagne)",
                        background:
                          editing.type === option.value
                            ? "var(--color-mist)"
                            : "white",
                        fontFamily: "var(--font-body)",
                      }}
                      className="p-3 transition-colors"
                    >
                      <p
                        style={{ color: "var(--color-charcoal)" }}
                        className="text-xs font-medium tracking-widest uppercase"
                      >
                        {option.label}
                      </p>
                      <p
                        style={{ color: "var(--color-warm-gray)" }}
                        className="text-xs font-light mt-1"
                      >
                        {option.note}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    style={{
                      color: "var(--color-charcoal)",
                      fontFamily: "var(--font-body)",
                    }}
                    className="block text-xs tracking-widest uppercase mb-2"
                  >
                    Giá Trị Giảm {editing.type === "percent" ? "(%)" : "(VNĐ)"} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={editing.type === "percent" ? 100 : undefined}
                    value={editing.value ?? ""}
                    onChange={(event) => {
                      setEditing((current) => ({
                        ...current,
                        value: Number(event.target.value),
                      }));
                      setErrors((current) => ({ ...current, value: "" }));
                    }}
                    style={inputStyle}
                    className={inputClass}
                  />
                  {errors.value && (
                    <p
                      style={{
                        color: "#c0392b",
                        fontFamily: "var(--font-body)",
                      }}
                      className="text-xs mt-1"
                    >
                      {errors.value}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    style={{
                      color: "var(--color-charcoal)",
                      fontFamily: "var(--font-body)",
                    }}
                    className="block text-xs tracking-widest uppercase mb-2"
                  >
                    Đơn Tối Thiểu (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editing.minOrder ?? ""}
                    onChange={(event) =>
                      setEditing((current) => ({
                        ...current,
                        minOrder: Number(event.target.value),
                      }))
                    }
                    style={inputStyle}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    style={{
                      color: "var(--color-charcoal)",
                      fontFamily: "var(--font-body)",
                    }}
                    className="block text-xs tracking-widest uppercase mb-2"
                  >
                    Giới Hạn Sử Dụng
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editing.usageLimit ?? ""}
                    onChange={(event) =>
                      setEditing((current) => ({
                        ...current,
                        usageLimit: Number(event.target.value),
                      }))
                    }
                    style={inputStyle}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label
                    style={{
                      color: "var(--color-charcoal)",
                      fontFamily: "var(--font-body)",
                    }}
                    className="block text-xs tracking-widest uppercase mb-2"
                  >
                    Ngày Hết Hạn *
                  </label>
                  <input
                    type="date"
                    value={editing.expiry ?? ""}
                    onChange={(event) => {
                      setEditing((current) => ({
                        ...current,
                        expiry: event.target.value,
                      }));
                      setErrors((current) => ({ ...current, expiry: "" }));
                    }}
                    style={inputStyle}
                    className={inputClass}
                  />
                  {errors.expiry && (
                    <p
                      style={{
                        color: "#c0392b",
                        fontFamily: "var(--font-body)",
                      }}
                      className="text-xs mt-1"
                    >
                      {errors.expiry}
                    </p>
                  )}
                </div>
              </div>

              <label
                style={{
                  border: "1px solid var(--color-champagne)",
                  background: "white",
                }}
                className="flex items-center justify-between gap-4 p-4 cursor-pointer"
              >
                <span>
                  <span
                    style={{
                      color: "var(--color-charcoal)",
                      fontFamily: "var(--font-body)",
                    }}
                    className="block text-xs font-medium tracking-widest uppercase"
                  >
                    Kích Hoạt Mã
                  </span>
                  <span
                    style={{
                      color: "var(--color-warm-gray)",
                      fontFamily: "var(--font-body)",
                    }}
                    className="block text-xs font-light mt-1"
                  >
                    Khách hàng có thể sử dụng mã ngay sau khi lưu.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={editing.active ?? true}
                  onChange={(event) =>
                    setEditing((current) => ({
                      ...current,
                      active: event.target.checked,
                    }))
                  }
                  className="sr-only"
                />
                <span
                  style={{
                    background:
                      editing.active ?? true
                        ? "var(--color-charcoal)"
                        : "var(--color-champagne)",
                  }}
                  className="w-10 h-5 rounded-full p-0.5 transition-colors flex-shrink-0"
                >
                  <span
                    style={{
                      transform:
                        editing.active ?? true
                          ? "translateX(20px)"
                          : "translateX(0)",
                    }}
                    className="block w-4 h-4 bg-white rounded-full transition-transform"
                  />
                </span>
              </label>
            </div>

            <div className="flex gap-3 mt-7">
              <button
                onClick={() => setEditing(null)}
                style={{
                  flex: 1,
                  border: "1px solid var(--color-champagne)",
                  color: "var(--color-warm-gray)",
                  fontFamily: "var(--font-body)",
                }}
                className="py-3 text-xs tracking-widest uppercase hover:border-[var(--color-charcoal)] transition-colors"
              >
                Huỷ
              </button>
              <button
                onClick={handleSave}
                style={{
                  flex: 2,
                  background: "var(--color-charcoal)",
                  color: "var(--color-champagne)",
                  fontFamily: "var(--font-body)",
                }}
                className="py-3 text-xs tracking-widest uppercase hover:opacity-80 transition-opacity"
              >
                {editing.id ? "Lưu Thay Đổi" : "Tạo Mã Giảm Giá"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(26,26,26,0.75)",
            zIndex: 200,
          }}
          className="flex items-center justify-center p-4"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            style={{
              background: "var(--color-cream)",
              maxWidth: "390px",
              width: "100%",
            }}
            className="p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <h3
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-charcoal)",
              }}
              className="text-xl font-normal mb-3"
            >
              Xoá Mã Giảm Giá?
            </h3>
            <p
              style={{
                color: "var(--color-warm-gray)",
                fontFamily: "var(--font-body)",
              }}
              className="text-sm font-light leading-relaxed mb-6"
            >
              Mã ưu đãi sẽ bị xoá vĩnh viễn và khách hàng không thể sử dụng mã
              này nữa.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                style={{
                  flex: 1,
                  border: "1px solid var(--color-champagne)",
                  color: "var(--color-warm-gray)",
                  fontFamily: "var(--font-body)",
                }}
                className="py-3 text-xs tracking-widest uppercase"
              >
                Giữ Lại
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                style={{
                  flex: 1,
                  background: "#c0392b",
                  color: "white",
                  fontFamily: "var(--font-body)",
                }}
                className="py-3 text-xs tracking-widest uppercase hover:opacity-80"
              >
                Xoá Mã
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
