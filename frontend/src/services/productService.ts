import { apiRequest } from "./api";
import type { Product } from "../App";

// Response từ Backend
interface ApiProduct {
  _id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number | null;
  images?: string[];
  categoryId?: { _id: string; name: string } | string;
  brandId?: { _id: string; name: string } | string | null;
  stock?: number;
  isNewArrival?: boolean;
  isBestseller?: boolean;
  ingredients?: string;
  tags?: string[];
}

interface ProductsResponse {
  success: boolean;
  count: number;
  data: ApiProduct[];
}

interface ProductResponse {
  success: boolean;
  data: ApiProduct;
}

// Map 1 sản phẩm API → type Product của Frontend
function mapProduct(p: ApiProduct): Product {
  const categoryName =
    typeof p.categoryId === "object" && p.categoryId
      ? p.categoryId.name
      : "";
  const brandName =
    typeof p.brandId === "object" && p.brandId ? p.brandId.name : "";

  return {
    id: p._id as any, // Backend dùng string; tạm dùng as any nếu type id đang là number
    name: p.name,
    brand: brandName || "—",
    price: p.price,
    originalPrice: p.originalPrice ?? undefined,
    image:
      p.images && p.images.length > 0
        ? p.images[0]
        : "https://via.placeholder.com/400x500?text=LUMIERE",
    category: categoryName || "Khác",
    tags: p.tags || [],
    rating: 0,
    reviews: 0,
    description: p.description || "",
    ingredients: p.ingredients || "",
    isNew: p.isNewArrival,
    isBestseller: p.isBestseller,
  };
}

// Lấy danh sách sản phẩm (có thể truyền query)
export async function fetchProducts(params?: {
  search?: string;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.categoryId) query.set("categoryId", params.categoryId);
  if (params?.brandId) query.set("brandId", params.brandId);
  if (params?.minPrice != null) query.set("minPrice", String(params.minPrice));
  if (params?.maxPrice != null) query.set("maxPrice", String(params.maxPrice));
  if (params?.sort) query.set("sort", params.sort);

  const qs = query.toString();
  const endpoint = qs ? `/products?${qs}` : "/products";
  const res = await apiRequest<ProductsResponse>(endpoint);
  return res.data.map(mapProduct);
}

// Lấy 1 sản phẩm theo id
export async function fetchProductById(id: string): Promise<Product> {
  const res = await apiRequest<ProductResponse>(`/products/${id}`);
  return mapProduct(res.data);
}

// ── Admin product (đủ field hơn mapProduct thường) ──

export interface AdminProduct {
  id: string;
  name: string;
  brand: string;
  brandId?: string;
  category: string;
  categoryId?: string;
  price: number;
  originalPrice?: number;
  image: string;
  stock: number;
  description: string;
  ingredients: string;
  isNew?: boolean;
  isBestseller?: boolean;
  isActive?: boolean;
}

export function mapAdminProduct(p: ApiProduct): AdminProduct {
  const categoryName =
    typeof p.categoryId === "object" && p.categoryId ? p.categoryId.name : "";
  const categoryId =
    typeof p.categoryId === "object" && p.categoryId
      ? p.categoryId._id
      : typeof p.categoryId === "string"
      ? p.categoryId
      : "";
  const brandName =
    typeof p.brandId === "object" && p.brandId ? p.brandId.name : "";
  const brandId =
    typeof p.brandId === "object" && p.brandId
      ? p.brandId._id
      : typeof p.brandId === "string"
      ? p.brandId
      : undefined;

  return {
    id: p._id,
    name: p.name,
    brand: brandName || "—",
    brandId,
    category: categoryName || "Khác",
    categoryId,
    price: p.price,
    originalPrice: p.originalPrice ?? undefined,
    image:
      p.images && p.images.length > 0
        ? p.images[0]
        : "https://via.placeholder.com/400x500?text=LUMIERE",
    stock: p.stock ?? 0,
    description: p.description || "",
    ingredients: p.ingredients || "",
    isNew: p.isNewArrival,
    isBestseller: p.isBestseller,
  };
}

export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  const res = await apiRequest<ProductsResponse>("/products");
  return res.data.map(mapAdminProduct);
}

export interface ProductPayload {
  name: string;
  description?: string;
  price: number;
  originalPrice?: number | null;
  categoryId: string;
  brandId?: string | null;
  stock?: number;
  images?: string[];
  ingredients?: string;
  isNewArrival?: boolean;
  isBestseller?: boolean;
  tags?: string[];
}

export async function createProduct(payload: ProductPayload) {
  const res = await apiRequest<ProductResponse>("/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return mapAdminProduct(res.data);
}

export async function updateProduct(id: string, payload: Partial<ProductPayload>) {
  const res = await apiRequest<ProductResponse>(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return mapAdminProduct(res.data);
}

export async function deleteProduct(id: string) {
  await apiRequest<{ success: boolean; message: string }>(`/products/${id}`, {
    method: "DELETE",
  });
}

// Categories (cho dropdown)
export async function fetchCategories(): Promise<{ id: string; name: string }[]> {
  const res = await apiRequest<{
    success: boolean;
    data: { _id: string; name: string }[];
  }>("/categories");
  return res.data.map((c) => ({ id: c._id, name: c.name }));
}