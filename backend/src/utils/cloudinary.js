import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

let uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null;
        // upload file on cloudinary
        let response= await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        // file uploaded successfully
        console.log("File uploaded successfully", response.url);
        return response;
    } catch (error){
        fs.unlinkSync(localFilePath); //removed the locally saved file as the uplasd fialed
        return null;
    }
};
