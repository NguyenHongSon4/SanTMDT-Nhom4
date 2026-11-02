
const mongoose = require("mongoose");
const Order = require("../models/Order");

// POST /api/payments/:orderId
// Customer yêu cầu thanh toán cho đơn hàng của mình
const requestPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentMethod } = req.body;

    if (!mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Mã đơn hàng không hợp lệ",
      });
    }

    if (!["cod", "transfer"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Phương thức thanh toán phải là cod hoặc transfer",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      userId: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Không thể thanh toán đơn hàng đã bị hủy",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(409).json({
        success: false,
        message: "Đơn hàng đã được thanh toán",
      });
    }

    order.paymentMethod = paymentMethod;

    if (paymentMethod === "cod") {
      // COD: khách trả tiền khi nhận hàng
      order.paymentStatus = "unpaid";
      order.paidAt = null;
      order.paymentReference = null;
    } else {
      // Chuyển khoản: chờ xác minh giao dịch thực tế
      order.paymentStatus = "pending";
      order.paidAt = null;
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message:
        paymentMethod === "cod"
          ? "Đã chọn thanh toán khi nhận hàng"
          : "Đã ghi nhận yêu cầu chuyển khoản, đang chờ xác minh thanh toán",
      data: {
        orderId: order._id,
        orderCode: order.orderCode,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        total: order.total,
        paidAt: order.paidAt,
      },
    });
  } catch (error) {
    console.error("requestPayment error:", error);

    return res.status(500).json({
      success: false,
      message: "Lỗi server khi xử lý yêu cầu thanh toán",
    });
  }
};

module.exports = {
  requestPayment,
};
