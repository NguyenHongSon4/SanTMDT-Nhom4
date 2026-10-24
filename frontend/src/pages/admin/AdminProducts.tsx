import { useState, useEffect } from "react";
import {
  fetchAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchCategories,
  type AdminProduct,
} from "../../services/productService";

const fmt = (n: number) => n.toLocaleString("vi-VN") + "₫";

interface FormState {
  id?: string;
  name: string;
  price: number | "";
  originalPrice: number | "";
  categoryId: string;
  stock: number | "";
  description: string;
  ingredients: string;
  image: string;
  isBestseller: boolean;
  isNew: boolean;
}

const emptyForm = (): FormState => ({
  name: "",
  price: "",
  originalPrice: "",
  categoryId: "",
  stock: 20,
  description: "",
  ingredients: "",
  image: "",
  isBestseller: false,
  isNew: false,
});

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [importHover, setImportHover] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importing, setImporting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [prods, cats] = await Promise.all([
        fetchAdminProducts(),
        fetchCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err: any) {
      setError(err.message || "Không tải được dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q);
    const matchCat =
      categoryFilter === "all" || p.categoryId === categoryFilter;
    return matchSearch && matchCat;
  });

  const openNew = () => {
    setForm({
      ...emptyForm(),
      categoryId: categories[0]?.id || "",
    });
    setShowModal(true);
  };

  const openEdit = (p: AdminProduct) => {
    setForm({
      id: p.id,
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice ?? "",
      categoryId: p.categoryId || categories[0]?.id || "",
      stock: p.stock,
      description: p.description,
      ingredients: p.ingredients,
      image: p.image,
      isBestseller: !!p.isBestseller,
      isNew: !!p.isNew,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || form.price === "" || !form.categoryId) {
      alert("Vui lòng nhập tên, giá và chọn danh mục");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        price: Number(form.price),
        originalPrice:
          form.originalPrice === "" ? null : Number(form.originalPrice),
        categoryId: form.categoryId,
        stock: form.stock === "" ? 0 : Number(form.stock),
        description: form.description,
        ingredients: form.ingredients,
        images: form.image ? [form.image] : [],
        isNewArrival: form.isNew,
        isBestseller: form.isBestseller,
      };
      if (form.id) {
        await updateProduct(form.id, payload);
      } else {
        await createProduct(payload);
      }
      setShowModal(false);
      setForm(emptyForm());
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
      await deleteProduct(id);
      setDeleteTarget(null);
      await load();
    } catch (err: any) {
      alert(err.message || "Xoá thất bại");
    } finally {
      setDeleting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const isCsv =
      file.name.toLowerCase().endsWith(".csv") || file.type === "text/csv";

    if (!isCsv) {
      alert(
        "Hiện hỗ trợ file .csv (Excel → Lưu thành CSV UTF-8).\n" +
          "Cột gợi ý: name,price,categoryId,stock,description,image,originalPrice"
      );
      return;
    }

    if (categories.length === 0) {
      alert("Cần có ít nhất 1 danh mục trước khi import.");
      return;
    }

    setImporting(true);
    try {
      const text = await file.text();
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

      if (lines.length < 2) {
        alert("File trống hoặc thiếu dữ liệu.");
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const idx = (key: string) => headers.indexOf(key);

      const nameI = idx("name");
      const priceI = idx("price");
      const catI = idx("categoryid");
      const stockI = idx("stock");
      const descI = idx("description");
      const imageI = idx("image");
      const origI = idx("originalprice");

      if (nameI < 0 || priceI < 0) {
        alert("CSV cần ít nhất cột: name, price");
        return;
      }

      let ok = 0;
      let fail = 0;

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i]
          .split(",")
          .map((c) => c.trim().replace(/^"|"$/g, ""));
        const name = cols[nameI];
        const price = Number(cols[priceI]);
        if (!name || !price) {
          fail++;
          continue;
        }

        const categoryId = (catI >= 0 && cols[catI]) || categories[0].id;

        try {
          await createProduct({
            name,
            price,
            categoryId,
            stock: stockI >= 0 && cols[stockI] ? Number(cols[stockI]) : 0,
            description: descI >= 0 ? cols[descI] || "" : "",
            images: imageI >= 0 && cols[imageI] ? [cols[imageI]] : [],
            originalPrice:
              origI >= 0 && cols[origI] ? Number(cols[origI]) : null,
          });
          ok++;
        } catch {
          fail++;
        }
      }

      setImportSuccess(true);
      setTimeout(() => setImportSuccess(false), 3000);
      await load();
      alert(`Import xong: ${ok} thành công, ${fail} lỗi.`);
    } catch (err: any) {
      alert(err.message || "Không đọc được file");
    } finally {
      setImporting(false);
    }
  };

  const inputStyle = {
    fontFamily: "var(--font-body)",
    border: "1px solid var(--color-champagne)",
    background: "white",
    color: "var(--color-charcoal)",
  };
  const inputCls =
    "w-full px-3 py-2 text-sm outline-none focus:border-[var(--color-charcoal)] transition-colors";

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
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
            Sản Phẩm
          </h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <label
            onMouseEnter={() => setImportHover(true)}
            onMouseLeave={() => setImportHover(false)}
            style={{
              border: "1px solid var(--color-champagne)",
              color: importSuccess
                ? "#5a8a6a"
                : importHover
                ? "var(--color-charcoal)"
                : "var(--color-warm-gray)",
              fontFamily: "var(--font-body)",
              cursor: importing ? "wait" : "pointer",
              background: importSuccess
                ? "rgba(90,138,106,0.1)"
                : "transparent",
            }}
            className="px-4 py-2 text-xs tracking-widest uppercase transition-all flex items-center gap-2"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {importing
              ? "Đang nhập..."
              : importSuccess
              ? "Đã nhập ✓"
              : "Nhập Excel/CSV"}
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              disabled={importing}
              onChange={handleImport}
            />
          </label>
          <button
            onClick={openNew}
            style={{
              background: "var(--color-charcoal)",
              color: "var(--color-champagne)",
              fontFamily: "var(--font-body)",
            }}
            className="px-5 py-2 text-xs tracking-widest uppercase hover:opacity-80"
          >
            + Thêm Sản Phẩm
          </button>
        </div>
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
          placeholder="Tìm theo tên hoặc thương hiệu..."
          style={inputStyle}
          className={inputCls + " flex-1"}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ ...inputStyle, minWidth: "160px" }}
          className={inputCls}
        >
          <option value="all">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <p className="text-center py-16 opacity-60">Đang tải sản phẩm...</p>
      )}
      {error && !loading && (
        <p className="text-center py-16" style={{ color: "#c0392b" }}>
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
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
                  {["Sản Phẩm", "Danh Mục", "Giá", "Tồn Kho", ""].map((h) => (
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
                  const isLow = p.stock < 10;
                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: "1px solid var(--color-champagne)",
                      }}
                      className="hover:bg-[var(--color-mist)]"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            style={{
                              width: "40px",
                              height: "50px",
                              objectFit: "cover",
                            }}
                          />
                          <div>
                            <p
                              style={{
                                fontFamily: "var(--font-display)",
                                color: "var(--color-charcoal)",
                              }}
                              className="text-sm"
                            >
                              {p.name}
                            </p>
                            <p
                              style={{
                                color: "var(--color-warm-gray)",
                                fontFamily: "var(--font-body)",
                              }}
                              className="text-xs"
                            >
                              {p.brand}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          style={{
                            background: "var(--color-mist)",
                            fontFamily: "var(--font-body)",
                          }}
                          className="text-xs px-2 py-1"
                        >
                          {p.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm">{fmt(p.price)}</p>
                        {p.originalPrice != null && (
                          <p
                            className="text-xs line-through"
                            style={{ color: "var(--color-warm-gray)" }}
                          >
                            {fmt(p.originalPrice)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          style={{
                            color: isLow ? "#c0392b" : "#5a8a6a",
                            fontFamily: "var(--font-body)",
                          }}
                          className="text-sm font-medium"
                        >
                          {isLow && "⚠ "}
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
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
                            onClick={() => setDeleteTarget(p.id)}
                            style={{
                              border: "1px solid #f5c6cb",
                              color: "#c0392b",
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
              <p className="text-center py-10 opacity-60">
                Không tìm thấy sản phẩm
              </p>
            )}
          </div>
          <p className="text-xs mt-3 opacity-60">
            {filtered.length} / {products.length} sản phẩm
          </p>
        </>
      )}

      {/* Modal thêm / sửa */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(26,26,26,0.7)",
            zIndex: 200,
          }}
          className="flex items-center justify-center p-4"
          onClick={() => !saving && setShowModal(false)}
        >
          <div
            style={{
              background: "var(--color-cream)",
              maxWidth: "560px",
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
              {form.id ? "Chỉnh Sửa Sản Phẩm" : "Thêm Sản Phẩm Mới"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs tracking-widest uppercase mb-2">
                  Tên sản phẩm *
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  style={inputStyle}
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase mb-2">
                    Giá *
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        price: e.target.value === "" ? "" : +e.target.value,
                      }))
                    }
                    style={inputStyle}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase mb-2">
                    Giá gốc
                  </label>
                  <input
                    type="number"
                    value={form.originalPrice}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        originalPrice:
                          e.target.value === "" ? "" : +e.target.value,
                      }))
                    }
                    style={inputStyle}
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase mb-2">
                    Danh mục *
                  </label>
                  <select
                    value={form.categoryId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, categoryId: e.target.value }))
                    }
                    style={inputStyle}
                    className={inputCls}
                  >
                    {categories.length === 0 && (
                      <option value="">Chưa có danh mục</option>
                    )}
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase mb-2">
                    Tồn kho
                  </label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        stock: e.target.value === "" ? "" : +e.target.value,
                      }))
                    }
                    style={inputStyle}
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase mb-2">
                  Mô tả
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={3}
                  style={inputStyle}
                  className={inputCls + " resize-none"}
                />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase mb-2">
                  Thành phần
                </label>
                <input
                  value={form.ingredients}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ingredients: e.target.value }))
                  }
                  style={inputStyle}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase mb-2">
                  URL hình ảnh
                </label>
                <input
                  value={form.image}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, image: e.target.value }))
                  }
                  style={inputStyle}
                  className={inputCls}
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isBestseller}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        isBestseller: e.target.checked,
                      }))
                    }
                  />
                  Bán chạy
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isNew}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, isNew: e.target.checked }))
                    }
                  />
                  Hàng mới
                </label>
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
                  : form.id
                  ? "Lưu thay đổi"
                  : "Thêm sản phẩm"}
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
              Xoá sản phẩm?
            </h3>
            <p className="text-sm opacity-70 mb-6">
              Sản phẩm sẽ bị ẩn/xóa khỏi hệ thống.
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
                {deleting ? "Đang xoá..." : "Xác nhận xoá"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}