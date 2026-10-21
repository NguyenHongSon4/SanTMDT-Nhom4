const Brand = require("../models/Brand");

const getAllBrands = async (query = {}) => {
  const filter = {};

  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === "true" || query.isActive === true;
  }

  if (query.search) {
    filter.name = { $regex: query.search, $options: "i" };
  }

  const brands = await Brand.find(filter).sort({ createdAt: -1 });
  return brands;
};

const getBrandById = async (id) => {
  const brand = await Brand.findById(id);
  if (!brand) {
    const error = new Error("Không tìm thấy thương hiệu");
    error.statusCode = 404;
    throw error;
  }
  return brand;
};

const createBrand = async ({ name, description, logo }) => {
  const existing = await Brand.findOne({ name });
  if (existing) {
    const error = new Error("Tên thương hiệu đã tồn tại");
    error.statusCode = 400;
    throw error;
  }

  const brand = await Brand.create({
    name,
    description: description || "",
    logo: logo || "",
  });

  return brand;
};

const updateBrand = async (id, { name, description, logo, isActive }) => {
  const brand = await Brand.findById(id);
  if (!brand) {
    const error = new Error("Không tìm thấy thương hiệu");
    error.statusCode = 404;
    throw error;
  }

  if (name && name !== brand.name) {
    const existing = await Brand.findOne({ name });
    if (existing) {
      const error = new Error("Tên thương hiệu đã tồn tại");
      error.statusCode = 400;
      throw error;
    }
    brand.name = name;
  }

  if (description !== undefined) brand.description = description;
  if (logo !== undefined) brand.logo = logo;
  if (isActive !== undefined) brand.isActive = isActive;

  await brand.save();
  return brand;
};

const deleteBrand = async (id) => {
  const brand = await Brand.findById(id);
  if (!brand) {
    const error = new Error("Không tìm thấy thương hiệu");
    error.statusCode = 404;
    throw error;
  }

  brand.isActive = false;
  await brand.save();
  return brand;
};

module.exports = {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
};