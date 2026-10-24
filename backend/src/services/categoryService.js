const Category = require("../models/Category");
const Product = require("../models/Product");

// Lấy tất cả danh mục
const getAllCategories = async (query = {}) => {
  const filter = {};

  // Chỉ lấy danh mục đang hoạt động nếu không phải admin xem tất cả
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === "true" || query.isActive === true;
  }

  // Tìm kiếm theo tên
  if (query.search) {
    filter.name = { $regex: query.search, $options: "i" };
  }

  const categories = await Category.find(filter).sort({ createdAt: -1 });
  return categories;
};

// Lấy 1 danh mục theo ID
const getCategoryById = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    const error = new Error("Không tìm thấy danh mục");
    error.statusCode = 404;
    throw error;
  }
  return category;
};

// Tạo danh mục mới
const createCategory = async ({ name, description }) => {
  const existing = await Category.findOne({ name });
  if (existing) {
    const error = new Error("Tên danh mục đã tồn tại");
    error.statusCode = 400;
    throw error;
  }

  const category = await Category.create({
    name,
    description: description || "",
  });

  return category;
};

// Cập nhật danh mục
const updateCategory = async (id, { name, description, isActive }) => {
  const category = await Category.findById(id);
  if (!category) {
    const error = new Error("Không tìm thấy danh mục");
    error.statusCode = 404;
    throw error;
  }

  // Kiểm tra trùng tên (nếu đổi tên)
  if (name && name !== category.name) {
    const existing = await Category.findOne({ name });
    if (existing) {
      const error = new Error("Tên danh mục đã tồn tại");
      error.statusCode = 400;
      throw error;
    }
    category.name = name;
  }

  if (description !== undefined) category.description = description;
  if (isActive !== undefined) category.isActive = isActive;

  await category.save();
  return category;
};

// Xóa danh mục: có SP thì chặn; không có SP thì xóa hẳn
const deleteCategory = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    const error = new Error("Không tìm thấy danh mục");
    error.statusCode = 404;
    throw error;
  }

  // Đếm sản phẩm đang gắn category này
  const productCount = await Product.countDocuments({
  categoryId: id,
  isActive: true,
  });

  if (productCount > 0) {
    const error = new Error(
      `Không thể xóa: còn ${productCount} sản phẩm thuộc danh mục này. Hãy chuyển hoặc xóa sản phẩm trước.`
    );
    error.statusCode = 400;
    throw error;
  }

  // Không còn SP → xóa hẳn khỏi DB
  await Category.findByIdAndDelete(id);
  return { deleted: true, id };
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};