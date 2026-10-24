import { apiRequest } from "./api";

export interface CategoryFromApi {
  _id: string;
  name: string;
  description?: string;
  slug?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface CategoryView {
  id: string;
  name: string;
  description: string;
  slug: string;
  active: boolean;
  createdAt: string;
  productCount: number; // Backend chưa trả → tạm 0
}

function mapCategory(c: CategoryFromApi): CategoryView {
  return {
    id: c._id,
    name: c.name,
    description: c.description || "",
    slug: c.slug || "",
    active: c.isActive !== false,
    createdAt: c.createdAt ? c.createdAt.slice(0, 10) : "",
    productCount: 0,
  };
}

interface ListResponse {
  success: boolean;
  count: number;
  data: CategoryFromApi[];
}

interface OneResponse {
  success: boolean;
  message?: string;
  data: CategoryFromApi;
}

export async function fetchCategoriesAdmin(): Promise<CategoryView[]> {
  const res = await apiRequest<ListResponse>("/categories");
  return res.data.map(mapCategory);
}

export async function createCategory(payload: {
  name: string;
  description?: string;
}) {
  const res = await apiRequest<OneResponse>("/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return mapCategory(res.data);
}

export async function updateCategory(
  id: string,
  payload: { name?: string; description?: string; isActive?: boolean }
) {
  const res = await apiRequest<OneResponse>(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return mapCategory(res.data);
}

export async function deleteCategory(id: string) {
  await apiRequest<{ success: boolean; message: string }>(`/categories/${id}`, {
    method: "DELETE",
  });
}