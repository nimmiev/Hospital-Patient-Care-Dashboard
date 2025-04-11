import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_API_KEY, 
    api_secret: process.env.CLOUD_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const streamUpload = (buffer, folder = "profile_pics") => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
        if (result) resolve(result);
        else reject(error);
      });
      streamifier.createReadStream(buffer).pipe(stream);
    });
  };

export { cloudinary as cloudinaryInstance, streamUpload}
