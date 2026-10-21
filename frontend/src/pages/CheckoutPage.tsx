import { useState } from "react";
import type { CartItem, Page, AppUser, Order } from "../App";

interface CheckoutPageProps {
  cart: CartItem[];
  navigate: (p: Page) => void;
  user: AppUser | null;
  onOrderPlaced: (order: Order) => void;
}

const fmt = (n: number) => n.toLocaleString("vi-VN") + "₫";

const cities = ["TP.HCM", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Huế", "Nha Trang", "Hải Phòng"];

// ─── Promo code catalogue ────────────────────────────────────────────────────
type PromoType = "percent" | "fixed";

interface PromoCode {
  code: string;
  type: PromoType;
  value: number;          // percent (0-100) or fixed VND
  minOrder: number;       // minimum subtotal to apply
  label: string;
  expiry: string;
}

const PROMO_CODES: Record<string, PromoCode> = {
  LUMIERE15: { code: "LUMIERE15", type: "percent", value: 15, minOrder: 0,       label: "Giảm 15% toàn đơn",           expiry: "2025-12-31" },
  BEAUTY10:  { code: "BEAUTY10",  type: "percent", value: 10, minOrder: 1000000, label: "Giảm 10% (đơn từ 1 triệu)",   expiry: "2025-12-31" },
  VIP20:     { code: "VIP20",     type: "percent", value: 20, minOrder: 3000000, label: "Giảm 20% (đơn từ 3 triệu)",   expiry: "2025-12-31" },
  SAVE50K:   { code: "SAVE50K",   type: "fixed",   value: 50000,  minOrder: 500000,  label: "Giảm 50.000₫",            expiry: "2025-12-31" },
  WELCOME:   { code: "WELCOME",   type: "fixed",   value: 100000, minOrder: 0,       label: "Giảm 100.000₫ chào mừng", expiry: "2025-12-31" },
  FREESHIP:  { code: "FREESHIP",  type: "fixed",   value: 30000,  minOrder: 0,       label: "Miễn phí vận chuyển",     expiry: "2025-12-31" },
};

function calcDiscount(promo: PromoCode, subtotal: number): number {
  if (subtotal < promo.minOrder) return 0;
  if (promo.type === "percent") return Math.round((subtotal * promo.value) / 100);
  return promo.value;
}

// ─── Order summary panel ─────────────────────────────────────────────────────
interface SummaryProps {
  cart: CartItem[];
  subtotal: number;
  shipping: number;
  appliedPromo: PromoCode | null;
  discount: number;
  total: number;
  promoInput: string;
  onPromoInputChange: (v: string) => void;
  onApplyPromo: () => void;
  onRemovePromo: () => void;
  promoError: string;
}

function OrderSummary({
  cart, subtotal, shipping, appliedPromo, discount, total,
  promoInput, onPromoInputChange, onApplyPromo, onRemovePromo, promoError,
}: SummaryProps) {
  const [showHints, setShowHints] = useState(false);

  return (
    <div style={{ background: "var(--color-mist)", border: "1px solid var(--color-champagne)" }} className="p-6 sticky top-24">
      <h3 style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-lg font-normal mb-5">
        Đơn Hàng ({cart.reduce((s, i) => s + i.qty, 0)} sản phẩm)
      </h3>

      {/* Cart items */}
      <div className="space-y-4 mb-5" style={{ borderBottom: "1px solid var(--color-champagne)", paddingBottom: "16px" }}>
        {cart.map((item) => (
          <div key={`${item.id}-${item.variant}`} className="flex gap-3 items-center">
            <div style={{ position: "relative", flexShrink: 0 }}>
              <img src={item.image} alt={item.name} style={{ width: "52px", height: "64px", objectFit: "cover" }} />
              <span style={{ position: "absolute", top: "-6px", right: "-6px", background: "var(--color-charcoal)", color: "var(--color-champagne)", fontFamily: "var(--font-body)", width: "20px", height: "20px", borderRadius: "50%", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {item.qty}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-display)" }} className="text-xs font-normal leading-snug truncate">{item.name}</p>
              <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs">{item.variant}</p>
            </div>
            <p style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-xs font-medium flex-shrink-0">{fmt(item.price * item.qty)}</p>
          </div>
        ))}
      </div>

      {/* Promo code input */}
      <div style={{ borderBottom: "1px solid var(--color-champagne)" }} className="pb-5 mb-4">
        <p style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase mb-3 font-medium">
          Mã Giảm Giá
        </p>

        {appliedPromo ? (
          /* Applied state */
          <div style={{ background: "rgba(201,168,130,0.12)", border: "1px solid rgba(201,168,130,0.4)" }} className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  <p style={{ color: "var(--color-gold)", fontFamily: "var(--font-body)" }} className="text-xs font-medium tracking-widest uppercase">
                    {appliedPromo.code}
                  </p>
                </div>
                <p style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-xs font-light">
                  {appliedPromo.label}
                </p>
                <p style={{ color: "var(--color-gold)", fontFamily: "var(--font-body)" }} className="text-sm font-medium mt-1">
                  -{fmt(discount)}
                </p>
              </div>
              <button
                onClick={onRemovePromo}
                style={{ color: "var(--color-warm-gray)", flexShrink: 0 }}
                className="hover:text-[var(--color-charcoal)] transition-colors mt-0.5"
                aria-label="Xoá mã"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        ) : (
          /* Input state */
          <div>
            <div className="flex gap-0">
              <input
                value={promoInput}
                onChange={(e) => onPromoInputChange(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && onApplyPromo()}
                placeholder="Nhập mã..."
                style={{
                  fontFamily: "var(--font-body)",
                  border: promoError ? "1px solid #c0392b" : "1px solid var(--color-champagne)",
                  background: "white",
                  color: "var(--color-charcoal)",
                  letterSpacing: "0.05em",
                }}
                className="flex-1 px-3 py-2.5 text-xs outline-none focus:border-[var(--color-charcoal)] transition-colors placeholder:opacity-40 placeholder:tracking-normal"
              />
              <button
                onClick={onApplyPromo}
                style={{ background: "var(--color-charcoal)", color: "var(--color-champagne)", fontFamily: "var(--font-body)" }}
                className="px-4 text-xs tracking-widest uppercase hover:opacity-80 transition-opacity flex-shrink-0"
              >
                Áp Dụng
              </button>
            </div>

            {promoError && (
              <p style={{ color: "#c0392b", fontFamily: "var(--font-body)" }} className="text-xs mt-1.5">
                {promoError}
              </p>
            )}

            {/* Hint toggle */}
            <button
              onClick={() => setShowHints(!showHints)}
              style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }}
              className="text-xs mt-2 hover:text-[var(--color-charcoal)] transition-colors flex items-center gap-1"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Xem mã có sẵn
            </button>

            {showHints && (
              <div style={{ border: "1px solid var(--color-champagne)", background: "white" }} className="mt-2 divide-y divide-[var(--color-champagne)]">
                {Object.values(PROMO_CODES).map((p) => {
                  const eligible = subtotal >= p.minOrder;
                  return (
                    <button
                      key={p.code}
                      onClick={() => { if (eligible) { onPromoInputChange(p.code); setShowHints(false); } }}
                      disabled={!eligible}
                      style={{ width: "100%", textAlign: "left", opacity: eligible ? 1 : 0.45, cursor: eligible ? "pointer" : "not-allowed" }}
                      className="px-3 py-2.5 hover:bg-[var(--color-mist)] transition-colors disabled:hover:bg-transparent"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-xs font-medium tracking-widest">
                            {p.code}
                          </p>
                          <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs font-light mt-0.5">
                            {p.label}
                            {p.minOrder > 0 && !eligible && ` · cần thêm ${fmt(p.minOrder - subtotal)}`}
                          </p>
                        </div>
                        <span style={{ color: "var(--color-gold)", fontFamily: "var(--font-body)" }} className="text-xs font-medium flex-shrink-0">
                          {p.type === "percent" ? `-${p.value}%` : `-${fmt(p.value)}`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Price breakdown */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs">Tạm tính</span>
          <span style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-xs">{fmt(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <span style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs flex items-center gap-1">
              <span style={{ color: "var(--color-gold)" }}>✦</span>
              Giảm giá ({appliedPromo?.code})
            </span>
            <span style={{ color: "var(--color-gold)", fontFamily: "var(--font-body)" }} className="text-xs font-medium">-{fmt(discount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs">Vận chuyển</span>
          <span style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-xs">{shipping === 0 ? "Miễn phí" : fmt(shipping)}</span>
        </div>
      </div>

      {/* Total */}
      <div style={{ borderTop: "1px solid var(--color-champagne)" }} className="pt-4 flex justify-between items-baseline">
        <span style={{ fontFamily: "var(--font-body)", color: "var(--color-charcoal)" }} className="text-xs tracking-widest uppercase font-medium">Tổng Cộng</span>
        <div className="text-right">
          {discount > 0 && (
            <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs line-through">{fmt(subtotal + shipping)}</p>
          )}
          <span style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-2xl">{fmt(total)}</span>
        </div>
      </div>

      {discount > 0 && (
        <div style={{ background: "rgba(201,168,130,0.1)", border: "1px solid rgba(201,168,130,0.3)" }} className="mt-3 px-3 py-2 text-center">
          <p style={{ color: "var(--color-gold)", fontFamily: "var(--font-body)" }} className="text-xs">
            Bạn đang tiết kiệm <strong>{fmt(discount)}</strong> với mã này!
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function CheckoutPage({ cart, navigate, user, onOrderPlaced }: CheckoutPageProps) {
  const [step, setStep] = useState<"address" | "payment" | "success">("address");

  const [name, setName]       = useState(user?.name ?? "");
  const [phone, setPhone]     = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity]       = useState("TP.HCM");
  const [note, setNote]       = useState("");
  const [payment, setPayment] = useState<"cod" | "transfer">("cod");
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);

  // Promo state
  const [promoInput, setPromoInput]       = useState("");
  const [appliedPromo, setAppliedPromo]   = useState<PromoCode | null>(null);
  const [promoError, setPromoError]       = useState("");

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= 500000 ? 0 : 30000;
  const discount = appliedPromo ? calcDiscount(appliedPromo, subtotal) : 0;
  const total    = Math.max(0, subtotal + shipping - discount);

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) { setPromoError("Vui lòng nhập mã giảm giá"); return; }
    const promo = PROMO_CODES[code];
    if (!promo) { setPromoError("Mã giảm giá không tồn tại hoặc đã hết hạn"); return; }
    if (subtotal < promo.minOrder) {
      setPromoError(`Mã này yêu cầu đơn hàng tối thiểu ${fmt(promo.minOrder)}`);
      return;
    }
    setAppliedPromo(promo);
    setPromoError("");
    setPromoInput("");
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoError("");
    setPromoInput("");
  };

  const validateAddress = () => {
    const e: Record<string, string> = {};
    if (!name.trim())    e.name    = "Vui lòng nhập họ tên";
    if (!phone.trim())   e.phone   = "Vui lòng nhập số điện thoại";
    if (!address.trim()) e.address = "Vui lòng nhập địa chỉ";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlaceOrder = () => {
    setPlacing(true);
    setTimeout(() => {
      const order: Order = {
        id: `LM-2025-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        items: cart,
        subtotal,
        discount,
        shipping,
        total,
        address,
        city,
        phone,
        payment,
        note,
        createdAt: new Date().toISOString().split("T")[0],
        status: "pending",
      };
      onOrderPlaced(order);
      setPlacing(false);
      setStep("success");
    }, 1200);
  };

  const inputStyle = {
    fontFamily: "var(--font-body)",
    border: "1px solid var(--color-champagne)",
    background: "white",
    color: "var(--color-charcoal)",
  };
  const inputCls = "w-full px-4 py-3 text-sm outline-none placeholder:opacity-40 focus:border-[var(--color-charcoal)] transition-colors";

  const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div>
      <label style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="block text-xs tracking-widest uppercase mb-2">
        {label}
      </label>
      {children}
      {error && <p style={{ color: "#c0392b", fontFamily: "var(--font-body)" }} className="text-xs mt-1">{error}</p>}
    </div>
  );

  // ── Success screen ──────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <div style={{ paddingTop: "64px", minHeight: "100vh", background: "var(--color-cream)" }} className="flex items-center justify-center py-20 px-4">
        <div className="text-center max-w-md">
          <div style={{ width: "72px", height: "72px", background: "var(--color-charcoal)" }} className="mx-auto flex items-center justify-center mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase mb-3">Đặt Hàng Thành Công</p>
          <h1 style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-4xl font-normal italic mb-4">
            Cảm ơn bạn!
          </h1>
          <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-sm font-light leading-relaxed mb-6">
            Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.<br />
            Chúng tôi sẽ liên hệ xác nhận qua số <strong>{phone}</strong> trong thời gian sớm nhất.
          </p>

          {/* Savings callout */}
          {discount > 0 && (
            <div style={{ background: "rgba(201,168,130,0.12)", border: "1px solid rgba(201,168,130,0.35)" }} className="p-3 mb-6">
              <p style={{ color: "var(--color-gold)", fontFamily: "var(--font-body)" }} className="text-sm">
                ✦ Bạn đã tiết kiệm <strong>{fmt(discount)}</strong> với mã <strong>{appliedPromo?.code}</strong>
              </p>
            </div>
          )}

          {/* Order total */}
          <div style={{ background: "var(--color-mist)", border: "1px solid var(--color-champagne)" }} className="p-4 mb-6 flex justify-between items-center">
            <span style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase">Tổng Thanh Toán</span>
            <span style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-xl">{fmt(total)}</span>
          </div>

          {payment === "transfer" && (
            <div style={{ background: "var(--color-mist)", border: "1px solid var(--color-champagne)" }} className="p-5 mb-6 text-left">
              <p style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase mb-3 font-medium">Thông Tin Chuyển Khoản</p>
              <div className="space-y-2">
                {[
                  ["Ngân hàng", "Vietcombank"],
                  ["Số tài khoản", "1234 5678 9012"],
                  ["Chủ tài khoản", "CONG TY LUMIERE BEAUTY"],
                  ["Số tiền", fmt(total)],
                  ["Nội dung CK", "LUMIERE " + phone],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs">{k}</span>
                    <span style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-xs font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate("orders")} style={{ background: "var(--color-charcoal)", color: "var(--color-champagne)", fontFamily: "var(--font-body)" }} className="px-8 py-3 text-xs tracking-widest uppercase hover:opacity-80 transition-opacity">
              Xem Đơn Hàng
            </button>
            <button onClick={() => navigate("home")} style={{ border: "1px solid var(--color-charcoal)", color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="px-8 py-3 text-xs tracking-widest uppercase hover:bg-[var(--color-charcoal)] hover:text-[var(--color-champagne)] transition-colors">
              Trang Chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main checkout layout ────────────────────────────────────────────────────
  const summaryProps: SummaryProps = {
    cart, subtotal, shipping, appliedPromo, discount, total,
    promoInput, onPromoInputChange: setPromoInput,
    onApplyPromo: applyPromo, onRemovePromo: removePromo, promoError,
  };

  return (
    <div style={{ paddingTop: "64px", minHeight: "100vh", background: "var(--color-cream)" }}>
      {/* Header */}
      <div style={{ background: "var(--color-charcoal)" }} className="py-10 text-center">
        <p style={{ color: "var(--color-gold)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase mb-2">Hoàn Tất Đơn Hàng</p>
        <h1 style={{ fontFamily: "var(--font-display)", color: "var(--color-champagne)" }} className="text-4xl font-normal italic">Thanh Toán</h1>
      </div>

      {/* Step indicator */}
      <div style={{ background: "var(--color-mist)", borderBottom: "1px solid var(--color-champagne)" }} className="py-4">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-center gap-0">
          {[{ key: "address", label: "Địa Chỉ" }, { key: "payment", label: "Thanh Toán" }].map((s, i) => (
            <div key={s.key} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  style={{
                    width: "28px", height: "28px",
                    background: step === s.key || (step === "payment" && i === 0) ? "var(--color-charcoal)" : "var(--color-champagne)",
                    color:      step === s.key || (step === "payment" && i === 0) ? "var(--color-gold)"    : "var(--color-warm-gray)",
                    fontFamily: "var(--font-body)",
                  }}
                  className="flex items-center justify-center text-xs font-medium"
                >
                  {step === "payment" && i === 0 ? "✓" : i + 1}
                </div>
                <span style={{ color: step === s.key ? "var(--color-charcoal)" : "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase">
                  {s.label}
                </span>
              </div>
              {i === 0 && <div style={{ width: "60px", height: "1px", background: "var(--color-champagne)", margin: "0 12px" }} />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* ── Left: form ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-2">

            {/* Step 1: Address */}
            {step === "address" && (
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-2xl font-normal mb-6">Địa Chỉ Giao Hàng</h2>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Họ và Tên *" error={errors.name}>
                      <input value={name} onChange={e => { setName(e.target.value); setErrors(p => ({...p, name: ""})); }} placeholder="Nguyễn Thị Lan" type="text" style={inputStyle} className={inputCls} />
                    </Field>
                    <Field label="Số Điện Thoại *" error={errors.phone}>
                      <input value={phone} onChange={e => { setPhone(e.target.value); setErrors(p => ({...p, phone: ""})); }} placeholder="0912 345 678" type="tel" style={inputStyle} className={inputCls} />
                    </Field>
                  </div>
                  <Field label="Địa Chỉ *" error={errors.address}>
                    <input value={address} onChange={e => { setAddress(e.target.value); setErrors(p => ({...p, address: ""})); }} placeholder="Số nhà, tên đường, phường/xã, quận/huyện" type="text" style={inputStyle} className={inputCls} />
                  </Field>
                  <Field label="Tỉnh / Thành Phố">
                    <select value={city} onChange={e => setCity(e.target.value)} style={inputStyle} className={inputCls + " cursor-pointer"}>
                      {cities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Ghi Chú (tuỳ chọn)">
                    <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Giao ngoài giờ hành chính, gọi trước khi giao..." rows={3} style={inputStyle} className={inputCls + " resize-none"} />
                  </Field>
                  <button
                    onClick={() => { if (validateAddress()) setStep("payment"); }}
                    style={{ background: "var(--color-charcoal)", color: "var(--color-champagne)", fontFamily: "var(--font-body)" }}
                    className="w-full py-4 text-xs tracking-widest uppercase font-medium hover:opacity-80 transition-opacity"
                  >
                    Tiếp Tục → Thanh Toán
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === "payment" && (
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-2xl font-normal mb-6">Phương Thức Thanh Toán</h2>

                {/* Address summary */}
                <div style={{ background: "var(--color-mist)", border: "1px solid var(--color-champagne)" }} className="p-4 mb-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase mb-1">Giao Đến</p>
                      <p style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-sm">{name} · {phone}</p>
                      <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs font-light">{address}, {city}</p>
                    </div>
                    <button onClick={() => setStep("address")} style={{ color: "var(--color-gold)", fontFamily: "var(--font-body)", borderBottom: "1px solid var(--color-gold)" }} className="text-xs tracking-widest uppercase">Sửa</button>
                  </div>
                </div>

                {/* Payment options */}
                <div className="space-y-3 mb-8">
                  {[
                    {
                      value: "cod" as const,
                      label: "Thanh Toán Khi Nhận Hàng (COD)",
                      desc: "Nhân viên giao hàng sẽ thu tiền mặt khi giao hàng đến tay bạn.",
                      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 4H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
                    },
                    {
                      value: "transfer" as const,
                      label: "Chuyển Khoản Ngân Hàng",
                      desc: "Chuyển khoản trước khi giao. Thông tin tài khoản sẽ hiển thị sau khi đặt hàng.",
                      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
                    },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setPayment(opt.value)}
                      style={{
                        border: payment === opt.value ? "1.5px solid var(--color-charcoal)" : "1px solid var(--color-champagne)",
                        background: payment === opt.value ? "var(--color-mist)" : "white",
                        fontFamily: "var(--font-body)",
                        width: "100%",
                        textAlign: "left",
                      }}
                      className="p-4 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div style={{ color: payment === opt.value ? "var(--color-charcoal)" : "var(--color-warm-gray)", flexShrink: 0, marginTop: "2px" }}>{opt.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: payment === opt.value ? "5px solid var(--color-charcoal)" : "1.5px solid var(--color-champagne)", flexShrink: 0 }} />
                            <p style={{ color: "var(--color-charcoal)" }} className="text-sm font-medium">{opt.label}</p>
                          </div>
                          <p style={{ color: "var(--color-warm-gray)" }} className="text-xs font-light leading-relaxed">{opt.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Confirm */}
                <div className="flex gap-3">
                  <button onClick={() => setStep("address")} style={{ border: "1px solid var(--color-champagne)", color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="px-6 py-4 text-xs tracking-widest uppercase hover:border-[var(--color-charcoal)] transition-colors">
                    ← Quay Lại
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    style={{ background: placing ? "var(--color-warm-gray)" : "var(--color-charcoal)", color: "var(--color-champagne)", fontFamily: "var(--font-body)" }}
                    className="flex-1 py-4 text-xs tracking-widest uppercase font-medium hover:opacity-80 transition-opacity"
                  >
                    {placing ? "Đang Xử Lý..." : discount > 0 ? `Đặt Hàng · Tiết Kiệm ${fmt(discount)}` : "Xác Nhận Đặt Hàng"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: order summary (always visible) ──────────────────────── */}
          <div>
            <OrderSummary {...summaryProps} />
          </div>
        </div>
      </div>
    </div>
  );
}
