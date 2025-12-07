import express from "express";
import multer from "multer";
import { checkAuth } from "../middlewares/authMiddleware.js";
import {
  contactsForSidebar,
  getMessages,
  sendMessage,
  markMessagesSeen,
  getUploadSignature
} from "../controllers/messageController.js";

const route = express.Router();
const upload = multer({ dest: "uploads/" }); // TEMP FOLDER

route.get("/users", checkAuth, contactsForSidebar);
route.get("/getmessages/:_id", checkAuth, getMessages);
route.post("/sendmessage/:_id", checkAuth, sendMessage);
route.get("/get-signature", checkAuth, getUploadSignature);
route.put("/mark-seen/:_id", checkAuth, markMessagesSeen);

export default route;
