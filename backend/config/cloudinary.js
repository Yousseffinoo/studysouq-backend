import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Parse Cloudinary URL: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
const cloudinaryUrl = process.env.CLOUDINARY_URL;

if (!cloudinaryUrl) {
  console.error('⚠️ CLOUDINARY_URL is not set in environment variables');
} else {
  // Parse the URL to extract credentials
  const urlPattern = /cloudinary:\/\/(\d+):([^@]+)@(.+)/;
  const match = cloudinaryUrl.match(urlPattern);
  
  if (match) {
    const [, api_key, api_secret, cloud_name] = match;
    
    cloudinary.config({
      cloud_name: cloud_name,
      api_key: api_key,
      api_secret: api_secret,
      secure: true
    });
    
    console.log('✅ Cloudinary configured successfully');
    console.log('📦 Cloud Name:', cloud_name);
  } else {
    console.error('❌ Invalid CLOUDINARY_URL format');
  }
}

export default cloudinary;

