const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { protect, admin } = require("../middlewares/authMiddleware");

// Public
router.get("/", productController.getAll);
router.get("/:id", productController.getById);

// Admin only
router.post("/", protect, admin, productController.create);
router.put("/:id", protect, admin, productController.update);
router.delete("/:id", protect, admin, productController.remove);

module.exports = router;