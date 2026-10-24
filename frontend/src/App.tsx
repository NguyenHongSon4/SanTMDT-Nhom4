import { useState } from "react";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminPromotions from "./pages/admin/AdminPromotions";
import Navbar from "./components/Navbar";
import { mockOrders } from "./data/mockData";
import { useEffect } from "react";
import {
  getCart,
  addToCartApi,
  updateCartItemApi,
  removeFromCartApi,
} from "./services/cartService";
import { getToken } from "./services/api";
import { getMe } from "./services/authService";


export type Page =
  | "home" | "products" | "detail" | "cart"
  | "login" | "checkout" | "orders" | "profile"
  | "admin-dashboard" | "admin-products" | "admin-orders" | "admin-users" | "admin-categories"
  | "admin-promotions";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  variant: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  tags: string[];
  rating: number;
  reviews: number;
  description: string;
  ingredients: string;
  isNew?: boolean;
  isBestseller?: boolean;
}

export interface AppUser {
  name: string;
  email: string;
  role: "customer" | "admin";
  phone?: string;
  address?: string;
  city?: string;
  birthdate?: string;
  gender?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  address: string;
  city: string;
  phone: string;
  payment: "cod" | "transfer";
  note?: string;
  createdAt: string;
  status: "pending" | "confirmed" | "shipping" | "completed" | "cancelled";
}

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<AppUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  // Khôi phục session khi reload trang
  useEffect(() => {
    getMe().then((u) => {
      if (u) {
        setUser({
          name: u.name,
          email: u.email,
          role: u.role,
          phone: u.phone,
          address: u.address,
          city: u.city,
          birthdate: u.birthdate,
          gender: u.gender,
        });
      }
    });
  }, []);
  
  useEffect(() => {
    if (!user || !getToken()) {
      setCart([]);
      return;
    }
    getCart()
      .then(setCart)
      .catch(() => setCart([]));
  }, [user]);

  const navigate = (target: Page, product?: Product) => {
    if (product) setSelectedProduct(product);
    setPage(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addToCart = async (product: Product, variant: string, qty: number) => {
  if (!user || !getToken()) {
    navigate("login");
    return;
  }
  try {
    const items = await addToCartApi(product.id, qty);
    setCart(items);
  } catch (err: any) {
    alert(err.message || "Không thêm được vào giỏ");
  }
};

const updateCart = async (id: string, variant: string, qty: number) => {
  if (!user || !getToken()) return;
  try {
    if (qty <= 0) {
      const items = await removeFromCartApi(id);
      setCart(items);
    } else {
      const items = await updateCartItemApi(id, qty);
      setCart(items);
    }
  } catch (err: any) {
    alert(err.message || "Không cập nhật được giỏ");
  }
};

  const handleLogin = (u: AppUser) => {
    setUser(u);
  };

 const handleLogout = () => {
  // nếu có logout() từ authService thì gọi
  setUser(null);
  setCart([]);
  setPage("home");
};

  const handleUpdateUser = (updates: Partial<AppUser>) => {
    setUser((prev) => prev ? { ...prev, ...updates } : null);
  };

  const handleOrderPlaced = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    setCart([]);
  };

  const handleCancelOrder = (id: string) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: "cancelled" } : o));
  };

  

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const isAdminPage = page.startsWith("admin");

  const adminContent = (() => {
    if (page === "admin-dashboard") return <AdminDashboard navigate={navigate} />;
    if (page === "admin-products") return <AdminProducts />;
    if (page === "admin-orders") return <AdminOrders />;
    if (page === "admin-users") return <AdminUsers />;
    if (page === "admin-categories") return <AdminCategories />;
    if (page === "admin-promotions") return <AdminPromotions />;
    return null;
  })();

  return (
    <div className="min-h-screen" style={{ background: "var(--color-cream)", fontFamily: "var(--font-body)" }}>
      <Navbar page={page} navigate={navigate} cartCount={cartCount} user={user} onLogout={handleLogout} />

      {isAdminPage ? (
        <AdminLayout page={page} navigate={navigate} onLogout={handleLogout}>
          {adminContent}
        </AdminLayout>
      ) : (
        <>
          {page === "home" && <HomePage navigate={navigate} />}
          {page === "products" && <ProductsPage navigate={navigate} />}
          {page === "detail" && selectedProduct && (
            <ProductDetailPage product={selectedProduct} navigate={navigate} addToCart={addToCart} user={user} />
          )}
          {page === "cart" && <CartPage cart={cart} updateCart={updateCart} navigate={navigate} />}
          {page === "login" && <LoginPage navigate={navigate} onLogin={handleLogin} />}
          {page === "checkout" && (
            <CheckoutPage cart={cart} navigate={navigate} user={user} onOrderPlaced={handleOrderPlaced} />
          )}
          {page === "orders" && <OrdersPage navigate={navigate} />}
          {page === "profile" && user && (
            <ProfilePage user={user} navigate={navigate} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />
          )}
        </>
      )}
    </div>
  );
}
