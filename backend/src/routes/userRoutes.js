const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, admin } = require("../middlewares/authMiddleware");

router.get("/", protect, admin, userController.getAll);
router.post("/", protect, admin, userController.create);
router.put("/:id", protect, admin, userController.update);

module.exports = router;