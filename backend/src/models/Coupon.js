const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Vui lòng nhập mã giảm giá"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    type: {
      type: String,
      enum: ["percent", "fixed"],
      required: true,
      default: "percent",
    },
    value: {
      type: Number,
      required: [true, "Vui lòng nhập giá trị giảm"],
      min: [0, "Giá trị không được âm"],
    },
    minOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
    usageLimit: {
      type: Number,
      default: 100,
      min: 0,
    },
    used: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiry: {
      type: Date,
      required: [true, "Vui lòng chọn ngày hết hạn"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);