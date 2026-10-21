import type { Product, Page } from "../App";

interface ProductCardProps {
  product: Product;
  navigate: (p: Page, product?: Product) => void;
}

const fmt = (n: number) =>
  n.toLocaleString("vi-VN") + "₫";

export default function ProductCard({ product, navigate }: ProductCardProps) {
  return (
    <div
      className="group cursor-pointer"
      onClick={() => navigate("detail", product)}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden mb-4"
        style={{ background: "var(--color-mist)", aspectRatio: "4/5" }}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.isNew && (
            <span
              style={{ background: "var(--color-charcoal)", color: "var(--color-gold)", fontFamily: "var(--font-body)" }}
              className="text-xs font-medium tracking-widest uppercase px-2 py-1"
            >
              Mới
            </span>
          )}
          {product.isBestseller && (
            <span
              style={{ background: "var(--color-gold)", color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }}
              className="text-xs font-medium tracking-widest uppercase px-2 py-1"
            >
              Bán Chạy
            </span>
          )}
        </div>
        {/* Overlay CTA */}
        <div
          style={{ background: "rgba(26,26,26,0.85)" }}
          className="absolute inset-x-0 bottom-0 py-3 flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300"
        >
          <span style={{ color: "var(--color-champagne)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase font-medium">
            Xem Chi Tiết
          </span>
        </div>
      </div>

      {/* Info */}
      <div>
        <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase mb-1">
          {product.brand}
        </p>
        <h3
          style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }}
          className="font-normal text-base mb-2 leading-snug"
        >
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="font-medium text-sm">
            {fmt(product.price)}
          </span>
          {product.originalPrice && (
            <span style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs line-through">
              {fmt(product.originalPrice)}
            </span>
          )}
        </div>
        {/* Stars */}
        <div className="flex items-center gap-1 mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill={i < Math.floor(product.rating) ? "var(--color-gold)" : "none"}
              stroke="var(--color-gold)"
              strokeWidth="1.5"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ))}
          <span style={{ color: "var(--color-warm-gray)" }} className="text-xs ml-1">({product.reviews})</span>
        </div>
      </div>
    </div>
  );
}
