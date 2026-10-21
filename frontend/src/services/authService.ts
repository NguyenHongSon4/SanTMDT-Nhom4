import { apiRequest, setToken } from "./api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
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