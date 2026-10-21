const productService = require("../services/productService");

const getAll = async (req, res) => {
  try {
    const products = await productService.getAllProducts(req.query);
    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
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
    const product = await productService.getProductById(req.params.id);
    res.status(200).json({
      success: true,
      data: product,
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
    const { name, price, categoryId, stock } = req.body;

    if (!name || price === undefined || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập tên, giá và danh mục sản phẩm",
      });
    }

    const product = await productService.createProduct(req.body);

    res.status(201).json({
      success: true,
      message: "Tạo sản phẩm thành công",
      data: product,
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
    const product = await productService.updateProduct(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Cập nhật sản phẩm thành công",
      data: product,
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
    await productService.deleteProduct(req.params.id);

    res.status(200).json({
      success: true,
      message: "Vô hiệu hóa sản phẩm thành công",
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