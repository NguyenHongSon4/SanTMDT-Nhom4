import type { Page } from "../../App";

interface AdminLayoutProps {
  page: Page;
  navigate: (p: Page) => void;
  children: React.ReactNode;
  onLogout: () => void;
}

const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
  {
    page: "admin-dashboard",
    label: "Tổng Quan",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    page: "admin-products",
    label: "Sản Phẩm",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
  },
  {
    page: "admin-orders",
    label: "Đơn Hàng",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    page: "admin-users",
    label: "Người Dùng",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    page: "admin-categories",
    label: "Danh Mục",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    page: "admin-promotions",
    label: "Mã Giảm Giá",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20.59 13.41 11 3.83V3H4v7h.83l9.58 9.59a2 2 0 0 0 2.82 0l3.36-3.36a2 2 0 0 0 0-2.82Z"/>
        <circle cx="7.5" cy="6.5" r="1"/>
      </svg>
    ),
  },
];

export default function AdminLayout({ page, navigate, children, onLogout }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen" style={{ paddingTop: "64px" }}>
      {/* Sidebar */}
      <aside
        style={{ background: "var(--color-charcoal)", width: "220px", flexShrink: 0, position: "fixed", top: "64px", left: 0, bottom: 0, overflowY: "auto" }}
        className="hidden lg:block"
      >
        <div className="p-4">
          <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase mb-4 px-2">Admin Panel</p>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => navigate(item.page)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  fontFamily: "var(--font-body)",
                  color: page === item.page ? "var(--color-gold)" : "var(--color-champagne)",
                  background: page === item.page ? "rgba(201,168,130,0.12)" : "transparent",
                  borderLeft: page === item.page ? "2px solid var(--color-gold)" : "2px solid transparent",
                }}
                className="flex items-center gap-3 px-3 py-3 text-xs tracking-widest uppercase transition-all hover:opacity-80"
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <div style={{ borderTop: "1px solid rgba(232,221,208,0.1)" }} className="mt-6 pt-4">
            <button
              onClick={() => navigate("home")}
              style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)", width: "100%" }}
              className="flex items-center gap-3 px-3 py-2 text-xs tracking-widest uppercase hover:text-[var(--color-champagne)] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Xem Cửa Hàng
            </button>
            <button
              onClick={onLogout}
              style={{ color: "#c0392b", fontFamily: "var(--font-body)", width: "100%" }}
              className="flex items-center gap-3 px-3 py-2 text-xs tracking-widest uppercase hover:opacity-70 transition-opacity mt-1"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Đăng Xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile nav */}
      <div style={{ background: "var(--color-charcoal)", borderBottom: "1px solid rgba(232,221,208,0.1)" }} className="lg:hidden fixed top-16 left-0 right-0 z-40 flex overflow-x-auto">
        {navItems.map((item) => (
          <button
            key={item.page}
            onClick={() => navigate(item.page)}
            style={{
              color: page === item.page ? "var(--color-gold)" : "var(--color-champagne)",
              fontFamily: "var(--font-body)",
              borderBottom: page === item.page ? "2px solid var(--color-gold)" : "2px solid transparent",
              flexShrink: 0,
            }}
            className="px-5 py-3 text-xs tracking-widest uppercase whitespace-nowrap"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Main desktop */}
      <main style={{ marginLeft: "220px", flex: 1, minHeight: "calc(100vh - 64px)", background: "var(--color-mist)" }} className="hidden lg:block">
        {children}
      </main>
      {/* Main mobile */}
      <main style={{ flex: 1, minHeight: "calc(100vh - 64px)", background: "var(--color-mist)", paddingTop: "40px" }} className="lg:hidden">
        {children}
      </main>
    </div>
  );
}
