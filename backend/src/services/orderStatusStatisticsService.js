const Order = require("../models/Order");

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipping",
  "completed",
  "cancelled",
];

const getOrderStatusStatistics = async () => {
  const grouped = await Order.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const counts = Object.fromEntries(
    ORDER_STATUSES.map((status) => [status, 0])
  );

  for (const item of grouped) {
    if (Object.prototype.hasOwnProperty.call(counts, item._id)) {
      counts[item._id] = item.count;
    }
  }

  const total = ORDER_STATUSES.reduce(
    (sum, status) => sum + counts[status],
    0
  );

  return {
    ...counts,
    total,
  };
};

module.exports = {
  getOrderStatusStatistics,
};
