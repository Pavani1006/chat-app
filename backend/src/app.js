import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from "./lib/socket.js";

import authRoute from "./routes/authRoute.js";
import messageRoute from "./routes/messageRoute.js";

dotenv.config();

const port = process.env.PORT || 5000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cookieParser());

app.use(
  cors({
    origin: "https://connectly-web-app.netlify.app",

    credentials: true,
  })
);

app.use("/api/auth", authRoute);
app.use("/api/message", messageRoute);

mongoose
  .connect(process.env.MONGODB_URI)
  .then((res) => {
    console.log("MongoDB connected:", res.connection.host);
    server.listen(port, () => {
      console.log(`Server running on port :${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
