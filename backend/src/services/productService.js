const Product = require("../models/Product");

const getAllProducts = async (query = {}) => {
  const filter = {};

  // Chỉ lấy sản phẩm đang bán (mặc định)
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === "true" || query.isActive === true;
  } else {
    filter.isActive = true;
  }

  // Lọc theo danh mục
  if (query.categoryId) {
    filter.categoryId = query.categoryId;
  }

  // Lọc theo thương hiệu
  if (query.brandId) {
    filter.brandId = query.brandId;
  }

  // Tìm kiếm theo tên
  if (query.search) {
    filter.name = { $regex: query.search, $options: "i" };
  }

  // Lọc theo khoảng giá
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  // Sắp xếp
  let sort = { createdAt: -1 };
  if (query.sort === "price_asc") sort = { price: 1 };
  if (query.sort === "price_desc") sort = { price: -1 };
  if (query.sort === "name") sort = { name: 1 };

  const products = await Product.find(filter)
    .populate("categoryId", "name")
    .populate("brandId", "name")
    .sort(sort);

  return products;
};

const getProductById = async (id) => {
  const product = await Product.findById(id)
    .populate("categoryId", "name")
    .populate("brandId", "name");

  if (!product) {
    const error = new Error("Không tìm thấy sản phẩm");
    error.statusCode = 404;
    throw error;
  }
  return product;
};

const createProduct = async (data) => {
  const product = await Product.create(data);
  return await Product.findById(product._id)
    .populate("categoryId", "name")
    .populate("brandId", "name");
};

const updateProduct = async (id, data) => {
  const product = await Product.findById(id);
  if (!product) {
    const error = new Error("Không tìm thấy sản phẩm");
    error.statusCode = 404;
    throw error;
  }

  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined) {
      product[key] = data[key];
    }
  });

  await product.save();
  return await Product.findById(product._id)
    .populate("categoryId", "name")
    .populate("brandId", "name");
};

const deleteProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) {
    const error = new Error("Không tìm thấy sản phẩm");
    error.statusCode = 404;
    throw error;
  }

  product.isActive = false;
  await product.save();
  return product;
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};