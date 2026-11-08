const Order = require("../models/Order");

const TIMEZONE = "Asia/Ho_Chi_Minh";
const DAY_OFFSET_MS = 7 * 60 * 60 * 1000;

function localDateUtc(year, month, day = 1) {
  return new Date(Date.UTC(year, month - 1, day) - DAY_OFFSET_MS);
}

function getPeriodRange(granularity, year, month) {
  if (granularity === "day") {
    return { from: localDateUtc(year, month), to: localDateUtc(year, month + 1) };
  }
  if (granularity === "month" || granularity === "quarter") {
    return { from: localDateUtc(year, 1), to: localDateUtc(year + 1, 1) };
  }
  return { from: localDateUtc(year - 4, 1), to: localDateUtc(year + 1, 1) };
}

function buildBuckets(granularity, year, month) {
  if (granularity === "day") {
    const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return Array.from({ length: days }, (_, i) => `${year}-${String(month).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`);
  }
  if (granularity === "month") {
    return Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`);
  }
  if (granularity === "quarter") {
    return [1, 2, 3, 4].map((quarter) => `${year}-Q${quarter}`);
  }
  return Array.from({ length: 5 }, (_, i) => String(year - 4 + i));
}

function periodKeyExpression(granularity) {
  if (granularity === "day") {
    return { $dateToString: { format: "%Y-%m-%d", date: "$revenueDate", timezone: TIMEZONE } };
  }
  if (granularity === "month") {
    return { $dateToString: { format: "%Y-%m", date: "$revenueDate", timezone: TIMEZONE } };
  }
  if (granularity === "quarter") {
    return {
      $concat: [
        { $toString: "$dateParts.year" },
        "-Q",
        { $toString: { $ceil: { $divide: ["$dateParts.month", 3] } } },
      ],
    };
  }
  return { $toString: "$dateParts.year" };
}

async function getRevenueStatistics({ granularity, year, month = 1 }) {
  const { from, to } = getPeriodRange(granularity, year, month);
  const match = {
    status: "completed",
    paymentStatus: { $ne: "refunded" },
    $or: [{ paymentMethod: "cod" }, { paymentStatus: "paid" }],
  };
  const grouped = await Order.aggregate([
    { $match: match },
    { $addFields: { revenueDate: { $ifNull: ["$completedAt", "$createdAt"] } } },
    { $match: { revenueDate: { $gte: from, $lt: to } } },
    { $addFields: { dateParts: { $dateToParts: { date: "$revenueDate", timezone: TIMEZONE } } } },
    { $addFields: { period: periodKeyExpression(granularity) } },
    {
      $group: {
        _id: "$period",
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
        subtotal: { $sum: "$subtotal" },
        discount: { $sum: "$discount" },
        shippingFee: { $sum: "$shippingFee" },
        codRevenue: { $sum: { $cond: [{ $eq: ["$paymentMethod", "cod"] }, "$total", 0] } },
        transferRevenue: { $sum: { $cond: [{ $eq: ["$paymentMethod", "transfer"] }, "$total", 0] } },
        cardRevenue: { $sum: { $cond: [{ $eq: ["$paymentMethod", "card"] }, "$total", 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const byPeriod = new Map(grouped.map((row) => [row._id, row]));
  const series = buildBuckets(granularity, year, month).map((period) => {
    const row = byPeriod.get(period) || {};
    return {
      period,
      revenue: row.revenue || 0,
      orders: row.orders || 0,
      subtotal: row.subtotal || 0,
      discount: row.discount || 0,
      shippingFee: row.shippingFee || 0,
      codRevenue: row.codRevenue || 0,
      transferRevenue: row.transferRevenue || 0,
      cardRevenue: row.cardRevenue || 0,
    };
  });

  const summary = series.reduce((result, row) => {
    result.revenue += row.revenue;
    result.orders += row.orders;
    result.subtotal += row.subtotal;
    result.discount += row.discount;
    result.shippingFee += row.shippingFee;
    result.byPaymentMethod.cod += row.codRevenue;
    result.byPaymentMethod.transfer += row.transferRevenue;
    result.byPaymentMethod.card += row.cardRevenue;
    return result;
  }, {
    revenue: 0,
    orders: 0,
    subtotal: 0,
    discount: 0,
    shippingFee: 0,
    byPaymentMethod: { cod: 0, transfer: 0, card: 0 },
  });
  summary.averageOrderValue = summary.orders ? Math.round(summary.revenue / summary.orders) : 0;
  return { granularity, year, month: granularity === "day" ? month : undefined, summary, series };
}

module.exports = { getRevenueStatistics };
