const mongoose = require("mongoose");
const Review = require("../models/Review");
const Order = require("../models/Order");
const Product = require("../models/Product");

const createReview = async (userId, productId, data) => {
  if (!mongoose.isValidObjectId(productId)) {
    const error = new Error("Mã sản phẩm không hợp lệ");
    error.statusCode = 400;
    throw error;
  }

  const product = await Product.findById(productId);
  if (!product) {
    const error = new Error("Không tìm thấy sản phẩm");
    error.statusCode = 404;
    throw error;
  }

  const rating = Number(data.rating);
  const comment = typeof data.comment === "string" ? data.comment.trim() : "";

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    const error = new Error("Số sao đánh giá phải là số nguyên từ 1 đến 5");
    error.statusCode = 400;
    throw error;
  }

  if (comment.length < 2 || comment.length > 1000) {
    const error = new Error("Bình luận phải từ 2 đến 1000 ký tự");
    error.statusCode = 400;
    throw error;
  }

  // Chỉ khách có đơn đã hoàn thành chứa sản phẩm này mới được đánh giá.
  const purchasedOrder = await Order.findOne({
    userId,
    status: "completed",
    "items.productId": productId,
  }).select("_id");

  if (!purchasedOrder) {
    const error = new Error("Bạn chỉ có thể đánh giá sản phẩm đã mua và nhận hàng");
    error.statusCode = 403;
    throw error;
  }

  const existed = await Review.findOne({ productId, userId });
  if (existed) {
    const error = new Error("Bạn đã đánh giá sản phẩm này rồi");
    error.statusCode = 409;
    throw error;
  }

  try {
    return await Review.create({
      productId,
      userId,
      orderId: purchasedOrder._id,
      rating,
      comment,
    });
  } catch (error) {
    // Bắt cả trường hợp hai yêu cầu đánh giá đến gần như đồng thời.
    if (error.code === 11000) {
      const duplicateError = new Error("Bạn đã đánh giá sản phẩm này rồi");
      duplicateError.statusCode = 409;
      throw duplicateError;
    }
    throw error;
  }
};

const getProductReviews = async (productId) => {
  if (!mongoose.isValidObjectId(productId)) {
    const error = new Error("Mã sản phẩm không hợp lệ");
    error.statusCode = 400;
    throw error;
  }

  const product = await Product.findById(productId).select("_id");
  if (!product) {
    const error = new Error("Không tìm thấy sản phẩm");
    error.statusCode = 404;
    throw error;
  }

  const reviews = await Review.find({ productId })
    .populate("userId", "name")
    .sort({ createdAt: -1 });

  const summary = await Review.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: "$productId",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  return {
    reviews,
    summary: summary[0]
      ? {
          averageRating: Number(summary[0].averageRating.toFixed(1)),
          totalReviews: summary[0].totalReviews,
        }
      : { averageRating: 0, totalReviews: 0 },
  };
};

module.exports = { createReview, getProductReviews };
