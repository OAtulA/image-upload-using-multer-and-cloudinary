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

const {fileUploadHandler, UploaderToCloudinary, multerErrorHandler} = require("./multer");
app.post(
  "/upload",
  fileUploadHandler,
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
app.use("/upload", multerErrorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port http://localhost:${PORT}`)
);

app.get("/", (req, res) => {
  res.send("Hello img server!");
});
