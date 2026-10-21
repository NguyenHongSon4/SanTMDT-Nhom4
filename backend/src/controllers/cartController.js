const cartService = require("../services/cartService");

// GET /api/cart
const getCart = async (req, res) => {
  try {
    const cart = await cartService.getCart(req.user._id);
    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

// POST /api/cart  body: { productId, quantity }
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn sản phẩm",
      });
    }

    const cart = await cartService.addToCart(
      req.user._id,
      productId,
      quantity || 1
    );

    res.status(200).json({
      success: true,
      message: "Thêm vào giỏ hàng thành công",
      data: cart,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

// PUT /api/cart  body: { productId, quantity }
const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng gửi productId và quantity",
      });
    }

    const cart = await cartService.updateCartItem(
      req.user._id,
      productId,
      quantity
    );

    res.status(200).json({
      success: true,
      message: "Cập nhật giỏ hàng thành công",
      data: cart,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

// DELETE /api/cart/:productId
const removeFromCart = async (req, res) => {
  try {
    const cart = await cartService.removeFromCart(
      req.user._id,
      req.params.productId
    );

    res.status(200).json({
      success: true,
      message: "Xóa sản phẩm khỏi giỏ thành công",
      data: cart,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

// DELETE /api/cart  (xóa hết)
const clearCart = async (req, res) => {
  try {
    const cart = await cartService.clearCart(req.user._id);
    res.status(200).json({
      success: true,
      message: "Đã xóa toàn bộ giỏ hàng",
      data: cart,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};