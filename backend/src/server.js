// server.js (or index.js)
const dotenv = require("dotenv");
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());
// Helps parse form
app.use(express.urlencoded({ extended: true }));

dotenv.config({ path: "../.env" });

const uploadOnCloudinary = require("./cloudinary").uploadOnCloudinary;

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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      // creating the folder uploads/temp
      // if the folder does not exist it will create it
      const tempUploadFolderName = "./uploads/temp";
      if (!fs.existsSync(tempUploadFolderName)) {
        fs.mkdirSync(tempUploadFolderName, { recursive: true });
      }
      cb(null, "./uploads/temp");
      // Now for this to work I need to create a folder called uploads/temp manually
      // if its just one level multer does it for us
      // for recursive structure we need to create it manually or via scripting
    } catch (error) {
      console.log("error in destination", error);
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    // to ensure the correct filename while preserving the file extension
    let lastDot = file.originalname.lastIndexOf(".");
    let fileName = file.originalname.substring(0, lastDot);
    let fileExtension = file.originalname.substring(lastDot + 1);
    // a function to replace the regex of all the symbols with the _ in the filename
    const replaceSpecialChars = () => {
      fileName = fileName.replace(/[\W]+/g, "_");
    };
    replaceSpecialChars();
    file.originalname = fileName + "." + fileExtension;

    let usrImgType;
    // I have done this to uniquely identify
    // As per the utility logic which img is this.
    if (file.fieldname === "profileImage") {
      usrImgType = "pfp";
    } else {
      usrImgType = "gly";
    }
    // Also this -& is used here bcs its a lesser used character in names
    // Because if a user uses - in name it will be tough to see which one is which
    let newFileName = `${fileName}-&${usrImgType}-&${Date.now()}.${fileExtension}`;
    cb(null, `${newFileName}`);
  },
});

const upload = multer({ storage: storage });

const imageFields = [
  { name: "profileImage", maxCount: 1 },
  { name: "galleryImages", maxCount: 5 },
];

// function to upload to cloudinary.
// Lets first check it.

let UploaderToCloudinary = async (req, res, next) => {
  try {
    // checks if pfp is present in the req.files
    let pfp = req.files.profileImage;
    if (pfp) {
      // Lets just print its path
      console.log("image:", pfp[0].originalname, "img.path", pfp[0].path);
      uploadOnCloudinary(pfp[0].path);
    }
    // checks if gly is present in the req.files
    console.log("gallery images");
    let glryImages = req.files.galleryImages;
    if (glryImages) {
      // Lets just print its path
      glryImages.forEach((image, i) => {
        console.log("image", image.originalname, "image.path", i, image.path);
        uploadOnCloudinary(image.path);
      });
    }
  } catch (err) {
    console.log("error in UploaderToCloudinary", err);
  }
};

app.post(
  "/upload",
  upload.fields(imageFields),
  UploaderToCloudinary,
  (req, res) => {
    // if (err) {
    //   console.log("error in the post route", err);
    //   return res.status(500).json({ error: "Failed to upload image" });
    // }
    // console.log("req.file is", req.files);
    console.log("body is", req.body);
    // I want to redirect the user back to the previous page on client side
    // So it was on live server you may want to use vite then change the port
    return res.redirect("http://127.0.0.1:5500/client/index.html");
  }
);

// Error handling middleware for multer
app.use("/upload", function (err, req, res, next) {
  if (err instanceof multer.MulterError) {
    // Multer error handling
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      console.log("Error:", err); // Log the error for debugging
      return res
        .status(400)
        .json({ error: "Unexpected field", errorCode: err.code });
    }
    return res.status(500).json({ error: "Multer error", errorCode: err.code });
  } else if (err) {
    // Other errors
    console.error("Error:", err); // Log the error for debugging
    return res.status(500).json({ error: "Failed to upload image" });
  }
  next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port http://localhost:${PORT}`)
);

app.get("/", (req, res) => {
  res.send("Hello img server!");
});
