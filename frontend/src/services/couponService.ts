import { apiRequest } from "./api";

export interface CouponView {
  id: string;
  code: string;
  description: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  usageLimit: number;
  used: number;
  expiry: string; // YYYY-MM-DD
  active: boolean;
}

interface ApiCoupon {
  _id: string;
  code: string;
  description?: string;
  type: "percent" | "fixed";
  value: number;
  minOrder?: number;
  usageLimit?: number;
  used?: number;
  expiry: string;
  isActive?: boolean;
}

function mapCoupon(c: ApiCoupon): CouponView {
  return {
    id: c._id,
    code: c.code,
    description: c.description || "",
    type: c.type,
    value: c.value,
    minOrder: c.minOrder ?? 0,
    usageLimit: c.usageLimit ?? 0,
    used: c.used ?? 0,
    expiry: c.expiry ? String(c.expiry).slice(0, 10) : "",
    active: c.isActive !== false,
  };
}

export async function fetchCoupons(): Promise<CouponView[]> {
  const res = await apiRequest<{ success: boolean; data: ApiCoupon[] }>(
    "/coupons"
  );
  return res.data.map(mapCoupon);
}

export async function createCoupon(payload: {
  code: string;
  description?: string;
  type: "percent" | "fixed";
  value: number;
  minOrder?: number;
  usageLimit?: number;
  expiry: string;
  isActive?: boolean;
}) {
  const res = await apiRequest<{ success: boolean; data: ApiCoupon }>(
    "/coupons",
    { method: "POST", body: JSON.stringify(payload) }
  );
  return mapCoupon(res.data);
}

export async function updateCoupon(
  id: string,
  payload: Partial<{
    code: string;
    description: string;
    type: "percent" | "fixed";
    value: number;
    minOrder: number;
    usageLimit: number;
    expiry: string;
    isActive: boolean;
  }>
) {
  const res = await apiRequest<{ success: boolean; data: ApiCoupon }>(
    `/coupons/${id}`,
    { method: "PUT", body: JSON.stringify(payload) }
  );
  return mapCoupon(res.data);
}

export async function deleteCoupon(id: string) {
  await apiRequest(`/coupons/${id}`, { method: "DELETE" });
}

export async function validateCoupon(code: string, subtotal: number) {
  const res = await apiRequest<{
    success: boolean;
    data: { code: string; discount: number; type: string; value: number };
  }>("/coupons/validate", {
    method: "POST",
    body: JSON.stringify({ code, subtotal }),
  });
  return res.data;
}

export async function fetchActiveCoupons(): Promise<CouponView[]> {
  const res = await apiRequest<{ success: boolean; data: ApiCoupon[] }>(
    "/coupons/active"
  );
  return res.data.map(mapCoupon);
}