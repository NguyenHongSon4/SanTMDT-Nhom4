const orderService = require("../services/orderService");
const statisticsService = require("../services/statisticsService");
const Order = require("../models/Order");
const vnpayService = require("../services/vnpayService");

const getVnpayAvailability = (_req, res) => {
  return res.status(200).json({ success: true, enabled: vnpayService.isConfigured() });
};

// GET /api/orders/admin/statistics (Admin)
const getAdminStatistics = async (req, res) => {
  try {
    const { from, to, interval } = req.query;
    const isDate = (value) => {
      if (!value) return true;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
      const parsed = new Date(`${value}T00:00:00.000Z`);
      return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
    };
    if (!isDate(from) || !isDate(to) || (from && to && from > to)) {
      return res.status(400).json({ success: false, message: "Khoảng ngày thống kê không hợp lệ" });
    }
    if (interval && !["day", "month"].includes(interval)) {
      return res.status(400).json({ success: false, message: "Nhóm thời gian không hợp lệ" });
    }
    const data = await statisticsService.getDashboardStatistics({ from, to, interval });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Lỗi server" });
  }
};

// POST /api/orders  (Customer đặt hàng)
const createOrder = async (req, res) => {
  try {
    const { receiverName, phone, shippingAddress, shippingCity } = req.body;

    if (!receiverName || !phone || !shippingAddress || !shippingCity) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin giao hàng",
      });
    }

    const paymentMethod = req.body.paymentMethod || "cod";
    if (paymentMethod === "card" && !vnpayService.isConfigured()) {
      return res.status(503).json({ success: false, message: "Thanh toán thẻ chưa được cấu hình. Vui lòng chọn chuyển khoản hoặc COD." });
    }

    const order = await orderService.createOrder(req.user._id, req.body);

    const response = { success: true, message: "Đặt hàng thành công", data: order };
    if (order.paymentMethod === "transfer") {
      const bankCode = process.env.BANK_CODE;
      const account = process.env.BANK_ACCOUNT;
      const accountName = process.env.BANK_ACCOUNT_NAME;
      response.transferInstructions = {
        bankCode: bankCode || "",
        account: account || "",
        accountName: accountName || "",
        reference: order.orderCode,
        amount: order.total,
        qrUrl: bankCode && account
          ? `https://img.vietqr.io/image/${encodeURIComponent(bankCode)}-${encodeURIComponent(account)}-compact2.png?amount=${order.total}&addInfo=${encodeURIComponent(order.orderCode)}${accountName ? `&accountName=${encodeURIComponent(accountName)}` : ""}`
          : "",
      };
    }
    if (order.paymentMethod === "card") {
      response.paymentUrl = vnpayService.createPaymentUrl(order, req.ip);
    }

    res.status(201).json(response);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

// VNPAY server-to-server result notification. Never trust the browser return alone.
const handleVnpayIpn = async (req, res) => {
  try {
    const params = { ...req.query };
    if (!vnpayService.verify(params)) return res.status(200).json({ RspCode: "97", Message: "Invalid signature" });
    const order = await Order.findOne({ orderCode: params.vnp_TxnRef, paymentMethod: "card" });
    if (!order) return res.status(200).json({ RspCode: "01", Message: "Order not found" });
    if (order.paymentStatus === "paid") return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
    if (order.status === "cancelled") return res.status(200).json({ RspCode: "04", Message: "Order is cancelled" });
    if (Number(params.vnp_Amount) !== Math.round(order.total * 100)) return res.status(200).json({ RspCode: "04", Message: "Invalid amount" });
    const update = {};
    if (params.vnp_ResponseCode === "00" && params.vnp_TransactionStatus === "00") {
      update.paymentStatus = "paid";
      update.paymentTransactionId = String(params.vnp_TransactionNo || "");
    } else {
      update.paymentStatus = "failed";
    }
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: order._id, status: { $ne: "cancelled" }, paymentStatus: { $ne: "paid" } },
      { $set: update },
      { new: true, runValidators: true },
    );
    if (!updatedOrder) return res.status(200).json({ RspCode: "04", Message: "Order status changed" });
    return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
  } catch {
    return res.status(200).json({ RspCode: "99", Message: "Unknown error" });
  }
};

const handleVnpayReturn = (req, res) => {
  const params = { ...req.query };
  const valid = vnpayService.verify(params);
  const success = valid && params.vnp_ResponseCode === "00" && params.vnp_TransactionStatus === "00";
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const target = new URL("/", frontendUrl);
  target.searchParams.set("paymentResult", success ? "success" : "failed");
  if (params.vnp_TxnRef) target.searchParams.set("orderCode", String(params.vnp_TxnRef));
  return res.redirect(303, target.toString());
};

// GET /api/orders/my  (Customer xem đơn của mình)
const getMyOrders = async (req, res) => {
  try {
    const orders = await orderService.getMyOrders(req.user._id);
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

// GET /api/orders/my/:id
const getMyOrderById = async (req, res) => {
  try {
    const order = await orderService.getMyOrderById(
      req.user._id,
      req.params.id
    );
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

// PUT /api/orders/my/:id/cancel
const cancelOrder = async (req, res) => {
  try {
    const { reason, reasonDetail } = req.body || {};
    const order = await orderService.cancelOrder(req.user._id, req.params.id, reason, reasonDetail);
    res.status(200).json({
      success: true,
      message: order.cancellationStatus === "requested"
        ? "Yêu cầu hủy đơn đang chờ Admin xác nhận hoàn tiền"
        : "Đơn hàng COD đã được hủy thành công",
      data: order,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

const completeCancellation = async (req, res) => {
  try {
    const order = await orderService.completeCancellation(req.params.id);
    return res.status(200).json({ success: true, message: "Đã xác nhận xử lý yêu cầu hủy đơn", data: order });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Lỗi server" });
  }
};

// GET /api/orders  (Admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders(req.query);
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

// GET /api/orders/:id  (Admin)
const getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

// PUT /api/orders/:id/status  (Admin)  body: { status }
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng gửi trạng thái mới",
      });
    }

    const order = await orderService.updateOrderStatus(req.params.id, status);

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const order = await orderService.updatePaymentStatus(req.params.id, req.body.paymentStatus);
    return res.status(200).json({ success: true, message: "Cập nhật thanh toán thành công", data: order });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Lỗi server" });
  }
};

module.exports = {
  getVnpayAvailability,
  getAdminStatistics,
  createOrder,
  getMyOrders,
  getMyOrderById,
  cancelOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  handleVnpayIpn,
  handleVnpayReturn,
  updatePaymentStatus,
  completeCancellation,
};
