import { apiRequest, setToken, getToken } from "./api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  phone?: string;
  address?: string;
  city?: string;
  birthdate?: string;
  gender?: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: { user: AuthUser; token: string };
}

export async function login(email: string, password: string) {
  const res = await apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(res.data.token);
  return res.data;
}

export async function register(name: string, email: string, password: string) {
  const res = await apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  setToken(res.data.token);
  return res.data;
}

export function logout() {
  setToken(null);
}

// Khôi phục session: gọi khi app khởi động nếu đã có token
export async function getMe(): Promise<AuthUser | null> {
  if (!getToken()) return null;
  try {
    const res = await apiRequest<{ success: boolean; data: AuthUser }>("/auth/me");
    return res.data;
  } catch {
    // Token hết hạn hoặc không hợp lệ
    setToken(null);
    return null;
  }
}

export interface ProfileUpdate {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  birthdate?: string;
  gender?: string;
}

export async function updateProfile(data: ProfileUpdate) {
  const res = await apiRequest<{
    success: boolean;
    message: string;
    data: AuthUser;
  }>("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.data;
}
