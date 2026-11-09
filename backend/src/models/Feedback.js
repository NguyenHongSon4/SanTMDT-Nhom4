const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  senderRole: { type: String, enum: ["customer", "admin"], required: true },
  content: { type: String, required: true, trim: true, maxlength: 3000 },
}, { timestamps: true });

const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  subject: { type: String, required: true, trim: true, maxlength: 120 },
  category: { type: String, enum: ["question", "order", "product", "other"], default: "other" },
  status: { type: String, enum: ["open", "answered", "closed"], default: "open", index: true },
  messages: { type: [messageSchema], default: [] },
}, { timestamps: true });

feedbackSchema.index({ updatedAt: -1 });
module.exports = mongoose.model("Feedback", feedbackSchema);
