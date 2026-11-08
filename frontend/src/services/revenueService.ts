import { apiRequest } from "./api";

export type RevenueGranularity = "day" | "month" | "quarter" | "year";

export interface RevenueBucket {
  period: string;
  revenue: number;
  orders: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  codRevenue: number;
  transferRevenue: number;
  cardRevenue: number;
}

export interface RevenueReport {
  granularity: RevenueGranularity;
  year: number;
  month?: number;
  summary: {
    revenue: number;
    orders: number;
    subtotal: number;
    discount: number;
    shippingFee: number;
    averageOrderValue: number;
    byPaymentMethod: { cod: number; transfer: number; card: number };
  };
  series: RevenueBucket[];
}

export async function getRevenueReport(params: {
  granularity: RevenueGranularity;
  year: number;
  month?: number;
}) {
  const query = new URLSearchParams({ granularity: params.granularity, year: String(params.year) });
  if (params.month) query.set("month", String(params.month));
  const response = await apiRequest<{ success: boolean; data: RevenueReport }>(
    `/orders/admin/revenue?${query.toString()}`,
  );
  return response.data;
}
