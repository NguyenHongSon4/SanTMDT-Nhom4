import { useState } from "react";
import { mockUsers as initialUsers } from "../../data/mockData";
import type { User } from "../../data/mockData";

const fmt = (n: number) => n.toLocaleString("vi-VN") + "₫";

export default function AdminUsers() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "customer" | "admin">("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState<"customer" | "admin">("customer");

  const filtered = users.filter((u) => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const openUser = (u: User) => {
    setSelectedUser(u);
    setEditRole(u.role);
  };

  const saveRole = () => {
    if (!selectedUser) return;
    setUsers((prev) => prev.map((u) => u.id === selectedUser.id ? { ...u, role: editRole } : u));
    setSelectedUser(null);
  };

  const toggleActive = (id: number) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, active: !u.active } : u));
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase mb-1">Quản Lý</p>
        <h1 style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-3xl font-normal">Người Dùng</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Tổng Người Dùng", value: users.length },
          { label: "Khách Hàng", value: users.filter(u => u.role === "customer").length },
          { label: "Đang Hoạt Động", value: users.filter(u => u.active).length },
        ].map((s) => (
          <div key={s.label} style={{ background: "white", border: "1px solid var(--color-champagne)" }} className="p-5">
            <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase mb-2">{s.label}</p>
            <p style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-3xl font-normal">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: "white", border: "1px solid var(--color-champagne)" }} className="p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-warm-gray)" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc email..."
            style={{ fontFamily: "var(--font-body)", border: "1px solid var(--color-champagne)", background: "white", color: "var(--color-charcoal)" }}
            className="w-full pl-9 pr-4 py-2 text-sm outline-none focus:border-[var(--color-charcoal)] transition-colors placeholder:opacity-40"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "customer", "admin"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              style={{
                fontFamily: "var(--font-body)",
                background: roleFilter === r ? "var(--color-charcoal)" : "transparent",
                color: roleFilter === r ? "var(--color-champagne)" : "var(--color-warm-gray)",
                border: "1px solid var(--color-champagne)",
              }}
              className="px-4 py-2 text-xs tracking-widest uppercase transition-all"
            >
              {r === "all" ? "Tất Cả" : r === "customer" ? "Khách Hàng" : "Admin"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "white", border: "1px solid var(--color-champagne)" }} className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-champagne)" }}>
              {["Người Dùng", "Thành Phố", "Phân Quyền", "Đơn Hàng", "Tổng Chi", "Trạng Thái", ""].map((h) => (
                <th key={h} style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="px-4 py-3 text-xs tracking-widest uppercase text-left font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} style={{ borderBottom: "1px solid var(--color-champagne)" }} className="hover:bg-[var(--color-mist)] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div style={{ width: "36px", height: "36px", background: "var(--color-charcoal)", borderRadius: "50%", flexShrink: 0 }} className="flex items-center justify-center">
                      <span style={{ color: "var(--color-gold)", fontFamily: "var(--font-display)" }} className="text-sm">{user.name[0]}</span>
                    </div>
                    <div className="min-w-0">
                      <p style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-sm font-medium truncate max-w-36">{user.name}</p>
                      <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs truncate max-w-36">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs">{user.city}</p>
                </td>
                <td className="px-4 py-3">
                  <span style={{
                    background: user.role === "admin" ? "rgba(201,168,130,0.15)" : "var(--color-mist)",
                    color: user.role === "admin" ? "var(--color-gold)" : "var(--color-warm-gray)",
                    border: `1px solid ${user.role === "admin" ? "rgba(201,168,130,0.4)" : "var(--color-champagne)"}`,
                    fontFamily: "var(--font-body)",
                  }} className="text-xs px-2 py-1 uppercase tracking-widest">
                    {user.role === "admin" ? "Admin" : "Khách Hàng"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-sm">{user.orders}</p>
                </td>
                <td className="px-4 py-3">
                  <p style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-sm">{user.totalSpent > 0 ? fmt(user.totalSpent) : "—"}</p>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(user.id)}
                    style={{
                      background: user.active ? "rgba(90,138,106,0.12)" : "rgba(192,57,43,0.08)",
                      color: user.active ? "#5a8a6a" : "#c0392b",
                      border: `1px solid ${user.active ? "rgba(90,138,106,0.3)" : "rgba(192,57,43,0.3)"}`,
                      fontFamily: "var(--font-body)",
                    }}
                    className="text-xs px-2 py-1 tracking-widest uppercase hover:opacity-70 transition-opacity"
                    title="Nhấn để chuyển trạng thái"
                  >
                    {user.active ? "Hoạt Động" : "Vô Hiệu"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => openUser(user)}
                    style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)", border: "1px solid var(--color-champagne)" }}
                    className="text-xs px-3 py-1 hover:text-[var(--color-charcoal)] hover:border-[var(--color-charcoal)] transition-all"
                  >
                    Phân Quyền
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-10 text-center">
            <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-display)" }} className="text-lg font-normal italic">Không tìm thấy người dùng</p>
          </div>
        )}
      </div>

      {/* Role modal */}
      {selectedUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(26,26,26,0.7)", zIndex: 200 }} className="flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
          <div style={{ background: "var(--color-cream)", maxWidth: "400px", width: "100%" }} className="p-7" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-2xl font-normal mb-2">Phân Quyền</h3>
            <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-sm font-light mb-6">{selectedUser.name} · {selectedUser.email}</p>

            <div className="space-y-3 mb-6">
              {([["customer", "Khách Hàng", "Truy cập mua sắm, xem đơn hàng cá nhân"], ["admin", "Quản Trị Viên", "Toàn quyền quản lý sản phẩm, đơn hàng và người dùng"]] as const).map(([r, label, desc]) => (
                <button
                  key={r}
                  onClick={() => setEditRole(r)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    border: editRole === r ? "1.5px solid var(--color-charcoal)" : "1px solid var(--color-champagne)",
                    background: editRole === r ? "var(--color-mist)" : "white",
                    fontFamily: "var(--font-body)",
                  }}
                  className="p-4 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: editRole === r ? "5px solid var(--color-charcoal)" : "1.5px solid var(--color-champagne)", flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <p style={{ color: "var(--color-charcoal)" }} className="text-sm font-medium mb-1">{label}</p>
                      <p style={{ color: "var(--color-warm-gray)" }} className="text-xs font-light">{desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setSelectedUser(null)} style={{ flex: 1, border: "1px solid var(--color-champagne)", color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="py-3 text-xs tracking-widest uppercase">Huỷ</button>
              <button onClick={saveRole} style={{ flex: 2, background: "var(--color-charcoal)", color: "var(--color-champagne)", fontFamily: "var(--font-body)" }} className="py-3 text-xs tracking-widest uppercase hover:opacity-80 transition-opacity">Lưu Phân Quyền</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
