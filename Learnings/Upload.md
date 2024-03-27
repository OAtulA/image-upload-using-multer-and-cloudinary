# Upload

## Multer

We will upload using multer.  
Temproraily store on server then upload to cloudinary.  
So that if upload fails we can reattempt.

### deleting file

In technical terms its unlink.

### saving the file

We will use disk storage so that ram does not fills up.

We need to once upload all the files.  
Then we can apply a middleware to add any filter condition  
whether we want to restrict the file size of each image  
or say upload only one pdf in gallery.

### Setting our own patterns to have good file names

```JS
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
```

### changing the names of the user sent images

```JS
    const replaceSpecialChars = () => {
      file.originalname = file.originalname.replace(/[\W]+/g, "_");
    };
    replaceSpecialChars();
```

### Awesome feature

If I want I can upload just one image field.  
It will not give errors.

### EdgeCase

Now this is doing some beautiful job.
My code took this file as input `simps(&@$(+on-1-3*^(#(rd-output.png`  
Converted its name to `simps_on_1_3_rd_output_png-&pfp-&1711478831291.undefined`

With slight modification it is fine now.

```JS
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
```

## Removing temp files

I created a functiont to remove the temp files.  
Be it on error or be it on say not fulfuilling our criteria.  

```JS
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
      for (image in galleryImages) {
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
```
