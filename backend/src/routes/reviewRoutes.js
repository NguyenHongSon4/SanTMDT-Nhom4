const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { protect } = require("../middlewares/authMiddleware");

// Xem đánh giá là công khai; gửi đánh giá yêu cầu đăng nhập.
router.get("/:productId", reviewController.getProductReviews);
router.post("/:productId", protect, reviewController.createReview);

module.exports = router;
