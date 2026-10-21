import { useState } from "react";
import type { Page } from "../App";
import { products, categories } from "../data/products";
import ProductCard from "../components/ProductCard";

interface ProductsPageProps {
  navigate: (p: Page, product?: any) => void;
}

const sortOptions = [
  { value: "default", label: "Mặc Định" },
  { value: "price-asc", label: "Giá Tăng Dần" },
  { value: "price-desc", label: "Giá Giảm Dần" },
  { value: "rating", label: "Đánh Giá Cao Nhất" },
];

const priceRanges = [
  { label: "Tất Cả", min: 0, max: Infinity },
  { label: "< 1 triệu", min: 0, max: 1000000 },
  { label: "1 – 2 triệu", min: 1000000, max: 2000000 },
  { label: "2 – 3 triệu", min: 2000000, max: 3000000 },
  { label: "> 3 triệu", min: 3000000, max: Infinity },
];

export default function ProductsPage({ navigate }: ProductsPageProps) {
  const [activeCategory, setActiveCategory] = useState("Tất Cả");
  const [sort, setSort] = useState("default");
  const [search, setSearch] = useState("");
  const [priceRangeIdx, setPriceRangeIdx] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const selectedRange = priceRanges[priceRangeIdx];

  const filtered = products
    .filter((p) => {
      const matchCat = activeCategory === "Tất Cả" || p.category === activeCategory;
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase());
      const matchPrice = p.price >= selectedRange.min && p.price < selectedRange.max;
      return matchCat && matchSearch && matchPrice;
    })
    .slice()
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      return 0;
    });

  const hasActiveFilters = activeCategory !== "Tất Cả" || priceRangeIdx !== 0 || search;

  const clearAll = () => {
    setActiveCategory("Tất Cả");
    setPriceRangeIdx(0);
    setSearch("");
    setSort("default");
  };

  return (
    <div style={{ paddingTop: "64px", minHeight: "100vh", background: "var(--color-cream)" }}>
      {/* Page header */}
      <div style={{ background: "var(--color-charcoal)" }} className="py-16 text-center">
        <p style={{ color: "var(--color-gold)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase mb-3">Bộ Sưu Tập</p>
        <h1 style={{ fontFamily: "var(--font-display)", color: "var(--color-champagne)" }} className="text-5xl font-normal italic">Sản Phẩm</h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
        {/* Search bar */}
        <div className="relative mb-8">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-warm-gray)" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo tên sản phẩm hoặc thương hiệu..."
            style={{
              fontFamily: "var(--font-body)",
              border: "1px solid var(--color-champagne)",
              background: "white",
              color: "var(--color-charcoal)",
            }}
            className="w-full pl-11 pr-4 py-3.5 text-sm outline-none focus:border-[var(--color-charcoal)] transition-colors placeholder:opacity-40"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{ color: "var(--color-warm-gray)" }}
              className="absolute right-4 top-1/2 -translate-y-1/2 hover:text-[var(--color-charcoal)] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        {/* Filters row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  fontFamily: "var(--font-body)",
                  background: activeCategory === cat ? "var(--color-charcoal)" : "transparent",
                  color: activeCategory === cat ? "var(--color-champagne)" : "var(--color-warm-gray)",
                  border: activeCategory === cat ? "1px solid var(--color-charcoal)" : "1px solid var(--color-champagne)",
                }}
                className="px-5 py-2 text-xs tracking-widest uppercase transition-all hover:border-[var(--color-charcoal)] hover:text-[var(--color-charcoal)]"
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {/* Price filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                fontFamily: "var(--font-body)",
                border: "1px solid var(--color-champagne)",
                color: showFilters ? "var(--color-charcoal)" : "var(--color-warm-gray)",
                background: showFilters ? "var(--color-mist)" : "transparent",
              }}
              className="px-4 py-2 text-xs tracking-widest uppercase transition-all flex items-center gap-2"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="10" y2="18"/>
              </svg>
              Lọc Giá
            </button>

            {/* Sort */}
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              style={{
                fontFamily: "var(--font-body)",
                background: "transparent",
                border: "1px solid var(--color-champagne)",
                color: "var(--color-warm-gray)",
              }}
              className="px-4 py-2 text-xs tracking-widest uppercase outline-none cursor-pointer"
            >
              {sortOptions.map(o => (
                <option key={o.value} value={o.value} style={{ background: "var(--color-cream)", color: "var(--color-charcoal)" }}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Price filter panel */}
        {showFilters && (
          <div style={{ background: "var(--color-mist)", border: "1px solid var(--color-champagne)" }} className="p-4 mb-6">
            <p style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase mb-3">Khoảng Giá</p>
            <div className="flex flex-wrap gap-2">
              {priceRanges.map((r, i) => (
                <button
                  key={r.label}
                  onClick={() => setPriceRangeIdx(i)}
                  style={{
                    fontFamily: "var(--font-body)",
                    background: priceRangeIdx === i ? "var(--color-charcoal)" : "white",
                    color: priceRangeIdx === i ? "var(--color-champagne)" : "var(--color-warm-gray)",
                    border: priceRangeIdx === i ? "1px solid var(--color-charcoal)" : "1px solid var(--color-champagne)",
                  }}
                  className="px-4 py-2 text-xs tracking-widest uppercase transition-all"
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active filters summary + clear */}
        <div className="flex items-center justify-between mb-6">
          <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase">
            {filtered.length} sản phẩm
            {search && <span> · "{search}"</span>}
            {activeCategory !== "Tất Cả" && <span> · {activeCategory}</span>}
            {priceRangeIdx !== 0 && <span> · {priceRanges[priceRangeIdx].label}</span>}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              style={{ color: "var(--color-gold)", fontFamily: "var(--font-body)", borderBottom: "1px solid var(--color-gold)" }}
              className="text-xs tracking-widest uppercase pb-0.5 hover:opacity-70 transition-opacity"
            >
              Xoá Bộ Lọc
            </button>
          )}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} navigate={navigate} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p style={{ fontFamily: "var(--font-display)", color: "var(--color-warm-gray)" }} className="text-2xl font-normal italic mb-4">
              Không tìm thấy sản phẩm
            </p>
            <button onClick={clearAll} style={{ color: "var(--color-gold)", fontFamily: "var(--font-body)", borderBottom: "1px solid var(--color-gold)" }} className="text-xs tracking-widest uppercase">
              Xoá Bộ Lọc
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
