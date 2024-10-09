import multer from "multer";
import fs from "fs";

if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/image");
  },
  filename: function (req, file, cb) {
    const imageNameModify = Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, `${file.fieldname}-${imageNameModify}.${file.mimetype.split("/")[1]}`);
  },
});

export const imageUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      return cb(new Error("Please upload a Image"));
    }
    cb(undefined, true);
  },
});
