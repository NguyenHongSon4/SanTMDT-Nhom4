import { apiRequest } from "./api";

export interface BrandView {
  id: string;
  name: string;
  description: string;
  logo: string;
  active: boolean;
}

interface ApiBrand {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  isActive?: boolean;
}

function mapBrand(b: ApiBrand): BrandView {
  return {
    id: b._id,
    name: b.name,
    description: b.description || "",
    logo: b.logo || "",
    active: b.isActive !== false,
  };
}

export async function fetchBrands(params?: {
  search?: string;
  isActive?: boolean;
}): Promise<BrandView[]> {
  const q = new URLSearchParams();
  if (params?.search) q.set("search", params.search);
  if (params?.isActive !== undefined) q.set("isActive", String(params.isActive));
  const qs = q.toString();
  const res = await apiRequest<{ success: boolean; data: ApiBrand[] }>(
    qs ? `/brands?${qs}` : "/brands"
  );
  return res.data.map(mapBrand);
}

/** Chỉ brand đang active — dùng dropdown form SP */
export async function fetchActiveBrands(): Promise<BrandView[]> {
  return fetchBrands({ isActive: true });
}

export async function createBrand(payload: {
  name: string;
  description?: string;
  logo?: string;
  isActive?: boolean;
}) {
  const res = await apiRequest<{ success: boolean; data: ApiBrand }>("/brands", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return mapBrand(res.data);
}

export async function updateBrand(
  id: string,
  payload: {
    name?: string;
    description?: string;
    logo?: string;
    isActive?: boolean;
  }
) {
  const res = await apiRequest<{ success: boolean; data: ApiBrand }>(
    `/brands/${id}`,
    { method: "PUT", body: JSON.stringify(payload) }
  );
  return mapBrand(res.data);
}

export async function deleteBrand(id: string) {
  await apiRequest(`/brands/${id}`, { method: "DELETE" });
}
