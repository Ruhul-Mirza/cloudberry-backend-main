const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});
console.log("CLOUDINARY CONFIG:", cloudinary.config());

exports.uploadPDFBuffer = async (buffer, certificateId) => {
    console.log("CLOUDINARY CONFIG AT UPLOAD TIME:", cloudinary.config());

  return new Promise((resolve, reject) => {
    
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "certificates",
        resource_type: "raw",
        public_id: certificateId,
      },
      (error, result) => {
        if (error) {
          console.error("CLOUDINARY ERROR:", error);
          return reject(error);
        }
        resolve(result.secure_url);
      },
    );

    stream.end(buffer);
  });
};
