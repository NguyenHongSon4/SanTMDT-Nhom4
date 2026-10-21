import { useState } from "react";
import { products as initialProducts } from "../../data/products";
import type { Product } from "../../App";

const fmt = (n: number) => n.toLocaleString("vi-VN") + "₫";

const stockMap: Record<number, number> = { 1: 8, 2: 24, 3: 6, 4: 15, 5: 22, 6: 3 };

interface EditProduct extends Partial<Product> {
  stock?: number;
}

export default function AdminProducts() {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Tất Cả");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<EditProduct | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [stocks, setStocks] = useState(stockMap);
  const [importHover, setImportHover] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const categories = ["Tất Cả", ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "Tất Cả" || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const openNew = () => {
    setEditingProduct({
      name: "", brand: "", price: 0, category: "Dưỡng Da",
      description: "", ingredients: "", tags: [], rating: 0, reviews: 0,
      image: "https://images.unsplash.com/photo-1764694187688-454d172e5ca0?w=600&h=750&fit=crop",
      stock: 20,
    });
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct({ ...p, stock: stocks[p.id] ?? 20 });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!editingProduct?.name || !editingProduct?.price) return;
    if (editingProduct.id) {
      setProducts((prev) => prev.map((p) => p.id === editingProduct.id ? { ...p, ...editingProduct } as Product : p));
      setStocks((prev) => ({ ...prev, [editingProduct.id!]: editingProduct.stock ?? prev[editingProduct.id!] }));
    } else {
      const newId = Math.max(...products.map((p) => p.id)) + 1;
      const newProduct: Product = {
        id: newId, name: editingProduct.name!, brand: editingProduct.brand ?? "",
        price: editingProduct.price!, category: editingProduct.category ?? "Dưỡng Da",
        description: editingProduct.description ?? "", ingredients: editingProduct.ingredients ?? "",
        tags: editingProduct.tags ?? [], rating: 0, reviews: 0,
        image: editingProduct.image ?? "https://images.unsplash.com/photo-1764694187688-454d172e5ca0?w=600&h=750&fit=crop",
      };
      setProducts((prev) => [...prev, newProduct]);
      setStocks((prev) => ({ ...prev, [newId]: editingProduct.stock ?? 20 }));
    }
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleDelete = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteTarget(null);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setImportSuccess(true);
      setTimeout(() => setImportSuccess(false), 2500);
    }
  };

  const inputStyle = {
    fontFamily: "var(--font-body)",
    border: "1px solid var(--color-champagne)",
    background: "white",
    color: "var(--color-charcoal)",
  };
  const inputCls = "w-full px-3 py-2 text-sm outline-none focus:border-[var(--color-charcoal)] transition-colors placeholder:opacity-40";

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase mb-1">Quản Lý</p>
          <h1 style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-3xl font-normal">Sản Phẩm</h1>
        </div>
        <div className="flex gap-2">
          {/* Import Excel */}
          <label
            onMouseEnter={() => setImportHover(true)}
            onMouseLeave={() => setImportHover(false)}
            style={{
              border: "1px solid var(--color-champagne)",
              color: importHover ? "var(--color-charcoal)" : "var(--color-warm-gray)",
              fontFamily: "var(--font-body)",
              cursor: "pointer",
              background: importSuccess ? "rgba(90,138,106,0.1)" : "transparent",
            }}
            className="px-4 py-2 text-xs tracking-widest uppercase transition-all flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            {importSuccess ? "Đã Nhập ✓" : "Nhập Excel"}
            <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImport} />
          </label>
          <button
            onClick={openNew}
            style={{ background: "var(--color-charcoal)", color: "var(--color-champagne)", fontFamily: "var(--font-body)" }}
            className="px-5 py-2 text-xs tracking-widest uppercase hover:opacity-80 transition-opacity flex items-center gap-2"
          >
            <span className="text-base leading-none">+</span>
            Thêm Sản Phẩm
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: "white", border: "1px solid var(--color-champagne)" }} className="p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-warm-gray)" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên hoặc thương hiệu..." style={inputStyle} className={inputCls + " pl-9"} />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ ...inputStyle, minWidth: "150px" }} className={inputCls + " cursor-pointer"}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "white", border: "1px solid var(--color-champagne)" }} className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-champagne)" }}>
              {["Sản Phẩm", "Danh Mục", "Giá", "Tồn Kho", "Đánh Giá", ""].map((h) => (
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
            {filtered.map((p) => {
              const stock = stocks[p.id] ?? 20;
              const isLow = stock < 10;
              return (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--color-champagne)" }} className="hover:bg-[var(--color-mist)] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} style={{ width: "40px", height: "50px", objectFit: "cover", flexShrink: 0 }} />
                      <div className="min-w-0">
                        <p style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-display)" }} className="text-sm font-normal truncate max-w-48">{p.name}</p>
                        <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ background: "var(--color-mist)", color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs px-2 py-1">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-sm">{fmt(p.price)}</p>
                    {p.originalPrice && <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs line-through">{fmt(p.originalPrice)}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ color: isLow ? "#c0392b" : "#5a8a6a", fontFamily: "var(--font-body)" }} className="text-sm font-medium">
                      {isLow && "⚠ "}{stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span style={{ color: "var(--color-gold)" }} className="text-xs">★</span>
                      <span style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-xs">{p.rating} ({p.reviews})</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs hover:text-[var(--color-charcoal)] transition-colors border border-[var(--color-champagne)] px-3 py-1">Sửa</button>
                      <button onClick={() => setDeleteTarget(p.id)} style={{ color: "#c0392b", fontFamily: "var(--font-body)" }} className="text-xs hover:opacity-70 transition-opacity border border-red-200 px-3 py-1">Xoá</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-10 text-center">
            <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-display)" }} className="text-lg font-normal italic">Không tìm thấy sản phẩm</p>
          </div>
        )}
      </div>
      <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs mt-3">{filtered.length} / {products.length} sản phẩm</p>

      {/* Edit/Add Modal */}
      {showModal && editingProduct && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(26,26,26,0.7)", zIndex: 200 }} className="flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div style={{ background: "var(--color-cream)", maxWidth: "560px", width: "100%", maxHeight: "90vh", overflowY: "auto" }} className="p-7" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-2xl font-normal mb-6">
              {editingProduct.id ? "Chỉnh Sửa Sản Phẩm" : "Thêm Sản Phẩm Mới"}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="block text-xs tracking-widest uppercase mb-2">Tên Sản Phẩm</label>
                  <input value={editingProduct.name ?? ""} onChange={e => setEditingProduct(p => ({...p!, name: e.target.value}))} style={inputStyle} className={inputCls} placeholder="Sérum Lumière..." />
                </div>
                <div>
                  <label style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="block text-xs tracking-widest uppercase mb-2">Thương Hiệu</label>
                  <input value={editingProduct.brand ?? ""} onChange={e => setEditingProduct(p => ({...p!, brand: e.target.value}))} style={inputStyle} className={inputCls} placeholder="MAISON BEAUTÉ" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="block text-xs tracking-widest uppercase mb-2">Giá (VNĐ)</label>
                  <input type="number" value={editingProduct.price ?? ""} onChange={e => setEditingProduct(p => ({...p!, price: +e.target.value}))} style={inputStyle} className={inputCls} placeholder="1850000" />
                </div>
                <div>
                  <label style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="block text-xs tracking-widest uppercase mb-2">Giá Gốc</label>
                  <input type="number" value={editingProduct.originalPrice ?? ""} onChange={e => setEditingProduct(p => ({...p!, originalPrice: +e.target.value || undefined}))} style={inputStyle} className={inputCls} placeholder="(tuỳ chọn)" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="block text-xs tracking-widest uppercase mb-2">Danh Mục</label>
                  <select value={editingProduct.category ?? "Dưỡng Da"} onChange={e => setEditingProduct(p => ({...p!, category: e.target.value}))} style={inputStyle} className={inputCls + " cursor-pointer"}>
                    {["Dưỡng Da", "Nước Hoa", "Dưỡng Thể", "Mặt Nạ"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="block text-xs tracking-widest uppercase mb-2">Tồn Kho</label>
                  <input type="number" value={editingProduct.stock ?? ""} onChange={e => setEditingProduct(p => ({...p!, stock: +e.target.value}))} style={inputStyle} className={inputCls} placeholder="20" />
                </div>
              </div>
              <div>
                <label style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="block text-xs tracking-widest uppercase mb-2">Mô Tả</label>
                <textarea value={editingProduct.description ?? ""} onChange={e => setEditingProduct(p => ({...p!, description: e.target.value}))} rows={3} style={inputStyle} className={inputCls + " resize-none"} placeholder="Mô tả sản phẩm..." />
              </div>
              <div>
                <label style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="block text-xs tracking-widest uppercase mb-2">Thành Phần</label>
                <input value={editingProduct.ingredients ?? ""} onChange={e => setEditingProduct(p => ({...p!, ingredients: e.target.value}))} style={inputStyle} className={inputCls} placeholder="Aqua, Retinol, Niacinamide..." />
              </div>
              <div>
                <label style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="block text-xs tracking-widest uppercase mb-2">URL Hình Ảnh</label>
                <input value={editingProduct.image ?? ""} onChange={e => setEditingProduct(p => ({...p!, image: e.target.value}))} style={inputStyle} className={inputCls} placeholder="https://..." />
              </div>
              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!editingProduct.isBestseller} onChange={e => setEditingProduct(p => ({...p!, isBestseller: e.target.checked}))} style={{ accentColor: "var(--color-charcoal)" }} />
                  <span style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-xs">Bán Chạy</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!editingProduct.isNew} onChange={e => setEditingProduct(p => ({...p!, isNew: e.target.checked}))} style={{ accentColor: "var(--color-charcoal)" }} />
                  <span style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-xs">Hàng Mới</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} style={{ flex: 1, border: "1px solid var(--color-champagne)", color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="py-3 text-xs tracking-widest uppercase">Huỷ</button>
              <button onClick={handleSave} style={{ flex: 2, background: "var(--color-charcoal)", color: "var(--color-champagne)", fontFamily: "var(--font-body)" }} className="py-3 text-xs tracking-widest uppercase hover:opacity-80 transition-opacity">
                {editingProduct.id ? "Lưu Thay Đổi" : "Thêm Sản Phẩm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(26,26,26,0.7)", zIndex: 200 }} className="flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div style={{ background: "var(--color-cream)", maxWidth: "380px", width: "100%" }} className="p-7" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-xl font-normal mb-3">Xoá Sản Phẩm?</h3>
            <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-sm font-light mb-6">Hành động này không thể hoàn tác.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} style={{ flex: 1, border: "1px solid var(--color-champagne)", color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="py-3 text-xs tracking-widest uppercase">Giữ Lại</button>
              <button onClick={() => handleDelete(deleteTarget)} style={{ flex: 1, background: "#c0392b", color: "white", fontFamily: "var(--font-body)" }} className="py-3 text-xs tracking-widest uppercase hover:opacity-80">Xoá</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
