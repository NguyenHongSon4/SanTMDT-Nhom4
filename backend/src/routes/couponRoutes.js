const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
const { protect, admin } = require("../middlewares/authMiddleware");

router.post("/validate", protect, couponController.validate);
router.get("/active", protect, couponController.getActive); // dòng ~8

router.get("/", protect, admin, couponController.getAll);
router.get("/:id", protect, admin, couponController.getById);
router.post("/", protect, admin, couponController.create);
router.put("/:id", protect, admin, couponController.update);
router.delete("/:id", protect, admin, couponController.remove);

module.exports = router;