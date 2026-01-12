import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173","http://192.168.1.9:5173"],
    credentials: true,
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
/* ===================== CALL SIGNALING ===================== */

// Caller → Receiver
socket.on("call:start", ({ to, type }) => {
  const receiverSocketId = userSocket[to];

  if (receiverSocketId) {
    io.to(receiverSocketId).emit("call:incoming", {
      from: userId,
      type, // "audio" | "video"
    });
  }
});

// Receiver accepts call
socket.on("call:accept", ({ to }) => {
  console.log("📞 SERVER received call:accept for", to);
  const receiverSocketId = userSocket[to];
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("call:accepted", {
  from: userId,
});

  }
});

// Receiver rejects call
socket.on("call:reject", ({ to }) => {
  const receiverSocketId = userSocket[to];
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("call:rejected");
  }
});

// Either side ends call
// In your backend socket logic:
socket.on("call:end", ({ to }) => {
  const receiverSocketId = getReceiverSocketId(to); // Use your helper function to get the ID
  if (receiverSocketId) {
    // Send "call:ended" to the other person
    io.to(receiverSocketId).emit("call:ended");
  }
});
/* ===================== WEBRTC SIGNALING ===================== */

// Offer from caller → receiver
socket.on("webrtc-offer", ({ to, offer }) => {
  const receiverSocketId = userSocket[to];
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("webrtc-offer", {
      from: userId,
      offer,
    });
  }
});

// Answer from receiver → caller
socket.on("webrtc-answer", ({ to, answer }) => {
  const receiverSocketId = userSocket[to];
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("webrtc-answer", {
      from: userId,
      answer,
    });
  }
});

// ICE candidates (both directions)
socket.on("ice-candidate", ({ to, candidate }) => {
  const receiverSocketId = userSocket[to];
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("ice-candidate", {
      from: userId,
      candidate,
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
