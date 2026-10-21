export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "admin";
  address: string;
  city: string;
  createdAt: string;
  orders: number;
  totalSpent: number;
  active: boolean;
}

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  image: string;
  qty: number;
  variant: string;
}

export interface Order {
  id: string;
  userId: number;
  userName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: "pending" | "confirmed" | "shipping" | "completed" | "cancelled";
  address: string;
  city: string;
  phone: string;
  payment: "cod" | "transfer";
  createdAt: string;
  note?: string;
}

export const mockUsers: User[] = [
  { id: 1, name: "Nguyễn Thị Lan", email: "lan.nguyen@gmail.com", phone: "0912345678", role: "customer", address: "123 Nguyễn Huệ, Q.1", city: "TP.HCM", createdAt: "2025-01-15", orders: 8, totalSpent: 12400000, active: true },
  { id: 2, name: "Trần Minh Anh", email: "minh.anh@gmail.com", phone: "0934567890", role: "customer", address: "45 Hai Bà Trưng, Q.3", city: "TP.HCM", createdAt: "2025-02-03", orders: 3, totalSpent: 5200000, active: true },
  { id: 3, name: "Phạm Thùy Linh", email: "linh.pham@gmail.com", phone: "0967891234", role: "customer", address: "78 Lê Văn Lương, Đống Đa", city: "Hà Nội", createdAt: "2025-02-20", orders: 12, totalSpent: 24800000, active: true },
  { id: 4, name: "Lê Hoàng Nam", email: "nam.le@gmail.com", phone: "0901234567", role: "customer", address: "12 Nguyễn Văn Linh, Q.7", city: "TP.HCM", createdAt: "2025-03-10", orders: 1, totalSpent: 1850000, active: false },
  { id: 5, name: "Võ Thị Hương", email: "huong.vo@gmail.com", phone: "0923456789", role: "customer", address: "56 Trần Phú, Hải Châu", city: "Đà Nẵng", createdAt: "2025-03-22", orders: 5, totalSpent: 9600000, active: true },
  { id: 6, name: "Admin Lumière", email: "admin@lumiere.vn", phone: "0800000001", role: "admin", address: "1 Lumière HQ, Q.1", city: "TP.HCM", createdAt: "2024-12-01", orders: 0, totalSpent: 0, active: true },
];

export const mockOrders: Order[] = [
  {
    id: "LM-2025-0042",
    userId: 1,
    userName: "Nguyễn Thị Lan",
    items: [
      { id: 1, name: "Sérum Lumière Éternelle", price: 1850000, image: "https://images.unsplash.com/photo-1764694187688-454d172e5ca0?w=100&h=120&fit=crop", qty: 1, variant: "50ml" },
      { id: 6, name: "Masque Éclat Perle", price: 980000, image: "https://images.unsplash.com/photo-1748543668646-e81cda0890f3?w=100&h=120&fit=crop", qty: 2, variant: "30ml" },
    ],
    subtotal: 3810000, discount: 571500, shipping: 0, total: 3238500,
    status: "completed",
    address: "123 Nguyễn Huệ, Q.1", city: "TP.HCM", phone: "0912345678",
    payment: "transfer",
    createdAt: "2025-08-20",
  },
  {
    id: "LM-2025-0055",
    userId: 3,
    userName: "Phạm Thùy Linh",
    items: [
      { id: 3, name: "Eau de Parfum Rose Noire", price: 3200000, image: "https://images.unsplash.com/photo-1630573133526-8d090e0269af?w=100&h=120&fit=crop", qty: 1, variant: "50ml" },
    ],
    subtotal: 3200000, discount: 0, shipping: 0, total: 3200000,
    status: "shipping",
    address: "78 Lê Văn Lương, Đống Đa", city: "Hà Nội", phone: "0967891234",
    payment: "cod",
    createdAt: "2025-09-10",
  },
  {
    id: "LM-2025-0061",
    userId: 2,
    userName: "Trần Minh Anh",
    items: [
      { id: 2, name: "Crème Velours Intense", price: 2350000, image: "https://images.unsplash.com/photo-1764694071508-e4b1efcd39bc?w=100&h=120&fit=crop", qty: 1, variant: "50ml" },
    ],
    subtotal: 2350000, discount: 0, shipping: 30000, total: 2380000,
    status: "confirmed",
    address: "45 Hai Bà Trưng, Q.3", city: "TP.HCM", phone: "0934567890",
    payment: "transfer",
    createdAt: "2025-09-12",
  },
  {
    id: "LM-2025-0067",
    userId: 5,
    userName: "Võ Thị Hương",
    items: [
      { id: 4, name: "Huile Précieuse Dorée", price: 1650000, image: "https://images.unsplash.com/photo-1705899853374-d91c048b81d2?w=100&h=120&fit=crop", qty: 1, variant: "50ml" },
      { id: 5, name: "Parfum Obsidian Noir", price: 4100000, image: "https://images.unsplash.com/photo-1705899844877-81bb0a0665c1?w=100&h=120&fit=crop", qty: 1, variant: "50ml" },
    ],
    subtotal: 5750000, discount: 0, shipping: 0, total: 5750000,
    status: "pending",
    address: "56 Trần Phú, Hải Châu", city: "Đà Nẵng", phone: "0923456789",
    payment: "cod",
    createdAt: "2025-09-14",
  },
  {
    id: "LM-2025-0039",
    userId: 4,
    userName: "Lê Hoàng Nam",
    items: [
      { id: 1, name: "Sérum Lumière Éternelle", price: 1850000, image: "https://images.unsplash.com/photo-1764694187688-454d172e5ca0?w=100&h=120&fit=crop", qty: 1, variant: "30ml" },
    ],
    subtotal: 1850000, discount: 0, shipping: 30000, total: 1880000,
    status: "cancelled",
    address: "12 Nguyễn Văn Linh, Q.7", city: "TP.HCM", phone: "0901234567",
    payment: "cod",
    createdAt: "2025-08-15",
  },
];

export const revenueData = {
  daily: [
    { label: "T2", value: 4200000 }, { label: "T3", value: 6800000 },
    { label: "T4", value: 3100000 }, { label: "T5", value: 9200000 },
    { label: "T6", value: 12400000 }, { label: "T7", value: 15600000 },
    { label: "CN", value: 8900000 },
  ],
  weekly: [
    { label: "T1", value: 48200000 }, { label: "T2", value: 62400000 },
    { label: "T3", value: 54100000 }, { label: "T4", value: 71800000 },
  ],
  monthly: [
    { label: "T1", value: 124000000 }, { label: "T2", value: 98000000 },
    { label: "T3", value: 145000000 }, { label: "T4", value: 132000000 },
    { label: "T5", value: 168000000 }, { label: "T6", value: 155000000 },
    { label: "T7", value: 189000000 }, { label: "T8", value: 201000000 },
    { label: "T9", value: 87000000 },
  ],
};

export const stockData = [
  { name: "Sérum Lumière Éternelle", stock: 8, threshold: 10 },
  { name: "Masque Éclat Perle", stock: 3, threshold: 10 },
  { name: "Huile Précieuse Dorée", stock: 15, threshold: 10 },
  { name: "Crème Velours Intense", stock: 24, threshold: 10 },
  { name: "Eau de Parfum Rose Noire", stock: 6, threshold: 10 },
];

// ─── Reviews ───────────────────────────────────────────────────────────────

export interface Review {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  userInitial: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  verified: boolean;
  helpful: number;
}

export const mockReviews: Review[] = [
  {
    id: 1, productId: 1, userId: 1, userName: "Nguyễn Thị Lan", userInitial: "L",
    rating: 5, title: "Sérum tuyệt vời, da sáng hẳn sau 2 tuần!",
    comment: "Mình dùng được 2 tuần, da thấy sáng và mịn hơn hẳn. Kết cấu nhẹ, thẩm thấu nhanh, không gây nhờn. Sẽ tiếp tục mua.",
    createdAt: "2025-08-28", verified: true, helpful: 24,
  },
  {
    id: 2, productId: 1, userId: 3, userName: "Phạm Thùy Linh", userInitial: "L",
    rating: 5, title: "Xứng đáng với giá tiền",
    comment: "Ban đầu còn do dự vì giá hơi cao nhưng dùng thử thấy thực sự hiệu quả. Da căng mọng và đều màu sau khoảng 3 tuần. Đóng gói sang trọng, rất ưng.",
    createdAt: "2025-09-02", verified: true, helpful: 18,
  },
  {
    id: 3, productId: 1, userId: 5, userName: "Võ Thị Hương", userInitial: "H",
    rating: 4, title: "Tốt nhưng cần kiên nhẫn",
    comment: "Hiệu quả rõ sau khoảng 4 tuần mới thấy, không phải ngay lập tức. Da mình khá nhạy cảm nhưng không bị kích ứng. Trừ 1 sao vì hộp hơi khó mở.",
    createdAt: "2025-09-10", verified: true, helpful: 11,
  },
  {
    id: 4, productId: 3, userId: 3, userName: "Phạm Thùy Linh", userInitial: "L",
    rating: 5, title: "Mùi hương quyến rũ, lưu hương lâu",
    comment: "Mùi hương đúng như mô tả, hoa hồng bí ẩn và ấm áp. Lưu hương khoảng 8-10 tiếng trên da. Nhiều người hỏi dùng nước hoa gì. Rất hài lòng!",
    createdAt: "2025-09-05", verified: true, helpful: 32,
  },
  {
    id: 5, productId: 6, userId: 1, userName: "Nguyễn Thị Lan", userInitial: "L",
    rating: 4, title: "Mặt nạ làm sáng da hiệu quả",
    comment: "Dùng 2 lần/tuần thấy da sáng và mịn hơn. Mùi thơm nhẹ dễ chịu. Thao tác sử dụng đơn giản. Sẽ mua thêm khi hết.",
    createdAt: "2025-08-25", verified: true, helpful: 9,
  },
  {
    id: 6, productId: 2, userId: 2, userName: "Trần Minh Anh", userInitial: "A",
    rating: 5, title: "Kem dưỡng tốt nhất mình từng dùng",
    comment: "Kết cấu mịn như nhung, thẩm thấu nhanh không bết. Da ẩm suốt cả ngày không cần thoa lại. Mùi thơm tinh tế. Đã order lần 2 rồi!",
    createdAt: "2025-09-13", verified: true, helpful: 15,
  },
];

// ─── Categories ─────────────────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  active: boolean;
  createdAt: string;
}

export const mockCategories: Category[] = [
  { id: 1, name: "Dưỡng Da", slug: "duong-da", description: "Các sản phẩm chăm sóc và dưỡng ẩm da mặt", productCount: 2, active: true, createdAt: "2024-12-01" },
  { id: 2, name: "Nước Hoa", slug: "nuoc-hoa", description: "Bộ sưu tập nước hoa cao cấp thuần khiết", productCount: 2, active: true, createdAt: "2024-12-01" },
  { id: 3, name: "Dưỡng Thể", slug: "duong-the", description: "Dầu và kem dưỡng da toàn thân", productCount: 1, active: true, createdAt: "2025-01-10" },
  { id: 4, name: "Mặt Nạ", slug: "mat-na", description: "Mặt nạ chuyên sâu các loại", productCount: 1, active: true, createdAt: "2025-01-10" },
  { id: 5, name: "Tẩy Trang", slug: "tay-trang", description: "Sản phẩm làm sạch và tẩy trang", productCount: 0, active: false, createdAt: "2025-03-15" },
  { id: 6, name: "Chống Nắng", slug: "chong-nang", description: "Kem chống nắng và bảo vệ da", productCount: 0, active: false, createdAt: "2025-05-20" },
];

export const statusLabel: Record<string, string> = {
  pending: "Chờ Xác Nhận",
  confirmed: "Đã Xác Nhận",
  shipping: "Đang Giao",
  completed: "Hoàn Tất",
  cancelled: "Đã Huỷ",
};

export const statusColor: Record<string, string> = {
  pending: "#c9a882",
  confirmed: "#4a90a4",
  shipping: "#7b6ca0",
  completed: "#5a8a6a",
  cancelled: "#a05a5a",
};
