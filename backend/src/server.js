// server.js (or index.js)
const dotenv = require("dotenv");
const express = require("express");
const multer = require("multer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
// Helps parse form
app.use(express.urlencoded({ extended: true }));

dotenv.config({ path: "../.env" });

const uploadOnCloudinary = require("./cloudinary").uploadOnCloudinary;

// Configure Multer to save files to the public/temp folder
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./public/temp");
//   },
//   filename: function (req, file, cb) {
//     let uploadFilename = file.originalname;
//     uploadFilename =
//       uploadFilename.split(".")[0] +
//       "-" +
//       Math.floor(Date.now() / 1000) +
//       "." +
//       file.originalname.split(".")[1];
//     console.log("uploadFilename is", uploadFilename);
//     cb(null, uploadFilename);
//   },
// });
// const upload = multer({ storage: storage });

// const upload = multer({ dest: "./uploads" });

let asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch(next);
  };
};

let uploadHandler = asyncHandler(async (req, res) => {
  try {
    console.log("code reached the uploadHandler");
    let file_path = req.file?.avatar[0]?.path;
    if (!file_path) {
      throw new ApiError(400, "No file found its required");
    }
    // Upload image to Cloudinary
    const avatar = await uploadOnCloudinary(file_path);
    console.log("avatar", avatar);

    // Send response with Cloudinary image URL
    res.json({ imageUrl: avatar.url });
  } catch (error) {
    console.error("Error in the uploadHandler", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});
// Endpoint for uploading image

// app.post(
//   "/upload2",
//   (req, res, next) => {
//     console.log("req.file is", req.file, req.files);
//     next();
//   },
//   upload.single("image"),
//   uploadHandler
// );

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      cb(null, "./uploads/temp");
    } catch (error) {
      console.log("error in destination", error);
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

app.post("/upload", upload.single("profileImage"), (req, res) => {
  console.log("req.file is", req.file);
  console.log("body is", req.body);
  // I want to redirect the user back to the previous page
  return res.redirect("http://127.0.0.1:5500/client/index.html");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port http://localhost:${PORT}`)
);

app.get("/", (req, res) => {
  res.send("Hello img server!");
});
