const Coupon = require("../models/Coupon");

const getAllCoupons = async (query = {}) => {
  const filter = {};
  if (query.isActive !== undefined) {
    filter.isActive =
      query.isActive === "true" || query.isActive === true;
  }
  if (query.search) {
    filter.$or = [
      { code: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } },
    ];
  }
  return await Coupon.find(filter).sort({ createdAt: -1 });
};

const getCouponById = async (id) => {
  const coupon = await Coupon.findById(id);
  if (!coupon) {
    const error = new Error("Không tìm thấy mã giảm giá");
    error.statusCode = 404;
    throw error;
  }
  return coupon;
};

const createCoupon = async (data) => {
  const code = (data.code || "").trim().toUpperCase();
  if (!code) {
    const error = new Error("Vui lòng nhập mã giảm giá");
    error.statusCode = 400;
    throw error;
  }
  if (!data.value || data.value <= 0) {
    const error = new Error("Giá trị giảm phải lớn hơn 0");
    error.statusCode = 400;
    throw error;
  }
  if (data.type === "percent" && data.value > 100) {
    const error = new Error("Phần trăm giảm không được vượt 100");
    error.statusCode = 400;
    throw error;
  }
  if (!data.expiry) {
    const error = new Error("Vui lòng chọn ngày hết hạn");
    error.statusCode = 400;
    throw error;
  }

  const exists = await Coupon.findOne({ code });
  if (exists) {
    const error = new Error("Mã giảm giá đã tồn tại");
    error.statusCode = 400;
    throw error;
  }

  return await Coupon.create({
    code,
    description: data.description || "",
    type: data.type || "percent",
    value: data.value,
    minOrder: data.minOrder ?? 0,
    usageLimit: data.usageLimit ?? 100,
    used: 0,
    expiry: data.expiry,
    isActive: data.isActive !== false,
  });
};

const updateCoupon = async (id, data) => {
  const coupon = await Coupon.findById(id);
  if (!coupon) {
    const error = new Error("Không tìm thấy mã giảm giá");
    error.statusCode = 404;
    throw error;
  }

  if (data.code !== undefined) {
    const code = String(data.code).trim().toUpperCase();
    if (code !== coupon.code) {
      const exists = await Coupon.findOne({ code });
      if (exists) {
        const error = new Error("Mã giảm giá đã tồn tại");
        error.statusCode = 400;
        throw error;
      }
      coupon.code = code;
    }
  }
  if (data.description !== undefined) coupon.description = data.description;
  if (data.type !== undefined) coupon.type = data.type;
  if (data.value !== undefined) coupon.value = data.value;
  if (data.minOrder !== undefined) coupon.minOrder = data.minOrder;
  if (data.usageLimit !== undefined) coupon.usageLimit = data.usageLimit;
  if (data.expiry !== undefined) coupon.expiry = data.expiry;
  if (data.isActive !== undefined) coupon.isActive = data.isActive;

  if (coupon.type === "percent" && coupon.value > 100) {
    const error = new Error("Phần trăm giảm không được vượt 100");
    error.statusCode = 400;
    throw error;
  }

  await coupon.save();
  return coupon;
};

const deleteCoupon = async (id) => {
  const coupon = await Coupon.findById(id);
  if (!coupon) {
    const error = new Error("Không tìm thấy mã giảm giá");
    error.statusCode = 404;
    throw error;
  }
  // Soft delete
  coupon.isActive = false;
  await coupon.save();
  return coupon;
};

const getActiveCoupons = async () => {
  const now = new Date();
  return await Coupon.find({
    isActive: true,
    expiry: { $gte: now },
  }).sort({ createdAt: -1 });
};

/** Khách / Checkout: kiểm tra mã + tính số tiền giảm */
const validateCoupon = async (code, orderSubtotal = 0) => {
  const normalized = (code || "").trim().toUpperCase();
  if (!normalized) {
    const error = new Error("Vui lòng nhập mã giảm giá");
    error.statusCode = 400;
    throw error;
  }

  const coupon = await Coupon.findOne({ code: normalized });
  if (!coupon || !coupon.isActive) {
    const error = new Error("Mã giảm giá không hợp lệ");
    error.statusCode = 400;
    throw error;
  }

  if (new Date(coupon.expiry) < new Date()) {
    const error = new Error("Mã giảm giá đã hết hạn");
    error.statusCode = 400;
    throw error;
  }

  if (coupon.used >= coupon.usageLimit) {
    const error = new Error("Mã giảm giá đã hết lượt sử dụng");
    error.statusCode = 400;
    throw error;
  }

  if (orderSubtotal < (coupon.minOrder || 0)) {
    const error = new Error(
      `Đơn tối thiểu ${Number(coupon.minOrder).toLocaleString("vi-VN")}₫ để dùng mã này`
    );
    error.statusCode = 400;
    throw error;
  }

  let discount = 0;
  if (coupon.type === "percent") {
    discount = Math.floor((orderSubtotal * coupon.value) / 100);
  } else {
    discount = coupon.value;
  }
  if (discount > orderSubtotal) discount = orderSubtotal;

  return {
    coupon,
    discount,
    code: coupon.code,
  };
};

module.exports = {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getActiveCoupons,
};