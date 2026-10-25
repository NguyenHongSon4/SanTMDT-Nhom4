const couponService = require("../services/couponService");

const getAll = async (req, res) => {
  try {
    const data = await couponService.getAllCoupons(req.query);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

const getById = async (req, res) => {
  try {
    const data = await couponService.getCouponById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

const create = async (req, res) => {
  try {
    const data = await couponService.createCoupon(req.body);
    res.status(201).json({
      success: true,
      message: "Tạo mã giảm giá thành công",
      data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

const update = async (req, res) => {
  try {
    const data = await couponService.updateCoupon(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Cập nhật mã giảm giá thành công",
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
    await couponService.deleteCoupon(req.params.id);
    res.status(200).json({
      success: true,
      message: "Đã vô hiệu hóa mã giảm giá",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

const validate = async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const result = await couponService.validateCoupon(
      code,
      Number(subtotal) || 0
    );
    res.status(200).json({
      success: true,
      data: {
        code: result.code,
        discount: result.discount,
        type: result.coupon.type,
        value: result.coupon.value,
      },
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

const getActive = async (req, res) => {
  try {
    const data = await couponService.getActiveCoupons();
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  validate,
  getActive,
};