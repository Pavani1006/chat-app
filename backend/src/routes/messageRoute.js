import express from "express";
import { checkAuth } from "../middlewares/authMiddleware.js";
import {
  contactsForSidebar,
  getMessages,
  sendMessage,
} from "../controllers/messageController.js";

const route = express.Router();

route.get("/users", checkAuth, contactsForSidebar);
route.get("/getmessages/:_id", checkAuth, getMessages);
route.post("/sendmessage/:_id", checkAuth, sendMessage);

export default route;
