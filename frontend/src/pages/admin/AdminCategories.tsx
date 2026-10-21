import { useState } from "react";
import { mockCategories as initialCategories, type Category } from "../../data/mockData";

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const CATEGORY_ICONS = ["🌿", "💧", "🌸", "✨", "🧴", "☀️", "🌙", "💄", "🧖", "🫧"];

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("🌿");
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  const filtered = categories.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setEditing({ name: "", slug: "", description: "", productCount: 0, active: true });
    setSelectedIcon("🌿");
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditing({ ...cat });
    setSelectedIcon("🌸");
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const errs: { name?: string; description?: string } = {};
    if (!editing?.name?.trim()) errs.name = "Vui lòng nhập tên danh mục";
    if (!editing?.description?.trim()) errs.description = "Vui lòng nhập mô tả";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const slug = slugify(editing!.name!);
    if (editing!.id) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editing!.id ? { ...c, ...editing, slug } as Category : c
        )
      );
    } else {
      const newCat: Category = {
        id: Math.max(...categories.map((c) => c.id)) + 1,
        name: editing!.name!,
        slug,
        description: editing!.description ?? "",
        productCount: 0,
        active: editing!.active ?? true,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setCategories((prev) => [...prev, newCat]);
    }
    setShowModal(false);
    setEditing(null);
  };

  const handleDelete = (id: number) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setDeleteTarget(null);
  };

  const toggleActive = (id: number) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  const inputStyle = {
    fontFamily: "var(--font-body)",
    border: "1px solid var(--color-champagne)",
    background: "white",
    color: "var(--color-charcoal)",
  };
  const inputCls =
    "w-full px-4 py-3 text-sm outline-none focus:border-[var(--color-charcoal)] transition-colors placeholder:opacity-40";

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p
            style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }}
            className="text-xs tracking-widest uppercase mb-1"
          >
            Quản Lý
          </p>
          <h1
            style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }}
            className="text-3xl font-normal"
          >
            Danh Mục Sản Phẩm
          </h1>
        </div>
        <button
          onClick={openNew}
          style={{
            background: "var(--color-charcoal)",
            color: "var(--color-champagne)",
            fontFamily: "var(--font-body)",
          }}
          className="px-5 py-2 text-xs tracking-widest uppercase hover:opacity-80 transition-opacity flex items-center gap-2"
        >
          <span className="text-base leading-none">+</span>
          Thêm Danh Mục
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Tổng Danh Mục", value: categories.length },
          { label: "Đang Hoạt Động", value: categories.filter((c) => c.active).length },
          { label: "Tổng Sản Phẩm", value: categories.reduce((s, c) => s + c.productCount, 0) },
        ].map((s) => (
          <div
            key={s.label}
            style={{ background: "white", border: "1px solid var(--color-champagne)" }}
            className="p-5"
          >
            <p
              style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }}
              className="text-xs tracking-widest uppercase mb-2"
            >
              {s.label}
            </p>
            <p
              style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }}
              className="text-3xl font-normal"
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div
        style={{ background: "white", border: "1px solid var(--color-champagne)" }}
        className="p-4 mb-5"
      >
        <div className="relative">
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm danh mục..."
            style={inputStyle}
            className="w-full pl-9 pr-4 py-2 text-sm outline-none focus:border-[var(--color-charcoal)] transition-colors placeholder:opacity-40"
          />
        </div>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {filtered.map((cat) => (
          <div
            key={cat.id}
            style={{
              background: "white",
              border: cat.active
                ? "1px solid var(--color-champagne)"
                : "1px dashed var(--color-champagne)",
              opacity: cat.active ? 1 : 0.65,
            }}
            className="p-5 transition-all hover:border-[var(--color-charcoal)]"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{CATEGORY_ICONS[(cat.id - 1) % CATEGORY_ICONS.length]}</span>
                <div>
                  <p
                    style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }}
                    className="font-normal text-base"
                  >
                    {cat.name}
                  </p>
                  <p
                    style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }}
                    className="text-xs font-mono"
                  >
                    /{cat.slug}
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleActive(cat.id)}
                style={{
                  background: cat.active
                    ? "rgba(90,138,106,0.12)"
                    : "rgba(192,57,43,0.08)",
                  color: cat.active ? "#5a8a6a" : "#c0392b",
                  border: `1px solid ${cat.active ? "rgba(90,138,106,0.3)" : "rgba(192,57,43,0.3)"}`,
                  fontFamily: "var(--font-body)",
                }}
                className="text-xs px-2 py-0.5 tracking-widest uppercase hover:opacity-70 transition-opacity flex-shrink-0"
                title="Nhấn để bật/tắt"
              >
                {cat.active ? "Hiện" : "Ẩn"}
              </button>
            </div>

            <p
              style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }}
              className="text-xs font-light leading-relaxed mb-4"
            >
              {cat.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-warm-gray)"
                    strokeWidth="1.5"
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  </svg>
                  <span
                    style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }}
                    className="text-xs"
                  >
                    {cat.productCount} sản phẩm
                  </span>
                </div>
                <span
                  style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }}
                  className="text-xs"
                >
                  {cat.createdAt}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(cat)}
                  style={{
                    color: "var(--color-warm-gray)",
                    fontFamily: "var(--font-body)",
                    border: "1px solid var(--color-champagne)",
                  }}
                  className="text-xs px-3 py-1 hover:text-[var(--color-charcoal)] hover:border-[var(--color-charcoal)] transition-all"
                >
                  Sửa
                </button>
                <button
                  onClick={() => setDeleteTarget(cat.id)}
                  disabled={cat.productCount > 0}
                  style={{
                    color: cat.productCount > 0 ? "var(--color-champagne)" : "#c0392b",
                    fontFamily: "var(--font-body)",
                    border: `1px solid ${cat.productCount > 0 ? "var(--color-champagne)" : "rgba(192,57,43,0.4)"}`,
                    cursor: cat.productCount > 0 ? "not-allowed" : "pointer",
                  }}
                  className="text-xs px-3 py-1 hover:opacity-70 transition-opacity disabled:hover:opacity-100"
                  title={cat.productCount > 0 ? "Không thể xoá danh mục có sản phẩm" : "Xoá danh mục"}
                >
                  Xoá
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div
          style={{ background: "white", border: "1px solid var(--color-champagne)" }}
          className="py-12 text-center"
        >
          <p
            style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-display)" }}
            className="text-xl font-normal italic"
          >
            Không tìm thấy danh mục nào
          </p>
        </div>
      )}

      {/* Table view */}
      <div style={{ background: "white", border: "1px solid var(--color-champagne)" }} className="mt-4 overflow-x-auto">
        <div style={{ borderBottom: "1px solid var(--color-champagne)" }} className="px-5 py-3">
          <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase">
            Tất Cả Danh Mục ({categories.length})
          </p>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-champagne)" }}>
              {["#", "Tên Danh Mục", "Slug", "Sản Phẩm", "Ngày Tạo", "Trạng Thái"].map((h) => (
                <th
                  key={h}
                  style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }}
                  className="px-4 py-3 text-xs tracking-widest uppercase text-left font-normal"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr
                key={cat.id}
                style={{ borderBottom: "1px solid var(--color-champagne)" }}
                className="hover:bg-[var(--color-mist)] transition-colors"
              >
                <td className="px-4 py-3">
                  <span
                    style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }}
                    className="text-xs"
                  >
                    {cat.id}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span>{CATEGORY_ICONS[(cat.id - 1) % CATEGORY_ICONS.length]}</span>
                    <p
                      style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }}
                      className="text-sm font-medium"
                    >
                      {cat.name}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p
                    style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }}
                    className="text-xs font-mono"
                  >
                    /{cat.slug}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span
                    style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }}
                    className="text-sm"
                  >
                    {cat.productCount}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }}
                    className="text-xs"
                  >
                    {cat.createdAt}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    style={{
                      background: cat.active
                        ? "rgba(90,138,106,0.12)"
                        : "rgba(192,57,43,0.08)",
                      color: cat.active ? "#5a8a6a" : "#c0392b",
                      border: `1px solid ${cat.active ? "rgba(90,138,106,0.3)" : "rgba(192,57,43,0.3)"}`,
                      fontFamily: "var(--font-body)",
                    }}
                    className="text-xs px-2 py-0.5 tracking-widest uppercase"
                  >
                    {cat.active ? "Hoạt Động" : "Ẩn"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && editing !== null && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(26,26,26,0.75)", zIndex: 200 }}
          className="flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
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
              style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }}
              className="text-2xl font-normal mb-6"
            >
              {editing.id ? "Chỉnh Sửa Danh Mục" : "Thêm Danh Mục Mới"}
            </h3>

            <div className="space-y-5">
              {/* Icon picker */}
              <div>
                <label
                  style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }}
                  className="block text-xs tracking-widest uppercase mb-3"
                >
                  Biểu Tượng
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setSelectedIcon(icon)}
                      style={{
                        width: "40px",
                        height: "40px",
                        border:
                          selectedIcon === icon
                            ? "2px solid var(--color-charcoal)"
                            : "1px solid var(--color-champagne)",
                        background:
                          selectedIcon === icon ? "var(--color-mist)" : "white",
                      }}
                      className="flex items-center justify-center text-lg transition-all hover:border-[var(--color-charcoal)]"
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label
                  style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }}
                  className="block text-xs tracking-widest uppercase mb-2"
                >
                  Tên Danh Mục *
                </label>
                <input
                  value={editing.name ?? ""}
                  onChange={(e) => {
                    setEditing((p) => ({ ...p, name: e.target.value }));
                    setErrors((p) => ({ ...p, name: "" }));
                  }}
                  placeholder="Ví dụ: Dưỡng Da, Nước Hoa..."
                  style={inputStyle}
                  className={inputCls}
                />
                {errors.name && (
                  <p
                    style={{ color: "#c0392b", fontFamily: "var(--font-body)" }}
                    className="text-xs mt-1"
                  >
                    {errors.name}
                  </p>
                )}
                {editing.name && (
                  <p
                    style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }}
                    className="text-xs mt-1 font-mono"
                  >
                    Slug: /{slugify(editing.name)}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }}
                  className="block text-xs tracking-widest uppercase mb-2"
                >
                  Mô Tả *
                </label>
                <textarea
                  value={editing.description ?? ""}
                  onChange={(e) => {
                    setEditing((p) => ({ ...p, description: e.target.value }));
                    setErrors((p) => ({ ...p, description: "" }));
                  }}
                  placeholder="Mô tả ngắn về danh mục sản phẩm..."
                  rows={3}
                  style={inputStyle}
                  className={inputCls + " resize-none"}
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

              {/* Active toggle */}
              <div>
                <label
                  style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }}
                  className="block text-xs tracking-widest uppercase mb-3"
                >
                  Trạng Thái
                </label>
                <div className="flex gap-3">
                  {[
                    [true, "Hiển Thị", "Danh mục hiện trên cửa hàng"],
                    [false, "Ẩn", "Không hiện với khách hàng"],
                  ].map(([val, label, desc]) => (
                    <button
                      key={String(val)}
                      type="button"
                      onClick={() => setEditing((p) => ({ ...p, active: val as boolean }))}
                      style={{
                        flex: 1,
                        textAlign: "left",
                        border:
                          editing.active === val
                            ? "1.5px solid var(--color-charcoal)"
                            : "1px solid var(--color-champagne)",
                        background: editing.active === val ? "var(--color-mist)" : "white",
                        fontFamily: "var(--font-body)",
                      }}
                      className="p-3 transition-all"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          style={{
                            width: "14px",
                            height: "14px",
                            borderRadius: "50%",
                            border:
                              editing.active === val
                                ? "4px solid var(--color-charcoal)"
                                : "1.5px solid var(--color-champagne)",
                            flexShrink: 0,
                          }}
                        />
                        <p
                          style={{ color: "var(--color-charcoal)" }}
                          className="text-xs font-medium uppercase tracking-widest"
                        >
                          {label as string}
                        </p>
                      </div>
                      <p
                        style={{ color: "var(--color-warm-gray)" }}
                        className="text-xs font-light pl-5"
                      >
                        {desc as string}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-7">
              <button
                onClick={() => setShowModal(false)}
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
                {editing.id ? "Lưu Thay Đổi" : "Tạo Danh Mục"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget !== null && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(26,26,26,0.75)", zIndex: 200 }}
          className="flex items-center justify-center p-4"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            style={{ background: "var(--color-cream)", maxWidth: "380px", width: "100%" }}
            className="p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }}
              className="text-xl font-normal mb-3"
            >
              Xoá Danh Mục?
            </h3>
            <p
              style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }}
              className="text-sm font-light mb-6"
            >
              Hành động này không thể hoàn tác. Danh mục sẽ bị xoá vĩnh viễn.
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
                Huỷ
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                style={{ flex: 1, background: "#c0392b", color: "white", fontFamily: "var(--font-body)" }}
                className="py-3 text-xs tracking-widest uppercase hover:opacity-80"
              >
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
