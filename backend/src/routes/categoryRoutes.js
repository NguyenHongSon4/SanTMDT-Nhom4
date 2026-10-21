const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { protect, admin } = require("../middlewares/authMiddleware");

// Public
router.get("/", categoryController.getAll);
router.get("/:id", categoryController.getById);

// Admin only
router.post("/", protect, admin, categoryController.create);
router.put("/:id", protect, admin, categoryController.update);
router.delete("/:id", protect, admin, categoryController.remove);

module.exports = router;