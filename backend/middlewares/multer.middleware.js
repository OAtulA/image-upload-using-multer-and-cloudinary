import multer from "multer";

// here multer is allowing us to get the uploaded file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp/");
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // cb(null, file.fieldname + "-" + uniqueSuffix);
    cb(null, file.originalname + "-" + Math.floor(Date.now() / 1000));
  },
});

export const upload = multer({ storage: storage });
