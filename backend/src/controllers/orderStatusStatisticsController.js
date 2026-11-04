const orderStatusStatisticsService = require("../services/orderStatusStatisticsService");

const getOrderStatusStatistics = async (req, res) => {
  try {
    const data =
      await orderStatusStatisticsService.getOrderStatusStatistics();

    return res.status(200).json({
      success: true,
      message: "Thống kê đơn hàng theo trạng thái thành công",
      data,
    });
  } catch (error) {
    console.error("getOrderStatusStatistics error:", error);

    return res.status(500).json({
      success: false,
      message: "Lỗi server khi thống kê đơn hàng theo trạng thái",
    });
  }
};

module.exports = {
  getOrderStatusStatistics,
};
