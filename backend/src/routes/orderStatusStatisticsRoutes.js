const express = require("express");
const router = express.Router();

const { protect, admin } = require("../middlewares/authMiddleware");
const orderStatusStatisticsController = require("../controllers/orderStatusStatisticsController");

// Chỉ Admin được xem thống kê đơn hàng theo trạng thái.
router.get(
  "/orders-by-status",
  protect,
  admin,
  orderStatusStatisticsController.getOrderStatusStatistics
);

module.exports = router;
