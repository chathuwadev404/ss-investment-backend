const multer = require('multer');
const path = require("path");
const appConfig = require("../../config/app.config")

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, appConfig.UPLOAD_FILES.DIR_NAME);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
exports.upload = multer({storage: storage, fileFilter: fileFilter})
