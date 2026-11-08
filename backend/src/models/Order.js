const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderCode: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
    },
    receiverName: {
      type: String,
      required: [true, "Vui lòng nhập tên người nhận"],
    },
    phone: {
      type: String,
      required: [true, "Vui lòng nhập số điện thoại"],
    },
    shippingAddress: {
      type: String,
      required: [true, "Vui lòng nhập địa chỉ giao hàng"],
    },
    shippingWard: {
      type: String,
      default: "",
    },
    shippingCity: {
      type: String,
      required: [true, "Vui lòng nhập tỉnh/thành phố"],
    },
    note: {
      type: String,
      default: "",
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "transfer", "card"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "pending", "paid", "failed", "refunded"],
      default: "unpaid",
      index: true,
    },
    paymentTransactionId: { type: String, default: "" },
    subtotal: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      default: "",
      uppercase: true,
      trim: true,
    },
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipping", "completed", "cancelled"],
      default: "pending",
    },
    cancellationStatus: {
      type: String,
      enum: ["none", "requested", "completed"],
      default: "none",
    },
    cancellationReason: {
      type: String,
      enum: ["ordered_by_mistake", "changed_mind", "found_better_price", "delivery_too_slow", "wrong_address", "change_items", "other", ""],
      default: "",
    },
    cancellationReasonDetail: { type: String, default: "", maxlength: 500 },
    cancellationRequestedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null, index: true },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ status: 1, createdAt: 1 });

module.exports = mongoose.model("Order", orderSchema);
