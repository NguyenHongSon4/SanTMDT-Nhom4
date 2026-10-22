import { useState } from "react";
import type { CartItem, Page } from "../App";

interface CartPageProps {
  cart: CartItem[];
  updateCart: (id: string, variant: string, qty: number) => void;
  navigate: (p: Page) => void;
}

const fmt = (n: number) => n.toLocaleString("vi-VN") + "₫";

const promos: Record<string, number> = {
  LUMIERE15: 0.15,
  BEAUTY10: 0.10,
};

export default function CartPage({ cart, updateCart, navigate }: CartPageProps) {
  const [promo, setPromo] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState("");

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = appliedPromo ? subtotal * promos[appliedPromo] : 0;
  const shipping = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal - discount + shipping;

  const handlePromo = () => {
    const code = promo.trim().toUpperCase();
    if (promos[code]) {
      setAppliedPromo(code);
      setPromoError("");
    } else {
      setPromoError("Mã không hợp lệ hoặc đã hết hạn");
    }
  };

  return (
    <div style={{ paddingTop: "64px", minHeight: "100vh", background: "var(--color-cream)" }}>
      {/* Header */}
      <div style={{ background: "var(--color-charcoal)" }} className="py-12 text-center">
        <p style={{ color: "var(--color-gold)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase mb-3">
          Tóm Tắt Đơn Hàng
        </p>
        <h1 style={{ fontFamily: "var(--font-display)", color: "var(--color-champagne)" }} className="text-4xl font-normal italic">
          Giỏ Hàng
        </h1>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12">
        {cart.length === 0 ? (
          <div className="text-center py-24">
            <svg className="mx-auto mb-6 opacity-20" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-charcoal)" strokeWidth="1">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <p style={{ fontFamily: "var(--font-display)", color: "var(--color-warm-gray)" }} className="text-2xl font-normal italic mb-6">
              Giỏ hàng của bạn đang trống
            </p>
            <button
              onClick={() => navigate("products")}
              style={{ background: "var(--color-charcoal)", color: "var(--color-champagne)", fontFamily: "var(--font-body)" }}
              className="px-10 py-3 text-xs tracking-widest uppercase hover:opacity-80 transition-opacity"
            >
              Tiếp Tục Mua Sắm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Items */}
            <div className="lg:col-span-2 space-y-0">
              <div style={{ borderBottom: "1px solid var(--color-champagne)" }} className="pb-4 mb-4 hidden md:grid grid-cols-12 gap-4">
                {["Sản Phẩm", "Dung Tích", "Số Lượng", "Thành Tiền"].map((h, i) => (
                  <p
                    key={h}
                    style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }}
                    className={`text-xs tracking-widest uppercase ${i === 0 ? "col-span-5" : i === 1 ? "col-span-2 text-center" : i === 2 ? "col-span-3 text-center" : "col-span-2 text-right"}`}
                  >
                    {h}
                  </p>
                ))}
              </div>

              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.variant}`}
                  style={{ borderBottom: "1px solid var(--color-champagne)" }}
                  className="py-6 grid grid-cols-12 gap-4 items-center"
                >
                  {/* Product */}
                  <div className="col-span-12 md:col-span-5 flex gap-4 items-center">
                    <div style={{ background: "var(--color-mist)", width: "72px", height: "90px", flexShrink: 0 }}>
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-display)" }} className="font-normal text-sm leading-snug mb-1">
                        {item.name}
                      </p>
                      <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs font-light">
                        {fmt(item.price)}
                      </p>
                    </div>
                  </div>

                  {/* Variant */}
                  <div className="col-span-4 md:col-span-2 text-center">
                    <span style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase">
                      {item.variant}
                    </span>
                  </div>

                  {/* Qty */}
                  <div className="col-span-5 md:col-span-3 flex items-center justify-center gap-0">
                    <div style={{ border: "1px solid var(--color-champagne)" }} className="flex items-center">
                      <button
                        onClick={() => updateCart(item.id, item.variant, item.qty - 1)}
                        style={{ color: "var(--color-warm-gray)" }}
                        className="w-8 h-8 text-base flex items-center justify-center hover:bg-[var(--color-mist)] transition-colors"
                      >
                        −
                      </button>
                      <span style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="w-8 text-center text-sm">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateCart(item.id, item.variant, item.qty + 1)}
                        style={{ color: "var(--color-warm-gray)" }}
                        className="w-8 h-8 text-base flex items-center justify-center hover:bg-[var(--color-mist)] transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Total + Remove */}
                  <div className="col-span-3 md:col-span-2 flex items-center justify-end gap-3">
                    <span style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-sm font-medium">
                      {fmt(item.price * item.qty)}
                    </span>
                    <button
                      onClick={() => updateCart(item.id, item.variant, 0)}
                      style={{ color: "var(--color-warm-gray)" }}
                      className="hover:text-[var(--color-charcoal)] transition-colors"
                      aria-label="Xóa"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              {/* Continue shopping */}
              <div className="pt-6">
                <button
                  onClick={() => navigate("products")}
                  style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)", borderBottom: "1px solid var(--color-champagne)" }}
                  className="text-xs tracking-widest uppercase pb-1 hover:text-[var(--color-charcoal)] transition-colors"
                >
                  ← Tiếp Tục Mua Sắm
                </button>
              </div>
            </div>

            {/* Summary */}
            <div>
              <div style={{ background: "var(--color-mist)", border: "1px solid var(--color-champagne)" }} className="p-6">
                <h2 style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-xl font-normal mb-6">
                  Tóm Tắt Đơn Hàng
                </h2>

                {/* Promo */}
                <div className="mb-6">
                  <p style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase mb-2">
                    Mã Giảm Giá
                  </p>
                  <div className="flex gap-0">
                    <input
                      value={promo}
                      onChange={(e) => { setPromo(e.target.value); setPromoError(""); }}
                      placeholder="Nhập mã..."
                      style={{
                        fontFamily: "var(--font-body)",
                        border: "1px solid var(--color-champagne)",
                        background: "white",
                        color: "var(--color-charcoal)",
                      }}
                      className="flex-1 px-3 py-2 text-xs outline-none focus:border-[var(--color-charcoal)] placeholder:text-[var(--color-warm-gray)]"
                    />
                    <button
                      onClick={handlePromo}
                      style={{ background: "var(--color-charcoal)", color: "var(--color-champagne)", fontFamily: "var(--font-body)" }}
                      className="px-4 py-2 text-xs tracking-widest uppercase hover:opacity-80 transition-opacity"
                    >
                      Áp
                    </button>
                  </div>
                  {promoError && (
                    <p style={{ color: "#c0392b", fontFamily: "var(--font-body)" }} className="text-xs mt-1">{promoError}</p>
                  )}
                  {appliedPromo && (
                    <p style={{ color: "var(--color-gold)", fontFamily: "var(--font-body)" }} className="text-xs mt-1">
                      ✓ Áp dụng mã {appliedPromo} — giảm {Math.round(promos[appliedPromo] * 100)}%
                    </p>
                  )}
                </div>

                {/* Price breakdown */}
                <div className="space-y-3 mb-6">
                  {[
                    { label: "Tạm Tính", value: fmt(subtotal) },
                    ...(discount > 0 ? [{ label: "Giảm Giá", value: `-${fmt(discount)}` }] : []),
                    { label: shipping === 0 ? "Vận Chuyển (Miễn Phí)" : "Vận Chuyển", value: shipping === 0 ? "Miễn phí" : fmt(shipping) },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center">
                      <span style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs">{row.label}</span>
                      <span style={{ color: row.label === "Giảm Giá" ? "var(--color-gold)" : "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-sm font-light">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: "1px solid var(--color-champagne)" }} className="pt-4 mb-6 flex justify-between items-baseline">
                  <span style={{ fontFamily: "var(--font-body)", color: "var(--color-charcoal)" }} className="text-xs tracking-widest uppercase font-medium">
                    Tổng Cộng
                  </span>
                  <span style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-2xl font-normal">
                    {fmt(total)}
                  </span>
                </div>

                <button
                  onClick={() => navigate("checkout")}
                  style={{ background: "var(--color-charcoal)", color: "var(--color-champagne)", fontFamily: "var(--font-body)" }}
                  className="w-full py-4 text-xs tracking-widest uppercase font-medium hover:opacity-80 transition-opacity"
                >
                  Tiến Hành Thanh Toán
                </button>

                {/* Payment icons */}
                <div className="mt-4 flex items-center justify-center gap-3">
                  {["VNPAY", "MoMo", "VISA", "MC"].map((p) => (
                    <span key={p} style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs border border-[var(--color-champagne)] px-2 py-1">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
