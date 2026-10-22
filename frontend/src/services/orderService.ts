import { apiRequest } from "./api";

export interface CreateOrderPayload {
  receiverName: string;
  phone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingWard?: string;
  paymentMethod?: "cod" | "transfer";
  note?: string;
  shippingFee?: number;
  discount?: number;
}

export interface OrderFromApi {
  _id: string;
  orderCode: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }[];
  receiverName: string;
  phone: string;
  shippingAddress: string;
  shippingWard?: string;
  shippingCity: string;
  note?: string;
  paymentMethod: "cod" | "transfer";
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: "pending" | "confirmed" | "shipping" | "completed" | "cancelled";
  createdAt: string;
}

interface CreateOrderResponse {
  success: boolean;
  message: string;
  data: OrderFromApi;
}

interface MyOrdersResponse {
  success: boolean;
  count: number;
  data: OrderFromApi[];
}

// Đặt hàng
export async function createOrder(payload: CreateOrderPayload) {
  const res = await apiRequest<CreateOrderResponse>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

// Lịch sử đơn của tôi
export async function getMyOrders() {
  const res = await apiRequest<MyOrdersResponse>("/orders/my");
  return res.data;
}

// Hủy đơn (chỉ pending)
export async function cancelMyOrder(orderId: string) {
  const res = await apiRequest<{ success: boolean; message: string; data: OrderFromApi }>(
    `/orders/my/${orderId}/cancel`,
    { method: "PUT" }
  );
  return res.data;
}