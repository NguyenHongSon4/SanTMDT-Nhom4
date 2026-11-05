import { apiRequest } from "./api";

export interface BrandFromApi {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BrandView {
  id: string;
  name: string;
  description: string;
  logo: string;
  active: boolean;
  createdAt: string;
}

interface BrandListResponse {
  success: boolean;
  count: number;
  data: BrandFromApi[];
}

interface BrandResponse {
  success: boolean;
  message?: string;
  data: BrandFromApi;
}

function mapBrand(brand: BrandFromApi): BrandView {
  return {
    id: brand._id,
    name: brand.name,
    description: brand.description || "",
    logo: brand.logo || "",
    active: brand.isActive !== false,
    createdAt: brand.createdAt ? brand.createdAt.slice(0, 10) : "",
  };
}

export async function fetchBrandsAdmin(): Promise<BrandView[]> {
  const response = await apiRequest<BrandListResponse>("/brands");
  return (response.data || []).map(mapBrand);
}

export async function createBrand(payload: {
  name: string;
  description?: string;
  logo?: string;
}): Promise<BrandView> {
  const response = await apiRequest<BrandResponse>("/brands", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return mapBrand(response.data);
}

export async function updateBrand(
  id: string,
  payload: {
    name?: string;
    description?: string;
    logo?: string;
    isActive?: boolean;
  }
): Promise<BrandView> {
  const response = await apiRequest<BrandResponse>(`/brands/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return mapBrand(response.data);
}

export async function deleteBrand(id: string): Promise<void> {
  await apiRequest<{ success: boolean; message: string }>(`/brands/${id}`, {
    method: "DELETE",
  });
}
