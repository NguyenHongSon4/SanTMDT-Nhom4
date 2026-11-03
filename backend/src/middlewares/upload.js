const multer = require("multer");
const path = require("path");
const fs = require("fs");

const dir = path.join(__dirname, "../../uploads/reviews");
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, dir),
  filename: (_req, file, cb) => {
    const unique =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `review-${unique}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const ok = /jpeg|jpg|png|webp/.test(
    path.extname(file.originalname).toLowerCase()
  ) && /image\/(jpeg|jpg|png|webp)/.test(file.mimetype);
  if (ok) cb(null, true);
  else cb(new Error("Chỉ chấp nhận ảnh JPG, PNG, WEBP"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024, files: 3 }, // 3MB, tối đa 3 ảnh
});

module.exports = upload;