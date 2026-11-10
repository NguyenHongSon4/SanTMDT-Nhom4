const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const controller = require("../controllers/chatController");

const router = express.Router();
router.post("/ask", controller.ask);
router.get("/orders/:orderCode", protect, controller.getOrderStatus);

module.exports = router;
