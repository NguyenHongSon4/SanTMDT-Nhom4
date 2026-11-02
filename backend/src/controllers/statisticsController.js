const statisticsService = require("../services/statisticsService");

const getRevenueStatistics = async (req, res) => {
  try {
    const { period = "month", date } = req.query;
    const data = await statisticsService.getRevenueStatistics(period, date);

    return res.status(200).json({
      success: true,
      message: "Lấy thống kê doanh thu thành công",
      data,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server khi thống kê doanh thu",
    });
  }
};

module.exports = { getRevenueStatistics };
