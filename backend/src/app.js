import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from "./lib/socket.js";

dotenv.config();

// ⬇️ ADD THIS (fixes 413 Payload Too Large)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
// ⬆️ MUST be before routes

app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const port = process.env.PORT;

import authRoute from "./routes/authRoute.js";
import messageRoute from "./routes/messageRoute.js";

app.use("/api/auth", authRoute);
app.use("/api/message", messageRoute);

mongoose.connect(process.env.MONGODB_URI).then((res) => {
  console.log("mongoDB connected:" + res.connection.host);
  server.listen(port, () => {
    console.log(`server running on port ${port}`);
  });
});
