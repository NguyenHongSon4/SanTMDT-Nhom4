const multer = require("multer");
const path = require("path");
const fs = require("fs");

const dir = path.join(__dirname, "../../uploads/avatars");
fs.mkdirSync(dir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, dir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP"));
  },
  limits: { fileSize: 3 * 1024 * 1024, files: 1 },
}).single("avatar");

module.exports = (req, res, next) => {
  upload(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.code === "LIMIT_FILE_SIZE" ? "Ảnh không được vượt quá 3 MB" : error.message,
      });
    }
    next();
  });
};
