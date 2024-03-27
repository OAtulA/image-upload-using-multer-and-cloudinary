# File Upload Project

## Learnings

[Learnings](Learnings)  
I have them captured here.

## How you can benefit from this project

It's quite simple.  
You just need to add the [multer.js](backend/src/multer.js) and [cloudinary.js](backend/src/cloudinary.js) files to your project.  
Also remember to add the env variables to your project.  
I have left the [.env.sample](backend/.env.sample) for your refrence

### A few minor changes to make it your own

- Change the `backend/src/multer.js` file  
   where it says `imageFields` and add the name you have written in the input tag like

  ```html
  <form
    id="image-form"
    enctype="multipart/form-data"
    action="http://localhost:5000/upload"
    method="POST"
  >
    <input
      type="file"
      accept="image/*"
      id="image-input"
      name="profileImage"
    /><br /><br />
    <!-- to upload at most 5 images with name galleryImage -->
    <input
      type="file"
      accept="image/*"
      id="gallery-input"
      name="galleryImages"
      multiple
    />
    <button type="submit">Upload</button>
  </form>
  ```

  has

  ```js
  const imageFields = [
    { name: "profileImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 5 },
  ];
  ```

- cloudinary.js file
  you can see at `line no. 20` I have  
  `console.log("file is uploaded on cloudinary ", response.url)`  
  Now you need to make a function to save this url to you database and  
  just call it below this and pass the response.url  
  It should do the job.  

## Setup

I have used node version 21 It will work with node 20 too. If you
are using below it. Install nodemon and change the `dev script` in the
`package.json`. You are good to go. Just clone or download this repo. open the
repo folder on the system. ### Backend just copy these commands **_I personally
like pnmp_** So you may do a `alias npm="pnpm"` first ```sh cd backend npm i npm
run dev

```

### Frontend

Just find the `index.html` in the `client/index.html` and open it in your vs code via live server.

## Contributing

Pull requests are welcome.
For major changes, please open an issue first to discuss what you would like to change.

You are free to contribute anything you like.
```
