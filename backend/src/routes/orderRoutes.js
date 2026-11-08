const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const revenueController = require("../controllers/revenueController");
const { protect, admin } = require("../middlewares/authMiddleware");

// Customer
router.get("/payment/vnpay/ipn", orderController.handleVnpayIpn);
router.get("/payment/vnpay/return", orderController.handleVnpayReturn);
router.post("/", protect, orderController.createOrder);
router.get("/my", protect, orderController.getMyOrders);
router.get("/my/:id", protect, orderController.getMyOrderById);
router.put("/my/:id/cancel", protect, orderController.cancelOrder);

// Admin
router.get("/admin/statistics", protect, admin, orderController.getAdminStatistics);
router.get("/admin/revenue", protect, admin, revenueController.getRevenueStatistics);
router.get("/", protect, admin, orderController.getAllOrders);
router.get("/:id", protect, admin, orderController.getOrderById);
router.put("/:id/status", protect, admin, orderController.updateOrderStatus);
router.put("/:id/payment-status", protect, admin, orderController.updatePaymentStatus);
router.put("/:id/cancellation/complete", protect, admin, orderController.completeCancellation);

module.exports = router;
