import { apiRequest } from "./api";
import type { CartItem } from "../App";

interface ApiCartItem {
  productId: {
    _id: string;
    name: string;
    price: number;
    originalPrice?: number;
    images?: string[];
    stock?: number;
    isActive?: boolean;
  };
  quantity: number;
}

interface CartResponse {
  success: boolean;
  message?: string;
  data: {
    _id: string;
    userId: string;
    items: ApiCartItem[];
  };
}

function mapCartItems(items: ApiCartItem[]): CartItem[] {
  return items
    .filter((i) => i.productId && i.productId._id)
    .map((i) => ({
      id: i.productId._id,
      name: i.productId.name,
      price: i.productId.price,
      image:
        i.productId.images && i.productId.images.length > 0
          ? i.productId.images[0]
          : "https://via.placeholder.com/100x120?text=LUMIERE",
      qty: i.quantity,
      variant: "Mặc định",
    }));
}

export async function getCart(): Promise<CartItem[]> {
  const res = await apiRequest<CartResponse>("/cart");
  return mapCartItems(res.data.items || []);
}

export async function addToCartApi(
  productId: string,
  quantity: number = 1
): Promise<CartItem[]> {
  const res = await apiRequest<CartResponse>("/cart", {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  });
  return mapCartItems(res.data.items || []);
}

export async function updateCartItemApi(
  productId: string,
  quantity: number
): Promise<CartItem[]> {
  const res = await apiRequest<CartResponse>("/cart", {
    method: "PUT",
    body: JSON.stringify({ productId, quantity }),
  });
  return mapCartItems(res.data.items || []);
}

export async function removeFromCartApi(
  productId: string
): Promise<CartItem[]> {
  const res = await apiRequest<CartResponse>(`/cart/${productId}`, {
    method: "DELETE",
  });
  return mapCartItems(res.data.items || []);
}