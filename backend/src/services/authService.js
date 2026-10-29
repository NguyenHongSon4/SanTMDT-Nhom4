const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Tạo JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// Đăng ký tài khoản
const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("Email đã được sử dụng");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({
    name,
    email,
    password,
    role: "customer",
  });

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || "",
      address: user.address || "",
      city: user.city || "",
      birthdate: user.birthdate || "",
    gender: user.gender || "",
    },
    token,
  };
};

// Đăng nhập
const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    const error = new Error("Email hoặc mật khẩu không đúng");
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error("Tài khoản đã bị vô hiệu hóa");
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    const error = new Error("Email hoặc mật khẩu không đúng");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || "",
      address: user.address || "",
      city: user.city || "",
      birthdate: user.birthdate || "",
    gender: user.gender || "",
    },
    token,
  };
};

const updateProfile = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("Không tìm thấy người dùng");
    error.statusCode = 404;
    throw error;
  }

  if (data.name !== undefined) user.name = data.name;
  if (data.phone !== undefined) user.phone = data.phone;
  if (data.address !== undefined) user.address = data.address;
  if (data.city !== undefined) user.city = data.city;
  if (data.birthdate !== undefined) user.birthdate = data.birthdate;
  if (data.gender !== undefined) user.gender = data.gender;

  await user.save();

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || "",
    address: user.address || "",
    city: user.city || "",
    birthdate: user.birthdate || "",
    gender: user.gender || "",
  };
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  if (!currentPassword || !newPassword) {
    const error = new Error("Vui lòng nhập đầy đủ mật khẩu");
    error.statusCode = 400;
    throw error;
  }
  if (newPassword.length < 6) {
    const error = new Error("Mật khẩu mới phải có ít nhất 6 ký tự");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId).select("+password");
  if (!user) {
    const error = new Error("Không tìm thấy người dùng");
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    const error = new Error("Mật khẩu hiện tại không đúng");
    error.statusCode = 400;
    throw error;
  }

  user.password = newPassword; // pre("save") sẽ hash
  await user.save();

  return true;
};

module.exports = {
  register,
  login,
  updateProfile,
  changePassword,
};