const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

// POST /api/auth/register
router.post("/register", authController.register);

// POST /api/auth/login
router.post("/login", authController.login);

// GET /api/auth/me  (cần đăng nhập)
router.get("/me", protect, authController.getMe);

router.put("/profile", protect, authController.updateProfile);

router.put("/password", protect, authController.changePassword);
module.exports = router;