import { useState, useEffect } from "react";
import type { Page, Product } from "../App";
import { fetchProducts } from "../services/productService";
import ProductCard from "../components/ProductCard";

interface ProductsPageProps {
  navigate: (p: Page, product?: Product) => void;
}

const sortOptions = [
  { value: "default", label: "Mặc Định" },
  { value: "price_asc", label: "Giá Tăng Dần" },
  { value: "price_desc", label: "Giá Giảm Dần" },
];

const priceRanges = [
  { label: "Tất Cả", min: 0, max: Infinity },
  { label: "< 500k", min: 0, max: 500000 },
  { label: "500k – 1 triệu", min: 500000, max: 1000000 },
  { label: "> 1 triệu", min: 1000000, max: Infinity },
];

export default function ProductsPage({ navigate }: ProductsPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sort, setSort] = useState("default");
  const [search, setSearch] = useState("");
  const [priceRangeIdx, setPriceRangeIdx] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const selectedRange = priceRanges[priceRangeIdx];
        const data = await fetchProducts({
          search: search || undefined,
          minPrice: selectedRange.min > 0 ? selectedRange.min : undefined,
          maxPrice: selectedRange.max < Infinity ? selectedRange.max : undefined,
          sort: sort === "default" ? undefined : sort,
        });
        if (!cancelled) setProducts(data);
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Không tải được sản phẩm");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [search, sort, priceRangeIdx]);

  return (
    <div style={{ paddingTop: "64px", minHeight: "100vh", background: "var(--color-cream)" }}>
      <div style={{ background: "var(--color-charcoal)" }} className="py-16 text-center">
        <p style={{ color: "var(--color-gold)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase mb-3">
          Bộ Sưu Tập
        </p>
        <h1 style={{ fontFamily: "var(--font-display)", color: "var(--color-champagne)" }} className="text-5xl font-normal italic">
          Sản Phẩm
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
        {/* Search */}
        <div className="relative mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo tên sản phẩm..."
            className="w-full px-4 py-3 text-sm outline-none"
            style={{
              fontFamily: "var(--font-body)",
              border: "1px solid var(--color-champagne)",
              background: "white",
              color: "var(--color-charcoal)",
            }}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8 items-center">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 text-sm"
            style={{ border: "1px solid var(--color-champagne)", fontFamily: "var(--font-body)" }}
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {priceRanges.map((r, i) => (
            <button
              key={r.label}
              onClick={() => setPriceRangeIdx(i)}
              className="px-3 py-2 text-xs tracking-widest uppercase"
              style={{
                fontFamily: "var(--font-body)",
                background: priceRangeIdx === i ? "var(--color-charcoal)" : "transparent",
                color: priceRangeIdx === i ? "white" : "var(--color-charcoal)",
                border: "1px solid var(--color-champagne)",
              }}
            >
              {r.label}
            </button>
          ))}
        </div>

        {loading && (
          <p className="text-center py-20 opacity-60" style={{ fontFamily: "var(--font-body)" }}>
            Đang tải sản phẩm...
          </p>
        )}

        {error && (
          <p className="text-center py-20" style={{ color: "#c0392b", fontFamily: "var(--font-body)" }}>
            {error}
          </p>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="text-center py-20 opacity-60" style={{ fontFamily: "var(--font-body)" }}>
            Chưa có sản phẩm nào.
          </p>
        )}

        {!loading && !error && products.length > 0 && (
          <>
            <p className="text-sm mb-6 opacity-60" style={{ fontFamily: "var(--font-body)" }}>
              {products.length} sản phẩm
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} navigate={navigate} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}