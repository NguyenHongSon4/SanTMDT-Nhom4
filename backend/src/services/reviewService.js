const Review = require("../models/Review");
const Order = require("../models/Order");
const Product = require("../models/Product");

const recalcProductRating = async (productId) => {
  const approved = await Review.find({
    productId,
    status: "approved",
    isActive: true,
  });
  const count = approved.length;
  const avg =
    count === 0
      ? 0
      : Math.round(
          (approved.reduce((s, r) => s + r.rating, 0) / count) * 10
        ) / 10;

  await Product.findByIdAndUpdate(productId, {
    rating: avg,
    reviewsCount: count,
  });
};

const createReview = async (userId, data, files = []) => {
  const { productId, rating, comment } = data;
  const r = Number(rating);

  if (!productId || !r || !comment) {
    const error = new Error("Thiếu productId, rating hoặc nội dung");
    error.statusCode = 400;
    throw error;
  }
  if (r < 1 || r > 5) {
    const error = new Error("Rating phải từ 1 đến 5");
    error.statusCode = 400;
    throw error;
  }
  if (String(comment).trim().length < 10) {
    const error = new Error("Nội dung tối thiểu 10 ký tự");
    error.statusCode = 400;
    throw error;
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    const error = new Error("Sản phẩm không tồn tại");
    error.statusCode = 404;
    throw error;
  }

  // Bắt buộc đã mua — đơn completed chứa SP
  const order = await Order.findOne({
    userId,
    status: "completed",
    "items.productId": productId,
  });
  if (!order) {
    const error = new Error(
      "Bạn chỉ có thể đánh giá sản phẩm đã mua và đơn đã hoàn tất"
    );
    error.statusCode = 403;
    throw error;
  }

  const existed = await Review.findOne({ userId, productId });
  if (existed) {
    const error = new Error("Bạn đã đánh giá sản phẩm này rồi");
    error.statusCode = 400;
    throw error;
  }

  const images = (files || []).map(
    (f) => `/uploads/reviews/${f.filename}`
  );

  const review = await Review.create({
    userId,
    productId,
    orderId: order._id,
    rating: r,
    comment: String(comment).trim(),
    images,
    status: "pending",
  });

  return await Review.findById(review._id)
    .populate("userId", "name email")
    .populate("productId", "name");
};

const getPublicByProduct = async (productId) => {
  return await Review.find({
    productId,
    status: "approved",
    isActive: true,
  })
    .populate("userId", "name")
    .sort({ createdAt: -1 });
};

const getAllForAdmin = async (query = {}) => {
  const filter = { isActive: true };
  if (query.status) filter.status = query.status;
  if (query.productId) filter.productId = query.productId;

  return await Review.find(filter)
    .populate("userId", "name email")
    .populate("productId", "name images")
    .sort({ createdAt: -1 });
};

const updateStatus = async (id, status) => {
  if (!["pending", "approved", "rejected"].includes(status)) {
    const error = new Error("Trạng thái không hợp lệ");
    error.statusCode = 400;
    throw error;
  }
  const review = await Review.findById(id);
  if (!review || !review.isActive) {
    const error = new Error("Không tìm thấy đánh giá");
    error.statusCode = 404;
    throw error;
  }
  review.status = status;
  await review.save();
  await recalcProductRating(review.productId);
  return review;
};

const deleteReview = async (id) => {
  const review = await Review.findById(id);
  if (!review) {
    const error = new Error("Không tìm thấy đánh giá");
    error.statusCode = 404;
    throw error;
  }
  review.isActive = false;
  await review.save();
  await recalcProductRating(review.productId);
  return review;
};

const replyToReview = async (reviewId, adminId, replyText) => {
  const text = (replyText || "").trim();
  if (!text) {
    const error = new Error("Vui lòng nhập nội dung trả lời");
    error.statusCode = 400;
    throw error;
  }
  if (text.length < 5) {
    const error = new Error("Nội dung trả lời tối thiểu 5 ký tự");
    error.statusCode = 400;
    throw error;
  }

  const review = await Review.findById(reviewId);
  if (!review || !review.isActive) {
    const error = new Error("Không tìm thấy đánh giá");
    error.statusCode = 404;
    throw error;
  }

  review.adminReply = text;
  review.adminReplyAt = new Date();
  review.repliedBy = adminId;
  await review.save();

  return await Review.findById(review._id)
    .populate("userId", "name email")
    .populate("productId", "name images");
};

module.exports = {
  createReview,
  getPublicByProduct,
  getAllForAdmin,
  updateStatus,
  deleteReview,
  replyToReview,
};