import { apiRequest } from "./api";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  phone?: string;
  city?: string;
  address?: string;
  active: boolean;
  createdAt: string;
  orders: number;
  totalSpent: number;
}

interface ApiUser {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  phone?: string;
  city?: string;
  address?: string;
  isActive?: boolean;
  createdAt?: string;
  orderCount?: number;
  totalSpent?: number;
}

function mapUser(u: ApiUser): AdminUser {
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone,
    city: u.city,
    address: u.address,
    active: u.isActive !== false,
    createdAt: u.createdAt ? u.createdAt.slice(0, 10) : "",
    orders: u.orderCount ?? 0,
    totalSpent: u.totalSpent ?? 0,
  };
}

export async function fetchUsers(params?: {
  search?: string;
  role?: string;
}): Promise<AdminUser[]> {
  const q = new URLSearchParams();
  if (params?.search) q.set("search", params.search);
  if (params?.role && params.role !== "all") q.set("role", params.role);
  const qs = q.toString();
  const res = await apiRequest<{
    success: boolean;
    data: ApiUser[];
  }>(qs ? `/users?${qs}` : "/users");
  return res.data.map(mapUser);
}

export async function updateUser(
  id: string,
  payload: { role?: "customer" | "admin"; isActive?: boolean }
) {
  const res = await apiRequest<{ success: boolean; data: ApiUser }>(
    `/users/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
  return mapUser(res.data);
}

export async function createUser(payload: {
  name: string;
  email: string;
  password: string;
  role?: "customer" | "admin";
}) {
  const res = await apiRequest<{ success: boolean; data: ApiUser }>("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return mapUser(res.data);
}