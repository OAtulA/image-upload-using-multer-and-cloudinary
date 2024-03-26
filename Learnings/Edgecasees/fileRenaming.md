# File Renaming

## Problem

This code was not checking for the file extension.  
So it changed the `simps(&@$(+on-1-3*^(#(rd-output.png` into

```JS
 filename: function (req, file, cb) {
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
```

Now this is doing some beautiful job.
My code took this file as input `simps(&@$(+on-1-3*^(#(rd-output.png`  
Converted its name to `simps_on_1_3_rd_output_png-&pfp-&1711478831291.undefined`

## Solution

With some minor tweak to the code it got solved.

From `simps(&@$(+on-1-3*^(#(rd-output` to `simps_on_1_3_rd_output-&pfp-&1711479348229.png`

Code:

```JS
filename: function (req, file, cb) {
    // to ensure the correct filename while preserving the file extension
    let lastDot = file.originalname.lastIndexOf(".");
    let fileName = file.originalname.substring(0, lastDot);
    let fileExtension = file.originalname.substring(lastDot + 1);
        // a function to replace the regex of all the symbols with the _ in the filename
    const replaceSpecialChars = () => {
      fileName= fileName.replace(/[\W]+/g, '_');
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
    let newFileName = `${fileName}-&${usrImgType}-&${Date.now()}.${fileExtension}`;
    cb(null, `${newFileName}`);
  },
```
