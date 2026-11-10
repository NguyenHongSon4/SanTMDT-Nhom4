import { useState, useEffect } from "react";
import {
  fetchAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchCategories,
  type AdminProduct,
} from "../../services/productService";
import { fetchActiveBrands } from "../../services/brandService";

const fmt = (n: number) => n.toLocaleString("vi-VN") + "₫";

interface FormState {
  id?: string;
  name: string;
  price: number | "";
  originalPrice: number | "";
  categoryId: string;
  stock: number | "";
  brandId: string;
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
  brandId: "",
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
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [lowStockOnly, setLowStockOnly] = useState(false);
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
      const [prods, cats, brandList] = await Promise.all([
        fetchAdminProducts(),
        fetchCategories(),
        fetchActiveBrands(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setBrands(brandList.map((b: { id: string; name: string }) => ({ id: b.id, name: b.name })));
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
    return matchSearch && matchCat && (!lowStockOnly || p.stock < 10);
  });
  const lowStockCount = products.filter((product) => product.stock < 10).length;

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
      brandId: p.brandId || "",
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
        brandId: form.brandId ? form.brandId : null,
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

    const extension = file.name.toLowerCase().split(".").pop();
    if (!extension || !["csv", "xlsx", "xls"].includes(extension)) {
      alert("Vui lòng chọn file .xlsx, .xls hoặc .csv.");
      return;
    }

    if (categories.length === 0) {
      alert("Cần có ít nhất 1 danh mục trước khi import.");
      return;
    }

    setImporting(true);
    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = firstSheet
        ? (XLSX.utils.sheet_to_json<unknown[]>(firstSheet, {
            header: 1,
            defval: "",
            raw: false,
          }) as unknown[][])
        : [];

      if (rows.length < 2) {
        alert("File trống hoặc thiếu dữ liệu.");
        return;
      }

      const normalizeHeader = (value: unknown) =>
        String(value ?? "")
          .trim()
          .toLocaleLowerCase("vi-VN")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/[^a-z0-9]/g, "");
      const headers = rows[0].map(normalizeHeader);
      const idx = (...keys: string[]) =>
        headers.findIndex((header) => keys.includes(header));

      const nameI = idx("name", "productname", "ten", "tensanpham");
      const priceI = idx("price", "gia");
      const categoryNameI = idx("category", "categoryname", "danhmuc", "tendanhmuc");
      const categoryIdI = idx("categoryid");
      const brandNameI = idx("brand", "brandname", "thuonghieu", "tenthuonghieu");
      const brandIdI = idx("brandid");
      const stockI = idx("stock", "quantity", "tonkho", "soluong");
      const descI = idx("description", "mota");
      const ingredientsI = idx("ingredients", "thanhphan");
      const imageI = idx("image", "imageurl", "hinhanh", "anh");
      const origI = idx("originalprice", "giagoc", "giacu");
      const isNewI = idx("isnew", "isnewarrival", "newarrival", "hangmoi", "moi");
      const isBestsellerI = idx("isbestseller", "bestseller", "banchay");

      if (nameI < 0 || priceI < 0) {
        alert("File cần có ít nhất cột name (tên sản phẩm) và price (giá).");
        return;
      }

      let ok = 0;
      let fail = 0;
      const categoryNames = new Map(
        categories.map((category) => [normalizeHeader(category.name), category.id])
      );
      const categoryIds = new Set(categories.map((category) => category.id));
      const brandNames = new Map(
        brands.map((brand) => [normalizeHeader(brand.name), brand.id])
      );
      const brandIds = new Set(brands.map((brand) => brand.id));
      const failures: string[] = [];
      const cell = (row: unknown[], column: number) =>
        column < 0 ? "" : String(row[column] ?? "").trim();
      const numericValue = (value: string) => {
        const cleaned = value.replace(/[^\d.-]/g, "");
        return cleaned ? Number(cleaned) : NaN;
      };
      const booleanValue = (value: string): boolean | undefined => {
        const normalized = normalizeHeader(value);
        if (!normalized) return false;
        if (["true", "1", "yes", "y", "co", "x", "new", "bestseller"].includes(normalized)) return true;
        if (["false", "0", "no", "n", "khong"].includes(normalized)) return false;
        return undefined;
      };

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row.some((value) => String(value ?? "").trim())) continue;
        const name = cell(row, nameI);
        const price = numericValue(cell(row, priceI));
        if (!name || !Number.isFinite(price) || price <= 0) {
          fail++;
          failures.push(`Dòng ${i + 1}: thiếu tên hoặc giá không hợp lệ.`);
          continue;
        }

        const categoryName = cell(row, categoryNameI);
        const suppliedCategoryId = cell(row, categoryIdI);
        const categoryId = categoryName
          ? categoryNames.get(normalizeHeader(categoryName))
          : suppliedCategoryId && categoryIds.has(suppliedCategoryId)
            ? suppliedCategoryId
            : undefined;
        if (!categoryId) {
          fail++;
          failures.push(
            categoryName || suppliedCategoryId
              ? `Dòng ${i + 1}: không tìm thấy danh mục “${categoryName || suppliedCategoryId}”.`
              : `Dòng ${i + 1}: thiếu tên danh mục trong cột category.`
          );
          continue;
        }

        const brandName = cell(row, brandNameI);
        const suppliedBrandId = cell(row, brandIdI);
        const brandId = brandName
          ? brandNames.get(normalizeHeader(brandName))
          : suppliedBrandId && brandIds.has(suppliedBrandId)
            ? suppliedBrandId
            : undefined;
        if ((brandName || suppliedBrandId) && !brandId) {
          fail++;
          failures.push(`Dòng ${i + 1}: không tìm thấy thương hiệu “${brandName || suppliedBrandId}”.`);
          continue;
        }

        const stockText = cell(row, stockI);
        const stock = stockText ? numericValue(stockText) : 0;
        const originalPriceText = cell(row, origI);
        const originalPrice = originalPriceText
          ? numericValue(originalPriceText)
          : undefined;
        const isNewText = cell(row, isNewI);
        const isBestsellerText = cell(row, isBestsellerI);
        const isNew = booleanValue(isNewText);
        const isBestseller = booleanValue(isBestsellerText);
        if (
          !Number.isFinite(stock) ||
          stock < 0 ||
          (originalPrice !== undefined && (!Number.isFinite(originalPrice) || originalPrice < 0)) ||
          isNew === undefined ||
          isBestseller === undefined
        ) {
          fail++;
          failures.push(`Dòng ${i + 1}: tồn kho, giá gốc hoặc giá trị hàng mới/bán chạy không hợp lệ.`);
          continue;
        }

        try {
          await createProduct({
            name,
            price,
            categoryId,
            brandId: brandId ?? null,
            stock,
            description: cell(row, descI),
            ingredients: cell(row, ingredientsI),
            images: cell(row, imageI) ? [cell(row, imageI)] : [],
            originalPrice: originalPrice ?? null,
            isNewArrival: isNew,
            isBestseller,
          });
          ok++;
        } catch (err: any) {
          fail++;
          failures.push(`Dòng ${i + 1}: ${err.message || "không lưu được sản phẩm."}`);
        }
      }

      setImportSuccess(true);
      setTimeout(() => setImportSuccess(false), 3000);
      await load();
      alert(
        `Import xong: ${ok} thành công, ${fail} lỗi.` +
          (failures.length ? `\n\n${failures.slice(0, 8).join("\n")}` : "") +
          (failures.length > 8 ? `\n... và ${failures.length - 8} lỗi khác.` : "")
      );
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
          <p className="mt-2 max-w-2xl text-xs opacity-60" style={{ fontFamily: "var(--font-body)" }}>
            Nhập .xlsx, .xls hoặc .csv. Cột bắt buộc: name, price, category (tên danh mục); cột tùy chọn: brand (tên thương hiệu), stock, description, ingredients, image, originalPrice, isNewArrival, isBestseller. Dùng true/false, có/không hoặc 1/0 cho hai cột cuối.
          </p>
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
          {lowStockCount > 0 && (
            <section
              aria-live="polite"
              className="mb-4 flex flex-wrap items-center justify-between gap-3 border-l-4 p-4"
              style={{
                background: "rgba(192,57,43,0.12)",
                borderColor: "#dc2626",
                color: "var(--color-charcoal)",
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-xl font-bold"
                  style={{ background: "#dc2626", color: "white" }}
                >
                  !
                </span>
                <div>
                  <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-body)" }}>
                    {lowStockCount} sản phẩm sắp hết hàng
                  </p>
                  <p className="text-xs opacity-75" style={{ fontFamily: "var(--font-body)" }}>
                    Tồn kho dưới 10 sản phẩm — kiểm tra để kịp bổ sung.
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-pressed={lowStockOnly}
                onClick={() => setLowStockOnly((current) => !current)}
                className="border px-3 py-2 text-xs font-semibold transition-colors"
                style={{ borderColor: "#dc2626", color: "#b42318", background: "white" }}
              >
                {lowStockOnly ? "Hiện tất cả sản phẩm" : "Xem sản phẩm sắp hết"}
              </button>
            </section>
          )}
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
                        ...(isLow
                          ? {
                              background: "rgba(220,38,38,0.07)",
                              boxShadow: "inset 4px 0 #dc2626",
                            }
                          : {}),
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
                        <div className="flex flex-col items-start gap-1">
                          <span
                            style={{
                              color: isLow ? "white" : "#5a8a6a",
                              background: isLow ? "#dc2626" : "transparent",
                              fontFamily: "var(--font-body)",
                              fontWeight: 700,
                            }}
                            className={`text-sm ${isLow ? "rounded px-2 py-1" : ""}`}
                          >
                            {p.stock} sản phẩm
                          </span>
                          {isLow && (
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                              style={{ background: "#dc2626", color: "white" }}
                            >
                              ⚠ Sắp hết
                            </span>
                          )}
                        </div>
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
                    Thương hiệu
                  </label>
                  <select
                    value={form.brandId || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, brandId: e.target.value }))
                    }
                    style={inputStyle}
                    className={inputCls}
                  >
                    <option value="">— Không chọn —</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
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
