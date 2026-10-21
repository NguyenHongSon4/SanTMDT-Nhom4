const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Lấy giỏ hàng của user (tạo mới nếu chưa có)
const getCart = async (userId) => {
  let cart = await Cart.findOne({ userId }).populate({
    path: "items.productId",
    select: "name price originalPrice images stock isActive",
    populate: [
      { path: "categoryId", select: "name" },
      { path: "brandId", select: "name" },
    ],
  });

  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
    cart = await Cart.findById(cart._id).populate({
      path: "items.productId",
      select: "name price originalPrice images stock isActive",
      populate: [
        { path: "categoryId", select: "name" },
        { path: "brandId", select: "name" },
      ],
    });
  }

  return cart;
};

// Thêm sản phẩm vào giỏ
const addToCart = async (userId, productId, quantity = 1) => {
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    const error = new Error("Sản phẩm không tồn tại hoặc đã ngừng bán");
    error.statusCode = 404;
    throw error;
  }

  if (product.stock < quantity) {
    const error = new Error("Số lượng vượt quá tồn kho");
    error.statusCode = 400;
    throw error;
  }

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }

  const existingItem = cart.items.find(
    (item) => item.productId.toString() === productId
  );

  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    if (newQty > product.stock) {
      const error = new Error("Số lượng vượt quá tồn kho");
      error.statusCode = 400;
      throw error;
    }
    existingItem.quantity = newQty;
  } else {
    cart.items.push({ productId, quantity });
  }

  await cart.save();
  return await getCart(userId);
};

// Cập nhật số lượng sản phẩm trong giỏ
const updateCartItem = async (userId, productId, quantity) => {
  if (quantity < 1) {
    const error = new Error("Số lượng tối thiểu là 1");
    error.statusCode = 400;
    throw error;
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    const error = new Error("Sản phẩm không tồn tại hoặc đã ngừng bán");
    error.statusCode = 404;
    throw error;
  }

  if (quantity > product.stock) {
    const error = new Error("Số lượng vượt quá tồn kho");
    error.statusCode = 400;
    throw error;
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    const error = new Error("Giỏ hàng trống");
    error.statusCode = 404;
    throw error;
  }

  const item = cart.items.find(
    (item) => item.productId.toString() === productId
  );
  if (!item) {
    const error = new Error("Sản phẩm không có trong giỏ hàng");
    error.statusCode = 404;
    throw error;
  }

  item.quantity = quantity;
  await cart.save();
  return await getCart(userId);
};

// Xóa sản phẩm khỏi giỏ
const removeFromCart = async (userId, productId) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    const error = new Error("Giỏ hàng trống");
    error.statusCode = 404;
    throw error;
  }

  cart.items = cart.items.filter(
    (item) => item.productId.toString() !== productId
  );
  await cart.save();
  return await getCart(userId);
};

// Xóa toàn bộ giỏ hàng
const clearCart = async (userId) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return { userId, items: [] };
  }
  cart.items = [];
  await cart.save();
  return cart;
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};