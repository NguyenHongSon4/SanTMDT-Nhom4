import { useState, useEffect, useMemo } from "react";
import type { Page } from "../../App";
import { statusLabel, statusColor } from "../../data/mockData";
import {
  getAllOrders,
  type AdminOrderFromApi,
} from "../../services/orderService";
import {
  fetchAdminProducts,
  type AdminProduct,
} from "../../services/productService";

const fmt = (n: number) =>
  n >= 1_000_000
    ? (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M₫"
    : n.toLocaleString("vi-VN") + "₫";
const fmtFull = (n: number) => n.toLocaleString("vi-VN") + "₫";
const LOW_STOCK = 10;

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

function orderDayKey(iso: string) {
  if (!iso) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso.slice(0, 10);
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return toLocalYMD(d);
}

function buildChart(
  orders: AdminOrderFromApi[],
  mode: "7d" | "14d" | "6m" | "custom",
  fromDate: string,
  toDate: string
): ChartPoint[] {
  const valid = orders.filter((o) => o.status !== "cancelled" && o.createdAt);

  if (mode === "custom") {
    if (!fromDate || !toDate || fromDate > toDate) return [];

    const map = new Map<string, number>();
    const from = new Date(fromDate + "T00:00:00");
    const to = new Date(toDate + "T00:00:00");

    for (let t = from.getTime(); t <= to.getTime(); t += 86400000) {
      map.set(toLocalYMD(new Date(t)), 0);
    }

    for (const o of valid) {
      const key = orderDayKey(o.createdAt);
      if (key >= fromDate && key <= toDate) {
        if (!map.has(key)) map.set(key, 0);
        map.set(key, (map.get(key) || 0) + (o.total || 0));
      }
    }

    const entries = Array.from(map.entries());
    if (entries.length > 31) {
      const byMonth = new Map<string, number>();
      for (const [day, val] of entries) {
        const m = day.slice(0, 7);
        byMonth.set(m, (byMonth.get(m) || 0) + val);
      }
      return Array.from(byMonth.entries()).map(([k, value]) => ({
        label: k.slice(5),
        fullDate: k,
        value,
      }));
    }

    return entries.map(([k, value]) => ({
      label: k.slice(8),
      fullDate: k,
      value,
    }));
  }

  if (mode === "6m") {
    const map = new Map<string, number>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, 0);
    }
    for (const o of valid) {
      const key = orderDayKey(o.createdAt).slice(0, 7);
      if (map.has(key)) {
        map.set(key, (map.get(key) || 0) + (o.total || 0));
      }
    }
    return Array.from(map.entries()).map(([k, value]) => ({
      label: k.slice(5),
      fullDate: k,
      value,
    }));
  }

  const days = mode === "7d" ? 7 : 14;
  const map = new Map<string, number>();
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    map.set(toLocalYMD(d), 0);
  }
  for (const o of valid) {
    const key = orderDayKey(o.createdAt);
    if (map.has(key)) {
      map.set(key, (map.get(key) || 0) + (o.total || 0));
    }
  }
  return Array.from(map.entries()).map(([k, value]) => ({
    label: k.slice(8),
    fullDate: k,
    value,
  }));
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
  const [orders, setOrders] = useState<AdminOrderFromApi[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"7d" | "14d" | "6m" | "custom">("6m");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [o, p] = await Promise.all([
          getAllOrders(),
          fetchAdminProducts(),
        ]);
        setOrders(o);
        setProducts(p);
      } catch (err: any) {
        setError(err.message || "Không tải được dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const pending = orders.filter((o) => o.status === "pending").length;
    const cancelled = orders.filter((o) => o.status === "cancelled").length;
    const completed = orders.filter((o) => o.status === "completed");
    const revenueAll = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((s, o) => s + (o.total || 0), 0);
    const revenueCompleted = completed.reduce(
      (s, o) => s + (o.total || 0),
      0
    );
    const cancelRate =
      orders.length > 0
        ? ((cancelled / orders.length) * 100).toFixed(1)
        : "0";
    const lowStock = products.filter((p) => p.stock < LOW_STOCK);
    const byStatus = {
      pending: orders.filter((o) => o.status === "pending").length,
      confirmed: orders.filter((o) => o.status === "confirmed").length,
      shipping: orders.filter((o) => o.status === "shipping").length,
      completed: completed.length,
      cancelled,
    };
    return {
      pending,
      cancelled,
      revenueAll,
      revenueCompleted,
      cancelRate,
      lowStock,
      byStatus,
      totalOrders: orders.length,
      totalProducts: products.length,
    };
  }, [orders, products]);

  const chartData = useMemo(
    () => buildChart(orders, mode, fromDate, toDate),
    [orders, mode, fromDate, toDate]
  );

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5),
    [orders]
  );

  const customerName = (o: AdminOrderFromApi) => {
    if (typeof o.userId === "object" && o.userId?.name) return o.userId.name;
    return o.receiverName || "—";
  };

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

  const statCards: {
    label: string;
    value: string;
    sub: string;
    go: Page;
  }[] = [
    {
      label: "Doanh thu (chưa huỷ)",
      value: fmt(stats.revenueAll),
      sub: `Hoàn tất: ${fmt(stats.revenueCompleted)}`,
      go: "admin-orders",
    },
    {
      label: "Tổng đơn hàng",
      value: String(stats.totalOrders),
      sub: `${stats.pending} chờ xác nhận`,
      go: "admin-orders",
    },
    {
      label: "Sản phẩm",
      value: String(stats.totalProducts),
      sub: `${stats.lowStock.length} sắp hết`,
      go: "admin-products",
    },
    {
      label: "Tỉ lệ huỷ đơn",
      value: `${stats.cancelRate}%`,
      sub: `${stats.cancelled} đơn đã huỷ`,
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

      {(stats.pending > 0 || stats.lowStock.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {stats.pending > 0 && (
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
                <strong>{stats.pending}</strong> đơn hàng đang chờ xác nhận
              </p>
            </button>
          )}
          {stats.lowStock.length > 0 && (
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
                <strong>{stats.lowStock.length}</strong> sản phẩm tồn kho &lt;{" "}
                {LOW_STOCK}
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
                  onClick={() => setMode(k)}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            {recentOrders.length === 0 && (
              <p className="text-sm opacity-50">Chưa có đơn hàng</p>
            )}
            {recentOrders.map((order) => (
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
              Tồn Kho Thấp (&lt; {LOW_STOCK})
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
            {stats.lowStock.length === 0 && (
              <p className="text-sm opacity-50">Không có SP sắp hết</p>
            )}
            {stats.lowStock.slice(0, 8).map((item) => {
              const pct = Math.min((item.stock / LOW_STOCK) * 100, 100);
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
      </div>
    </div>
  );
}