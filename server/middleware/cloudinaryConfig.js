const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

console.log('Testing Cloudinary Config...');
if (!process.env.CLOUDINARY_API_KEY) {
  console.warn('WARNING: CLOUDINARY_API_KEY is NOT defined in process.env!');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'quickcook_uploads',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  }
});

module.exports = { cloudinary, storage };
