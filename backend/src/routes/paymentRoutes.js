
const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const paymentController = require("../controllers/paymentController");

// Customer yêu cầu thanh toán cho đơn hàng
// POST /api/payments/:orderId
router.post("/:orderId", protect, paymentController.requestPayment);

module.exports = router;
