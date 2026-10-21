const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brandController");
const { protect, admin } = require("../middlewares/authMiddleware");

// Public
router.get("/", brandController.getAll);
router.get("/:id", brandController.getById);

// Admin only
router.post("/", protect, admin, brandController.create);
router.put("/:id", protect, admin, brandController.update);
router.delete("/:id", protect, admin, brandController.remove);

module.exports = router;