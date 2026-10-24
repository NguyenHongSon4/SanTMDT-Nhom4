import { useState, useEffect } from "react";
import {
  fetchCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
  type CategoryView,
} from "../../services/categoryService";

const CATEGORY_ICONS = ["🌿", "💧", "🌸", "✨", "🧴", "☀️", "🌙", "💄", "🧖", "🫧"];

function iconFor(id: string, index: number) {
  let n = 0;
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i);
  return CATEGORY_ICONS[(n + index) % CATEGORY_ICONS.length];
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<CategoryView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("🌿");
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchCategoriesAdmin();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || "Không tải được danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = categories.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setSelectedIcon("🌿");
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (cat: CategoryView) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description);
    setSelectedIcon(iconFor(cat.id, 0));
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const errs: { name?: string; description?: string } = {};
    if (!name.trim()) errs.name = "Vui lòng nhập tên danh mục";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateCategory(editingId, {
          name: name.trim(),
          description: description.trim(),
        });
      } else {
        await createCategory({
          name: name.trim(),
          description: description.trim(),
        });
      }
      setShowModal(false);
      await load();
    } catch (err: any) {
      alert(err.message || "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deleteCategory(id);
      setDeleteTarget(null);
      await load();
    } catch (err: any) {
      alert(err.message || "Xoá / ẩn danh mục thất bại");
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (cat: CategoryView) => {
    setTogglingId(cat.id);
    try {
      await updateCategory(cat.id, { isActive: !cat.active });
      await load();
    } catch (err: any) {
      alert(err.message || "Không đổi được trạng thái");
    } finally {
      setTogglingId(null);
    }
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
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
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
          className="px-5 py-2 text-xs tracking-widest uppercase hover:opacity-80"
        >
          + Thêm Danh Mục
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Tổng Danh Mục", value: categories.length },
          {
            label: "Đang Hoạt Động",
            value: categories.filter((c) => c.active).length,
          },
          {
            label: "Đang Ẩn",
            value: categories.filter((c) => !c.active).length,
          },
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
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm danh mục..."
          style={inputStyle}
          className="w-full px-4 py-2 text-sm outline-none"
        />
      </div>

      {loading && (
        <p className="text-center py-16 opacity-60">Đang tải danh mục...</p>
      )}
      {error && !loading && (
        <p className="text-center py-16" style={{ color: "#c0392b" }}>
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            {filtered.map((cat, index) => (
              <div
                key={cat.id}
                style={{
                  background: "white",
                  border: cat.active
                    ? "1px solid var(--color-champagne)"
                    : "1px dashed var(--color-champagne)",
                  opacity: cat.active ? 1 : 0.65,
                }}
                className="p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{iconFor(cat.id, index)}</span>
                    <div>
                      <p
                        style={{
                          fontFamily: "var(--font-display)",
                          color: "var(--color-charcoal)",
                        }}
                        className="text-base"
                      >
                        {cat.name}
                      </p>
                      {cat.slug && (
                        <p
                          style={{
                            color: "var(--color-warm-gray)",
                            fontFamily: "var(--font-body)",
                          }}
                          className="text-xs font-mono"
                        >
                          /{cat.slug}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleActive(cat)}
                    disabled={togglingId === cat.id}
                    style={{
                      background: cat.active
                        ? "rgba(90,138,106,0.12)"
                        : "rgba(192,57,43,0.08)",
                      color: cat.active ? "#5a8a6a" : "#c0392b",
                      border: `1px solid ${
                        cat.active
                          ? "rgba(90,138,106,0.3)"
                          : "rgba(192,57,43,0.3)"
                      }`,
                      fontFamily: "var(--font-body)",
                    }}
                    className="text-xs px-2 py-0.5 tracking-widest uppercase"
                  >
                    {togglingId === cat.id
                      ? "..."
                      : cat.active
                      ? "Hiện"
                      : "Ẩn"}
                  </button>
                </div>

                <p
                  style={{
                    color: "var(--color-warm-gray)",
                    fontFamily: "var(--font-body)",
                  }}
                  className="text-xs font-light leading-relaxed mb-4"
                >
                  {cat.description || "—"}
                </p>

                <div className="flex items-center justify-between">
                  <span
                    style={{
                      color: "var(--color-warm-gray)",
                      fontFamily: "var(--font-body)",
                    }}
                    className="text-xs"
                  >
                    {cat.createdAt || "—"}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(cat)}
                      style={{
                        border: "1px solid var(--color-champagne)",
                        fontFamily: "var(--font-body)",
                      }}
                      className="text-xs px-3 py-1"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => setDeleteTarget(cat.id)}
                      style={{
                        color: "#c0392b",
                        border: "1px solid rgba(192,57,43,0.4)",
                        fontFamily: "var(--font-body)",
                      }}
                      className="text-xs px-3 py-1"
                    >
                      Xoá
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center py-12 opacity-60 italic">
              Không tìm thấy danh mục nào
            </p>
          )}
        </>
      )}

      {/* Modal thêm / sửa */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(26,26,26,0.75)",
            zIndex: 200,
          }}
          className="flex items-center justify-center p-4"
          onClick={() => !saving && setShowModal(false)}
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
              {editingId ? "Chỉnh Sửa Danh Mục" : "Thêm Danh Mục Mới"}
            </h3>

            <div className="space-y-5">
              <div>
                <label
                  style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }}
                  className="block text-xs tracking-widest uppercase mb-3"
                >
                  Biểu Tượng (chỉ giao diện)
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
                      className="flex items-center justify-center text-lg"
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }}
                  className="block text-xs tracking-widest uppercase mb-2"
                >
                  Tên Danh Mục *
                </label>
                <input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((p) => ({ ...p, name: "" }));
                  }}
                  placeholder="Ví dụ: Dưỡng Da, Nước Hoa..."
                  style={inputStyle}
                  className={inputCls}
                />
                {errors.name && (
                  <p style={{ color: "#c0392b" }} className="text-xs mt-1">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }}
                  className="block text-xs tracking-widest uppercase mb-2"
                >
                  Mô tả
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Mô tả ngắn về danh mục..."
                  style={inputStyle}
                  className={inputCls + " resize-none"}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                style={{ border: "1px solid var(--color-champagne)" }}
                className="flex-1 py-3 text-xs tracking-widest uppercase"
              >
                Huỷ
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  background: "var(--color-charcoal)",
                  color: "var(--color-champagne)",
                }}
                className="flex-[2] py-3 text-xs tracking-widest uppercase disabled:opacity-50"
              >
                {saving
                  ? "Đang lưu..."
                  : editingId
                  ? "Lưu thay đổi"
                  : "Thêm danh mục"}
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
              Xoá / ẩn danh mục?
            </h3>
            <p className="text-sm opacity-70 mb-6">
              Backend có thể vô hiệu hóa (soft delete) thay vì xóa hẳn. Kiểm tra
              lại nếu danh mục đang gắn sản phẩm.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                style={{ border: "1px solid var(--color-champagne)" }}
                className="flex-1 py-3 text-xs tracking-widest uppercase"
              >
                Giữ lại
              </button>
              <button
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