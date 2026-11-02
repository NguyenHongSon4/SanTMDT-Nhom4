const express = require("express");
const router = express.Router();
const statisticsController = require("../controllers/statisticsController");
const { protect, admin } = require("../middlewares/authMiddleware");

// Chỉ Admin được xem thống kê doanh thu.
router.get("/revenue", protect, admin, statisticsController.getRevenueStatistics);

module.exports = router;
