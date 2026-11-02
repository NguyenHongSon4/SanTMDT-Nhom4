const Order = require("../models/Order");

// Hệ thống dùng múi giờ Việt Nam (UTC+7) khi xác định ngày/tuần/tháng.
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

const parseDate = (value) => {
  if (!value) return new Date();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const error = new Error("Tham số date phải có định dạng YYYY-MM-DD");
    error.statusCode = 400;
    throw error;
  }

  const date = new Date(`${value}T00:00:00.000+07:00`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !==
      new Date(date.getTime() + VN_OFFSET_MS).toISOString().slice(0, 10)) {
    const error = new Error("Ngày thống kê không hợp lệ");
    error.statusCode = 400;
    throw error;
  }
  return date;
};

const getPeriodRange = (period, inputDate) => {
  const selected = parseDate(inputDate);
  // Chuyển sang đồng hồ Việt Nam để tính đầu ngày.
  const local = new Date(selected.getTime() + VN_OFFSET_MS);
  const year = local.getUTCFullYear();
  const month = local.getUTCMonth();
  const day = local.getUTCDate();

  let startLocal;
  let endLocal;

  if (period === "day") {
    startLocal = new Date(Date.UTC(year, month, day));
    endLocal = new Date(Date.UTC(year, month, day + 1));
  } else if (period === "week") {
    const weekday = new Date(Date.UTC(year, month, day)).getUTCDay();
    const daysFromMonday = (weekday + 6) % 7;
    startLocal = new Date(Date.UTC(year, month, day - daysFromMonday));
    endLocal = new Date(startLocal.getTime() + 7 * 24 * 60 * 60 * 1000);
  } else if (period === "month") {
    startLocal = new Date(Date.UTC(year, month, 1));
    endLocal = new Date(Date.UTC(year, month + 1, 1));
  } else {
    const error = new Error("period chỉ nhận day, week hoặc month");
    error.statusCode = 400;
    throw error;
  }

  return {
    start: new Date(startLocal.getTime() - VN_OFFSET_MS),
    end: new Date(endLocal.getTime() - VN_OFFSET_MS),
  };
};

const getRevenueStatistics = async (period = "month", date) => {
  const { start, end } = getPeriodRange(period, date);

  const groupFormat =
    period === "day" ? "%H:00" :
    period === "week" ? "%Y-%m-%d" : "%Y-%m-%d";

  const result = await Order.aggregate([
    {
      $match: {
        status: "completed",
        createdAt: { $gte: start, $lt: end },
      },
    },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$total" },
              totalOrders: { $sum: 1 },
            },
          },
        ],
        chart: [
          {
            $group: {
              _id: {
                $dateToString: {
                  format: groupFormat,
                  date: "$createdAt",
                  timezone: "+07:00",
                },
              },
              revenue: { $sum: "$total" },
              orders: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],
      },
    },
  ]);

  const data = result[0] || { summary: [], chart: [] };
  const summary = data.summary[0] || { totalRevenue: 0, totalOrders: 0 };

  return {
    period,
    date: date || new Date(Date.now() + VN_OFFSET_MS).toISOString().slice(0, 10),
    from: start,
    to: new Date(end.getTime() - 1),
    totalRevenue: summary.totalRevenue,
    totalOrders: summary.totalOrders,
    chart: data.chart.map((item) => ({
      label: item._id,
      revenue: item.revenue,
      orders: item.orders,
    })),
    currency: "VND",
    countedOrderStatus: "completed",
  };
};

module.exports = { getRevenueStatistics };
