import multer from "multer";

const storage = multer.memoryStorage(); // Store file in memory before uploading to Cloudinary

// const storage = multer.diskStorage({
//     filename: function (req, file, cb) {
//         // console.log("file==", file)
        
//         cb(null, file.originalname)
//     }
//   })

export const upload = multer({ storage });

  



