import express from "express";
import { upload } from "../middlewares/upload.js";
import { checkAuth } from "../middlewares/authMiddleware.js";

import {
  contactsForSidebar,
  getMessages,
  sendMessage,
  markMessagesSeen,
  deleteMessageForEveryone,
  deleteMessageForMe,
} from "../controllers/messageController.js";

const route = express.Router();

route.get("/users", checkAuth, contactsForSidebar);
route.get("/getmessages/:_id", checkAuth, getMessages);

route.post(
  "/sendmessage/:_id",
  checkAuth,
  upload.single("file"),
  sendMessage
);

route.put("/mark-seen/:_id", checkAuth, markMessagesSeen);
route.put("/delete-for-me/:messageId", checkAuth, deleteMessageForMe);
route.put("/delete-for-everyone/:messageId", checkAuth, deleteMessageForEveryone);
export default route;
