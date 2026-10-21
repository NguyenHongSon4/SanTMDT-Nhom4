const categoryService = require("../services/categoryService");

const getAll = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories(req.query);
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

const getById = async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

const create = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập tên danh mục",
      });
    }

    const category = await categoryService.createCategory({ name, description });

    res.status(201).json({
      success: true,
      message: "Tạo danh mục thành công",
      data: category,
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
    const category = await categoryService.updateCategory(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Cập nhật danh mục thành công",
      data: category,
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
    await categoryService.deleteCategory(req.params.id);

    res.status(200).json({
      success: true,
      message: "Vô hiệu hóa danh mục thành công",
    });
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
};