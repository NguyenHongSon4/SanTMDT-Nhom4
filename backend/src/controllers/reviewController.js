const reviewService = require("../services/reviewService");

const createReview = async (req, res) => {
  try {
    const review = await reviewService.createReview(
      req.user._id,
      req.params.productId,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Đánh giá sản phẩm thành công",
      data: review,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server khi tạo đánh giá",
    });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const result = await reviewService.getProductReviews(req.params.productId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server khi lấy đánh giá",
    });
  }
};

module.exports = { createReview, getProductReviews };
