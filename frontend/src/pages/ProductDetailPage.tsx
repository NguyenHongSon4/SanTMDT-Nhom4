import { useState } from "react";
import type { Product, Page, AppUser } from "../App";
import { products } from "../data/products";
import ProductCard from "../components/ProductCard";
import ReviewSection from "../components/ReviewSection";

interface Props {
  product: Product;
  navigate: (p: Page, product?: Product) => void;
  addToCart: (product: Product, variant: string, qty: number) => void;
  user: AppUser | null;
}

const fmt = (n: number) => n.toLocaleString("vi-VN") + "₫";

const variants = ["30ml", "50ml", "100ml"];

export default function ProductDetailPage({ product, navigate, addToCart, user }: Props) {
  const [selectedVariant, setSelectedVariant] = useState(variants[1]);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc" | "ingredients" | "guide">("desc");
  const [added, setAdded] = useState(false);

  const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 3);

  const handleAdd = () => {
    addToCart(product, selectedVariant, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div style={{ paddingTop: "64px", background: "var(--color-cream)", minHeight: "100vh" }}>
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-8 pb-0">
        <nav style={{ fontFamily: "var(--font-body)" }} className="flex items-center gap-2 text-xs tracking-widest uppercase">
          <button onClick={() => navigate("home")} style={{ color: "var(--color-warm-gray)" }} className="hover:text-[var(--color-charcoal)] transition-colors">
            Trang Chủ
          </button>
          <span style={{ color: "var(--color-champagne)" }}>·</span>
          <button onClick={() => navigate("products")} style={{ color: "var(--color-warm-gray)" }} className="hover:text-[var(--color-charcoal)] transition-colors">
            Sản Phẩm
          </button>
          <span style={{ color: "var(--color-champagne)" }}>·</span>
          <span style={{ color: "var(--color-charcoal)" }}>{product.category}</span>
        </nav>
      </div>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image */}
          <div className="relative" style={{ background: "var(--color-mist)", aspectRatio: "4/5" }}>
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.isNew && (
              <div className="absolute top-4 left-4">
                <span style={{ background: "var(--color-charcoal)", color: "var(--color-gold)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase px-3 py-1">
                  Mới
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase mb-2">
              {product.brand} · {product.category}
            </p>
            <h1 style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-4xl font-normal mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i < Math.floor(product.rating) ? "var(--color-gold)" : "none"} stroke="var(--color-gold)" strokeWidth="1.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <span style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs">
                {product.rating} ({product.reviews} đánh giá)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-8">
              <span style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-3xl font-normal">
                {fmt(product.price)}
              </span>
              {product.originalPrice && (
                <span style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-sm line-through">
                  {fmt(product.originalPrice)}
                </span>
              )}
              {product.originalPrice && (
                <span style={{ background: "rgba(201,168,130,0.15)", color: "var(--color-gold)", fontFamily: "var(--font-body)" }} className="text-xs px-2 py-1">
                  -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                </span>
              )}
            </div>

            {/* Variant */}
            <div className="mb-6">
              <p style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase mb-3">
                Dung Tích: <span style={{ color: "var(--color-gold)" }}>{selectedVariant}</span>
              </p>
              <div className="flex gap-2">
                {variants.map((v) => (
                  <button
                    key={v}
                    onClick={() => setSelectedVariant(v)}
                    style={{
                      fontFamily: "var(--font-body)",
                      background: selectedVariant === v ? "var(--color-charcoal)" : "transparent",
                      color: selectedVariant === v ? "var(--color-champagne)" : "var(--color-warm-gray)",
                      border: selectedVariant === v ? "1px solid var(--color-charcoal)" : "1px solid var(--color-champagne)",
                    }}
                    className="px-5 py-2 text-xs tracking-widest uppercase transition-all hover:border-[var(--color-charcoal)]"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Qty + Add to cart */}
            <div className="flex gap-0 mb-6">
              <div style={{ border: "1px solid var(--color-champagne)" }} className="flex items-center">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }}
                  className="w-10 h-12 text-lg flex items-center justify-center hover:bg-[var(--color-mist)] transition-colors"
                >
                  −
                </button>
                <span style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="w-10 text-center text-sm font-medium">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(qty + 1)}
                  style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }}
                  className="w-10 h-12 text-lg flex items-center justify-center hover:bg-[var(--color-mist)] transition-colors"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAdd}
                style={{
                  background: added ? "var(--color-gold)" : "var(--color-charcoal)",
                  color: added ? "var(--color-charcoal)" : "var(--color-champagne)",
                  fontFamily: "var(--font-body)",
                  transition: "all 0.3s",
                }}
                className="flex-1 h-12 text-xs tracking-widest uppercase font-medium hover:opacity-80"
              >
                {added ? "✓ Đã Thêm Vào Giỏ" : "Thêm Vào Giỏ Hàng"}
              </button>
            </div>

            {/* Buy now */}
            <button
              onClick={() => { addToCart(product, selectedVariant, qty); navigate("cart"); }}
              style={{ border: "1px solid var(--color-charcoal)", color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }}
              className="w-full h-12 text-xs tracking-widest uppercase font-medium hover:bg-[var(--color-charcoal)] hover:text-[var(--color-champagne)] transition-colors mb-8"
            >
              Mua Ngay
            </button>

            {/* Trust signals */}
            <div style={{ borderTop: "1px solid var(--color-champagne)" }} className="pt-6 space-y-2">
              {[
                "Miễn phí vận chuyển cho đơn từ 500.000₫",
                "Đổi trả miễn phí trong 30 ngày",
                "Hàng chính hãng, có tem bảo đảm",
              ].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <span style={{ color: "var(--color-gold)" }} className="text-xs">✦</span>
                  <span style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs font-light">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ borderTop: "1px solid var(--color-champagne)" }} className="mt-16 pt-0">
          <div className="flex border-b" style={{ borderColor: "var(--color-champagne)" }}>
            {(["desc", "ingredients", "guide"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  fontFamily: "var(--font-body)",
                  color: tab === t ? "var(--color-charcoal)" : "var(--color-warm-gray)",
                  borderBottom: tab === t ? "2px solid var(--color-charcoal)" : "2px solid transparent",
                  marginBottom: "-1px",
                }}
                className="px-6 py-4 text-xs tracking-widest uppercase transition-colors hover:text-[var(--color-charcoal)]"
              >
                {t === "desc" ? "Mô Tả" : t === "ingredients" ? "Thành Phần" : "Hướng Dẫn"}
              </button>
            ))}
          </div>
          <div className="py-8 max-w-2xl">
            {tab === "desc" && (
              <p style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-sm font-light leading-relaxed">
                {product.description}
              </p>
            )}
            {tab === "ingredients" && (
              <p style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-sm font-light leading-loose">
                {product.ingredients}
              </p>
            )}
            {tab === "guide" && (
              <div style={{ fontFamily: "var(--font-body)" }} className="space-y-3">
                {[
                  "Làm sạch da mặt với sữa rửa mặt phù hợp.",
                  "Dùng toner cân bằng da.",
                  "Lấy 2-3 giọt sản phẩm vào lòng bàn tay.",
                  "Vỗ nhẹ lên toàn bộ khuôn mặt và cổ.",
                  "Sử dụng buổi sáng và tối để đạt hiệu quả tốt nhất.",
                ].map((step, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <span style={{ color: "var(--color-gold)", minWidth: "20px" }} className="text-xs font-medium">0{i + 1}</span>
                    <p style={{ color: "var(--color-charcoal)" }} className="text-sm font-light">{step}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <ReviewSection
          productId={product.id}
          productRating={product.rating}
          totalReviews={product.reviews}
          user={user}
          navigate={navigate}
        />

        {/* Related */}
        {related.length > 0 && (
          <div style={{ borderTop: "1px solid var(--color-champagne)" }} className="pt-12 mt-4">
            <h2 style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-2xl font-normal mb-8">
              Sản Phẩm Liên Quan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} navigate={navigate} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
