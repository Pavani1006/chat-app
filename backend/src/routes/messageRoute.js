import express from "express";
import multer from "multer";
import { checkAuth } from "../middlewares/authMiddleware.js";
import {
  contactsForSidebar,
  getMessages,
  sendMessage,
  markMessagesSeen
} from "../controllers/messageController.js";

const route = express.Router();
const upload = multer({ dest: "uploads/" }); // TEMP FOLDER

route.get("/users", checkAuth, contactsForSidebar);
route.get("/getmessages/:_id", checkAuth, getMessages);
route.post("/sendmessage/:_id", checkAuth, upload.single("file"), sendMessage);
route.put("/mark-seen/:_id", checkAuth, markMessagesSeen);

export default route;
