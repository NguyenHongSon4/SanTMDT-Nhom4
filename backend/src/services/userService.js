const User = require("../models/User");
const Order = require("../models/Order");

const getAllUsers = async (query = {}) => {
  const filter = {};

  if (query.role) filter.role = query.role;
  if (query.isActive !== undefined) {
    filter.isActive =
      query.isActive === "true" || query.isActive === true;
  }
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { email: { $regex: query.search, $options: "i" } },
    ];
  }

  const users = await User.find(filter)
    .select("-password")
    .sort({ createdAt: -1 });

  // Gắn số đơn + tổng chi (đơn không huỷ)
  const result = await Promise.all(
    users.map(async (u) => {
      const orders = await Order.find({
        userId: u._id,
        status: { $ne: "cancelled" },
      });
      const orderCount = orders.length;
      const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0);

      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        phone: u.phone,
        city: u.city,
        address: u.address,
        isActive: u.isActive,
        createdAt: u.createdAt,
        orderCount,
        totalSpent,
      };
    })
  );

  return result;
};

const updateUser = async (id, { role, isActive }) => {
  const user = await User.findById(id);
  if (!user) {
    const error = new Error("Không tìm thấy người dùng");
    error.statusCode = 404;
    throw error;
  }

  if (role !== undefined) {
    if (!["customer", "admin"].includes(role)) {
      const error = new Error("Role không hợp lệ");
      error.statusCode = 400;
      throw error;
    }
    user.role = role;
  }

  if (isActive !== undefined) {
    user.isActive = isActive;
  }

  await user.save();

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    city: user.city,
    address: user.address,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
};

const createUser = async ({ name, email, password, role = "customer" }) => {
  if (!name || !email || !password) {
    const error = new Error("Vui lòng nhập họ tên, email và mật khẩu");
    error.statusCode = 400;
    throw error;
  }
  if (password.length < 6) {
    const error = new Error("Mật khẩu phải có ít nhất 6 ký tự");
    error.statusCode = 400;
    throw error;
  }
  if (role && !["customer", "admin"].includes(role)) {
    const error = new Error("Role không hợp lệ");
    error.statusCode = 400;
    throw error;
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    const error = new Error("Email đã được sử dụng");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    role: role || "customer",
  });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    city: user.city,
    address: user.address,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
};

module.exports = {
  getAllUsers,
  updateUser,
  createUser,
};