import { useState, useRef, useEffect } from "react";
import type { Page, AppUser } from "../App";

interface NavbarProps {
  page: Page;
  navigate: (p: Page) => void;
  cartCount: number;
  user: AppUser | null;
  onLogout: () => void;
}

export default function Navbar({ page, navigate, cartCount, user, onLogout }: NavbarProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isAdmin = page.startsWith("admin");

  return (
    <nav style={{ background: isAdmin ? "#111" : "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-16">
        {/* Logo */}
        <button
          onClick={() => navigate(user?.role === "admin" ? "admin-dashboard" : "home")}
          style={{ fontFamily: "var(--font-display)", color: "var(--color-champagne)" }}
          className="text-xl font-medium tracking-widest uppercase hover:opacity-80 transition-opacity"
        >
          Lumière
          {user?.role === "admin" && (
            <span style={{ color: "var(--color-gold)", fontFamily: "var(--font-body)" }} className="text-xs ml-2 tracking-widest">ADMIN</span>
          )}
        </button>

        {/* Customer nav links */}
        {user?.role !== "admin" && (
          <div className="hidden md:flex items-center gap-10">
            {(["home", "products"] as Page[]).map((p) => (
              <button
                key={p}
                onClick={() => navigate(p)}
                style={{
                  color: page === p ? "var(--color-gold)" : "var(--color-champagne)",
                  fontFamily: "var(--font-body)",
                }}
                className="text-sm font-light tracking-widest uppercase transition-colors hover:opacity-70"
              >
                {p === "home" ? "Trang Chủ" : "Sản Phẩm"}
              </button>
            ))}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-5">
          {/* Cart (customer only) */}
          {user?.role !== "admin" && (
            <button
              onClick={() => navigate("cart")}
              style={{ color: page === "cart" ? "var(--color-gold)" : "var(--color-champagne)" }}
              className="relative flex items-center gap-1.5 text-sm font-light tracking-widest uppercase transition-opacity hover:opacity-70"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span className="hidden sm:inline">Giỏ</span>
              {cartCount > 0 && (
                <span style={{ background: "var(--color-gold)", color: "var(--color-charcoal)" }} className="absolute -top-2 -right-3 w-5 h-5 rounded-full text-xs font-semibold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* User menu or login */}
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{ color: "var(--color-champagne)" }}
                className="flex items-center gap-2 hover:opacity-70 transition-opacity"
              >
                <div style={{ width: "30px", height: "30px", background: "rgba(201,168,130,0.2)", border: "1px solid var(--color-gold)", borderRadius: "50%" }} className="flex items-center justify-center">
                  <span style={{ color: "var(--color-gold)", fontFamily: "var(--font-display)", fontSize: "12px" }}>{user.name[0]}</span>
                </div>
                <span style={{ fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase hidden sm:block">{user.name.split(" ").slice(-1)[0]}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ transform: userMenuOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {userMenuOpen && (
                <div
                  style={{ background: "var(--color-charcoal)", border: "1px solid rgba(232,221,208,0.15)", minWidth: "180px", top: "calc(100% + 8px)", right: 0 }}
                  className="absolute z-50 shadow-xl"
                >
                  <div style={{ borderBottom: "1px solid rgba(232,221,208,0.1)" }} className="px-4 py-3">
                    <p style={{ color: "var(--color-champagne)", fontFamily: "var(--font-body)" }} className="text-xs font-medium">{user.name}</p>
                    <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs font-light truncate">{user.email}</p>
                  </div>
                  {user.role === "admin" ? (
                    [
                      { label: "Dashboard", page: "admin-dashboard" as Page },
                      { label: "Sản Phẩm", page: "admin-products" as Page },
                      { label: "Danh Mục", page: "admin-categories" as Page },
                      { label: "Đơn Hàng", page: "admin-orders" as Page },
                      { label: "Người Dùng", page: "admin-users" as Page },
                    ].map((item) => (
                      <button
                        key={item.page}
                        onClick={() => { navigate(item.page); setUserMenuOpen(false); }}
                        style={{ color: "var(--color-champagne)", fontFamily: "var(--font-body)", width: "100%", textAlign: "left" }}
                        className="px-4 py-2.5 text-xs tracking-widest uppercase hover:bg-[rgba(232,221,208,0.08)] transition-colors block"
                      >
                        {item.label}
                      </button>
                    ))
                  ) : (
                    [
                      { label: "Hồ Sơ", page: "profile" as Page },
                      { label: "Đơn Hàng", page: "orders" as Page },
                    ].map((item) => (
                      <button
                        key={item.page}
                        onClick={() => { navigate(item.page); setUserMenuOpen(false); }}
                        style={{ color: "var(--color-champagne)", fontFamily: "var(--font-body)", width: "100%", textAlign: "left" }}
                        className="px-4 py-2.5 text-xs tracking-widest uppercase hover:bg-[rgba(232,221,208,0.08)] transition-colors block"
                      >
                        {item.label}
                      </button>
                    ))
                  )}
                  <div style={{ borderTop: "1px solid rgba(232,221,208,0.1)" }}>
                    <button
                      onClick={() => { onLogout(); setUserMenuOpen(false); }}
                      style={{ color: "#c0392b", fontFamily: "var(--font-body)", width: "100%", textAlign: "left" }}
                      className="px-4 py-2.5 text-xs tracking-widest uppercase hover:bg-[rgba(192,57,43,0.1)] transition-colors block"
                    >
                      Đăng Xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("login")}
              style={{ color: "var(--color-champagne)", fontFamily: "var(--font-body)", border: "1px solid rgba(232,221,208,0.3)" }}
              className="px-4 py-1.5 text-xs tracking-widest uppercase hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors hidden sm:block"
            >
              Đăng Nhập
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
