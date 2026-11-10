import { useState, useEffect } from "react";
import type { Page, Product } from "../App";
import { fetchActiveCategories, fetchProducts } from "../services/productService";
import { fetchActiveBrands } from "../services/brandService";
import ProductCard from "../components/ProductCard";

interface ProductsPageProps {
  navigate: (p: Page, product?: Product) => void;
}

const sortOptions = [
  { value: "default", label: "Mặc Định" },
  { value: "name_asc", label: "Tên A – Z" },
  { value: "name_desc", label: "Tên Z – A" },
  { value: "price_asc", label: "Giá Tăng Dần" },
  { value: "price_desc", label: "Giá Giảm Dần" },
];

const MIN_PRICE = 1_000;
const MAX_PRICE = 100_000_000;
const formatPrice = (price: number) => `${price.toLocaleString("vi-VN")} đ`;

export default function ProductsPage({ navigate }: ProductsPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sort, setSort] = useState("default");
  const [search, setSearch] = useState("");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [priceFilterEnabled, setPriceFilterEnabled] = useState(false);
  const [minPrice, setMinPrice] = useState(MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);

  useEffect(() => {
    fetchActiveBrands().then(setBrands).catch(() => setBrands([]));
    fetchActiveCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchProducts({
          search: search || undefined,
          brandId: brandId || undefined,
          categoryId: categoryId || undefined,
          minPrice: priceFilterEnabled ? minPrice : undefined,
          maxPrice: priceFilterEnabled ? maxPrice : undefined,
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
  }, [search, sort, brandId, categoryId, priceFilterEnabled, minPrice, maxPrice]);

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
        <div className="flex flex-wrap gap-3 mb-5 items-center">
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

          <select
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            className="px-3 py-2 text-sm bg-transparent"
            style={{ border: "1px solid var(--color-champagne)", fontFamily: "var(--font-body)" }}
            aria-label="Lọc theo thương hiệu"
          >
            <option value="">Tất cả thương hiệu</option>
            {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
          </select>

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="px-3 py-2 text-sm bg-transparent"
            style={{ border: "1px solid var(--color-champagne)", fontFamily: "var(--font-body)" }}
            aria-label="Lọc theo danh mục sản phẩm"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </div>

        <section className="mb-8 p-4 md:p-5" style={{ border: "1px solid var(--color-champagne)", background: "rgba(255,255,255,.45)" }} aria-label="Lọc theo khoảng giá">
          <div className="flex flex-wrap justify-between gap-2 mb-3">
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer" style={{ fontFamily: "var(--font-body)" }}>
              <input type="checkbox" checked={priceFilterEnabled} onChange={(e) => setPriceFilterEnabled(e.target.checked)} aria-label="Bật lọc theo khoảng giá" />
              Khoảng giá
            </label>
            <span className="text-sm" style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)", opacity: priceFilterEnabled ? 1 : 0.5 }}>{priceFilterEnabled ? `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}` : "Không áp dụng"}</span>
          </div>
          <div className={`relative h-8 flex items-center ${priceFilterEnabled ? "" : "opacity-40"}`}>
            <div className="absolute left-0 right-0 h-1 rounded-full" style={{ background: "var(--color-champagne)" }} />
            <div
              className="absolute h-1 rounded-full"
              style={{
                left: `${((minPrice - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100}%`,
                right: `${100 - ((maxPrice - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100}%`,
                background: "var(--color-charcoal)",
              }}
            />
            <input
              type="range" min={MIN_PRICE} max={MAX_PRICE} step={1000} value={minPrice}
              onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice))}
              className="price-range-thumb absolute inset-0 w-full"
              disabled={!priceFilterEnabled}
              aria-label="Giá thấp nhất"
            />
            <input
              type="range" min={MIN_PRICE} max={MAX_PRICE} step={1000} value={maxPrice}
              onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice))}
              className="price-range-thumb absolute inset-0 w-full"
              disabled={!priceFilterEnabled}
              aria-label="Giá cao nhất"
            />
            <style>{`
              .price-range-thumb { appearance: none; -webkit-appearance: none; background: transparent; pointer-events: none; }
              .price-range-thumb::-webkit-slider-thumb { appearance: none; -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: var(--color-charcoal); border: 2px solid var(--color-cream); cursor: grab; pointer-events: auto; }
              .price-range-thumb::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: var(--color-charcoal); border: 2px solid var(--color-cream); cursor: grab; pointer-events: auto; }
              .price-range-thumb:focus-visible::-webkit-slider-thumb { outline: 2px solid var(--color-gold); outline-offset: 2px; }
              .price-range-thumb:focus-visible::-moz-range-thumb { outline: 2px solid var(--color-gold); outline-offset: 2px; }
            `}</style>
          </div>
          <div className="flex justify-between text-xs opacity-60 mt-1" style={{ fontFamily: "var(--font-body)" }}><span>{formatPrice(MIN_PRICE)}</span><span>{formatPrice(MAX_PRICE)}</span></div>
        </section>

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
