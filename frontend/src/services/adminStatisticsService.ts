import { apiRequest } from "./api";

export interface DashboardStatistics {
  lowStockThreshold: number;
  lowStockCount: number;
  totalOrders: number;
  totalProducts: number;
  byStatus: Record<"pending" | "confirmed" | "shipping" | "completed" | "cancelled", number>;
  revenueAllTime: { total: number; orders: number };
  revenuePeriod: { total: number; subtotal: number; discount: number; shippingFee: number; orders: number };
  revenueSeries: { date: string; value: number; orders: number }[];
  topSelling: { productId: string; name: string; quantity: number; grossSales: number }[];
  lowStock: { id: string; name: string; stock: number; image: string }[];
  recentOrders: {
    _id: string;
    orderCode: string;
    receiverName: string;
    userId?: { name?: string } | string;
    createdAt: string;
    status: "pending" | "confirmed" | "shipping" | "completed" | "cancelled";
    total: number;
  }[];
}

export async function getDashboardStatistics(params: {
  from?: string;
  to?: string;
  interval?: "day" | "month";
}): Promise<DashboardStatistics> {
  const query = new URLSearchParams();
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.interval) query.set("interval", params.interval);
  const response = await apiRequest<{ success: boolean; data: DashboardStatistics }>(
    `/orders/admin/statistics?${query.toString()}`
  );
  return response.data;
}
