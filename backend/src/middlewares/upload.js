import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../lib/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // 🖼️ Image files
    if (file.mimetype.startsWith("image/")) {
      return {
        folder: "images",
        resource_type: "image",
        access_mode: "public",
      };
    }

    // 🎤 Audio files
    if (file.mimetype.startsWith("audio/")) {
      return {
        folder: "audio",
        resource_type: "video", // Cloudinary treats audio as video
        access_mode: "public",
      };
    }

    // 🎥 Video files
    if (file.mimetype.startsWith("video/")) {
      return {
        folder: "videos",
        resource_type: "video",
        access_mode: "public",
      };
    }

    // 📄 Documents (PDF, DOC, ZIP, etc.)
    return {
      folder: "documents",
      resource_type: "auto", // 🔥 CRITICAL FIX
      access_mode: "public",
    };
  },
});

export const upload = multer({ storage });
