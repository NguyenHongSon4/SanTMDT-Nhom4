const revenueService = require("../services/revenueService");

const getRevenueStatistics = async (req, res) => {
  const granularity = req.query.granularity;
  const year = Number(req.query.year);
  const month = Number(req.query.month);

  if (!["day", "month", "quarter", "year"].includes(granularity)) {
    return res.status(400).json({ success: false, message: "Khoảng thống kê không hợp lệ" });
  }
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return res.status(400).json({ success: false, message: "Năm thống kê không hợp lệ" });
  }
  if (granularity === "day" && (!Number.isInteger(month) || month < 1 || month > 12)) {
    return res.status(400).json({ success: false, message: "Tháng thống kê không hợp lệ" });
  }

  try {
    const data = await revenueService.getRevenueStatistics({ granularity, year, month });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Không tải được báo cáo doanh thu" });
  }
};

module.exports = { getRevenueStatistics };
