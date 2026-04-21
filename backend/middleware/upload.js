const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const uploadPath = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'issue-' + unique + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  /jpeg|jpg|png|gif|webp/.test(path.extname(file.originalname).toLowerCase())
    ? cb(null, true)
    : cb(new Error('Images only!'), false);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});