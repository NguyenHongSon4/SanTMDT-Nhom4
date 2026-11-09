const User = require("../models/User");
const jwt = require("jsonwebtoken");
const GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo";

const loginWithGoogle = async (credential) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    const error = new Error("Đăng nhập Google chưa được cấu hình");
    error.statusCode = 503;
    throw error;
  }
  if (typeof credential !== "string" || credential.length > 10000) {
    const error = new Error("Google credential không hợp lệ");
    error.statusCode = 400;
    throw error;
  }
  let claims;
  try {
    const response = await fetch(`${GOOGLE_TOKEN_INFO_URL}?id_token=${encodeURIComponent(credential)}`);
    if (!response.ok) throw new Error("Invalid credential");
    claims = await response.json();
  } catch {
    const error = new Error("Không thể xác minh tài khoản Google");
    error.statusCode = 401;
    throw error;
  }
  if (claims.aud !== clientId || !["accounts.google.com", "https://accounts.google.com"].includes(claims.iss) || claims.email_verified !== "true" || !claims.sub || !claims.email) {
    const error = new Error("Tài khoản Google không hợp lệ hoặc email chưa được xác minh");
    error.statusCode = 401;
    throw error;
  }
  let user = await User.findOne({ googleId: claims.sub });
  if (!user) {
    user = await User.findOne({ email: claims.email.toLowerCase() }).select("+googleId");
    if (user) {
      if (user.googleId && user.googleId !== claims.sub) {
        const error = new Error("Email này đã liên kết với tài khoản Google khác");
        error.statusCode = 409;
        throw error;
      }
      user.googleId = claims.sub;
      if (!user.avatar && claims.picture) user.avatar = claims.picture;
      await user.save();
    } else {
      user = await User.create({ name: claims.name || claims.email.split("@")[0], email: claims.email, googleId: claims.sub, avatar: claims.picture || "", role: "customer" });
    }
  }
  if (!user.isActive) {
    const error = new Error("Tài khoản đã bị vô hiệu hóa");
    error.statusCode = 403;
    throw error;
  }
  return { user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone || "", address: user.address || "", city: user.city || "", ward: user.ward || "", birthdate: user.birthdate || "", gender: user.gender || "", avatar: user.avatar || "" }, token: generateToken(user._id) };
};

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
      ward: user.ward || "",
      birthdate: user.birthdate || "",
    gender: user.gender || "",
      avatar: user.avatar || "",
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
      ward: user.ward || "",
      birthdate: user.birthdate || "",
    gender: user.gender || "",
      avatar: user.avatar || "",
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
  if (data.ward !== undefined) user.ward = data.ward;
  if (data.birthdate !== undefined) user.birthdate = data.birthdate;
  if (data.gender !== undefined) user.gender = data.gender;
  if (data.avatar !== undefined) user.avatar = data.avatar;

  await user.save();

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || "",
    address: user.address || "",
    city: user.city || "",
    ward: user.ward || "",
    birthdate: user.birthdate || "",
    gender: user.gender || "",
    avatar: user.avatar || "",
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
  loginWithGoogle,
  updateProfile,
  changePassword,
};
