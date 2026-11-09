const Feedback = require("../models/Feedback");

const sendError = (res, error) => res.status(error.statusCode || 500).json({
  success: false,
  message: error.message || "Lỗi server",
});

const validMessage = (value) => {
  const content = String(value || "").trim();
  if (content.length < 5) {
    const error = new Error("Nội dung cần có ít nhất 5 ký tự");
    error.statusCode = 400;
    throw error;
  }
  if (content.length > 3000) {
    const error = new Error("Nội dung tối đa 3000 ký tự");
    error.statusCode = 400;
    throw error;
  }
  return content;
};

const listMine = async (req, res) => {
  try {
    const data = await Feedback.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json({ success: true, data });
  } catch (error) { sendError(res, error); }
};

const listAll = async (_req, res) => {
  try {
    const data = await Feedback.find().populate("userId", "name email").sort({ updatedAt: -1 });
    res.json({ success: true, data });
  } catch (error) { sendError(res, error); }
};

const create = async (req, res) => {
  try {
    const subject = String(req.body.subject || "").trim();
    if (subject.length < 3 || subject.length > 120) {
      const error = new Error("Tiêu đề cần từ 3 đến 120 ký tự");
      error.statusCode = 400;
      throw error;
    }
    const category = ["question", "order", "product", "other"].includes(req.body.category) ? req.body.category : "other";
    const feedback = await Feedback.create({
      userId: req.user._id,
      subject,
      category,
      messages: [{ senderId: req.user._id, senderRole: "customer", content: validMessage(req.body.content) }],
    });
    res.status(201).json({ success: true, data: feedback });
  } catch (error) { sendError(res, error); }
};

const reply = async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, userId: req.user._id };
    const feedback = await Feedback.findOne(filter);
    if (!feedback) return res.status(404).json({ success: false, message: "Không tìm thấy góp ý" });
    if (feedback.status === "closed") return res.status(400).json({ success: false, message: "Cuộc trao đổi đã đóng" });
    const content = validMessage(req.body.content);
    feedback.messages.push({ senderId: req.user._id, senderRole: req.user.role, content });
    feedback.status = req.user.role === "admin" ? "answered" : "open";
    await feedback.save();
    if (req.user.role === "admin") await feedback.populate("userId", "name email");
    res.json({ success: true, data: feedback });
  } catch (error) { sendError(res, error); }
};

const close = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(req.params.id, { status: "closed" }, { new: true });
    if (!feedback) return res.status(404).json({ success: false, message: "Không tìm thấy góp ý" });
    res.json({ success: true, data: feedback });
  } catch (error) { sendError(res, error); }
};

module.exports = { listMine, listAll, create, reply, close };
