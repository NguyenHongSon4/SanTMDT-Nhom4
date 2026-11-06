import { useState, useEffect } from "react";
import {
  fetchBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  type BrandView,
} from "../../services/brandService";

interface FormState {
  id?: string;
  name: string;
  description: string;
  logo: string;
  active: boolean;
}

const emptyForm = (): FormState => ({
  name: "",
  description: "",
  logo: "",
  active: true,
});

export default function AdminBrands() {
  const [brands, setBrands] = useState<BrandView[]>([]);
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
      const data = await fetchBrands();
      setBrands(data);
    } catch (err: any) {
      setError(err.message || "Không tải được thương hiệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = brands.filter((b) => {
    const okSearch =
      !search ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase());
    const okStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && b.active) ||
      (statusFilter === "inactive" && !b.active);
    return okSearch && okStatus;
  });

  const activeCount = brands.filter((b) => b.active).length;

  const openNew = () => {
    setEditing(emptyForm());
    setErrors({});
  };

  const openEdit = (b: BrandView) => {
    setEditing({
      id: b.id,
      name: b.name,
      description: b.description,
      logo: b.logo,
      active: b.active,
    });
    setErrors({});
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!editing?.name.trim()) next.name = "Vui lòng nhập tên thương hiệu";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!editing || !validate()) return;
    setSaving(true);
    try {
      const payload = {
        name: editing.name.trim(),
        description: editing.description.trim(),
        logo: editing.logo.trim(),
        isActive: editing.active,
      };
      if (editing.id) {
        await updateBrand(editing.id, payload);
      } else {
        await createBrand(payload);
      }
      setEditing(null);
      await load();
    } catch (err: any) {
      alert(err.message || "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (b: BrandView) => {
    try {
      await updateBrand(b.id, { isActive: !b.active });
      await load();
    } catch (err: any) {
      alert(err.message || "Không đổi được trạng thái");
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deleteBrand(id);
      setDeleteTarget(null);
      await load();
    } catch (err: any) {
      alert(err.message || "Vô hiệu thất bại");
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
            Danh Mục Dữ Liệu
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-charcoal)",
            }}
            className="text-3xl font-normal"
          >
            Thương Hiệu
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
          + Thêm Thương Hiệu
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {[
          { label: "Tổng Thương Hiệu", value: brands.length },
          { label: "Đang Hoạt Động", value: activeCount },
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
          placeholder="Tìm theo tên hoặc mô tả..."
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
          <option value="inactive">Đã tắt</option>
        </select>
      </div>

      {loading && <p className="py-12 text-center opacity-60">Đang tải...</p>}
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
                {["Thương Hiệu", "Mô Tả", "Logo", "Trạng Thái", ""].map((h) => (
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
              {filtered.map((b) => (
                <tr
                  key={b.id}
                  style={{ borderBottom: "1px solid var(--color-champagne)" }}
                  className="hover:bg-[var(--color-mist)]"
                >
                  <td className="px-4 py-4">
                    <p
                      style={{
                        color: "var(--color-charcoal)",
                        fontFamily: "var(--font-body)",
                      }}
                      className="text-sm font-medium"
                    >
                      {b.name}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-sm opacity-70 max-w-xs">
                    <p className="line-clamp-2">{b.description || "—"}</p>
                  </td>
                  <td className="px-4 py-4">
                    {b.logo ? (
                      <img
                        src={b.logo}
                        alt={b.name}
                        className="w-10 h-10 object-contain"
                        style={{ border: "1px solid var(--color-champagne)" }}
                      />
                    ) : (
                      <span className="text-xs opacity-40">Không có</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => toggleActive(b)}
                      style={{
                        background: b.active
                          ? "rgba(90,138,106,0.12)"
                          : "rgba(192,57,43,0.08)",
                        color: b.active ? "#5a8a6a" : "#c0392b",
                        fontFamily: "var(--font-body)",
                      }}
                      className="text-xs px-2 py-1 uppercase"
                    >
                      {b.active ? "Hoạt động" : "Đã tắt"}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(b)}
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
                        onClick={() => setDeleteTarget(b.id)}
                        style={{
                          color: "#c0392b",
                          border: "1px solid rgba(192,57,43,0.3)",
                          fontFamily: "var(--font-body)",
                        }}
                        className="text-xs px-3 py-1"
                      >
                        Tắt
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="py-10 text-center opacity-60">
              Không tìm thấy thương hiệu
            </p>
          )}
        </div>
      )}

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
              maxWidth: "480px",
              width: "100%",
            }}
            className="p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{ fontFamily: "var(--font-display)" }}
              className="text-2xl mb-6"
            >
              {editing.id ? "Sửa thương hiệu" : "Thêm thương hiệu"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs tracking-widest uppercase mb-2">
                  Tên *
                </label>
                <input
                  value={editing.name}
                  onChange={(e) =>
                    setEditing((f) => (f ? { ...f, name: e.target.value } : f))
                  }
                  style={inputStyle}
                  className={inputClass}
                  placeholder="La Mer, L'Oréal..."
                />
                {errors.name && (
                  <p className="text-xs mt-1" style={{ color: "#c0392b" }}>
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase mb-2">
                  Mô tả
                </label>
                <textarea
                  value={editing.description}
                  onChange={(e) =>
                    setEditing((f) =>
                      f ? { ...f, description: e.target.value } : f
                    )
                  }
                  rows={3}
                  style={inputStyle}
                  className={inputClass + " resize-none"}
                />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase mb-2">
                  URL Logo
                </label>
                <input
                  value={editing.logo}
                  onChange={(e) =>
                    setEditing((f) => (f ? { ...f, logo: e.target.value } : f))
                  }
                  style={inputStyle}
                  className={inputClass}
                  placeholder="https://..."
                />
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
                {saving ? "Đang lưu..." : editing.id ? "Lưu" : "Tạo"}
              </button>
            </div>
          </div>
        </div>
      )}

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
              Vô hiệu thương hiệu?
            </h3>
            <p className="text-sm opacity-70 mb-6">
              Chỉ tắt được khi không còn sản phẩm đang bán gắn brand này.
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
                {deleting ? "..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}