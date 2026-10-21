const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { protect } = require("../middlewares/authMiddleware");

// Tất cả route giỏ hàng đều cần đăng nhập
router.use(protect);

router.get("/", cartController.getCart);
router.post("/", cartController.addToCart);
router.put("/", cartController.updateCartItem);
router.delete("/:productId", cartController.removeFromCart);
router.delete("/", cartController.clearCart);

module.exports = router;