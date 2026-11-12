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
import AdminReviews from "./pages/admin/AdminReviews";
import { mockOrders } from "./data/mockData";
import { useEffect } from "react";
import {
  getCart,
  addToCartApi,
  updateCartItemApi,
  removeFromCartApi,
} from "./services/cartService";
import { getToken } from "./services/api";
import { getMe, logout } from "./services/authService";
import AdminBrands from "./pages/admin/AdminBrands";
import AdminRevenue from "./pages/admin/AdminRevenue";
import SupportInfoPage from "./pages/SupportInfoPage";
import FeedbackPage from "./pages/FeedbackPage";
import { fetchProductById } from "./services/productService";
import ChatWidget from "./components/ChatWidget";


export type Page =
  | "home"
  | "products"
  | "detail"
  | "cart"
  | "login"
  | "checkout"
  | "orders"
  | "profile"
  | "return-policy"
  | "buying-guide"
  | "brand-story"
  | "certifications"
  | "admin-dashboard"
  | "admin-revenue"
  | "admin-products"
  | "admin-orders"
  | "admin-users"
  | "admin-categories"
  | "admin-promotions"
  | "admin-reviews"
  | "admin-brands"
  | "feedback"
  | "admin-feedback";

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
  soldCount?: number;
  description: string;
  ingredients: string;
  isNew?: boolean;
  isBestseller?: boolean;
}

const NAVIGATION_STORAGE_KEY = "lumiere-current-navigation";
const validPages = new Set<Page>([
  "home", "products", "detail", "cart", "login", "checkout", "orders", "profile",
  "return-policy", "buying-guide", "brand-story", "certifications", "admin-dashboard",
  "admin-revenue", "admin-products", "admin-orders", "admin-users", "admin-categories",
  "admin-promotions", "admin-reviews", "admin-brands", "feedback", "admin-feedback",
]);

function readSavedNavigation(): { page: Page; selectedProduct: Product | null } {
  try {
    const saved = JSON.parse(sessionStorage.getItem(NAVIGATION_STORAGE_KEY) || "null");
    if (!saved || !validPages.has(saved.page)) return { page: "home", selectedProduct: null };
    if (saved.page === "detail" && !saved.selectedProduct) return { page: "home", selectedProduct: null };
    return { page: saved.page, selectedProduct: saved.selectedProduct || null };
  } catch {
    return { page: "home", selectedProduct: null };
  }
}

function saveNavigation(page: Page, selectedProduct: Product | null) {
  try {
    sessionStorage.setItem(NAVIGATION_STORAGE_KEY, JSON.stringify({ page, selectedProduct }));
  } catch {
    // Keep navigation working even when browser storage is unavailable.
  }
}

export interface AppUser {
  name: string;
  email: string;
  role: "customer" | "admin";
  phone?: string;
  address?: string;
  city?: string;
  ward?: string;
  birthdate?: string;
  gender?: string;
  avatar?: string;
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
  ward?: string;
  phone: string;
  payment: "cod" | "transfer" | "card";
  paymentStatus?: "unpaid" | "pending" | "paid" | "failed" | "refunded";
  cancellationStatus?: "none" | "requested" | "completed";
  cancellationReason?: string;
  cancellationReasonDetail?: string;
  returnStatus?: "none" | "requested" | "approved" | "rejected";
  returnReason?: string;
  note?: string;
  createdAt: string;
  status: "pending" | "confirmed" | "shipping" | "completed" | "returned" | "cancelled";
}

export default function App() {
  const [initialNavigation] = useState(readSavedNavigation);
  const [page, setPage] = useState<Page>(initialNavigation.page);
  const [openReviewOnDetail, setOpenReviewOnDetail] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("lumiere-theme");
    return saved === "dark" ? "dark" : "light";
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(initialNavigation.selectedProduct);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<AppUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  // Khôi phục session khi reload trang
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("paymentResult")) {
      setPage("orders");
      saveNavigation("orders", initialNavigation.selectedProduct);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

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
          ward: u.ward,
          birthdate: u.birthdate,
          gender: u.gender,
          avatar: u.avatar,
        });
      }
    });
  }, []);

  useEffect(() => {
    if (initialNavigation.page !== "detail" || !initialNavigation.selectedProduct) return;
    fetchProductById(initialNavigation.selectedProduct.id)
      .then(setSelectedProduct)
      .catch(() => {});
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

  const navigate = (target: Page, product?: Product, openReview = false) => {
    const nextProduct = product || selectedProduct;
    if (product) setSelectedProduct(product);
    setOpenReviewOnDetail(target === "detail" && openReview);
    setPage(target);
    saveNavigation(target, nextProduct);
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
  logout();
  setUser(null);
  setCart([]);
  setPage("login");
  saveNavigation("login", selectedProduct);
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

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("lumiere-theme", theme);
  }, [theme]);

  const adminContent = (() => {
    if (page === "admin-dashboard") return <AdminDashboard navigate={navigate} />;
    if (page === "admin-revenue") return <AdminRevenue />;
    if (page === "admin-products") return <AdminProducts />;
    if (page === "admin-orders") return <AdminOrders />;
    if (page === "admin-users") return <AdminUsers />;
    if (page === "admin-categories") return <AdminCategories />;
    if (page === "admin-promotions") return <AdminPromotions />;
    if (page === "admin-reviews") return <AdminReviews />;
    if (page === "admin-brands") return <AdminBrands />;
    if (page === "admin-feedback") return user ? <FeedbackPage user={user} navigate={navigate} /> : null;
    return null;
  })();

  return (
    <div className="min-h-screen" style={{ background: "var(--color-cream)", fontFamily: "var(--font-body)" }}>
      <Navbar page={page} navigate={navigate} cartCount={cartCount} user={user} onLogout={handleLogout} theme={theme} onToggleTheme={() => setTheme((current) => current === "light" ? "dark" : "light")} />
      {!isAdminPage && <ChatWidget user={user} navigate={navigate} />}

      {isAdminPage ? (
        <AdminLayout page={page} navigate={navigate} onLogout={handleLogout}>
          {adminContent}
        </AdminLayout>
      ) : (
        <>
          {page === "home" && <HomePage navigate={navigate} />}
          {page === "products" && <ProductsPage navigate={navigate} />}
          {page === "detail" && selectedProduct && (
            <ProductDetailPage product={selectedProduct} navigate={navigate} addToCart={addToCart} user={user} openReviewOnLoad={openReviewOnDetail} />
          )}
          {page === "cart" && <CartPage cart={cart} updateCart={updateCart} navigate={navigate} />}
          {page === "login" && <LoginPage navigate={navigate} onLogin={handleLogin} />}
          {page === "checkout" && (
            <CheckoutPage cart={cart} navigate={navigate} user={user} onOrderPlaced={handleOrderPlaced} />
          )}
          {page === "orders" && <OrdersPage navigate={navigate} />}
          {page === "feedback" && user && <FeedbackPage user={user} navigate={navigate} />}
          {(page === "return-policy" || page === "buying-guide" || page === "brand-story" || page === "certifications") && (
            <SupportInfoPage page={page} navigate={navigate} />
          )}
          {page === "profile" && user && (
            <ProfilePage user={user} navigate={navigate} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />
          )}
        </>
      )}
    </div>
  );
}
