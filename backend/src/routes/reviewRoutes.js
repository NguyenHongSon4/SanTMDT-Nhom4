const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { protect, admin } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");

// Public — review đã duyệt theo SP
router.get("/product/:productId", reviewController.getByProduct);

// User — tạo review (multipart)
router.post(
  "/",
  protect,
  upload.array("images", 3),
  reviewController.create
);

// Admin
router.get("/", protect, admin, reviewController.getAll);
router.put("/:id/status", protect, admin, reviewController.updateStatus);
router.delete("/:id", protect, admin, reviewController.remove);
router.put("/:id/reply", protect, admin, reviewController.reply);

module.exports = router;