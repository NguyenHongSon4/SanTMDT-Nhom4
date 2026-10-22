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