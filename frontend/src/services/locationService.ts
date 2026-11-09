const LOCATION_API = "https://tinhthanhpho.com/api/v1";

export interface ProvinceOption { code: string; name: string }
export interface WardOption { code: string; name: string; fullName: string }

interface ApiResponse<T> {
  success: boolean;
  data: T[];
  metadata?: { total?: number; page?: number; limit?: number };
}

let provincesPromise: Promise<ProvinceOption[]> | undefined;
const wardsPromises = new Map<string, Promise<WardOption[]>>();

async function getPage<T>(path: string, page: number, limit: number) {
  const response = await fetch(`${LOCATION_API}${path}?page=${page}&limit=${limit}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("Không tải được danh sách địa giới hành chính.");
  const result = await response.json() as ApiResponse<T>;
  if (!result.success || !Array.isArray(result.data)) throw new Error("Dữ liệu địa giới hành chính không hợp lệ.");
  return result;
}

export function getProvinces(): Promise<ProvinceOption[]> {
  if (!provincesPromise) {
    provincesPromise = getPage<{ code: string; name: string }>("/new-provinces", 1, 100)
      .then(({ data }) => data.map(({ code, name }) => ({ code, name })).sort((a, b) => a.name.localeCompare(b.name, "vi")))
      .catch((error) => { provincesPromise = undefined; throw error; });
  }
  return provincesPromise;
}

export function getWards(provinceCode: string): Promise<WardOption[]> {
  const cached = wardsPromises.get(provinceCode);
  if (cached) return cached;
  const request = (async () => {
    const first = await getPage<{ code: string; name: string; type?: string; full_name?: string }>(`/new-provinces/${encodeURIComponent(provinceCode)}/wards`, 1, 1000);
    const wards = [...first.data];
    const pages = Math.ceil((first.metadata?.total ?? wards.length) / (first.metadata?.limit || 1000));
    for (let page = 2; page <= pages; page += 1) {
      const next = await getPage<{ code: string; name: string; type?: string; full_name?: string }>(`/new-provinces/${encodeURIComponent(provinceCode)}/wards`, page, 1000);
      wards.push(...next.data);
    }
    return wards.map(({ code, name, type, full_name }) => ({ code, name, fullName: full_name || `${type ? `${type} ` : ""}${name}` }))
      .sort((a, b) => a.name.localeCompare(b.name, "vi"));
  })().catch((error) => { wardsPromises.delete(provinceCode); throw error; });
  wardsPromises.set(provinceCode, request);
  return request;
}

export function resolveProvince(provinceName: string, provinces: ProvinceOption[]) {
  const normalized = provinceName.trim().toLocaleLowerCase("vi");
  const aliases: Record<string, string> = {
    "tp.hcm": "hồ chí minh",
    "tp. hồ chí minh": "hồ chí minh",
    "tp.hồ chí minh": "hồ chí minh",
    "nha trang": "khánh hòa",
  };
  const target = aliases[normalized] || normalized;
  return provinces.find((province) => province.name.toLocaleLowerCase("vi") === target);
}
