import { useState, useEffect } from "react";
import { statusLabel, statusColor } from "../../data/mockData";
import {
  getAllOrders,
  updateOrderStatus,
  type AdminOrderFromApi,
} from "../../services/orderService";

const fmt = (n: number) => n.toLocaleString("vi-VN") + "₫";

const statusFlow = ["pending", "confirmed", "shipping", "completed"] as const;
const paymentLabel: Record<string, string> = {
  cod: "COD",
  transfer: "Chuyển khoản",
};

type OrderStatus = AdminOrderFromApi["status"];

interface AdminOrderView {
  mongoId: string;
  id: string; // orderCode
  userName: string;
  phone: string;
  address: string;
  city: string;
  payment: "cod" | "transfer";
  status: OrderStatus;
  createdAt: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  items: {
    name: string;
    price: number;
    qty: number;
    image: string;
    variant: string;
  }[];
}

function mapOrder(o: AdminOrderFromApi): AdminOrderView {
  const userName =
    typeof o.userId === "object" && o.userId?.name
      ? o.userId.name
      : o.receiverName || "—";

  return {
    mongoId: o._id,
    id: o.orderCode || o._id,
    userName,
    phone: o.phone,
    address: o.shippingAddress,
    city: o.shippingCity,
    payment: o.paymentMethod,
    status: o.status,
    createdAt: o.createdAt ? o.createdAt.slice(0, 10) : "",
    subtotal: o.subtotal,
    discount: o.discount,
    shipping: o.shippingFee,
    total: o.total,
    items: (o.items || []).map((it) => ({
      name: it.name,
      price: it.price,
      qty: it.quantity,
      image: it.image || "https://via.placeholder.com/44x56?text=L",
      variant: "Mặc định",
    })),
  };
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrderView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderView | null>(null);
  const [updating, setUpdating] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllOrders();
      setOrders(data.map(mapOrder));
    } catch (err: any) {
      setError(err.message || "Không tải được đơn hàng (cần đăng nhập Admin)");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      o.id.toLowerCase().includes(q) ||
      o.userName.toLowerCase().includes(q) ||
      o.phone.includes(search);
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleUpdateStatus = async (mongoId: string, status: OrderStatus) => {
    setUpdating(true);
    try {
      const updated = await updateOrderStatus(mongoId, status);
      const mapped = mapOrder(updated);
      setOrders((prev) =>
        prev.map((o) => (o.mongoId === mongoId ? mapped : o))
      );
      if (selectedOrder?.mongoId === mongoId) setSelectedOrder(mapped);
    } catch (err: any) {
      alert(err.message || "Cập nhật trạng thái thất bại");
    } finally {
      setUpdating(false);
    }
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
        <p
          style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }}
          className="text-xs tracking-widest uppercase mb-1"
        >
          Quản Lý
        </p>
        <h1
          style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }}
          className="text-3xl font-normal"
        >
          Đơn Hàng
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { key: "all", label: "Tổng", count: orders.length },
          ...(["pending", "confirmed", "shipping", "completed"] as const).map(
            (s) => ({
              key: s,
              label: statusLabel[s],
              count: orders.filter((o) => o.status === s).length,
            })
          ),
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setStatusFilter(item.key)}
            style={{
              background:
                statusFilter === item.key ? "var(--color-charcoal)" : "white",
              border: "1px solid var(--color-champagne)",
              fontFamily: "var(--font-body)",
            }}
            className="p-3 text-center transition-all"
          >
            <p
              style={{
                color:
                  statusFilter === item.key
                    ? "var(--color-gold)"
                    : "var(--color-warm-gray)",
              }}
              className="text-xs tracking-widest uppercase"
            >
              {item.label}
            </p>
            <p
              style={{
                color:
                  statusFilter === item.key
                    ? "var(--color-champagne)"
                    : "var(--color-charcoal)",
                fontFamily: "var(--font-display)",
              }}
              className="text-2xl font-normal mt-1"
            >
              {item.count}
            </p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div
        style={{ background: "white", border: "1px solid var(--color-champagne)" }}
        className="p-4 mb-4"
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo mã đơn, tên khách, SĐT..."
          style={inputStyle}
          className="w-full px-4 py-2 text-sm outline-none"
        />
      </div>

      {loading && (
        <p className="text-center py-16 opacity-60" style={{ fontFamily: "var(--font-body)" }}>
          Đang tải đơn hàng...
        </p>
      )}

      {error && !loading && (
        <p className="text-center py-16" style={{ color: "#c0392b", fontFamily: "var(--font-body)" }}>
          {error}
        </p>
      )}

      {!loading && !error && (
        <div
          style={{ background: "white", border: "1px solid var(--color-champagne)" }}
          className="overflow-x-auto"
        >
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-champagne)" }}>
                {["Mã Đơn", "Khách Hàng", "Ngày", "Thanh Toán", "Trạng Thái", "Tổng", ""].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        color: "var(--color-warm-gray)",
                        fontFamily: "var(--font-body)",
                      }}
                      className="px-4 py-3 text-xs tracking-widest uppercase text-left font-normal"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr
                  key={order.mongoId}
                  style={{ borderBottom: "1px solid var(--color-champagne)" }}
                  className="hover:bg-[var(--color-mist)] transition-colors"
                >
                  <td className="px-4 py-3">
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        color: "var(--color-charcoal)",
                      }}
                      className="text-xs font-medium"
                    >
                      {order.id}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p
                      style={{
                        color: "var(--color-charcoal)",
                        fontFamily: "var(--font-body)",
                      }}
                      className="text-sm"
                    >
                      {order.userName}
                    </p>
                    <p
                      style={{
                        color: "var(--color-warm-gray)",
                        fontFamily: "var(--font-body)",
                      }}
                      className="text-xs"
                    >
                      {order.phone}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p
                      style={{
                        color: "var(--color-warm-gray)",
                        fontFamily: "var(--font-body)",
                      }}
                      className="text-xs"
                    >
                      {order.createdAt}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      style={{
                        color: "var(--color-warm-gray)",
                        fontFamily: "var(--font-body)",
                      }}
                      className="text-xs"
                    >
                      {paymentLabel[order.payment]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      style={{
                        color: statusColor[order.status],
                        background: statusColor[order.status] + "18",
                        border: `1px solid ${statusColor[order.status]}40`,
                        fontFamily: "var(--font-body)",
                      }}
                      className="text-xs px-2 py-1 tracking-widest uppercase"
                    >
                      {statusLabel[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p
                      style={{
                        color: "var(--color-charcoal)",
                        fontFamily: "var(--font-display)",
                      }}
                      className="text-sm"
                    >
                      {fmt(order.total)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      style={{
                        color: "var(--color-warm-gray)",
                        fontFamily: "var(--font-body)",
                        border: "1px solid var(--color-champagne)",
                      }}
                      className="text-xs px-3 py-1 hover:text-[var(--color-charcoal)] transition-all"
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
              <p
                style={{
                  color: "var(--color-warm-gray)",
                  fontFamily: "var(--font-display)",
                }}
                className="text-lg font-normal italic"
              >
                Không tìm thấy đơn hàng
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal chi tiết */}
      {selectedOrder && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(26,26,26,0.7)",
            zIndex: 200,
          }}
          className="flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            style={{
              background: "var(--color-cream)",
              maxWidth: "580px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            className="p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--color-charcoal)",
                  }}
                  className="text-2xl font-normal"
                >
                  {selectedOrder.id}
                </h3>
                <p
                  style={{
                    color: "var(--color-warm-gray)",
                    fontFamily: "var(--font-body)",
                  }}
                  className="text-xs mt-1"
                >
                  {selectedOrder.createdAt} · {paymentLabel[selectedOrder.payment]}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)}>✕</button>
            </div>

            <div
              style={{
                background: "var(--color-mist)",
                border: "1px solid var(--color-champagne)",
              }}
              className="p-4 mb-5"
            >
              <p
                style={{
                  color: "var(--color-charcoal)",
                  fontFamily: "var(--font-body)",
                }}
                className="text-xs tracking-widest uppercase mb-2 font-medium"
              >
                Thông Tin Khách Hàng
              </p>
              <p
                style={{
                  color: "var(--color-charcoal)",
                  fontFamily: "var(--font-body)",
                }}
                className="text-sm"
              >
                {selectedOrder.userName} · {selectedOrder.phone}
              </p>
              <p
                style={{
                  color: "var(--color-warm-gray)",
                  fontFamily: "var(--font-body)",
                }}
                className="text-xs"
              >
                {selectedOrder.address}, {selectedOrder.city}
              </p>
            </div>

            <div
              className="space-y-3 mb-5"
              style={{
                borderBottom: "1px solid var(--color-champagne)",
                paddingBottom: "16px",
              }}
            >
              {selectedOrder.items.map((item, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: "44px", height: "56px", objectFit: "cover" }}
                  />
                  <div className="flex-1">
                    <p
                      style={{
                        color: "var(--color-charcoal)",
                        fontFamily: "var(--font-display)",
                      }}
                      className="text-sm"
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
                      {item.variant} × {item.qty}
                    </p>
                  </div>
                  <p
                    style={{
                      color: "var(--color-charcoal)",
                      fontFamily: "var(--font-body)",
                    }}
                    className="text-sm"
                  >
                    {fmt(item.price * item.qty)}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-5">
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: "var(--color-warm-gray)" }}>
                  Tạm tính
                </span>
                <span className="text-sm">{fmt(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: "var(--color-warm-gray)" }}>
                    Giảm giá
                  </span>
                  <span className="text-sm" style={{ color: "var(--color-gold)" }}>
                    -{fmt(selectedOrder.discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: "var(--color-warm-gray)" }}>
                  Vận chuyển
                </span>
                <span className="text-sm">
                  {selectedOrder.shipping === 0
                    ? "Miễn phí"
                    : fmt(selectedOrder.shipping)}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-xs uppercase tracking-widest font-medium">
                  Tổng cộng
                </span>
                <span
                  style={{ fontFamily: "var(--font-display)" }}
                  className="text-xl"
                >
                  {fmt(selectedOrder.total)}
                </span>
              </div>
            </div>

            {selectedOrder.status !== "cancelled" && (
              <div>
                <p
                  style={{
                    color: "var(--color-charcoal)",
                    fontFamily: "var(--font-body)",
                  }}
                  className="text-xs tracking-widest uppercase mb-3"
                >
                  Cập Nhật Trạng Thái
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[...statusFlow, "cancelled" as const].map((s) => (
                    <button
                      key={s}
                      disabled={updating || selectedOrder.status === s}
                      onClick={() =>
                        handleUpdateStatus(selectedOrder.mongoId, s)
                      }
                      style={{
                        background:
                          selectedOrder.status === s
                            ? statusColor[s]
                            : "transparent",
                        color:
                          selectedOrder.status === s ? "white" : statusColor[s],
                        border: `1px solid ${statusColor[s]}`,
                        fontFamily: "var(--font-body)",
                        opacity: updating ? 0.6 : 1,
                      }}
                      className="py-2 text-xs tracking-widest uppercase transition-all"
                    >
                      {statusLabel[s]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedOrder.status === "cancelled" && (
              <div
                style={{
                  background: "rgba(192,57,43,0.08)",
                  border: "1px solid rgba(192,57,43,0.3)",
                }}
                className="p-3 text-center"
              >
                <p
                  style={{ color: "#c0392b", fontFamily: "var(--font-body)" }}
                  className="text-xs uppercase tracking-widest"
                >
                  Đơn hàng đã bị huỷ
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}