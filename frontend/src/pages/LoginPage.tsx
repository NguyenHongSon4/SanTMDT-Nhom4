import { useState } from "react";
import type { Page, AppUser } from "../App";
import { login, register } from "../services/authService";

interface LoginPageProps {
  navigate: (p: Page) => void;
  onLogin: (user: AppUser) => void;
}

export default function LoginPage({ navigate, onLogin }: LoginPageProps) {
  const [tab, setTab] = useState<"login" | "register">("login");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);
    try {
      const data = await login(loginEmail, loginPassword);
      onLogin({
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        phone: data.user.phone,
        address: data.user.address,
        city: data.user.city,
        birthdate: data.user.birthdate,
        gender: data.user.gender,
      });
      navigate(data.user.role === "admin" ? "admin-dashboard" : "home");
    } catch (err: any) {
      setLoginError(err.message || "Email hoặc mật khẩu không đúng.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      setRegError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (regPassword !== regConfirm) {
      setRegError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (regPassword.length < 6) {
      setRegError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    setRegError("");
    setLoading(true);
    try {
      const data = await register(regName, regEmail, regPassword);
      setRegSuccess(true);
      setTimeout(() => {
        onLogin({
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          phone: data.user.phone,
          address: data.user.address,
          city: data.user.city,
          birthdate: data.user.birthdate,
        });
        navigate("home");
      }, 1000);
    } catch (err: any) {
      setRegError(err.message || "Đăng ký thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-3 text-sm outline-none transition-colors placeholder:opacity-40";
  const inputStyle = {
    fontFamily: "var(--font-body)",
    border: "1px solid var(--color-champagne)",
    background: "white",
    color: "var(--color-charcoal)",
  };

  return (
    <div
      style={{ paddingTop: "64px", minHeight: "100vh", background: "var(--color-cream)" }}
      className="flex items-center justify-center py-16 px-4"
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <p style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-4xl font-normal mb-2">
            Lumière
          </p>
          <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase">
            Tài Khoản Của Bạn
          </p>
        </div>

        <div style={{ borderBottom: "1px solid var(--color-champagne)" }} className="flex mb-8">
          {(["login", "register"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setLoginError(""); setRegError(""); }}
              style={{
                fontFamily: "var(--font-body)",
                color: tab === t ? "var(--color-charcoal)" : "var(--color-warm-gray)",
                borderBottom: tab === t ? "2px solid var(--color-charcoal)" : "2px solid transparent",
                marginBottom: "-1px",
              }}
              className="flex-1 py-3 text-xs tracking-widest uppercase transition-colors"
            >
              {t === "login" ? "Đăng Nhập" : "Đăng Ký"}
            </button>
          ))}
        </div>

        {tab === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="block text-xs tracking-widest uppercase mb-2">
                Email
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => { setLoginEmail(e.target.value); setLoginError(""); }}
                className={inputCls}
                style={inputStyle}
                placeholder="email@example.com"
                required
              />
            </div>
            <div>
              <label style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="block text-xs tracking-widest uppercase mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => { setLoginPassword(e.target.value); setLoginError(""); }}
                  className={inputCls}
                  style={inputStyle}
                  placeholder="••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-50"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {showPwd ? "Ẩn" : "Hiện"}
                </button>
              </div>
            </div>
            {loginError && (
              <p className="text-sm" style={{ color: "#c0392b", fontFamily: "var(--font-body)" }}>
                {loginError}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-xs tracking-widest uppercase text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--color-charcoal)", fontFamily: "var(--font-body)" }}
            >
              {loading ? "Đang xử lý..." : "Đăng Nhập"}
            </button>
          </form>
        )}

        {tab === "register" && (
          <form onSubmit={handleRegister} className="space-y-4">
            {regSuccess ? (
              <p className="text-center text-sm py-8" style={{ color: "var(--color-charcoal)" }}>
                Đăng ký thành công! Đang chuyển trang...
              </p>
            ) : (
              <>
                <div>
                  <label style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="block text-xs tracking-widest uppercase mb-2">Họ tên</label>
                  <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} className={inputCls} style={inputStyle} required />
                </div>
                <div>
                  <label style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="block text-xs tracking-widest uppercase mb-2">Email</label>
                  <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className={inputCls} style={inputStyle} required />
                </div>
                <div>
                  <label style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="block text-xs tracking-widest uppercase mb-2">Mật khẩu</label>
                  <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className={inputCls} style={inputStyle} required minLength={6} />
                </div>
                <div>
                  <label style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="block text-xs tracking-widest uppercase mb-2">Xác nhận mật khẩu</label>
                  <input type="password" value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} className={inputCls} style={inputStyle} required />
                </div>
                {regError && (
                  <p className="text-sm" style={{ color: "#c0392b", fontFamily: "var(--font-body)" }}>{regError}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 text-xs tracking-widest uppercase text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: "var(--color-charcoal)", fontFamily: "var(--font-body)" }}
                >
                  {loading ? "Đang xử lý..." : "Đăng Ký"}
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}