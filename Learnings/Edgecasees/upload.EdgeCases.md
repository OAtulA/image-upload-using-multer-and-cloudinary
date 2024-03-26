# upload Edge cases

## More than max limit files uploaded

So I thought lets handle this on backend.  
Although a validation can be added on the frontend.  
But I do not want my server to stop just because of a validation.

So I added it here in the code and everything works despite
more than max limit files uploaded. My server will send a polite message.  
This saves us in the production

SO the code now is like

```JS

app.post("/upload", upload.fields(imageFields), ( req, res) => {
  // if (err) {
  //   console.log("error in the post route", err);
  //   return res.status(500).json({ error: "Failed to upload image" });
  // }
  console.log("req.file is", req.files);
  console.log("body is", req.body);
  // I want to redirect the user back to the previous page on client side
  return res.redirect("http://127.0.0.1:5500/client/index.html");
});

// Error handling middleware for multer
app.use('/upload',function (err, req, res, next) {
  if (err instanceof multer.MulterError) {
    // Multer error handling
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      console.log("Error:", err); // Log the error for debugging
      return res.status(400).json({ error: "Unexpected field", errorCode: err.code });
    }
    return res.status(500).json({ error: "Multer error", errorCode: err.code });
  } else if (err) {
    // Other errors
    console.error("Error:", err); // Log the error for debugging
    return res.status(500).json({ error: "Failed to upload image" });
  }
  next();
});
```
