// import {v2 as cloudinary} from "cloudinary"
let cloudinary = require("cloudinary").v2;
// import fs from "fs"
let fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfull
    console.log("file is uploaded on cloudinary ", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.log("some error while uploading", error.message);
    try {
      fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    } catch (error) {
      console.log("error in unlinking", error.message);
    }
    return null;
  }
};

module.exports = {
  uploadOnCloudinary,
};
