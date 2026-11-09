const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const uploadAvatar = require("../middlewares/avatarUpload");

// POST /api/auth/register
router.post("/register", authController.register);

// POST /api/auth/login
router.post("/login", authController.login);
router.post("/google", authController.googleLogin);

// GET /api/auth/me  (cần đăng nhập)
router.get("/me", protect, authController.getMe);

router.put("/profile", protect, authController.updateProfile);

router.put("/profile/avatar", protect, uploadAvatar, (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Vui lòng chọn ảnh đại diện" });
  }
  req.body.avatar = `/uploads/avatars/${req.file.filename}`;
  authController.updateProfile(req, res, next);
});

router.put("/password", protect, authController.changePassword);
module.exports = router;
