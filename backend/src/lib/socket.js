import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

export const getReceiverSocketId = (userId) => {
  return userSocket[userId];
};

const userSocket = {};

io.on("connection", (socket) => {
  console.log("user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocket[userId] = socket.id;
  }
  io.emit("getOnlineUsers", Object.keys(userSocket));
  // 🔵 USER IS TYPING
  socket.on("typing", (receiverId) => {
    const receiverSocketId = userSocket[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", {
        senderId: userId,
      });
    }
  });

  // 🔵 USER STOPPED TYPING
  socket.on("stopTyping", (receiverId) => {
    const receiverSocketId = userSocket[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", {
        senderId: userId,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    delete userSocket[userId];
    io.emit("getOnlineUsers", Object.keys(userSocket));
  });
});
export { app, server, io };
