import { useState, useEffect } from "react";
import type { CartItem, Page, AppUser, Order } from "../App";
import { createOrder } from "../services/orderService";
import {
  validateCoupon,
  fetchActiveCoupons,
  type CouponView,
} from "../services/couponService";

interface CheckoutPageProps {
  cart: CartItem[];
  navigate: (p: Page) => void;
  user: AppUser | null;
  onOrderPlaced: (order: Order) => void;
}

const fmt = (n: number) => n.toLocaleString("vi-VN") + "₫";
const cities = [
  "TP.HCM",
  "Hà Nội",
  "Đà Nẵng",
  "Cần Thơ",
  "Huế",
  "Nha Trang",
  "Hải Phòng",
];

interface AppliedPromo {
  code: string;
  label: string;
  discount: number;
}

// ─── Order summary ───────────────────────────────────────────────────────────

interface SummaryProps {
  cart: CartItem[];
  subtotal: number;
  shipping: number;
  appliedPromo: AppliedPromo | null;
  discount: number;
  total: number;
  promoInput: string;
  onPromoInputChange: (v: string) => void;
  onApplyPromo: () => void;
  onRemovePromo: () => void;
  promoError: string;
  applyingPromo: boolean;
  availableCoupons: CouponView[];
}

function OrderSummary({
  cart,
  subtotal,
  shipping,
  appliedPromo,
  discount,
  total,
  promoInput,
  onPromoInputChange,
  onApplyPromo,
  onRemovePromo,
  promoError,
  applyingPromo,
  availableCoupons,
}: SummaryProps) {
  const [showHints, setShowHints] = useState(false);

  return (
    <div
      style={{
        background: "var(--color-mist)",
        border: "1px solid var(--color-champagne)",
      }}
      className="p-6 sticky top-24"
    >
      <h3
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-charcoal)",
        }}
        className="text-lg font-normal mb-5"
      >
        Đơn Hàng ({cart.reduce((s, i) => s + i.qty, 0)} sản phẩm)
      </h3>

      <div
        className="space-y-4 mb-5"
        style={{
          borderBottom: "1px solid var(--color-champagne)",
          paddingBottom: "16px",
        }}
      >
        {cart.map((item) => (
          <div
            key={`${item.id}-${item.variant}`}
            className="flex gap-3 items-center"
          >
            <div style={{ position: "relative", flexShrink: 0 }}>
              <img
                src={item.image}
                alt={item.name}
                style={{ width: "52px", height: "64px", objectFit: "cover" }}
              />
              <span
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-6px",
                  background: "var(--color-charcoal)",
                  color: "var(--color-champagne)",
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  fontSize: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item.qty}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p
                style={{
                  color: "var(--color-charcoal)",
                  fontFamily: "var(--font-display)",
                }}
                className="text-xs truncate"
              >
                {item.name}
              </p>
              <p
                style={{
                  color: "var(--color-warm-gray)",
                  fontFamily: "var(--font-body)",
                }}
                className="text-xs"
              >
                {item.variant}
              </p>
            </div>
            <p
              style={{
                color: "var(--color-charcoal)",
                fontFamily: "var(--font-body)",
              }}
              className="text-xs font-medium flex-shrink-0"
            >
              {fmt(item.price * item.qty)}
            </p>
          </div>
        ))}
      </div>

      {/* Promo */}
      <div
        style={{ borderBottom: "1px solid var(--color-champagne)" }}
        className="pb-5 mb-4"
      >
        <p
          style={{
            color: "var(--color-charcoal)",
            fontFamily: "var(--font-body)",
          }}
          className="text-xs tracking-widest uppercase mb-3 font-medium"
        >
          Mã Giảm Giá
        </p>

        {appliedPromo ? (
          <div
            style={{
              background: "rgba(201,168,130,0.12)",
              border: "1px solid rgba(201,168,130,0.4)",
            }}
            className="p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p
                  style={{
                    color: "var(--color-gold)",
                    fontFamily: "var(--font-body)",
                  }}
                  className="text-xs font-medium tracking-widest uppercase"
                >
                  {appliedPromo.code}
                </p>
                <p
                  style={{
                    color: "var(--color-charcoal)",
                    fontFamily: "var(--font-body)",
                  }}
                  className="text-xs font-light"
                >
                  {appliedPromo.label}
                </p>
                <p
                  style={{
                    color: "var(--color-gold)",
                    fontFamily: "var(--font-body)",
                  }}
                  className="text-sm font-medium mt-1"
                >
                  -{fmt(discount)}
                </p>
              </div>
              <button
                type="button"
                onClick={onRemovePromo}
                style={{ color: "var(--color-warm-gray)" }}
                className="hover:opacity-70"
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex">
              <input
                value={promoInput}
                onChange={(e) =>
                  onPromoInputChange(e.target.value.toUpperCase())
                }
                onKeyDown={(e) => e.key === "Enter" && onApplyPromo()}
                placeholder="Nhập mã..."
                style={{
                  fontFamily: "var(--font-body)",
                  border: promoError
                    ? "1px solid #c0392b"
                    : "1px solid var(--color-champagne)",
                  background: "white",
                  color: "var(--color-charcoal)",
                }}
                className="flex-1 px-3 py-2.5 text-xs outline-none"
              />
              <button
                type="button"
                onClick={onApplyPromo}
                disabled={applyingPromo}
                style={{
                  background: "var(--color-charcoal)",
                  color: "var(--color-champagne)",
                  fontFamily: "var(--font-body)",
                }}
                className="px-4 text-xs tracking-widest uppercase disabled:opacity-50"
              >
                {applyingPromo ? "..." : "Áp Dụng"}
              </button>
            </div>

            {promoError && (
              <p
                style={{ color: "#c0392b", fontFamily: "var(--font-body)" }}
                className="text-xs mt-1.5"
              >
                {promoError}
              </p>
            )}

            <button
              type="button"
              onClick={() => setShowHints(!showHints)}
              style={{
                color: "var(--color-warm-gray)",
                fontFamily: "var(--font-body)",
              }}
              className="text-xs mt-2 hover:text-[var(--color-charcoal)]"
            >
              {showHints ? "Ẩn mã có sẵn" : "Xem mã có sẵn"}
            </button>

            {showHints && (
              <div
                style={{
                  border: "1px solid var(--color-champagne)",
                  background: "white",
                }}
                className="mt-2"
              >
                {availableCoupons.length === 0 && (
                  <p className="px-3 py-3 text-xs opacity-50">
                    Chưa có mã khả dụng
                  </p>
                )}
                {availableCoupons.map((p) => {
                  const eligible = subtotal >= p.minOrder;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        if (!eligible) return;
                        onPromoInputChange(p.code);
                        setShowHints(false);
                      }}
                      disabled={!eligible}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        opacity: eligible ? 1 : 0.45,
                        cursor: eligible ? "pointer" : "not-allowed",
                        borderBottom: "1px solid var(--color-champagne)",
                      }}
                      className="px-3 py-2.5 hover:bg-[var(--color-mist)]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p
                            style={{
                              color: "var(--color-charcoal)",
                              fontFamily: "var(--font-body)",
                            }}
                            className="text-xs font-medium tracking-widest"
                          >
                            {p.code}
                          </p>
                          <p
                            style={{
                              color: "var(--color-warm-gray)",
                              fontFamily: "var(--font-body)",
                            }}
                            className="text-xs font-light mt-0.5"
                          >
                            {p.description ||
                              (p.type === "percent"
                                ? `Giảm ${p.value}%`
                                : `Giảm ${fmt(p.value)}`)}
                            {p.minOrder > 0 &&
                              !eligible &&
                              ` · cần thêm ${fmt(p.minOrder - subtotal)}`}
                          </p>
                        </div>
                        <span
                          style={{
                            color: "var(--color-gold)",
                            fontFamily: "var(--font-body)",
                          }}
                          className="text-xs font-medium flex-shrink-0"
                        >
                          {p.type === "percent"
                            ? `-${p.value}%`
                            : `-${fmt(p.value)}`}
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

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span
            style={{
              color: "var(--color-warm-gray)",
              fontFamily: "var(--font-body)",
            }}
            className="text-xs"
          >
            Tạm tính
          </span>
          <span
            style={{
              color: "var(--color-charcoal)",
              fontFamily: "var(--font-body)",
            }}
            className="text-xs"
          >
            {fmt(subtotal)}
          </span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <span
              style={{
                color: "var(--color-warm-gray)",
                fontFamily: "var(--font-body)",
              }}
              className="text-xs"
            >
              Giảm giá ({appliedPromo?.code})
            </span>
            <span
              style={{
                color: "var(--color-gold)",
                fontFamily: "var(--font-body)",
              }}
              className="text-xs font-medium"
            >
              -{fmt(discount)}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span
            style={{
              color: "var(--color-warm-gray)",
              fontFamily: "var(--font-body)",
            }}
            className="text-xs"
          >
            Vận chuyển
          </span>
          <span
            style={{
              color: "var(--color-charcoal)",
              fontFamily: "var(--font-body)",
            }}
            className="text-xs"
          >
            {shipping === 0 ? "Miễn phí" : fmt(shipping)}
          </span>
        </div>
      </div>

      <div
        style={{ borderTop: "1px solid var(--color-champagne)" }}
        className="pt-4 flex justify-between items-baseline"
      >
        <span
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--color-charcoal)",
          }}
          className="text-xs tracking-widest uppercase font-medium"
        >
          Tổng Cộng
        </span>
        <div className="text-right">
          {discount > 0 && (
            <p
              style={{
                color: "var(--color-warm-gray)",
                fontFamily: "var(--font-body)",
              }}
              className="text-xs line-through"
            >
              {fmt(subtotal + shipping)}
            </p>
          )}
          <span
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-charcoal)",
            }}
            className="text-2xl"
          >
            {fmt(total)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function CheckoutPage({
  cart,
  navigate,
  user,
  onOrderPlaced,
}: CheckoutPageProps) {
  const [step, setStep] = useState<"address" | "payment" | "success">(
    "address"
  );

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [address, setAddress] = useState(user?.address ?? "");
  const [city, setCity] = useState(user?.city ?? "TP.HCM");
  const [note, setNote] = useState("");
  const [payment, setPayment] = useState<"cod" | "transfer">("cod");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);

  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [promoError, setPromoError] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState<CouponView[]>([]);
  const [applyingPromo, setApplyingPromo] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
      setCity(user.city || "TP.HCM");
    }
  }, [user]);

  useEffect(() => {
    fetchActiveCoupons()
      .then(setAvailableCoupons)
      .catch(() => setAvailableCoupons([]));
  }, []);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= 500000 ? 0 : 30000;
  const discount = appliedPromo?.discount ?? 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const applyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) {
      setPromoError("Vui lòng nhập mã giảm giá");
      return;
    }
    setApplyingPromo(true);
    setPromoError("");
    try {
      const data = await validateCoupon(code, subtotal);
      setAppliedPromo({
        code: data.code,
        label:
          data.type === "percent"
            ? `Giảm ${data.value}%`
            : `Giảm ${fmt(data.value)}`,
        discount: data.discount,
      });
      setPromoInput("");
    } catch (err: any) {
      setPromoError(err.message || "Mã không hợp lệ");
      setAppliedPromo(null);
    } finally {
      setApplyingPromo(false);
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoError("");
    setPromoInput("");
  };

  const validateAddress = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Vui lòng nhập họ tên";
    if (!phone.trim()) e.phone = "Vui lòng nhập số điện thoại";
    if (!address.trim()) e.address = "Vui lòng nhập địa chỉ";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const data = await createOrder({
        receiverName: name,
        phone,
        shippingAddress: address,
        shippingCity: city,
        paymentMethod: payment,
        note,
        shippingFee: shipping,
        discount,
        couponCode: appliedPromo?.code,
      } as any);

      const order: Order = {
        id: data.orderCode || data._id,
        items: cart,
        subtotal: data.subtotal,
        discount: data.discount,
        shipping: data.shippingFee,
        total: data.total,
        address: data.shippingAddress,
        city: data.shippingCity,
        phone: data.phone,
        payment: data.paymentMethod,
        note: data.note,
        createdAt:
          data.createdAt?.slice(0, 10) ||
          new Date().toISOString().slice(0, 10),
        status: data.status,
      };

      onOrderPlaced(order);
      setStep("success");
    } catch (err: any) {
      alert(err.message || "Đặt hàng thất bại");
    } finally {
      setPlacing(false);
    }
  };

  const inputStyle = {
    fontFamily: "var(--font-body)",
    border: "1px solid var(--color-champagne)",
    background: "white",
    color: "var(--color-charcoal)",
  };
  const inputCls =
    "w-full px-4 py-3 text-sm outline-none placeholder:opacity-40 focus:border-[var(--color-charcoal)] transition-colors";

  const summaryProps: SummaryProps = {
    cart,
    subtotal,
    shipping,
    appliedPromo,
    discount,
    total,
    promoInput,
    onPromoInputChange: setPromoInput,
    onApplyPromo: applyPromo,
    onRemovePromo: removePromo,
    promoError,
    applyingPromo,
    availableCoupons,
  };

  if (step === "success") {
    return (
      <div
        style={{
          paddingTop: "64px",
          minHeight: "100vh",
          background: "var(--color-cream)",
        }}
        className="flex items-center justify-center py-20 px-4"
      >
        <div className="text-center max-w-md">
          <div
            style={{
              width: "72px",
              height: "72px",
              background: "var(--color-charcoal)",
            }}
            className="mx-auto flex items-center justify-center mb-6"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-champagne)"
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-charcoal)",
            }}
            className="text-3xl mb-3"
          >
            Đặt hàng thành công
          </h1>
          <p
            style={{
              color: "var(--color-warm-gray)",
              fontFamily: "var(--font-body)",
            }}
            className="text-sm mb-8"
          >
            Cảm ơn bạn. Đơn hàng đang được xử lý.
          </p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => navigate("orders")}
              style={{
                background: "var(--color-charcoal)",
                color: "var(--color-champagne)",
              }}
              className="py-3 text-xs tracking-widest uppercase"
            >
              Xem đơn hàng
            </button>
            <button
              type="button"
              onClick={() => navigate("home")}
              style={{ border: "1px solid var(--color-champagne)" }}
              className="py-3 text-xs tracking-widest uppercase"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
  return (
    <div
      style={{ paddingTop: "120px", background: "var(--color-cream)" }}
      className="min-h-screen text-center px-4"
    >
      <p className="mb-4 opacity-70">Giỏ hàng trống</p>
      <button
        type="button"
        onClick={() => navigate("products")}
        style={{
          background: "var(--color-charcoal)",
          color: "var(--color-champagne)",
        }}
        className="px-6 py-3 text-xs tracking-widest uppercase"
      >
        Mua sắm
      </button>
    </div>
  );
}

  return (
    <div
      style={{
        paddingTop: "64px",
        minHeight: "100vh",
        background: "var(--color-cream)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-charcoal)",
          }}
          className="text-3xl mb-8"
        >
          Thanh Toán
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            {step === "address" && (
              <>
                <div
                  style={{
                    background: "white",
                    border: "1px solid var(--color-champagne)",
                  }}
                  className="p-6 space-y-4"
                >
                  <h2
                    style={{ fontFamily: "var(--font-display)" }}
                    className="text-xl mb-2"
                  >
                    Thông tin giao hàng
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs tracking-widest uppercase mb-2">
                        Họ tên *
                      </label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={inputStyle}
                        className={inputCls}
                      />
                      {errors.name && (
                        <p className="text-xs mt-1" style={{ color: "#c0392b" }}>
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs tracking-widest uppercase mb-2">
                        Số điện thoại *
                      </label>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={inputStyle}
                        className={inputCls}
                      />
                      {errors.phone && (
                        <p className="text-xs mt-1" style={{ color: "#c0392b" }}>
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-2">
                      Địa chỉ *
                    </label>
                    <input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      style={inputStyle}
                      className={inputCls}
                    />
                    {errors.address && (
                      <p className="text-xs mt-1" style={{ color: "#c0392b" }}>
                        {errors.address}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-2">
                      Tỉnh / Thành phố
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={inputStyle}
                      className={inputCls}
                    >
                      {cities.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-2">
                      Ghi chú
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      style={inputStyle}
                      className={inputCls + " resize-none"}
                      placeholder="Giao ngoài giờ hành chính..."
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (validateAddress()) setStep("payment");
                  }}
                  style={{
                    background: "var(--color-charcoal)",
                    color: "var(--color-champagne)",
                    width: "100%",
                  }}
                  className="py-3 text-xs tracking-widest uppercase"
                >
                  Tiếp tục → Thanh toán
                </button>
              </>
            )}

            {step === "payment" && (
              <>
                <div
                  style={{
                    background: "white",
                    border: "1px solid var(--color-champagne)",
                  }}
                  className="p-6 space-y-4"
                >
                  <h2
                    style={{ fontFamily: "var(--font-display)" }}
                    className="text-xl mb-2"
                  >
                    Phương thức thanh toán
                  </h2>
                  {(
                    [
                      ["cod", "Thanh toán khi nhận hàng (COD)"],
                      ["transfer", "Chuyển khoản ngân hàng"],
                    ] as const
                  ).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setPayment(val)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        border:
                          payment === val
                            ? "1.5px solid var(--color-charcoal)"
                            : "1px solid var(--color-champagne)",
                        background:
                          payment === val ? "var(--color-mist)" : "white",
                      }}
                      className="p-4"
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep("address")}
                    style={{ border: "1px solid var(--color-champagne)" }}
                    className="flex-1 py-3 text-xs tracking-widest uppercase"
                  >
                    Quay lại
                  </button>
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    style={{
                      background: "var(--color-charcoal)",
                      color: "var(--color-champagne)",
                    }}
                    className="flex-[2] py-3 text-xs tracking-widest uppercase disabled:opacity-50"
                  >
                    {placing ? "Đang đặt hàng..." : "Đặt hàng"}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="lg:col-span-2">
            <OrderSummary {...summaryProps} />
          </div>
        </div>
      </div>
    </div>
  );
}