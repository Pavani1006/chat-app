import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../lib/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    if (file.mimetype.startsWith("image/")) {
      return {
        folder: "images",
        resource_type: "image",
        access_mode: "public",
      };
    }

    if (file.mimetype.startsWith("audio/")) {
      return {
        folder: "audio",
        resource_type: "video",
        access_mode: "public",
      };
    }

    if (file.mimetype.startsWith("video/")) {
      return {
        folder: "videos",
        resource_type: "video",
        access_mode: "public",
      };
    }

    return {
      folder: "documents",
      resource_type: "auto",
      access_mode: "public",
    };
  },
});

export const upload = multer({ storage });
