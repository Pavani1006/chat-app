import express from "express";
import multer from "multer";
import { checkAuth } from "../middlewares/authMiddleware.js";

import {
  contactsForSidebar,
  getMessages,
  sendMessage,
  markMessagesSeen,
} from "../controllers/messageController.js";

const route = express.Router();

// ===== Multer Storage Configuration =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});

// ===== File Filter (Allow only pdf, docs, images, audio) =====
const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "audio/mpeg",
    "audio/mp3",
    "audio/webm",
    "audio/wav",
    "audio/ogg",
     "video/mp4",
  "video/webm",
  "video/mkv",
  "video/ogg",
  ];

  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Unsupported file type"), false);
};

// ===== Middleware =====
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
});

// ===== Routes =====
route.get("/users", checkAuth, contactsForSidebar);
route.get("/getmessages/:_id", checkAuth, getMessages);

// ⬇ IMPORTANT — supports text, image, audio, and PDF messages
route.post("/sendmessage/:_id", checkAuth, upload.single("file"), sendMessage);

route.put("/mark-seen/:_id", checkAuth, markMessagesSeen);

export default route;
