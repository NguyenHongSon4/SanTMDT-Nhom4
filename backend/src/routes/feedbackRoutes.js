const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middlewares/authMiddleware");
const controller = require("../controllers/feedbackController");

router.use(protect);
router.get("/mine", controller.listMine);
router.post("/", controller.create);
router.get("/", admin, controller.listAll);
router.post("/:id/messages", controller.reply);
router.patch("/:id/close", admin, controller.close);

module.exports = router;
