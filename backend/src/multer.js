const multer = require("multer");
const uploadOnCloudinary = require("./cloudinary").uploadOnCloudinary;
const fs = require("fs");
let asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => {
      console.log("error is ", err);
      next(err);
    });
  };
};

let fileTypeFilterMiddleware = function (req, file, cb) {
  // There is no req.files at this stage.
  if (
    file.mimetype === "application/pdf" ||
    file.mimetype.startsWith("image/")
  ) {
    cb(null, true);
  } else {
    cb(
      new Error("Only 1 PDF or 5 images maxsize 5mb files are allowed"),
      false
    );
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      // console.log('\n', 'Multer diskstorage reached ')
      // console.log('\n file is', file, '\n req.files is ', req.files, '\n');
      // console.log()
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

const upload = multer({
  storage: storage,
  limits: {
    fileSize:
      process.env.MAX_FILE_SIZE <= 10_300_000
        ? process.env.MAX_FILE_SIZE
        : 10_300_000,
  }, //10MB approx
  fileFilter: fileTypeFilterMiddleware,
});

const imageFields = [
  { name: "profileImage", maxCount: 1 },
  { name: "galleryImages", maxCount: 5 },
];

// function to upload to cloudinary.
// Lets first check it.

let UploaderToCloudinary = asyncHandler(async (req, res, next) => {
  try {
    // checks if pfp is present in the req.files
    let pfp = req.files.profileImage;
    if (pfp) {
      // Lets just print its path
      console.log("image:", pfp[0].originalname, "img.path", pfp[0].path);
      let uploadResponseCloudinary = await uploadOnCloudinary(pfp[0].path);
      pfp[0].imgURL = uploadResponseCloudinary.url;
    }
    // checks if gly is present in the req.files
    console.log("gallery images");
    let glryImages = req.files.galleryImages;
    if (glryImages) {
      // Comment left deliberately to remember later
      //

      // Lets just print its path
      // glryImages.forEach(async (image, i) => {
      //   console.log("image", image.originalname, "image.path", i, image.path);
      //   // This is the function to upload the images to cloudinary
      //   // It also returns the response. So you could add response.url to the database
      //   let uploadResponseCloudinary = await uploadOnCloudinary(image.path);
      //   glryImages[i].imgURL = uploadResponseCloudinary.url;
      // });
      for (let i = 0; i < glryImages.length; i++) {
        console.log(
          "image",
          glryImages[i].originalname,
          "image.path",
          i,
          glryImages[i].path
        );
        let uploadResponseCloudinary = await uploadOnCloudinary(
          glryImages[i].path
        );
        glryImages[i].imgURL = uploadResponseCloudinary.url;
      }
    }
    next();
  } catch (err) {
    console.log("error in UploaderToCloudinary", err);
    next(err);
  }
});

let fileUploadHandler = async (req, res, next) => {
  try {
    upload.fields(imageFields)(req, res, next);
  } catch (error) {}
};

let removeTempFiles = (req, res, next) => {
  try {
    let profileImage = req.files.profileImage;
    let galleryImages = req.files.galleryImages;
    if (profileImage) {
      try {
        fs.unlinkSync(profileImage[0].path);
      } catch (error) {
        console.log("error in removing profile image", error.message);
      }
    }
    if (galleryImages) {
      for (image of galleryImages) {
        try {
          fs.unlinkSync(image.path);
        } catch (error) {
          console.log("error in removing gallery image", error.message);
        }
      }
    }
    console.log("\n", "temp files removed :)", "\n");
  } catch (error) {
    console.log("\nerror in removeTempFiles\n", error);
  }
};

// So this is a file filter to check if only 1 pdf or multiple images are allowed
let logicalFileFilter = async (req, res, next) => {
  try {
    // only 1 profile image
    if (req.files.profileImage) {
      if (req.files.profileImage.length > 1) {
        return new Error("400|Only one profile image is allowed");
      }
    }
    // we don't allow more than 5 images in gallery
    if (req.files.galleryImages) {
      if (req.files.galleryImages.length > 5) {
        // make an error with the message
        return new Error("400|Only 5 images are allowed");
      }
      // checks if only 1 pdf or multiple images are allowed
      if (req.files.galleryImages.length > 1) {
        for (let i = 0; i < req.files.galleryImages.length; i++) {
          if (req.files.galleryImages[i].mimetype !== "image/jpeg") {
            return new Error("400|Only 1 pdf or 5 images allowed");
          }
        }
      }
    }
    next();
  } catch (err) {
    removeTempFiles(req, res, next);
    let errorMesage = err.message.split("|");
    res.status(errorMesage[0]).json({ error: errorMesage[1] });
  }
};

let multerErrorHandler = (err, req, res, next) => {
  // to clean the files from the disk
  console.log("\n error in multerErrorHandler \n", err.message);
  removeTempFiles(req, res, next);
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
};
module.exports = {
  fileUploadHandler,
  UploaderToCloudinary,
  multerErrorHandler,
  logicalFileFilter,
};
