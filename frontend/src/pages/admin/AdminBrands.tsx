import { useEffect, useMemo, useState } from "react";
import {
  createBrand,
  deleteBrand,
  fetchBrandsAdmin,
  updateBrand,
  type BrandView,
} from "../../services/brandService";

type BrandForm = { name: string; description: string; logo: string };

const EMPTY_FORM: BrandForm = { name: "", description: "", logo: "" };

export default function AdminBrands() {
  const [brands, setBrands] = useState<BrandView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BrandForm>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BrandView | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setBrands(await fetchBrandsAdmin());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được thương hiệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("vi");
    return brands.filter((brand) => {
      const matchesSearch =
        !keyword ||
        brand.name.toLocaleLowerCase("vi").includes(keyword) ||
        brand.description.toLocaleLowerCase("vi").includes(keyword);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && brand.active) ||
        (statusFilter === "inactive" && !brand.active);
      return matchesSearch && matchesStatus;
    });
  }, [brands, search, statusFilter]);

  const activeCount = brands.filter((brand) => brand.active).length;
  const inactiveCount = brands.length - activeCount;

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (brand: BrandView) => {
    setEditingId(brand.id);
    setForm({
      name: brand.name,
      description: brand.description,
      logo: brand.logo,
    });
    setFormError("");
    setShowModal(true);
  };

  const save = async () => {
    const name = form.name.trim();
    if (!name) {
      setFormError("Vui lòng nhập tên thương hiệu.");
      return;
    }
    if (name.length > 100) {
      setFormError("Tên thương hiệu không được vượt quá 100 ký tự.");
      return;
    }
    if (form.logo.trim() && !/^https?:\/\/\S+$/i.test(form.logo.trim())) {
      setFormError("Logo phải là đường dẫn URL bắt đầu bằng http:// hoặc https://.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      const payload = {
        name,
        description: form.description.trim(),
        logo: form.logo.trim(),
      };
      if (editingId) await updateBrand(editingId, payload);
      else await createBrand(payload);
      setShowModal(false);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Không thể lưu thương hiệu.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (brand: BrandView) => {
    setTogglingId(brand.id);
    try {
      await updateBrand(brand.id, { isActive: !brand.active });
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể cập nhật trạng thái.");
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBrand(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể ẩn thương hiệu.");
    } finally {
      setDeleting(false);
    }
  };

  const inputStyle = {
    border: "1px solid var(--color-champagne)",
    background: "white",
    color: "var(--color-charcoal)",
    fontFamily: "var(--font-body)",
  };
  const inputClass =
    "w-full px-4 py-3 text-sm outline-none focus:border-[var(--color-charcoal)]";

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p
            className="mb-1 text-xs uppercase tracking-widest"
            style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }}
          >
            Quản lý
          </p>
          <h1
            className="text-3xl font-normal"
            style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-display)" }}
          >
            Thương Hiệu
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--color-warm-gray)" }}>
            Quản lý tên, logo, mô tả và trạng thái thương hiệu.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-5 py-3 text-xs uppercase tracking-widest transition-opacity hover:opacity-80"
          style={{
            background: "var(--color-charcoal)",
            color: "var(--color-champagne)",
            fontFamily: "var(--font-body)",
          }}
        >
          + Thêm thương hiệu
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Tổng thương hiệu", value: brands.length },
          { label: "Đang hoạt động", value: activeCount },
          { label: "Đang ẩn", value: inactiveCount },
        ].map((item) => (
          <div
            key={item.label}
            className="p-5"
            style={{ background: "white", border: "1px solid var(--color-champagne)" }}
          >
            <p
              className="mb-2 text-xs uppercase tracking-widest"
              style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }}
            >
              {item.label}
            </p>
            <p
              className="text-3xl"
              style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-display)" }}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div
        className="mb-5 flex flex-col gap-3 p-4 sm:flex-row"
        style={{ background: "white", border: "1px solid var(--color-champagne)" }}
      >
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tìm theo tên hoặc mô tả thương hiệu..."
          className={inputClass + " flex-1"}
          style={inputStyle}
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className={inputClass + " sm:max-w-52"}
          style={inputStyle}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đang ẩn</option>
        </select>
        <button
          onClick={() => void load()}
          className="border px-4 py-2 text-xs uppercase tracking-widest"
          style={{ borderColor: "var(--color-champagne)" }}
        >
          Làm mới
        </button>
      </div>

      {loading && <p className="py-16 text-center opacity-60">Đang tải thương hiệu...</p>}
      {error && !loading && (
        <div className="p-5 text-center" style={{ color: "#c0392b", background: "white" }}>
          {error}
          <button onClick={() => void load()} className="ml-3 underline">Thử lại</button>
        </div>
      )}

      {!loading && !error && (
        <div
          className="overflow-x-auto"
          style={{ background: "white", border: "1px solid var(--color-champagne)" }}
        >
          <table className="w-full min-w-[720px]">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-champagne)" }}>
                {["Thương hiệu", "Mô tả", "Ngày tạo", "Trạng thái", "Thao tác"].map((title) => (
                  <th
                    key={title}
                    className="px-4 py-4 text-left text-xs font-normal uppercase tracking-widest"
                    style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }}
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((brand) => (
                <tr
                  key={brand.id}
                  className="hover:bg-[var(--color-mist)]"
                  style={{ borderBottom: "1px solid var(--color-champagne)" }}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden"
                        style={{ background: "var(--color-mist)", border: "1px solid var(--color-champagne)" }}
                      >
                        {brand.logo ? (
                          <img src={brand.logo} alt={brand.name} className="h-full w-full object-contain" />
                        ) : (
                          <span className="text-lg" style={{ color: "var(--color-warm-gray)" }}>
                            {brand.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="text-sm" style={{ fontFamily: "var(--font-display)" }}>
                        {brand.name}
                      </span>
                    </div>
                  </td>
                  <td className="max-w-xs px-4 py-4 text-sm" style={{ color: "var(--color-warm-gray)" }}>
                    {brand.description || "—"}
                  </td>
                  <td className="px-4 py-4 text-sm">{brand.createdAt || "—"}</td>
                  <td className="px-4 py-4">
                    <span
                      className="px-2 py-1 text-xs"
                      style={{
                        color: brand.active ? "#477a58" : "#a94442",
                        background: brand.active ? "rgba(90,138,106,.12)" : "rgba(192,57,43,.08)",
                      }}
                    >
                      {brand.active ? "Hoạt động" : "Đang ẩn"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => openEdit(brand)}
                        className="border px-3 py-2 text-xs"
                        style={{ borderColor: "var(--color-champagne)" }}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => void toggleStatus(brand)}
                        disabled={togglingId === brand.id}
                        className="border px-3 py-2 text-xs disabled:opacity-50"
                        style={{ borderColor: "var(--color-champagne)" }}
                      >
                        {togglingId === brand.id ? "Đang lưu..." : brand.active ? "Ẩn" : "Hiện"}
                      </button>
                      <button
                        onClick={() => setDeleteTarget(brand)}
                        className="border px-3 py-2 text-xs"
                        style={{ borderColor: "#e5b8b8", color: "#c0392b" }}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="py-12 text-center text-sm opacity-60">Không tìm thấy thương hiệu phù hợp.</p>
          )}
          <p className="px-4 py-3 text-xs opacity-60">
            Hiển thị {filtered.length} / {brands.length} thương hiệu
          </p>
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) setShowModal(false);
          }}
        >
          <div
            className="w-full max-w-xl p-7"
            style={{ background: "var(--color-cream)", maxHeight: "90vh", overflowY: "auto" }}
          >
            <h2
              className="mb-6 text-2xl"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }}
            >
              {editingId ? "Chỉnh sửa thương hiệu" : "Thêm thương hiệu"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-widest">Tên thương hiệu *</label>
                <input
                  value={form.name}
                  onChange={(event) => setForm((old) => ({ ...old, name: event.target.value }))}
                  className={inputClass}
                  style={inputStyle}
                  maxLength={100}
                  placeholder="Ví dụ: LUMIÈRE"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-widest">URL logo</label>
                <input
                  value={form.logo}
                  onChange={(event) => setForm((old) => ({ ...old, logo: event.target.value }))}
                  className={inputClass}
                  style={inputStyle}
                  placeholder="https://example.com/logo.png"
                />
                {form.logo && (
                  <div className="mt-3 flex h-20 w-20 items-center justify-center border bg-white p-2" style={{ borderColor: "var(--color-champagne)" }}>
                    <img src={form.logo} alt="Xem trước logo" className="max-h-full max-w-full object-contain" onError={(event) => { event.currentTarget.style.display = "none"; }} />
                  </div>
                )}
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-widest">Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((old) => ({ ...old, description: event.target.value }))}
                  className={inputClass + " resize-y"}
                  style={inputStyle}
                  rows={4}
                  maxLength={1000}
                  placeholder="Mô tả ngắn về thương hiệu..."
                />
              </div>
              {formError && <p className="text-sm" style={{ color: "#c0392b" }}>{formError}</p>}
            </div>
            <div className="mt-7 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                className="flex-1 border py-3 text-xs uppercase tracking-widest disabled:opacity-50"
                style={{ borderColor: "var(--color-champagne)" }}
              >
                Hủy
              </button>
              <button
                onClick={() => void save()}
                disabled={saving}
                className="flex-[2] py-3 text-xs uppercase tracking-widest disabled:opacity-50"
                style={{ background: "var(--color-charcoal)", color: "var(--color-champagne)" }}
              >
                {saving ? "Đang lưu..." : editingId ? "Lưu thay đổi" : "Tạo thương hiệu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-[210] flex items-center justify-center bg-black/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) setDeleteTarget(null);
          }}
        >
          <div className="w-full max-w-sm p-7" style={{ background: "var(--color-cream)" }}>
            <h2 className="mb-3 text-xl" style={{ fontFamily: "var(--font-display)" }}>
              Ẩn thương hiệu?
            </h2>
            <p className="mb-6 text-sm opacity-70">
              Thương hiệu <strong>{deleteTarget.name}</strong> sẽ được chuyển sang trạng thái ẩn. Dữ liệu không bị xóa khỏi cơ sở dữ liệu.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 border py-3 text-xs uppercase"
                style={{ borderColor: "var(--color-champagne)" }}
              >
                Hủy
              </button>
              <button
                onClick={() => void confirmDelete()}
                disabled={deleting}
                className="flex-1 py-3 text-xs uppercase disabled:opacity-50"
                style={{ background: "#c0392b", color: "white" }}
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
