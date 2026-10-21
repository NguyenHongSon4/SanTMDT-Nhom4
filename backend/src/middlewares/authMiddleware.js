const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Kiểm tra đã đăng nhập chưa
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Người dùng không tồn tại",
        });
      }

      if (!req.user.isActive) {
        return res.status(403).json({
          success: false,
          message: "Tài khoản đã bị vô hiệu hóa",
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ hoặc đã hết hạn",
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: "Chưa đăng nhập, không có token",
    });
  }
};

// Chỉ cho phép Admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Không có quyền truy cập (chỉ Admin)",
    });
  }
};

module.exports = { protect, admin };