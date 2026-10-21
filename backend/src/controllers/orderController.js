const orderService = require("../services/orderService");

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

    const order = await orderService.createOrder(req.user._id, req.body);

    res.status(201).json({
      success: true,
      message: "Đặt hàng thành công",
      data: order,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
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
    const order = await orderService.cancelOrder(req.user._id, req.params.id);
    res.status(200).json({
      success: true,
      message: "Hủy đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
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

module.exports = {
  createOrder,
  getMyOrders,
  getMyOrderById,
  cancelOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};