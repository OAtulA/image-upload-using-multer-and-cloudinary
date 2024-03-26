# Upload

## Multer

We will upload using multer.  
Temproraily store on server then upload to cloudinary.  
So that if upload fails we can reattempt.

### deleting file

In technical terms its unlink.

### saving the file

We will use disk storage so that ram does not fills up.

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

```
