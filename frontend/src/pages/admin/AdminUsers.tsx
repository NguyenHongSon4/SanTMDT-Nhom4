import { useState, useEffect } from "react";
import {
  fetchUsers,
  updateUser,
  createUser,
  type AdminUser,
} from "../../services/userService";

const fmt = (n: number) => n.toLocaleString("vi-VN") + "₫";

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "customer" | "admin">(
    "all"
  );

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editRole, setEditRole] = useState<"customer" | "admin">("customer");
  const [saving, setSaving] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<"customer" | "admin">("customer");
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Không tải được người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const openUser = (u: AdminUser) => {
    setSelectedUser(u);
    setEditRole(u.role);
  };

  const saveRole = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      await updateUser(selectedUser.id, { role: editRole });
      setSelectedUser(null);
      await load();
    } catch (err: any) {
      alert(err.message || "Không lưu được phân quyền");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (u: AdminUser) => {
    try {
      await updateUser(u.id, { isActive: !u.active });
      await load();
    } catch (err: any) {
      alert(err.message || "Không đổi được trạng thái");
    }
  };

  const handleCreate = async () => {
    if (!formName.trim() || !formEmail.trim() || !formPassword) {
      alert("Vui lòng nhập đủ họ tên, email và mật khẩu");
      return;
    }
    if (formPassword.length < 6) {
      alert("Mật khẩu tối thiểu 6 ký tự");
      return;
    }
    setCreating(true);
    try {
      await createUser({
        name: formName.trim(),
        email: formEmail.trim(),
        password: formPassword,
        role: formRole,
      });
      setShowCreate(false);
      setFormName("");
      setFormEmail("");
      setFormPassword("");
      setFormRole("customer");
      await load();
    } catch (err: any) {
      alert(err.message || "Tạo tài khoản thất bại");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <p
            style={{
              color: "var(--color-warm-gray)",
              fontFamily: "var(--font-body)",
            }}
            className="text-xs tracking-widest uppercase mb-1"
          >
            Quản Lý
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-charcoal)",
            }}
            className="text-3xl font-normal"
          >
            Người Dùng
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          style={{
            background: "var(--color-charcoal)",
            color: "var(--color-champagne)",
            fontFamily: "var(--font-body)",
          }}
          className="px-5 py-2 text-xs tracking-widest uppercase hover:opacity-80"
        >
          + Tạo tài khoản
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Tổng Người Dùng", value: users.length },
          {
            label: "Khách Hàng",
            value: users.filter((u) => u.role === "customer").length,
          },
          {
            label: "Đang Hoạt Động",
            value: users.filter((u) => u.active).length,
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "white",
              border: "1px solid var(--color-champagne)",
            }}
            className="p-5"
          >
            <p
              style={{
                color: "var(--color-warm-gray)",
                fontFamily: "var(--font-body)",
              }}
              className="text-xs tracking-widest uppercase mb-2"
            >
              {s.label}
            </p>
            <p
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-charcoal)",
              }}
              className="text-3xl font-normal"
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "white",
          border: "1px solid var(--color-champagne)",
        }}
        className="p-4 mb-4 flex flex-col sm:flex-row gap-3"
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên hoặc email..."
          style={{
            fontFamily: "var(--font-body)",
            border: "1px solid var(--color-champagne)",
          }}
          className="flex-1 px-4 py-2 text-sm outline-none"
        />
        <div className="flex gap-2">
          {(["all", "customer", "admin"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              style={{
                fontFamily: "var(--font-body)",
                background:
                  roleFilter === r ? "var(--color-charcoal)" : "transparent",
                color:
                  roleFilter === r
                    ? "var(--color-champagne)"
                    : "var(--color-warm-gray)",
                border: "1px solid var(--color-champagne)",
              }}
              className="px-4 py-2 text-xs tracking-widest uppercase"
            >
              {r === "all" ? "Tất Cả" : r === "customer" ? "Khách" : "Admin"}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <p className="py-10 text-center opacity-60">Đang tải...</p>
      )}
      {error && !loading && (
        <p className="py-10 text-center" style={{ color: "#c0392b" }}>
          {error}
        </p>
      )}

      {!loading && !error && (
        <div
          style={{
            background: "white",
            border: "1px solid var(--color-champagne)",
          }}
          className="overflow-x-auto"
        >
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-champagne)" }}>
                {[
                  "Người Dùng",
                  "Thành Phố",
                  "Phân Quyền",
                  "Đơn",
                  "Tổng Chi",
                  "Trạng Thái",
                  "",
                ].map((h) => (
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
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  style={{ borderBottom: "1px solid var(--color-champagne)" }}
                  className="hover:bg-[var(--color-mist)]"
                >
                  <td className="px-4 py-3">
                    <p
                      style={{
                        color: "var(--color-charcoal)",
                        fontFamily: "var(--font-body)",
                      }}
                      className="text-sm font-medium"
                    >
                      {user.name}
                    </p>
                    <p
                      style={{
                        color: "var(--color-warm-gray)",
                        fontFamily: "var(--font-body)",
                      }}
                      className="text-xs"
                    >
                      {user.email}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs opacity-70">
                    {user.city || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      style={{
                        background:
                          user.role === "admin"
                            ? "rgba(201,168,130,0.15)"
                            : "var(--color-mist)",
                        color:
                          user.role === "admin"
                            ? "var(--color-gold)"
                            : "var(--color-warm-gray)",
                        fontFamily: "var(--font-body)",
                      }}
                      className="text-xs px-2 py-1 uppercase"
                    >
                      {user.role === "admin" ? "Admin" : "Khách"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{user.orders}</td>
                  <td className="px-4 py-3 text-sm">
                    {user.totalSpent > 0 ? fmt(user.totalSpent) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleActive(user)}
                      title="Bấm để bật/tắt tài khoản"
                      style={{
                        background: user.active
                          ? "rgba(90,138,106,0.12)"
                          : "rgba(192,57,43,0.08)",
                        color: user.active ? "#5a8a6a" : "#c0392b",
                        fontFamily: "var(--font-body)",
                      }}
                      className="text-xs px-2 py-1 uppercase"
                    >
                      {user.active ? "Hoạt Động" : "Vô Hiệu"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => openUser(user)}
                      style={{
                        border: "1px solid var(--color-champagne)",
                        fontFamily: "var(--font-body)",
                      }}
                      className="text-xs px-3 py-1"
                    >
                      Phân Quyền
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="py-10 text-center opacity-60">
              Không tìm thấy người dùng
            </p>
          )}
        </div>
      )}

      {/* Modal phân quyền */}
      {selectedUser && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(26,26,26,0.7)",
            zIndex: 200,
          }}
          className="flex items-center justify-center p-4"
          onClick={() => !saving && setSelectedUser(null)}
        >
          <div
            style={{
              background: "var(--color-cream)",
              maxWidth: "400px",
              width: "100%",
            }}
            className="p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{ fontFamily: "var(--font-display)" }}
              className="text-2xl mb-2"
            >
              Phân Quyền
            </h3>
            <p className="text-sm opacity-70 mb-6">
              {selectedUser.name} · {selectedUser.email}
            </p>
            <div className="space-y-3 mb-6">
              {(
                [
                  ["customer", "Khách Hàng", "Mua sắm, xem đơn cá nhân"],
                  ["admin", "Quản Trị Viên", "Toàn quyền quản lý hệ thống"],
                ] as const
              ).map(([r, label, desc]) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setEditRole(r)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    border:
                      editRole === r
                        ? "1.5px solid var(--color-charcoal)"
                        : "1px solid var(--color-champagne)",
                    background: editRole === r ? "var(--color-mist)" : "white",
                  }}
                  className="p-4"
                >
                  <p className="text-sm font-medium mb-1">{label}</p>
                  <p className="text-xs opacity-60">{desc}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                disabled={saving}
                style={{ border: "1px solid var(--color-champagne)" }}
                className="flex-1 py-3 text-xs tracking-widest uppercase"
              >
                Huỷ
              </button>
              <button
                type="button"
                onClick={saveRole}
                disabled={saving}
                style={{
                  background: "var(--color-charcoal)",
                  color: "var(--color-champagne)",
                }}
                className="flex-[2] py-3 text-xs tracking-widest uppercase disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : "Lưu Phân Quyền"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal tạo tài khoản */}
      {showCreate && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(26,26,26,0.7)",
            zIndex: 200,
          }}
          className="flex items-center justify-center p-4"
          onClick={() => !creating && setShowCreate(false)}
        >
          <div
            style={{
              background: "var(--color-cream)",
              maxWidth: "420px",
              width: "100%",
            }}
            className="p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{ fontFamily: "var(--font-display)" }}
              className="text-2xl mb-6"
            >
              Tạo tài khoản
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs tracking-widest uppercase mb-2">
                  Họ tên *
                </label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={{
                    border: "1px solid var(--color-champagne)",
                    fontFamily: "var(--font-body)",
                  }}
                />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={{
                    border: "1px solid var(--color-champagne)",
                    fontFamily: "var(--font-body)",
                  }}
                />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase mb-2">
                  Mật khẩu *
                </label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={{
                    border: "1px solid var(--color-champagne)",
                    fontFamily: "var(--font-body)",
                  }}
                />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase mb-2">
                  Phân quyền
                </label>
                <select
                  value={formRole}
                  onChange={(e) =>
                    setFormRole(e.target.value as "customer" | "admin")
                  }
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={{
                    border: "1px solid var(--color-champagne)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  <option value="customer">Khách hàng</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                disabled={creating}
                style={{ border: "1px solid var(--color-champagne)" }}
                className="flex-1 py-3 text-xs tracking-widest uppercase"
              >
                Huỷ
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating}
                style={{
                  background: "var(--color-charcoal)",
                  color: "var(--color-champagne)",
                }}
                className="flex-[2] py-3 text-xs tracking-widest uppercase disabled:opacity-50"
              >
                {creating ? "Đang tạo..." : "Tạo tài khoản"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}