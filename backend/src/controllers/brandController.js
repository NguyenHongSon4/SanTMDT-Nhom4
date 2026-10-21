const brandService = require("../services/brandService");

const getAll = async (req, res) => {
  try {
    const brands = await brandService.getAllBrands(req.query);
    res.status(200).json({
      success: true,
      count: brands.length,
      data: brands,
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
    const brand = await brandService.getBrandById(req.params.id);
    res.status(200).json({
      success: true,
      data: brand,
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
    const { name, description, logo } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập tên thương hiệu",
      });
    }

    const brand = await brandService.createBrand({ name, description, logo });

    res.status(201).json({
      success: true,
      message: "Tạo thương hiệu thành công",
      data: brand,
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
    const brand = await brandService.updateBrand(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Cập nhật thương hiệu thành công",
      data: brand,
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
    await brandService.deleteBrand(req.params.id);

    res.status(200).json({
      success: true,
      message: "Vô hiệu hóa thương hiệu thành công",
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