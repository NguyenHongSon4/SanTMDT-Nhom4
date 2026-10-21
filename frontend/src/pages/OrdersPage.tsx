import { useState } from "react";
import type { Page, Order } from "../App";
import { statusLabel, statusColor } from "../data/mockData";

interface OrdersPageProps {
  orders: Order[];
  navigate: (p: Page) => void;
  onCancelOrder: (id: string) => void;
}

const fmt = (n: number) => n.toLocaleString("vi-VN") + "₫";

const paymentLabel: Record<string, string> = {
  cod: "COD",
  transfer: "Chuyển khoản",
};

const steps = ["pending", "confirmed", "shipping", "completed"];

export default function OrdersPage({ orders, navigate, onCancelOrder }: OrdersPageProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered = filterStatus === "all" ? orders : orders.filter(o => o.status === filterStatus);

  const toggle = (id: string) => setExpandedId(prev => prev === id ? null : id);

  const confirmCancel = (id: string) => {
    onCancelOrder(id);
    setCancelTarget(null);
  };

  return (
    <div style={{ paddingTop: "64px", minHeight: "100vh", background: "var(--color-cream)" }}>
      {/* Header */}
      <div style={{ background: "var(--color-charcoal)" }} className="py-12 text-center">
        <p style={{ color: "var(--color-gold)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase mb-3">Tài Khoản Của Bạn</p>
        <h1 style={{ fontFamily: "var(--font-display)", color: "var(--color-champagne)" }} className="text-4xl font-normal italic">Lịch Sử Đơn Hàng</h1>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-10">
        {/* Filter tabs */}
        <div style={{ borderBottom: "1px solid var(--color-champagne)" }} className="flex flex-wrap gap-0 mb-8">
          {[["all", "Tất Cả"], ["pending", "Chờ XN"], ["confirmed", "Đã XN"], ["shipping", "Đang Giao"], ["completed", "Hoàn Tất"], ["cancelled", "Đã Huỷ"]].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setFilterStatus(v)}
              style={{
                fontFamily: "var(--font-body)",
                color: filterStatus === v ? "var(--color-charcoal)" : "var(--color-warm-gray)",
                borderBottom: filterStatus === v ? "2px solid var(--color-charcoal)" : "2px solid transparent",
                marginBottom: "-1px",
              }}
              className="px-4 py-3 text-xs tracking-widest uppercase transition-colors whitespace-nowrap"
            >
              {l}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <svg className="mx-auto mb-5 opacity-20" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--color-charcoal)" strokeWidth="1">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
            <p style={{ fontFamily: "var(--font-display)", color: "var(--color-warm-gray)" }} className="text-2xl font-normal italic mb-5">Chưa có đơn hàng nào</p>
            <button onClick={() => navigate("products")} style={{ background: "var(--color-charcoal)", color: "var(--color-champagne)", fontFamily: "var(--font-body)" }} className="px-8 py-3 text-xs tracking-widest uppercase hover:opacity-80 transition-opacity">
              Mua Sắm Ngay
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => {
              const isExpanded = expandedId === order.id;
              const stepIdx = steps.indexOf(order.status);

              return (
                <div key={order.id} style={{ border: "1px solid var(--color-champagne)", background: "white" }}>
                  {/* Order header */}
                  <button
                    onClick={() => toggle(order.id)}
                    className="w-full px-6 py-5 flex items-center justify-between"
                    style={{ textAlign: "left" }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
                      <div>
                        <p style={{ fontFamily: "var(--font-body)", color: "var(--color-charcoal)" }} className="text-sm font-medium">{order.id}</p>
                        <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs font-light">{order.createdAt}</p>
                      </div>
                      <div
                        style={{
                          background: statusColor[order.status] + "18",
                          color: statusColor[order.status],
                          fontFamily: "var(--font-body)",
                          border: `1px solid ${statusColor[order.status]}40`,
                        }}
                        className="px-3 py-1 text-xs tracking-widest uppercase w-fit"
                      >
                        {statusLabel[order.status]}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-lg font-normal hidden sm:block">{fmt(order.total)}</p>
                      <svg
                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-warm-gray)" strokeWidth="1.5"
                        style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div style={{ borderTop: "1px solid var(--color-champagne)" }}>
                      {/* Progress track */}
                      {order.status !== "cancelled" && (
                        <div className="px-6 py-5" style={{ borderBottom: "1px solid var(--color-champagne)" }}>
                          <div className="flex items-center">
                            {steps.map((s, i) => (
                              <div key={s} className="flex items-center flex-1 last:flex-none">
                                <div className="flex flex-col items-center">
                                  <div
                                    style={{
                                      width: "28px", height: "28px",
                                      background: i <= stepIdx ? "var(--color-charcoal)" : "var(--color-champagne)",
                                      color: i <= stepIdx ? "var(--color-gold)" : "var(--color-warm-gray)",
                                      borderRadius: "50%",
                                      flexShrink: 0,
                                    }}
                                    className="flex items-center justify-center text-xs"
                                  >
                                    {i < stepIdx ? "✓" : i + 1}
                                  </div>
                                  <p style={{ color: i <= stepIdx ? "var(--color-charcoal)" : "var(--color-warm-gray)", fontFamily: "var(--font-body)", fontSize: "10px" }} className="mt-1 text-center">
                                    {statusLabel[s]}
                                  </p>
                                </div>
                                {i < steps.length - 1 && (
                                  <div style={{ flex: 1, height: "1px", background: i < stepIdx ? "var(--color-charcoal)" : "var(--color-champagne)", margin: "0 4px", marginBottom: "16px" }} />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Items */}
                      <div className="px-6 py-4 space-y-3" style={{ borderBottom: "1px solid var(--color-champagne)" }}>
                        {order.items.map((item, i) => (
                          <div key={i} className="flex gap-3 items-center">
                            <img src={item.image} alt={item.name} style={{ width: "48px", height: "60px", objectFit: "cover", flexShrink: 0 }} />
                            <div className="flex-1 min-w-0">
                              <p style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-display)" }} className="text-sm font-normal truncate">{item.name}</p>
                              <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs">{item.variant} × {item.qty}</p>
                            </div>
                            <p style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-sm font-medium">{fmt(item.price * item.qty)}</p>
                          </div>
                        ))}
                      </div>

                      {/* Info + actions */}
                      <div className="px-6 py-4 flex flex-col sm:flex-row justify-between gap-4">
                        <div className="space-y-1">
                          <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs">
                            Giao đến: <span style={{ color: "var(--color-charcoal)" }}>{order.address}, {order.city}</span>
                          </p>
                          <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs">
                            Thanh toán: <span style={{ color: "var(--color-charcoal)" }}>{paymentLabel[order.payment]}</span>
                          </p>
                          <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs">
                            Tổng cộng: <span style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-display)" }} className="text-base">{fmt(order.total)}</span>
                          </p>
                        </div>
                        <div className="flex gap-2 items-end">
                          {order.status === "completed" && (
                            <button
                              onClick={() => navigate("products")}
                              style={{ background: "var(--color-charcoal)", color: "var(--color-champagne)", fontFamily: "var(--font-body)" }}
                              className="px-5 py-2 text-xs tracking-widest uppercase hover:opacity-80 transition-opacity"
                            >
                              Đánh Giá
                            </button>
                          )}
                          {order.status === "pending" && (
                            <button
                              onClick={() => setCancelTarget(order.id)}
                              style={{ border: "1px solid #c0392b", color: "#c0392b", fontFamily: "var(--font-body)" }}
                              className="px-5 py-2 text-xs tracking-widest uppercase hover:bg-red-50 transition-colors"
                            >
                              Huỷ Đơn
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel modal */}
      {cancelTarget && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(26,26,26,0.7)", zIndex: 200 }}
          className="flex items-center justify-center p-4"
          onClick={() => setCancelTarget(null)}
        >
          <div
            style={{ background: "var(--color-cream)", maxWidth: "420px", width: "100%" }}
            className="p-8"
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-2xl font-normal mb-3">Huỷ Đơn Hàng?</h3>
            <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-sm font-light mb-6 leading-relaxed">
              Bạn có chắc chắn muốn huỷ đơn hàng <strong>{cancelTarget}</strong>? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setCancelTarget(null)} style={{ flex: 1, border: "1px solid var(--color-champagne)", color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="py-3 text-xs tracking-widest uppercase hover:border-[var(--color-charcoal)] transition-colors">
                Giữ Đơn
              </button>
              <button onClick={() => confirmCancel(cancelTarget)} style={{ flex: 1, background: "#c0392b", color: "white", fontFamily: "var(--font-body)" }} className="py-3 text-xs tracking-widest uppercase hover:opacity-80 transition-opacity">
                Xác Nhận Huỷ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
