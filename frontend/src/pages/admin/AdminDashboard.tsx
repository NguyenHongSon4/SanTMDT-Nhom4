import { useState } from "react";
import { revenueData, stockData, mockOrders } from "../../data/mockData";
import { statusLabel, statusColor } from "../../data/mockData";

const fmt = (n: number) =>
  n >= 1000000 ? (n / 1000000).toFixed(1) + "M₫" : n.toLocaleString("vi-VN") + "₫";
const fmtFull = (n: number) => n.toLocaleString("vi-VN") + "₫";

const statCards = [
  { label: "Doanh Thu Tháng 9", value: "87M₫", change: "+14%", up: true },
  { label: "Đơn Hàng Mới", value: "24", change: "+8%", up: true },
  { label: "Tổng Khách Hàng", value: "5", change: "+2", up: true },
  { label: "Tỉ Lệ Huỷ Đơn", value: "4.2%", change: "-1.1%", up: false },
];

function BarChart({ data, color = "var(--color-charcoal)" }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map((d) => d.value));
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="relative" style={{ height: "180px" }}>
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map((pct) => (
        <div
          key={pct}
          style={{
            position: "absolute", left: 0, right: 0,
            bottom: `${pct}%`, height: "1px",
            background: "rgba(26,26,26,0.06)",
          }}
        />
      ))}
      {/* Bars */}
      <div className="absolute inset-0 flex items-end gap-1 pb-0">
        {data.map((d, i) => {
          const pct = max > 0 ? (d.value / max) * 100 : 0;
          const isHovered = hovered === i;
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-1"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "default" }}
            >
              {isHovered && (
                <div
                  style={{
                    background: "var(--color-charcoal)",
                    color: "var(--color-champagne)",
                    fontFamily: "var(--font-body)",
                    fontSize: "10px",
                    padding: "2px 6px",
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                  }}
                >
                  {fmtFull(d.value)}
                </div>
              )}
              <div
                style={{
                  width: "100%",
                  height: `${pct}%`,
                  background: isHovered ? "var(--color-gold)" : color,
                  borderRadius: "2px 2px 0 0",
                  transition: "background 0.15s, height 0.3s",
                  minHeight: "2px",
                }}
              />
              <p
                style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)", fontSize: "10px" }}
                className="text-center"
              >
                {d.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("monthly");

  const pendingOrders = mockOrders.filter((o) => o.status === "pending").length;
  const lowStockItems = stockData.filter((s) => s.stock < s.threshold);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase mb-1">Tổng Quan</p>
        <h1 style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-3xl font-normal">Bảng Điều Khiển</h1>
      </div>

      {/* Alerts */}
      {(pendingOrders > 0 || lowStockItems.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {pendingOrders > 0 && (
            <div style={{ background: "rgba(201,168,130,0.12)", border: "1px solid rgba(201,168,130,0.4)" }} className="p-3 flex items-center gap-3">
              <span style={{ color: "var(--color-gold)" }} className="text-lg">⏳</span>
              <p style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-xs">
                <strong>{pendingOrders}</strong> đơn hàng đang chờ xác nhận
              </p>
            </div>
          )}
          {lowStockItems.length > 0 && (
            <div style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.3)" }} className="p-3 flex items-center gap-3">
              <span className="text-lg">⚠️</span>
              <p style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-xs">
                <strong>{lowStockItems.length}</strong> sản phẩm sắp hết tồn kho
              </p>
            </div>
          )}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} style={{ background: "white", border: "1px solid var(--color-champagne)" }} className="p-5">
            <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase mb-3">{s.label}</p>
            <p style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-2xl font-normal mb-1">{s.value}</p>
            <p style={{ color: s.up ? "#5a8a6a" : "#c0392b", fontFamily: "var(--font-body)" }} className="text-xs font-medium">
              {s.up ? "↑" : "↓"} {s.change} so với tháng trước
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue chart */}
        <div style={{ background: "white", border: "1px solid var(--color-champagne)" }} className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-lg font-normal">Doanh Thu</h2>
            <div className="flex gap-1">
              {(["daily", "weekly", "monthly"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  style={{
                    fontFamily: "var(--font-body)",
                    background: period === p ? "var(--color-charcoal)" : "transparent",
                    color: period === p ? "var(--color-champagne)" : "var(--color-warm-gray)",
                    border: period === p ? "1px solid var(--color-charcoal)" : "1px solid var(--color-champagne)",
                  }}
                  className="px-3 py-1 text-xs tracking-widest uppercase transition-all"
                >
                  {p === "daily" ? "Ngày" : p === "weekly" ? "Tuần" : "Tháng"}
                </button>
              ))}
            </div>
          </div>
          <BarChart data={revenueData[period]} />
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div style={{ width: "12px", height: "12px", background: "var(--color-charcoal)", borderRadius: "2px" }} />
              <span style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs">Doanh thu</span>
            </div>
            <div className="flex items-center gap-2">
              <div style={{ width: "12px", height: "12px", background: "var(--color-gold)", borderRadius: "2px" }} />
              <span style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs">Cột đang xem</span>
            </div>
          </div>
        </div>

        {/* Order status breakdown */}
        <div style={{ background: "white", border: "1px solid var(--color-champagne)" }} className="p-6">
          <h2 style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-lg font-normal mb-6">Trạng Thái Đơn</h2>
          <div className="space-y-4">
            {(["pending", "confirmed", "shipping", "completed", "cancelled"] as const).map((s) => {
              const count = mockOrders.filter((o) => o.status === s).length;
              const pct = (count / mockOrders.length) * 100;
              return (
                <div key={s}>
                  <div className="flex justify-between mb-1">
                    <span style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-xs">{statusLabel[s]}</span>
                    <span style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs">{count}</span>
                  </div>
                  <div style={{ height: "4px", background: "var(--color-champagne)", borderRadius: "2px" }}>
                    <div
                      style={{ width: `${pct}%`, height: "100%", background: statusColor[s], borderRadius: "2px", transition: "width 0.5s" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div style={{ background: "white", border: "1px solid var(--color-champagne)" }} className="p-6">
          <h2 style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-lg font-normal mb-5">Đơn Hàng Gần Đây</h2>
          <div className="space-y-3">
            {mockOrders.slice(0, 4).map((order) => (
              <div key={order.id} style={{ borderBottom: "1px solid var(--color-champagne)" }} className="pb-3 flex items-center justify-between">
                <div>
                  <p style={{ fontFamily: "var(--font-body)", color: "var(--color-charcoal)" }} className="text-xs font-medium">{order.id}</p>
                  <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs font-light">{order.userName} · {order.createdAt}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span style={{ color: statusColor[order.status], fontFamily: "var(--font-body)" }} className="text-xs">{statusLabel[order.status]}</span>
                  <span style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-xs font-medium">{fmt(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock */}
        <div style={{ background: "white", border: "1px solid var(--color-champagne)" }} className="p-6">
          <h2 style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-lg font-normal mb-5">Tồn Kho</h2>
          <div className="space-y-4">
            {stockData.map((item) => {
              const isLow = item.stock < item.threshold;
              const pct = Math.min((item.stock / 30) * 100, 100);
              return (
                <div key={item.name}>
                  <div className="flex justify-between mb-1">
                    <span style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-xs truncate max-w-48">{item.name}</span>
                    <span style={{ color: isLow ? "#c0392b" : "#5a8a6a", fontFamily: "var(--font-body)" }} className="text-xs font-medium ml-2 flex-shrink-0">
                      {isLow && "⚠ "}{item.stock} SP
                    </span>
                  </div>
                  <div style={{ height: "4px", background: "var(--color-champagne)", borderRadius: "2px" }}>
                    <div
                      style={{
                        width: `${pct}%`, height: "100%",
                        background: isLow ? "#c0392b" : "#5a8a6a",
                        borderRadius: "2px",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
