const Order = require("../models/Order");
const Product = require("../models/Product");

const STATUSES = ["pending", "confirmed", "shipping", "completed", "cancelled"];
const LOW_STOCK = 10;

const getDashboardStatistics = async ({ from, to, interval = "day" } = {}) => {
  const [statusRows, completedRevenue, periodRevenue, revenueSeries, topSelling, lowStock, lowStockCount, totalProducts, recentOrders] = await Promise.all([
    Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$total" }, orders: { $sum: 1 } } },
    ]),
    (() => {
      const match = { status: "completed" };
      if (from || to) {
        match.createdAt = {};
        if (from) match.createdAt.$gte = new Date(`${from}T00:00:00+07:00`);
        if (to) {
          const end = new Date(`${to}T00:00:00+07:00`);
          end.setUTCDate(end.getUTCDate() + 1);
          match.createdAt.$lt = end;
        }
      }
      return Order.aggregate([
        { $match: match },
        { $group: { _id: null, total: { $sum: "$total" }, subtotal: { $sum: "$subtotal" }, discount: { $sum: "$discount" }, shippingFee: { $sum: "$shippingFee" }, orders: { $sum: 1 } } },
      ]);
    })(),
    (() => {
      const match = { status: "completed" };
      if (from || to) {
        match.createdAt = {};
        if (from) match.createdAt.$gte = new Date(`${from}T00:00:00+07:00`);
        if (to) {
          const end = new Date(`${to}T00:00:00+07:00`);
          end.setUTCDate(end.getUTCDate() + 1);
          match.createdAt.$lt = end;
        }
      }
      const dateFormat = interval === "month" ? "%Y-%m" : "%Y-%m-%d";
      return Order.aggregate([
        { $match: match },
        { $group: { _id: { $dateToString: { format: dateFormat, date: "$createdAt", timezone: "Asia/Ho_Chi_Minh" } }, value: { $sum: "$total" }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]);
    })(),
    Order.aggregate([
      { $match: { status: "completed" } },
      { $unwind: "$items" },
      { $group: { _id: "$items.productId", name: { $max: "$items.name" }, quantity: { $sum: "$items.quantity" }, grossSales: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
      { $sort: { quantity: -1, name: 1 } },
      { $limit: 10 },
    ]),
    Product.find({ isActive: true, stock: { $lt: LOW_STOCK } }).select("name stock images").sort({ stock: 1, name: 1 }).limit(20).lean(),
    Product.countDocuments({ isActive: true, stock: { $lt: LOW_STOCK } }),
    Product.countDocuments({ isActive: true }),
    Order.find().sort({ createdAt: -1 }).limit(5).select("orderCode receiverName userId createdAt status total").populate("userId", "name").lean(),
  ]);

  const byStatus = Object.fromEntries(STATUSES.map((status) => [status, 0]));
  for (const row of statusRows) if (Object.hasOwn(byStatus, row._id)) byStatus[row._id] = row.count;
  const allRevenue = completedRevenue[0] || {};
  const selectedRevenue = periodRevenue[0] || {};
  return {
    lowStockThreshold: LOW_STOCK,
    lowStockCount,
    totalOrders: Object.values(byStatus).reduce((sum, count) => sum + count, 0),
    totalProducts,
    byStatus,
    revenueAllTime: { total: allRevenue.total || 0, orders: allRevenue.orders || 0 },
    revenuePeriod: { total: selectedRevenue.total || 0, subtotal: selectedRevenue.subtotal || 0, discount: selectedRevenue.discount || 0, shippingFee: selectedRevenue.shippingFee || 0, orders: selectedRevenue.orders || 0 },
    revenueSeries: revenueSeries.map((row) => ({ date: row._id, value: row.value, orders: row.orders })),
    topSelling: topSelling.map((row) => ({ productId: row._id, name: row.name, quantity: row.quantity, grossSales: row.grossSales })),
    lowStock: lowStock.map((product) => ({ id: product._id, name: product.name, stock: product.stock, image: product.images?.[0] || "" })),
    recentOrders,
  };
};

module.exports = { getDashboardStatistics };
