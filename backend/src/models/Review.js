const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Vui lòng chọn số sao đánh giá"],
      min: [1, "Đánh giá tối thiểu 1 sao"],
      max: [5, "Đánh giá tối đa 5 sao"],
      validate: {
        validator: Number.isInteger,
        message: "Số sao phải là số nguyên từ 1 đến 5",
      },
    },
    comment: {
      type: String,
      required: [true, "Vui lòng nhập nội dung bình luận"],
      trim: true,
      minlength: [2, "Bình luận phải có ít nhất 2 ký tự"],
      maxlength: [1000, "Bình luận không được vượt quá 1000 ký tự"],
    },
  },
  { timestamps: true }
);

// Mỗi khách hàng chỉ đánh giá một lần cho một sản phẩm.
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
