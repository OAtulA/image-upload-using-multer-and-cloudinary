// server.js (or index.js)

const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const app = express();

// Configure Multer to save files to the public/temp folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/temp');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_NAME
});

let asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next))
    .catch(next);
  };
};

// Endpoint for uploading image
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);

    // Once uploaded, you may want to delete the temporary file
    fs.unlinkSync(req.file.path);

    // Send response with Cloudinary image URL
    res.json({ imageUrl: result.secure_url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
