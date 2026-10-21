import { useState } from "react";
import { mockOrders as initialOrders, statusLabel, statusColor } from "../../data/mockData";
import type { Order } from "../../data/mockData";

const fmt = (n: number) => n.toLocaleString("vi-VN") + "₫";

const statusFlow = ["pending", "confirmed", "shipping", "completed"] as const;
const paymentLabel: Record<string, string> = { cod: "COD", transfer: "Chuyển khoản" };

export default function AdminOrders() {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filtered = orders.filter((o) => {
    const matchSearch = !search || o.id.toLowerCase().includes(search.toLowerCase()) || o.userName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = (id: string, status: Order["status"]) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
    if (selectedOrder?.id === id) setSelectedOrder((prev) => prev ? { ...prev, status } : null);
  };

  const inputStyle = {
    fontFamily: "var(--font-body)",
    border: "1px solid var(--color-champagne)",
    background: "white",
    color: "var(--color-charcoal)",
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase mb-1">Quản Lý</p>
        <h1 style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-3xl font-normal">Đơn Hàng</h1>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { key: "all", label: "Tổng", count: orders.length },
          ...["pending", "confirmed", "shipping", "completed"].map((s) => ({
            key: s,
            label: statusLabel[s],
            count: orders.filter((o) => o.status === s).length,
          })),
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setStatusFilter(item.key)}
            style={{
              background: statusFilter === item.key ? "var(--color-charcoal)" : "white",
              border: "1px solid var(--color-champagne)",
              fontFamily: "var(--font-body)",
            }}
            className="p-3 text-center transition-all hover:border-[var(--color-charcoal)]"
          >
            <p style={{ color: statusFilter === item.key ? "var(--color-gold)" : "var(--color-warm-gray)" }} className="text-xs tracking-widest uppercase">{item.label}</p>
            <p style={{ color: statusFilter === item.key ? "var(--color-champagne)" : "var(--color-charcoal)", fontFamily: "var(--font-display)" }} className="text-2xl font-normal mt-1">{item.count}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ background: "white", border: "1px solid var(--color-champagne)" }} className="p-4 mb-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-warm-gray)" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo mã đơn hoặc tên khách..." style={inputStyle} className="w-full pl-9 pr-4 py-2 text-sm outline-none" />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "white", border: "1px solid var(--color-champagne)" }} className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-champagne)" }}>
              {["Mã Đơn", "Khách Hàng", "Ngày", "Thanh Toán", "Trạng Thái", "Tổng", ""].map((h) => (
                <th key={h} style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="px-4 py-3 text-xs tracking-widest uppercase text-left font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order.id} style={{ borderBottom: "1px solid var(--color-champagne)" }} className="hover:bg-[var(--color-mist)] transition-colors">
                <td className="px-4 py-3">
                  <p style={{ fontFamily: "var(--font-body)", color: "var(--color-charcoal)" }} className="text-xs font-medium">{order.id}</p>
                </td>
                <td className="px-4 py-3">
                  <p style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-sm">{order.userName}</p>
                  <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs">{order.phone}</p>
                </td>
                <td className="px-4 py-3">
                  <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs">{order.createdAt}</p>
                </td>
                <td className="px-4 py-3">
                  <span style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs">{paymentLabel[order.payment]}</span>
                </td>
                <td className="px-4 py-3">
                  <span style={{ color: statusColor[order.status], background: statusColor[order.status] + "18", border: `1px solid ${statusColor[order.status]}40`, fontFamily: "var(--font-body)" }} className="text-xs px-2 py-1 tracking-widest uppercase">
                    {statusLabel[order.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-display)" }} className="text-sm">{fmt(order.total)}</p>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)", border: "1px solid var(--color-champagne)" }}
                    className="text-xs px-3 py-1 hover:text-[var(--color-charcoal)] hover:border-[var(--color-charcoal)] transition-all"
                  >
                    Chi Tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-10 text-center">
            <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-display)" }} className="text-lg font-normal italic">Không tìm thấy đơn hàng</p>
          </div>
        )}
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(26,26,26,0.7)", zIndex: 200 }} className="flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div style={{ background: "var(--color-cream)", maxWidth: "580px", width: "100%", maxHeight: "90vh", overflowY: "auto" }} className="p-7" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-2xl font-normal">{selectedOrder.id}</h3>
                <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs mt-1">{selectedOrder.createdAt} · {paymentLabel[selectedOrder.payment]}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ color: "var(--color-warm-gray)" }} className="hover:text-[var(--color-charcoal)] transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Customer info */}
            <div style={{ background: "var(--color-mist)", border: "1px solid var(--color-champagne)" }} className="p-4 mb-5">
              <p style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase mb-2 font-medium">Thông Tin Khách Hàng</p>
              <p style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-sm">{selectedOrder.userName} · {selectedOrder.phone}</p>
              <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs">{selectedOrder.address}, {selectedOrder.city}</p>
            </div>

            {/* Items */}
            <div className="space-y-3 mb-5" style={{ borderBottom: "1px solid var(--color-champagne)", paddingBottom: "16px" }}>
              {selectedOrder.items.map((item, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <img src={item.image} alt={item.name} style={{ width: "44px", height: "56px", objectFit: "cover" }} />
                  <div className="flex-1">
                    <p style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-display)" }} className="text-sm">{item.name}</p>
                    <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs">{item.variant} × {item.qty}</p>
                  </div>
                  <p style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-sm">{fmt(item.price * item.qty)}</p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="space-y-2 mb-5" style={{ borderBottom: "1px solid var(--color-champagne)", paddingBottom: "16px" }}>
              <div className="flex justify-between"><span style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs">Tạm tính</span><span style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-sm">{fmt(selectedOrder.subtotal)}</span></div>
              {selectedOrder.discount > 0 && <div className="flex justify-between"><span style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs">Giảm giá</span><span style={{ color: "var(--color-gold)", fontFamily: "var(--font-body)" }} className="text-sm">-{fmt(selectedOrder.discount)}</span></div>}
              <div className="flex justify-between"><span style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs">Vận chuyển</span><span style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-sm">{selectedOrder.shipping === 0 ? "Miễn phí" : fmt(selectedOrder.shipping)}</span></div>
              <div className="flex justify-between pt-2 mt-2 border-t border-[var(--color-champagne)]"><span style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-xs uppercase tracking-widest font-medium">Tổng cộng</span><span style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-display)" }} className="text-xl">{fmt(selectedOrder.total)}</span></div>
            </div>

            {/* Update status */}
            {selectedOrder.status !== "cancelled" && (
              <div>
                <p style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase mb-3">Cập Nhật Trạng Thái</p>
                <div className="grid grid-cols-2 gap-2">
                  {[...statusFlow, "cancelled" as const].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selectedOrder.id, s)}
                      style={{
                        background: selectedOrder.status === s ? statusColor[s] : "transparent",
                        color: selectedOrder.status === s ? "white" : statusColor[s],
                        border: `1px solid ${statusColor[s]}`,
                        fontFamily: "var(--font-body)",
                      }}
                      className="py-2 text-xs tracking-widest uppercase transition-all hover:opacity-80"
                    >
                      {statusLabel[s]}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {selectedOrder.status === "cancelled" && (
              <div style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.3)" }} className="p-3 text-center">
                <p style={{ color: "#c0392b", fontFamily: "var(--font-body)" }} className="text-xs uppercase tracking-widest">Đơn hàng đã bị huỷ</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
