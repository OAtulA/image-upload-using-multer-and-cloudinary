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
    // file.originalname = file.originalname.replace(" ", "_");
    // file.originalname = file.originalname.replace("/", "_");
    // file.originalname = file.originalname.replace("\\", "_");
    // file.originalname = file.originalname.replace("-", "_");
    // // These should be good enough for  now. May add more later
    
    // a function to replace the regex of all the symbols with the _ in the file.originalname
    const replaceSpecialChars = () => {
      file.originalname= file.originalname.replace(/[\W]+/g, '_'); 
    }
    replaceSpecialChars()

    let filenameSplit = file.originalname.split(".");
    let usrImgType;
    // I have done this to uniquely identify
    // As per the utility logic which img is this.
    if(file.fieldname === "profileImage"){
      usrImgType = "pfp";
    }else{
      usrImgType = "gly";
    }
    // Also this -& is used here bcs its a lesser used character in names
    // Because if a user uses - in name it will be tough to see which one is which
    let newFileName = `${filenameSplit[0]}-&${usrImgType}-&${Date.now()}.${filenameSplit[1]}`;
    cb(null, `${newFileName}`);
  },
});

const upload = multer({ storage: storage });

const imageFields = [
  { name: "profileImage", maxCount: 1 },
  { name: "galleryImages", maxCount: 5 },
];
app.post("/upload", upload.fields(imageFields), (req, res) => {
  console.log("req.file is", req.files);
  console.log("body is", req.body);
  // I want to redirect the user back to the previous page on client side
  return res.redirect("http://127.0.0.1:5500/client/index.html");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port http://localhost:${PORT}`)
);

app.get("/", (req, res) => {
  res.send("Hello img server!");
});
