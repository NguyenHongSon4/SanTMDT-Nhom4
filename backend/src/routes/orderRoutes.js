const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { protect, admin } = require("../middlewares/authMiddleware");

// Customer
router.post("/", protect, orderController.createOrder);
router.get("/my", protect, orderController.getMyOrders);
router.get("/my/:id", protect, orderController.getMyOrderById);
router.put("/my/:id/cancel", protect, orderController.cancelOrder);

// Admin
router.get("/", protect, admin, orderController.getAllOrders);
router.get("/:id", protect, admin, orderController.getOrderById);
router.put("/:id/status", protect, admin, orderController.updateOrderStatus);

module.exports = router;