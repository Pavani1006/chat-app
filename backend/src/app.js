// import express from "express";
// import dotenv from "dotenv";
// import path from "path";
// import mongoose from "mongoose";
// import cookieParser from "cookie-parser";
// import cors from "cors";
// import fs from "fs";
// import { app, server } from "./lib/socket.js";

// dotenv.config();

// const port = process.env.PORT || 5000;

// // ⬇️ Fix payload limit for large base64 images/audio
// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ limit: "50mb", extended: true }));

// app.use(cookieParser());
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );

// // 📁 Ensure uploads folder exists (prevents crashes)
// const uploadDir = path.join(process.cwd(), "uploads");
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// // ⬇️ Serve uploaded PDFs/docs BEFORE routes
// app.use("/uploads", express.static(uploadDir));

// import authRoute from "./routes/authRoute.js";
// import messageRoute from "./routes/messageRoute.js";

// app.use("/api/auth", authRoute);
// app.use("/api/message", messageRoute);

// // DATABASE + SERVER START
// mongoose
//   .connect(process.env.MONGODB_URI)
//   .then((res) => {
//     console.log("MongoDB connected:", res.connection.host);
//     server.listen(port, () =>
//       console.log(`Server running on http://localhost:${port}`)
//     );
//   })
//   .catch((err) => {
//     console.error("❌ MongoDB connection failed:", err.message);
//     process.exit(1);
//   });



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

// Increase payload limit (needed for base64 text, captions, etc.)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoute);
app.use("/api/message", messageRoute);

// Database + Server
mongoose
  .connect(process.env.MONGODB_URI)
  .then((res) => {
    console.log("MongoDB connected:", res.connection.host);
    server.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
