import multer from 'multer';
import fs from 'fs';
import path from 'path';


const BLOG_IMAGE_UPLOAD_DIR = './public/assets/images/users';

if (!fs.existsSync(BLOG_IMAGE_UPLOAD_DIR)) {
  fs.mkdirSync(BLOG_IMAGE_UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      if (!fs.existsSync(BLOG_IMAGE_UPLOAD_DIR)) {
        fs.mkdirSync(BLOG_IMAGE_UPLOAD_DIR, { recursive: true });
      }
      cb(null, BLOG_IMAGE_UPLOAD_DIR);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '_').toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `profileImage-${uniqueSuffix}-${safeName}`);
  },
});

const blogImageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and JPG formats are allowed.'));
    }
  },
});

export const uploadBlogProfileImage = blogImageUpload.single('profileImage');
