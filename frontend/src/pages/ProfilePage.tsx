import { useState } from "react";
import type { Page, AppUser } from "../App";

interface ProfilePageProps {
  user: AppUser;
  navigate: (p: Page) => void;
  onLogout: () => void;
  onUpdateUser: (updates: Partial<AppUser>) => void;
}

const cities = ["TP.HCM", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Huế", "Nha Trang", "Hải Phòng"];

export default function ProfilePage({ user, navigate, onLogout, onUpdateUser }: ProfilePageProps) {
  const [tab, setTab] = useState<"info" | "address" | "password">("info");
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState("female");

  const [address, setAddress] = useState(user.address ?? "");
  const [city, setCity] = useState(user.city ?? "TP.HCM");
  const [ward, setWard] = useState("");

  const [curPwd, setCurPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState(false);

  const handleSaveInfo = () => {
    onUpdateUser({ name, phone });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveAddress = () => {
    onUpdateUser({ address, city });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSavePassword = () => {
    if (!curPwd) { setPwdError("Nhập mật khẩu hiện tại"); return; }
    if (newPwd.length < 6) { setPwdError("Mật khẩu mới phải ≥ 6 ký tự"); return; }
    if (newPwd !== confirmPwd) { setPwdError("Mật khẩu xác nhận không khớp"); return; }
    setPwdError("");
    setPwdSuccess(true);
    setCurPwd(""); setNewPwd(""); setConfirmPwd("");
    setTimeout(() => setPwdSuccess(false), 2500);
  };

  const inputStyle = {
    fontFamily: "var(--font-body)",
    border: "1px solid var(--color-champagne)",
    background: "white",
    color: "var(--color-charcoal)",
  };
  const inputCls = "w-full px-4 py-3 text-sm outline-none placeholder:opacity-40 focus:border-[var(--color-charcoal)] transition-colors";

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="block text-xs tracking-widest uppercase mb-2">{children}</label>
  );

  return (
    <div style={{ paddingTop: "64px", minHeight: "100vh", background: "var(--color-cream)" }}>
      <div style={{ background: "var(--color-charcoal)" }} className="py-12 text-center">
        <p style={{ color: "var(--color-gold)", fontFamily: "var(--font-body)" }} className="text-xs tracking-widest uppercase mb-3">Tài Khoản Của Bạn</p>
        <h1 style={{ fontFamily: "var(--font-display)", color: "var(--color-champagne)" }} className="text-4xl font-normal italic">Hồ Sơ</h1>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-12 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Avatar */}
            <div className="text-center mb-6">
              <div
                style={{ width: "80px", height: "80px", background: "var(--color-charcoal)", borderRadius: "50%", margin: "0 auto 12px" }}
                className="flex items-center justify-center"
              >
                <span style={{ fontFamily: "var(--font-display)", color: "var(--color-gold)" }} className="text-2xl font-normal">
                  {user.name[0]}
                </span>
              </div>
              <p style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-base font-normal">{user.name}</p>
              <p style={{ color: "var(--color-warm-gray)", fontFamily: "var(--font-body)" }} className="text-xs font-light">{user.email}</p>
            </div>

            {/* Nav */}
            <nav className="space-y-1">
              {([
                ["info", "Thông Tin Cá Nhân", "👤"],
                ["address", "Địa Chỉ Giao Hàng", "📍"],
                ["password", "Đổi Mật Khẩu", "🔒"],
              ] as const).map(([t, label, icon]) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    fontFamily: "var(--font-body)",
                    color: tab === t ? "var(--color-charcoal)" : "var(--color-warm-gray)",
                    background: tab === t ? "var(--color-mist)" : "transparent",
                    borderLeft: tab === t ? "2px solid var(--color-charcoal)" : "2px solid transparent",
                    width: "100%",
                    textAlign: "left",
                  }}
                  className="px-4 py-3 text-xs tracking-widest uppercase transition-all flex items-center gap-2"
                >
                  <span style={{ fontSize: "14px" }}>{icon}</span>
                  {label}
                </button>
              ))}
              <div style={{ borderTop: "1px solid var(--color-champagne)" }} className="pt-2 mt-2">
                <button
                  onClick={() => navigate("orders")}
                  style={{ fontFamily: "var(--font-body)", color: "var(--color-warm-gray)", width: "100%", textAlign: "left" }}
                  className="px-4 py-3 text-xs tracking-widest uppercase hover:text-[var(--color-charcoal)] transition-colors flex items-center gap-2"
                >
                  <span style={{ fontSize: "14px" }}>📦</span>
                  Lịch Sử Đơn Hàng
                </button>
                <button
                  onClick={onLogout}
                  style={{ fontFamily: "var(--font-body)", color: "#c0392b", width: "100%", textAlign: "left" }}
                  className="px-4 py-3 text-xs tracking-widest uppercase hover:opacity-70 transition-opacity flex items-center gap-2"
                >
                  <span style={{ fontSize: "14px" }}>🚪</span>
                  Đăng Xuất
                </button>
              </div>
            </nav>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            {saved && (
              <div style={{ background: "rgba(90,138,106,0.12)", border: "1px solid rgba(90,138,106,0.3)" }} className="p-3 mb-5 flex items-center gap-2">
                <span style={{ color: "#5a8a6a" }}>✓</span>
                <p style={{ color: "#5a8a6a", fontFamily: "var(--font-body)" }} className="text-xs">Đã lưu thay đổi thành công.</p>
              </div>
            )}

            {tab === "info" && (
              <div style={{ background: "white", border: "1px solid var(--color-champagne)" }} className="p-6">
                <h2 style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-xl font-normal mb-6">Thông Tin Cá Nhân</h2>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label>Họ và Tên</Label>
                      <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} className={inputCls} />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <input value={user.email} readOnly style={{ ...inputStyle, background: "var(--color-mist)", cursor: "not-allowed" }} className={inputCls + " opacity-60"} />
                    </div>
                    <div>
                      <Label>Số Điện Thoại</Label>
                      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="0912 345 678" style={inputStyle} className={inputCls} />
                    </div>
                    <div>
                      <Label>Ngày Sinh</Label>
                      <input type="date" value={birthdate} onChange={e => setBirthdate(e.target.value)} style={inputStyle} className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <Label>Giới Tính</Label>
                    <div className="flex gap-4">
                      {[["female", "Nữ"], ["male", "Nam"], ["other", "Khác"]].map(([v, l]) => (
                        <label key={v} className="flex items-center gap-2 cursor-pointer">
                          <div
                            onClick={() => setGender(v)}
                            style={{
                              width: "16px", height: "16px", borderRadius: "50%",
                              border: gender === v ? "5px solid var(--color-charcoal)" : "1.5px solid var(--color-champagne)",
                              cursor: "pointer",
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ color: "var(--color-charcoal)", fontFamily: "var(--font-body)" }} className="text-sm">{l}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleSaveInfo}
                    style={{ background: "var(--color-charcoal)", color: "var(--color-champagne)", fontFamily: "var(--font-body)" }}
                    className="px-8 py-3 text-xs tracking-widest uppercase hover:opacity-80 transition-opacity"
                  >
                    Lưu Thay Đổi
                  </button>
                </div>
              </div>
            )}

            {tab === "address" && (
              <div style={{ background: "white", border: "1px solid var(--color-champagne)" }} className="p-6">
                <h2 style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-xl font-normal mb-6">Địa Chỉ Giao Hàng Mặc Định</h2>
                <div className="space-y-5">
                  <div>
                    <Label>Địa Chỉ</Label>
                    <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Số nhà, đường, phường/xã, quận/huyện" style={inputStyle} className={inputCls} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label>Tỉnh / Thành Phố</Label>
                      <select value={city} onChange={e => setCity(e.target.value)} style={inputStyle} className={inputCls + " cursor-pointer"}>
                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label>Phường / Xã</Label>
                      <input value={ward} onChange={e => setWard(e.target.value)} placeholder="Phường Bến Nghé..." style={inputStyle} className={inputCls} />
                    </div>
                  </div>
                  <button
                    onClick={handleSaveAddress}
                    style={{ background: "var(--color-charcoal)", color: "var(--color-champagne)", fontFamily: "var(--font-body)" }}
                    className="px-8 py-3 text-xs tracking-widest uppercase hover:opacity-80 transition-opacity"
                  >
                    Lưu Địa Chỉ
                  </button>
                </div>
              </div>
            )}

            {tab === "password" && (
              <div style={{ background: "white", border: "1px solid var(--color-champagne)" }} className="p-6">
                <h2 style={{ fontFamily: "var(--font-display)", color: "var(--color-charcoal)" }} className="text-xl font-normal mb-6">Đổi Mật Khẩu</h2>
                {pwdSuccess ? (
                  <div style={{ background: "rgba(90,138,106,0.12)", border: "1px solid rgba(90,138,106,0.3)" }} className="p-4 flex items-center gap-2">
                    <span style={{ color: "#5a8a6a" }}>✓</span>
                    <p style={{ color: "#5a8a6a", fontFamily: "var(--font-body)" }} className="text-sm">Mật khẩu đã được cập nhật thành công.</p>
                  </div>
                ) : (
                  <div className="space-y-5 max-w-sm">
                    {[
                      ["Mật Khẩu Hiện Tại", curPwd, setCurPwd],
                      ["Mật Khẩu Mới", newPwd, setNewPwd],
                      ["Xác Nhận Mật Khẩu Mới", confirmPwd, setConfirmPwd],
                    ].map(([label, val, setter]) => (
                      <div key={label as string}>
                        <Label>{label as string}</Label>
                        <input
                          type="password"
                          value={val as string}
                          onChange={e => { (setter as (v: string) => void)(e.target.value); setPwdError(""); }}
                          placeholder="••••••••"
                          style={inputStyle}
                          className={inputCls}
                        />
                      </div>
                    ))}
                    {pwdError && <p style={{ color: "#c0392b", fontFamily: "var(--font-body)" }} className="text-xs">{pwdError}</p>}
                    <button
                      onClick={handleSavePassword}
                      style={{ background: "var(--color-charcoal)", color: "var(--color-champagne)", fontFamily: "var(--font-body)" }}
                      className="px-8 py-3 text-xs tracking-widest uppercase hover:opacity-80 transition-opacity"
                    >
                      Cập Nhật Mật Khẩu
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
