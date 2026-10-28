const mongoose = require("mongoose");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const SHIPPING_FEE_DEFAULT = 30000;
const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipping",
  "completed",
  "cancelled",
];

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const assertValidObjectId = (id, label = "ID") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError(`${label} không hợp lệ`, 400);
  }
};

const parseNonNegativeNumber = (value, label, defaultValue) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw createError(`${label} phải là số hợp lệ và không được âm`, 400);
  }
  return parsed;
};

// Tạo mã đơn hàng; kiểm tra trước để giảm khả năng trùng mã.
const generateOrderCode = async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const date = new Date();
    const y = date.getFullYear().toString().slice(-2);
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const random = Math.floor(10000 + Math.random() * 90000);
    const code = `LM${y}${m}${d}${random}`;
    const exists = await Order.exists({ orderCode: code });
    if (!exists) return code;
  }
  throw createError("Không thể tạo mã đơn hàng, vui lòng thử lại", 503);
};

const rollbackStockChanges = async (changes) => {
  for (const change of changes.reverse()) {
    await Product.updateOne(
      { _id: change.productId },
      { $inc: { stock: change.quantity } }
    );
  }
};

// Đặt hàng từ giỏ hiện tại của khách hàng.
const createOrder = async (userId, orderData = {}) => {
  if (!userId) throw createError("Không xác định được người đặt hàng", 401);

  const cart = await Cart.findOne({ userId }).populate("items.productId");
  if (!cart || !cart.items || cart.items.length === 0) {
    throw createError("Giỏ hàng trống, không thể đặt hàng", 400);
  }

  const items = cart.items.map((item) => {
    const product = item.productId;
    if (!product || !product.isActive) {
      throw createError("Có sản phẩm không còn được kinh doanh", 400);
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      throw createError(`Số lượng của sản phẩm "${product.name}" không hợp lệ`, 400);
    }
    if (product.stock < item.quantity) {
      throw createError(
        `Sản phẩm "${product.name}" chỉ còn ${product.stock} sản phẩm`,
        400
      );
    }

    // Lấy giá và thông tin sản phẩm từ database, không lấy giá do client gửi lên.
    return {
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      image: Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]
        : "",
    };
  });

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingFee = parseNonNegativeNumber(
    orderData.shippingFee,
    "Phí vận chuyển",
    SHIPPING_FEE_DEFAULT
  );
  const discount = parseNonNegativeNumber(orderData.discount, "Giảm giá", 0);

  if (discount > subtotal) {
    throw createError("Giảm giá không được lớn hơn tiền hàng", 400);
  }

  const total = subtotal + shippingFee - discount;
  if (!Number.isFinite(total) || total < 0) {
    throw createError("Tổng tiền đơn hàng không hợp lệ", 400);
  }

  const requiredFields = [
    ["receiverName", "Vui lòng nhập tên người nhận"],
    ["phone", "Vui lòng nhập số điện thoại"],
    ["shippingAddress", "Vui lòng nhập địa chỉ giao hàng"],
    ["shippingCity", "Vui lòng nhập tỉnh/thành phố"],
  ];
  for (const [field, message] of requiredFields) {
    if (typeof orderData[field] !== "string" || !orderData[field].trim()) {
      throw createError(message, 400);
    }
  }

  const order = await Order.create({
    orderCode: await generateOrderCode(),
    userId,
    items,
    receiverName: orderData.receiverName.trim(),
    phone: orderData.phone.trim(),
    shippingAddress: orderData.shippingAddress.trim(),
    shippingWard: typeof orderData.shippingWard === "string"
      ? orderData.shippingWard.trim()
      : "",
    shippingCity: orderData.shippingCity.trim(),
    note: typeof orderData.note === "string" ? orderData.note.trim() : "",
    paymentMethod: orderData.paymentMethod || "cod",
    subtotal,
    shippingFee,
    discount,
    total,
    status: "pending",
  });

  // Chỉ xóa giỏ hàng sau khi đơn hàng đã được lưu thành công.
  cart.items = [];
  await cart.save();

  return order;
};

// Khách xem lịch sử đơn hàng của mình.
const getMyOrders = async (userId) => {
  return Order.find({ userId }).sort({ createdAt: -1 });
};

// Khách xem chi tiết đơn hàng của mình.
const getMyOrderById = async (userId, orderId) => {
  assertValidObjectId(orderId, "Mã đơn hàng");
  const order = await Order.findOne({ _id: orderId, userId });
  if (!order) throw createError("Không tìm thấy đơn hàng", 404);
  return order;
};

// Khách chỉ được hủy đơn đang chờ xác nhận; cập nhật có điều kiện để tránh race condition.
const cancelOrder = async (userId, orderId) => {
  assertValidObjectId(orderId, "Mã đơn hàng");

  const order = await Order.findOneAndUpdate(
    { _id: orderId, userId, status: "pending" },
    { $set: { status: "cancelled" } },
    { new: true, runValidators: true }
  );
  if (order) return order;

  const existingOrder = await Order.findOne({ _id: orderId, userId });
  if (!existingOrder) throw createError("Không tìm thấy đơn hàng", 404);
  throw createError("Chỉ có thể hủy đơn đang chờ xác nhận", 400);
};

// Admin xem danh sách đơn hàng, có thể lọc theo trạng thái hiện có.
const getAllOrders = async (query = {}) => {
  const filter = {};
  if (query.status) {
    if (!ORDER_STATUSES.includes(query.status)) {
      throw createError("Trạng thái đơn hàng không hợp lệ", 400);
    }
    filter.status = query.status;
  }
  return Order.find(filter)
    .populate("userId", "name email")
    .sort({ createdAt: -1 });
};

// Admin xem chi tiết đơn hàng.
const getOrderById = async (orderId) => {
  assertValidObjectId(orderId, "Mã đơn hàng");
  const order = await Order.findById(orderId).populate("userId", "name email");
  if (!order) throw createError("Không tìm thấy đơn hàng", 404);
  return order;
};

// Admin cập nhật trạng thái theo luồng nghiệp vụ hiện có.
const updateOrderStatus = async (orderId, newStatus) => {
  assertValidObjectId(orderId, "Mã đơn hàng");
  if (!ORDER_STATUSES.includes(newStatus)) {
    throw createError("Trạng thái đơn hàng không hợp lệ", 400);
  }

  const order = await Order.findById(orderId);
  if (!order) throw createError("Không tìm thấy đơn hàng", 404);

  const currentStatus = order.status;
  const validTransitions = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["shipping", "cancelled"],
    shipping: ["completed"],
    completed: [],
    cancelled: [],
  };

  if (!validTransitions[currentStatus]?.includes(newStatus)) {
    throw createError(
      `Không thể chuyển từ "${currentStatus}" sang "${newStatus}"`,
      400
    );
  }

  // Khi xác nhận, trừ tồn kho bằng cập nhật có điều kiện để tránh bán vượt tồn.
  // Nếu một mặt hàng không đủ tồn kho, hoàn lại các thay đổi đã thực hiện.
  const deductedStock = [];
  if (currentStatus === "pending" && newStatus === "confirmed") {
    try {
      for (const item of order.items) {
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: item.productId, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { new: true }
        );

        if (!updatedProduct) {
          throw createError(
            `Sản phẩm "${item.name}" không đủ tồn kho để xác nhận`,
            400
          );
        }
        deductedStock.push({
          productId: item.productId,
          quantity: item.quantity,
        });
      }
    } catch (error) {
      await rollbackStockChanges(deductedStock);
      throw error;
    }
  }

  // Chỉ đổi trạng thái nếu đơn vẫn ở trạng thái đã đọc ban đầu.
  const updatedOrder = await Order.findOneAndUpdate(
    { _id: orderId, status: currentStatus },
    { $set: { status: newStatus } },
    { new: true, runValidators: true }
  );

  if (!updatedOrder) {
    if (deductedStock.length > 0) await rollbackStockChanges(deductedStock);
    throw createError("Đơn hàng vừa được cập nhật bởi thao tác khác. Vui lòng tải lại", 409);
  }

  // Khi Admin hủy đơn đã xác nhận, hoàn tồn kho đúng một lần sau khi đổi trạng thái thành công.
  if (currentStatus === "confirmed" && newStatus === "cancelled") {
    try {
      for (const item of order.items) {
        await Product.updateOne(
          { _id: item.productId },
          { $inc: { stock: item.quantity } }
        );
      }
    } catch (error) {
      // Khôi phục trạng thái nếu thao tác hoàn tồn kho gặp lỗi.
      await Order.findOneAndUpdate(
        { _id: orderId, status: "cancelled" },
        { $set: { status: "confirmed" } },
        { runValidators: true }
      );
      throw createError("Không thể hoàn tồn kho. Vui lòng kiểm tra lại đơn hàng", 500);
    }
  }

  return updatedOrder;
};

module.exports = {
  createOrder,
  getMyOrders,
  getMyOrderById,
  cancelOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};
