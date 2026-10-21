const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Tạo mã đơn hàng duy nhất
const generateOrderCode = () => {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `LM${y}${m}${d}${random}`;
};

// Đặt hàng (từ giỏ hàng)
const createOrder = async (userId, orderData) => {
  const cart = await Cart.findOne({ userId }).populate("items.productId");
  if (!cart || cart.items.length === 0) {
    const error = new Error("Giỏ hàng trống, không thể đặt hàng");
    error.statusCode = 400;
    throw error;
  }

  // Kiểm tra tồn kho & sản phẩm còn bán
  for (const item of cart.items) {
    const product = item.productId;
    if (!product || !product.isActive) {
      const error = new Error(`Sản phẩm không còn bán`);
      error.statusCode = 400;
      throw error;
    }
    if (product.stock < item.quantity) {
      const error = new Error(
        `Sản phẩm "${product.name}" chỉ còn ${product.stock} sản phẩm`
      );
      error.statusCode = 400;
      throw error;
    }
  }

  const items = cart.items.map((item) => ({
    productId: item.productId._id,
    name: item.productId.name,
    price: item.productId.price,
    quantity: item.quantity,
    image:
      item.productId.images && item.productId.images.length > 0
        ? item.productId.images[0]
        : "",
  }));

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingFee = orderData.shippingFee ?? 30000;
  const discount = orderData.discount ?? 0;
  const total = subtotal + shippingFee - discount;

  const order = await Order.create({
    orderCode: generateOrderCode(),
    userId,
    items,
    receiverName: orderData.receiverName,
    phone: orderData.phone,
    shippingAddress: orderData.shippingAddress,
    shippingWard: orderData.shippingWard || "",
    shippingCity: orderData.shippingCity,
    note: orderData.note || "",
    paymentMethod: orderData.paymentMethod || "cod",
    subtotal,
    shippingFee,
    discount,
    total,
    status: "pending",
  });

  // Xóa giỏ hàng sau khi đặt thành công
  cart.items = [];
  await cart.save();

  return order;
};

// Khách xem lịch sử đơn hàng của mình
const getMyOrders = async (userId) => {
  return await Order.find({ userId }).sort({ createdAt: -1 });
};

// Khách xem chi tiết 1 đơn
const getMyOrderById = async (userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, userId });
  if (!order) {
    const error = new Error("Không tìm thấy đơn hàng");
    error.statusCode = 404;
    throw error;
  }
  return order;
};

// Khách hủy đơn (chỉ khi pending)
const cancelOrder = async (userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, userId });
  if (!order) {
    const error = new Error("Không tìm thấy đơn hàng");
    error.statusCode = 404;
    throw error;
  }

  if (order.status !== "pending") {
    const error = new Error("Chỉ có thể hủy đơn đang chờ xác nhận");
    error.statusCode = 400;
    throw error;
  }

  order.status = "cancelled";
  await order.save();
  return order;
};

// Admin xem tất cả đơn
const getAllOrders = async (query = {}) => {
  const filter = {};
  if (query.status) filter.status = query.status;
  return await Order.find(filter)
    .populate("userId", "name email")
    .sort({ createdAt: -1 });
};

// Admin xem chi tiết đơn
const getOrderById = async (orderId) => {
  const order = await Order.findById(orderId).populate("userId", "name email");
  if (!order) {
    const error = new Error("Không tìm thấy đơn hàng");
    error.statusCode = 404;
    throw error;
  }
  return order;
};

// Admin cập nhật trạng thái đơn (BR42, BR56, BR60)
const updateOrderStatus = async (orderId, newStatus) => {
  const order = await Order.findById(orderId);
  if (!order) {
    const error = new Error("Không tìm thấy đơn hàng");
    error.statusCode = 404;
    throw error;
  }

  const validTransitions = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["shipping", "cancelled"],
    shipping: ["completed"],
    completed: [],
    cancelled: [],
  };

  if (!validTransitions[order.status]?.includes(newStatus)) {
    const error = new Error(
      `Không thể chuyển từ "${order.status}" sang "${newStatus}"`
    );
    error.statusCode = 400;
    throw error;
  }

  // BR42: Khi Admin xác nhận → trừ tồn kho
  if (newStatus === "confirmed" && order.status === "pending") {
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;
      if (product.stock < item.quantity) {
        const error = new Error(
          `Sản phẩm "${item.name}" không đủ tồn kho để xác nhận`
        );
        error.statusCode = 400;
        throw error;
      }
      product.stock -= item.quantity;
      await product.save();
    }
  }

  // BR60: Hủy đơn đã confirmed → hoàn tồn kho
  if (newStatus === "cancelled" && order.status === "confirmed") {
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;
      product.stock += item.quantity;
      await product.save();
    }
  }

  order.status = newStatus;
  await order.save();
  return order;
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