import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { getProvinces, getWards, resolveProvince, type ProvinceOption, type WardOption } from "../services/locationService";

interface AddressLocationFieldsProps {
  province: string;
  ward: string;
  onProvinceChange: (province: string) => void;
  onWardChange: (ward: string) => void;
  inputClassName: string;
  inputStyle: CSSProperties;
  labels?: boolean;
}

export default function AddressLocationFields({ province, ward, onProvinceChange, onWardChange, inputClassName, inputStyle, labels = true }: AddressLocationFieldsProps) {
  const [provinces, setProvinces] = useState<ProvinceOption[]>([]);
  const [wards, setWards] = useState<WardOption[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingWards, setLoadingWards] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getProvinces().then((data) => { if (active) setProvinces(data); })
      .catch(() => { if (active) setError("Không tải được danh sách tỉnh/thành. Vui lòng tải lại trang."); })
      .finally(() => { if (active) setLoadingProvinces(false); });
    return () => { active = false; };
  }, []);

  const selectedProvince = resolveProvince(province, provinces);
  useEffect(() => {
    let active = true;
    setWards([]);
    if (!selectedProvince) {
      setLoadingWards(false);
      return () => { active = false; };
    }
    setLoadingWards(true);
    setError("");
    getWards(selectedProvince.code).then((data) => { if (active) setWards(data); })
      .catch(() => { if (active) setError("Không tải được danh sách phường/xã. Vui lòng thử lại."); })
      .finally(() => { if (active) setLoadingWards(false); });
    return () => { active = false; };
  }, [selectedProvince?.code]);

  return <>
    <div className="min-w-0">
      {labels && <label className="block text-xs tracking-widest uppercase mb-2">Tỉnh / Thành phố</label>}
      <select value={selectedProvince?.code || ""} onChange={(event) => {
        const next = provinces.find((item) => item.code === event.target.value);
        onProvinceChange(next?.name || "");
        onWardChange("");
      }} disabled={loadingProvinces} style={inputStyle} className={inputClassName}>
        <option value="">{loadingProvinces ? "Đang tải tỉnh/thành..." : "Chọn tỉnh/thành phố"}</option>
        {province && !selectedProvince && <option value="">Địa chỉ cũ: {province}</option>}
        {provinces.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
      </select>
    </div>
    <div className="min-w-0">
      {labels && <label className="block text-xs tracking-widest uppercase mb-2">Phường / Xã</label>}
      <select value={ward} onChange={(event) => onWardChange(event.target.value)} disabled={!selectedProvince || loadingWards} style={inputStyle} className={inputClassName}>
        <option value="">{!selectedProvince ? "Chọn tỉnh/thành trước" : loadingWards ? "Đang tải phường/xã..." : "Chọn phường/xã"}</option>
        {ward && !wards.some((item) => item.name === ward || item.fullName === ward) && <option value={ward}>{ward} (địa chỉ đã lưu)</option>}
        {wards.map((item) => <option key={item.code} value={item.fullName}>{item.fullName}</option>)}
      </select>
    </div>
    {error && <p className="sm:col-span-2 text-xs" style={{ color: "#c0392b" }}>{error}</p>}
    <p className="sm:col-span-2 text-[10px] opacity-50">
      Danh mục địa giới: <a href="https://tinhthanhpho.com/" target="_blank" rel="noreferrer" className="underline">tinhthanhpho.com</a>
    </p>
  </>;
}
