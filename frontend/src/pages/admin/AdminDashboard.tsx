import { useState, useEffect, useMemo } from "react";
import type { Page } from "../../App";
import { statusLabel, statusColor } from "../../data/mockData";
import { getDashboardStatistics, type DashboardStatistics } from "../../services/adminStatisticsService";

const fmt = (n: number) =>
  n >= 1_000_000
    ? (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M₫"
    : n.toLocaleString("vi-VN") + "₫";
const fmtFull = (n: number) => n.toLocaleString("vi-VN") + "₫";

interface AdminDashboardProps {
  navigate: (p: Page) => void;
}

type ChartPoint = { label: string; value: number; fullDate: string };

function toLocalYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildChart(
  series: DashboardStatistics["revenueSeries"],
  mode: "7d" | "14d" | "6m" | "custom",
  fromDate: string,
  toDate: string
): ChartPoint[] {
  if (mode === "custom" && (!fromDate || !toDate || fromDate > toDate)) return [];
  const monthly = mode === "6m" || (mode === "custom" && new Date(toDate).getTime() - new Date(fromDate).getTime() > 31 * 86400000);
  const values = new Map(series.map((item) => [item.date, item.value]));
  const keys: string[] = [];
  if (monthly) {
    const from = mode === "6m" ? new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1) : new Date(`${fromDate}T00:00:00`);
    const to = mode === "6m" ? new Date() : new Date(`${toDate}T00:00:00`);
    for (let cursor = new Date(from.getFullYear(), from.getMonth(), 1); cursor <= to; cursor.setMonth(cursor.getMonth() + 1)) keys.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`);
  } else {
    const end = mode === "custom" ? new Date(`${toDate}T00:00:00`) : new Date();
    const start = mode === "custom" ? new Date(`${fromDate}T00:00:00`) : new Date(end.getFullYear(), end.getMonth(), end.getDate() - (mode === "7d" ? 6 : 13));
    for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) keys.push(toLocalYMD(cursor));
  }
  return keys.map((key) => ({ label: monthly ? key.slice(5) : key.slice(8), fullDate: key, value: values.get(key) || 0 }));
}

function BarChart({ data }: { data: ChartPoint[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const [hovered, setHovered] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <p className="text-center py-16 opacity-50 text-sm">Chưa có dữ liệu</p>
    );
  }

  const sum = data.reduce((s, d) => s + d.value, 0);
  if (sum === 0) {
    return (
      <p className="text-center py-16 opacity-50 text-sm">
        Không có doanh thu trong khoảng đã chọn.
        <br />
        Thử chọn <strong>6 tháng</strong> hoặc nới rộng Từ / Đến.
      </p>
    );
  }

  const tip = hovered != null ? data[hovered] : null;

  return (
    <div>
      <div className="relative" style={{ height: "200px" }}>
        {[0, 25, 50, 75, 100].map((pct) => (
          <div
            key={pct}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: `${pct}%`,
              height: "1px",
              background: "rgba(26,26,26,0.06)",
            }}
          />
        ))}

        <div
          className="absolute inset-0 flex items-end gap-1"
          style={{ paddingBottom: "4px" }}
        >
          {data.map((d, i) => {
            const pct = max > 0 ? (d.value / max) * 100 : 0;
            const isHovered = hovered === i;
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center justify-end"
                style={{ height: "100%", cursor: "pointer" }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <div
                  style={{
                    width: "70%",
                    maxWidth: "36px",
                    height: d.value > 0 ? `${Math.max(pct, 6)}%` : "2px",
                    background: isHovered
                      ? "var(--color-gold)"
                      : "var(--color-charcoal)",
                    borderRadius: "3px 3px 0 0",
                    transition: "background 0.15s, height 0.25s",
                    minHeight: d.value > 0 ? "8px" : "2px",
                    opacity: d.value > 0 ? 1 : 0.2,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-1 mt-1">
        {data.map((d, i) => (
          <div
            key={i}
            className="flex-1 text-center"
            style={{
              fontSize: "10px",
              fontFamily: "var(--font-body)",
              color:
                hovered === i
                  ? "var(--color-charcoal)"
                  : "var(--color-warm-gray)",
              fontWeight: hovered === i ? 600 : 400,
            }}
          >
            {d.label}
          </div>
        ))}
      </div>

      <div
        className="mt-4 text-center"
        style={{ minHeight: "44px", fontFamily: "var(--font-body)" }}
      >
        {tip ? (
          <>
            <p
              style={{ color: "var(--color-charcoal)" }}
              className="text-sm font-medium"
            >
              {tip.fullDate}
            </p>
            <p
              style={{
                color: "var(--color-gold)",
                fontFamily: "var(--font-display)",
              }}
              className="text-lg"
            >
              {fmtFull(tip.value)}
            </p>
          </>
        ) : (
          <p style={{ color: "var(--color-warm-gray)" }} className="text-xs">
            Di chuột vào một cột để xem ngày và doanh thu
          </p>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard({ navigate }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"7d" | "14d" | "6m" | "custom">("6m");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const range = useMemo(() => {
    if (mode === "custom") {
      const longRange = !!fromDate && !!toDate && new Date(toDate).getTime() - new Date(fromDate).getTime() > 31 * 86400000;
      return { from: fromDate, to: toDate, interval: longRange ? "month" as const : "day" as const };
    }
    const end = new Date();
    const start = mode === "6m" ? new Date(end.getFullYear(), end.getMonth() - 5, 1) : new Date(end.getFullYear(), end.getMonth(), end.getDate() - (mode === "7d" ? 6 : 13));
    return { from: toLocalYMD(start), to: toLocalYMD(end), interval: mode === "6m" ? "month" as const : "day" as const };
  }, [mode, fromDate, toDate]);

  useEffect(() => {
    if (mode === "custom" && (!range.from || !range.to || range.from > range.to)) return;
    let active = true;
    setLoading(true);
    setError("");
    getDashboardStatistics(range)
      .then((data) => { if (active) setStats(data); })
      .catch((err: Error) => { if (active) setError(err.message || "Could not load dashboard statistics"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [range, mode]);

  const chartData = useMemo(
    () => stats ? buildChart(stats.revenueSeries, mode, range.from, range.to) : [],
    [stats, mode, range]
  );
  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <p className="opacity-60">Đang tải bảng điều khiển...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <p style={{ color: "#c0392b" }}>{error}</p>
        <p className="text-sm opacity-60 mt-2">
          Cần đăng nhập bằng tài khoản Admin.
        </p>
      </div>
    );
  }

  if (!stats || (mode === "custom" && (!range.from || !range.to || range.from > range.to))) {
    return <div className="p-6 lg:p-8"><p className="opacity-60">Choose a valid date range to view statistics.</p></div>;
  }

  const pending = stats.byStatus.pending;
  const cancelled = stats.byStatus.cancelled;
  const lowStock = stats.lowStock;
  const cancelRate = stats.totalOrders ? ((cancelled / stats.totalOrders) * 100).toFixed(1) : "0";
  const customerName = (order: DashboardStatistics["recentOrders"][number]) =>
    typeof order.userId === "object" && order.userId?.name ? order.userId.name : order.receiverName || "—";
  const statCards: {
    label: string;
    value: string;
    sub: string;
    go: Page;
  }[] = [
    {
      label: "Doanh thu ho\u00E0n t\u1EA5t (to\u00E0n th\u1EDDi gian)",
      value: fmt(stats.revenueAllTime.total),
      sub: `${stats.revenueAllTime.orders} \u0111\u01A1n \u0111\u00E3 ho\u00E0n t\u1EA5t`,
      go: "admin-orders",
    },
    {
      label: "Tổng đơn hàng",
      value: String(stats.totalOrders),
      sub: `${pending} chờ xác nhận`,
      go: "admin-orders",
    },
    {
      label: "Sản phẩm",
      value: String(stats.totalProducts),
      sub: `${stats.lowStockCount} sắp hết`,
      go: "admin-products",
    },
    {
      label: "Tỉ lệ huỷ đơn",
      value: `${cancelRate}%`,
      sub: `${cancelled} đơn đã hủy`,
      go: "admin-orders",
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <p
          style={{
            color: "var(--color-warm-gray)",
            fontFamily: "var(--font-body)",
          }}
          className="text-xs tracking-widest uppercase mb-1"
        >
          Tổng Quan
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-charcoal)",
          }}
          className="text-3xl font-normal"
        >
          Bảng Điều Khiển
        </h1>
      </div>

      {(pending > 0 || stats.lowStockCount > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {pending > 0 && (
            <button
              type="button"
              onClick={() => navigate("admin-orders")}
              style={{
                background: "rgba(201,168,130,0.12)",
                border: "1px solid rgba(201,168,130,0.4)",
                textAlign: "left",
              }}
              className="p-3 flex items-center gap-3 cursor-pointer"
            >
              <span className="text-lg">⏳</span>
              <p
                style={{
                  color: "var(--color-charcoal)",
                  fontFamily: "var(--font-body)",
                }}
                className="text-xs"
              >
                <strong>{pending}</strong> đơn hàng đang chờ xác nhận
              </p>
            </button>
          )}
          {stats.lowStockCount > 0 && (
            <button
              type="button"
              onClick={() => navigate("admin-products")}
              style={{
                background: "rgba(192,57,43,0.08)",
                border: "1px solid rgba(192,57,43,0.3)",
                textAlign: "left",
              }}
              className="p-3 flex items-center gap-3 cursor-pointer"
            >
              <span className="text-lg">⚠️</span>
              <p
                style={{
                  color: "var(--color-charcoal)",
                  fontFamily: "var(--font-body)",
                }}
                className="text-xs"
              >
                <strong>{stats.lowStockCount}</strong> sản phẩm tồn kho &lt;{" "}
                {stats.lowStockThreshold}
              </p>
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => navigate(s.go)}
            style={{
              background: "white",
              border: "1px solid var(--color-champagne)",
              textAlign: "left",
              cursor: "pointer",
            }}
            className="p-5 hover:border-[var(--color-charcoal)] transition-all"
          >
            <p
              style={{
                color: "var(--color-warm-gray)",
                fontFamily: "var(--font-body)",
              }}
              className="text-xs tracking-widest uppercase mb-3"
            >
              {s.label}
            </p>
            <p
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-charcoal)",
              }}
              className="text-2xl font-normal mb-1"
            >
              {s.value}
            </p>
            <p
              style={{
                color: "var(--color-warm-gray)",
                fontFamily: "var(--font-body)",
              }}
              className="text-xs"
            >
              {s.sub}
            </p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div
          style={{
            background: "white",
            border: "1px solid var(--color-champagne)",
          }}
          className="lg:col-span-2 p-6"
        >
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-charcoal)",
              }}
              className="text-lg font-normal"
            >
              Doanh Thu
            </h2>
            <div className="flex flex-wrap gap-1">
              {(
                [
                  ["7d", "7 ngày"],
                  ["14d", "14 ngày"],
                  ["6m", "6 tháng"],
                  ["custom", "Tùy chọn"],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
              onClick={() => {
                setMode(k);
                if (k === "custom" && (!fromDate || !toDate)) {
                  const end = new Date();
                  const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 29);
                  setFromDate(toLocalYMD(start));
                  setToDate(toLocalYMD(end));
                }
              }}
                  style={{
                    fontFamily: "var(--font-body)",
                    background:
                      mode === k ? "var(--color-charcoal)" : "transparent",
                    color:
                      mode === k
                        ? "var(--color-champagne)"
                        : "var(--color-warm-gray)",
                    border:
                      mode === k
                        ? "1px solid var(--color-charcoal)"
                        : "1px solid var(--color-champagne)",
                  }}
                  className="px-3 py-1 text-xs tracking-widest uppercase"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {mode === "custom" && (
            <div className="flex flex-wrap gap-3 mb-4 items-center">
              <label
                className="text-xs flex items-center gap-2"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Từ
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  style={{
                    border: "1px solid var(--color-champagne)",
                    fontFamily: "var(--font-body)",
                  }}
                  className="px-2 py-1 text-xs"
                />
              </label>
              <label
                className="text-xs flex items-center gap-2"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Đến
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  style={{
                    border: "1px solid var(--color-champagne)",
                    fontFamily: "var(--font-body)",
                  }}
                  className="px-2 py-1 text-xs"
                />
              </label>
            </div>
          )}

          <BarChart data={chartData} />
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t" style={{ borderColor: "var(--color-champagne)" }}>
            <p className="text-xs">Doanh thu: <strong>{fmt(stats.revenuePeriod.total)}</strong></p>
            <p className="text-xs">Số đơn: <strong>{stats.revenuePeriod.orders}</strong></p>
            <p className="text-xs">Tiền hàng: <strong>{fmt(stats.revenuePeriod.subtotal)}</strong></p>
            <p className="text-xs">Giảm giá: <strong>{fmt(stats.revenuePeriod.discount)}</strong></p>
            <p className="text-xs">Phí giao hàng: <strong>{fmt(stats.revenuePeriod.shippingFee)}</strong></p>
          </div>
        </div>

        <div
          style={{
            background: "white",
            border: "1px solid var(--color-champagne)",
          }}
          className="p-6"
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-charcoal)",
            }}
            className="text-lg font-normal mb-6"
          >
            Trạng Thái Đơn
          </h2>
          <div className="space-y-4">
            {(
              [
                "pending",
                "confirmed",
                "shipping",
                "completed",
                "cancelled",
              ] as const
            ).map((s) => {
              const count = stats.byStatus[s];
              const pct =
                stats.totalOrders > 0
                  ? (count / stats.totalOrders) * 100
                  : 0;
              return (
                <div key={s}>
                  <div className="flex justify-between mb-1">
                    <span
                      style={{
                        color: "var(--color-charcoal)",
                        fontFamily: "var(--font-body)",
                      }}
                      className="text-xs"
                    >
                      {statusLabel[s]}
                    </span>
                    <span
                      style={{
                        color: "var(--color-warm-gray)",
                        fontFamily: "var(--font-body)",
                      }}
                      className="text-xs"
                    >
                      {count}
                    </span>
                  </div>
                  <div
                    style={{
                      height: "4px",
                      background: "var(--color-champagne)",
                      borderRadius: "2px",
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: statusColor[s],
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          style={{
            background: "white",
            border: "1px solid var(--color-champagne)",
          }}
          className="p-6"
        >
          <div className="flex justify-between items-center mb-5">
            <h2
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-charcoal)",
              }}
              className="text-lg font-normal"
            >
              Đơn Hàng Gần Đây
            </h2>
            <button
              type="button"
              onClick={() => navigate("admin-orders")}
              style={{
                color: "var(--color-gold)",
                fontFamily: "var(--font-body)",
              }}
              className="text-xs tracking-widest uppercase"
            >
              Xem tất cả →
            </button>
          </div>
          <div className="space-y-3">
            {stats.recentOrders.length === 0 && (
              <p className="text-sm opacity-50">Chưa có đơn hàng</p>
            )}
            {stats.recentOrders.map((order) => (
              <button
                key={order._id}
                type="button"
                onClick={() => navigate("admin-orders")}
                style={{
                  borderBottom: "1px solid var(--color-champagne)",
                  width: "100%",
                  textAlign: "left",
                }}
                className="pb-3 flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-charcoal)",
                    }}
                    className="text-xs font-medium"
                  >
                    {order.orderCode || order._id}
                  </p>
                  <p
                    style={{
                      color: "var(--color-warm-gray)",
                      fontFamily: "var(--font-body)",
                    }}
                    className="text-xs font-light"
                  >
                    {customerName(order)} ·{" "}
                    {(order.createdAt || "").slice(0, 10)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    style={{
                      color: statusColor[order.status],
                      fontFamily: "var(--font-body)",
                    }}
                    className="text-xs"
                  >
                    {statusLabel[order.status]}
                  </span>
                  <span
                    style={{
                      color: "var(--color-charcoal)",
                      fontFamily: "var(--font-body)",
                    }}
                    className="text-xs font-medium"
                  >
                    {fmt(order.total)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            background: "white",
            border: "1px solid var(--color-champagne)",
          }}
          className="p-6"
        >
          <div className="flex justify-between items-center mb-5">
            <h2
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-charcoal)",
              }}
              className="text-lg font-normal"
            >
              Tồn Kho Thấp (&lt; {stats.lowStockThreshold})
            </h2>
            <button
              type="button"
              onClick={() => navigate("admin-products")}
              style={{
                color: "var(--color-gold)",
                fontFamily: "var(--font-body)",
              }}
              className="text-xs tracking-widest uppercase"
            >
              Sản phẩm →
            </button>
          </div>
          <div className="space-y-4">
            {lowStock.length === 0 && (
              <p className="text-sm opacity-50">Không có SP sắp hết</p>
            )}
            {lowStock.slice(0, 8).map((item) => {
              const pct = Math.min((item.stock / stats.lowStockThreshold) * 100, 100);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate("admin-products")}
                  className="w-full text-left cursor-pointer"
                >
                  <div className="flex justify-between mb-1">
                    <span
                      style={{
                        color: "var(--color-charcoal)",
                        fontFamily: "var(--font-body)",
                      }}
                      className="text-xs truncate max-w-48"
                    >
                      {item.name}
                    </span>
                    <span
                      style={{
                        color: "#c0392b",
                        fontFamily: "var(--font-body)",
                      }}
                      className="text-xs font-medium ml-2"
                    >
                      ⚠ {item.stock}
                    </span>
                  </div>
                  <div
                    style={{
                      height: "4px",
                      background: "var(--color-champagne)",
                      borderRadius: "2px",
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: "#c0392b",
                        borderRadius: "2px",
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ background: "white", border: "1px solid var(--color-champagne)" }} className="p-6">
          <h2 style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-lg font-normal mb-5">Sản phẩm bán chạy</h2>
          <div className="space-y-4">
            {stats.topSelling.length === 0 && <p className="text-sm opacity-50">Chưa có đơn hoàn tất</p>}
            {stats.topSelling.map((item, index) => (
              <div key={item.productId || item.name} className="flex items-start justify-between gap-3 border-b pb-3" style={{ borderColor: "var(--color-champagne)" }}>
                <div className="min-w-0"><p className="text-xs font-medium truncate">{index + 1}. {item.name}</p><p className="text-xs opacity-60">{item.quantity} sản phẩm</p></div>
                <span className="text-xs whitespace-nowrap" title="Giá trị hàng trước giảm giá, chưa gồm phí giao hàng">{fmt(item.grossSales)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
