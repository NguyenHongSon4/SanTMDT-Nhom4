const reviewService = require("../services/reviewService");

const create = async (req, res) => {
  try {
    const data = await reviewService.createReview(
      req.user._id,
      req.body,
      req.files || []
    );
    res.status(201).json({
      success: true,
      message:
        "Gửi đánh giá thành công. Đánh giá sẽ hiển thị sau khi Admin duyệt.",
      data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

const getByProduct = async (req, res) => {
  try {
    const data = await reviewService.getPublicByProduct(
      req.params.productId
    );
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

const getAll = async (req, res) => {
  try {
    const data = await reviewService.getAllForAdmin(req.query);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

const updateStatus = async (req, res) => {
  try {
    const data = await reviewService.updateStatus(
      req.params.id,
      req.body.status
    );
    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

const remove = async (req, res) => {
  try {
    await reviewService.deleteReview(req.params.id);
    res.status(200).json({
      success: true,
      message: "Đã xóa đánh giá",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

const reply = async (req, res) => {
  try {
    const data = await reviewService.replyToReview(
      req.params.id,
      req.user._id,
      req.body.reply
    );
    res.status(200).json({
      success: true,
      message: "Đã gửi phản hồi",
      data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

module.exports = { create, getByProduct, getAll, updateStatus, remove, reply };