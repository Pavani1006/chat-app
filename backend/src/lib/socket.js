import express from "express";
import http from "http";
import { Server } from "socket.io";
import Message from "../model/messageModel.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});

const userSockets = new Map();
const activeCalls = {}; // 🔥 Track ongoing calls

export const getReceiverRoom = (userId) => String(userId);
export const isUserOnline = (userId) => userSockets.has(String(userId));
export const getReceiverSocketId = (userId) => {
  const sockets = userSockets.get(String(userId));
  return sockets ? [...sockets].pop() : undefined;
};

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  const userId = String(socket.handshake.query.userId || "");
  if (userId) {
    const sockets = userSockets.get(userId) || new Set();
    sockets.add(socket.id);
    userSockets.set(userId, sockets);
    socket.join(getReceiverRoom(userId));
  }

  io.emit("getOnlineUsers", [...userSockets.keys()]);

socket.on("call:start", async ({ to, type }) => {
  console.log("📞 CALL START:", userId, "→", to, type);

  const receiverSocketId = getReceiverSocketId(to);

  if (!isUserOnline(to)) {
    await Message.create({
      senderId: userId,
      receiverId: to,
      text: `Missed ${type} call`,
      messageType: "missed_call",
      callType: type,
      seenBy: [userId],
    });
    console.log("❌ MISSED CALL SAVED (USER OFFLINE)");
    return;
  }

  activeCalls[`${userId}-${to}`] = {
    from: userId,
    to,
    type,
    accepted: false,
  };

  setTimeout(async () => {
    const callKey = `${userId}-${to}`;
    const call = activeCalls[callKey];

    if (call && !call.accepted) {
      const missedCall = await Message.create({
        senderId: userId,
        receiverId: to,
        text: `Missed ${type} call`,
        messageType: "missed_call",
        callType: type,
        seenBy: [userId],
      });

      const latestReceiverSocket = getReceiverSocketId(to);
      io.to(getReceiverRoom(to)).emit("newMessage", missedCall);
      if (latestReceiverSocket) {
        io.to(latestReceiverSocket).emit("call:ended");
      }

      socket.emit("call:no_answer"); 

      delete activeCalls[callKey];
      console.log("❌ TIMEOUT: Receiver didn't lift.");
    }
  }, 20000); 

  io.to(receiverSocketId).emit("call:incoming", {
    from: userId,
    type,
  });
});

  socket.on("call:accept", ({ to }) => {
    console.log("✅ CALL ACCEPTED by", userId);

    const callKey = `${to}-${userId}`;
    if (activeCalls[callKey]) {
      activeCalls[callKey].accepted = true;
    }

    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call:accepted", {
        from: userId,
      });
    }
  });

socket.on("call:reject", async ({ to }) => {
  console.log("❌ CALL REJECTED by", userId);

  const callKey = `${to}-${userId}`; 
  const call = activeCalls[callKey];

  if (call && !call.accepted) {
    const missedCall = await Message.create({
      senderId: to,      
      receiverId: userId, 
      text: `Missed ${call.type} call`,
      messageType: "missed_call",
      callType: call.type,
      seenBy: [to],
    });

    io.to(getReceiverRoom(userId)).emit("newMessage", missedCall);
  }

  delete activeCalls[callKey];

  const callerSocketId = getReceiverSocketId(to);
  if (callerSocketId) {
    io.to(callerSocketId).emit("call:rejected");
  }
});

socket.on("disconnect", async () => {
  console.log("⚠️ User disconnected:", userId);

  for (const key in activeCalls) {
    const call = activeCalls[key];

    if (call.from === userId && !call.accepted) {
      const missedCall = await Message.create({
        senderId: call.from,
        receiverId: call.to,
        text: `Missed ${call.type} call`,
        messageType: "missed_call",
        callType: call.type,
        seenBy: [call.from],
      });

      io.to(getReceiverRoom(call.to)).emit("newMessage", missedCall);
      
      delete activeCalls[key];
    }
  }

  const sockets = userSockets.get(userId);
  sockets?.delete(socket.id);
  if (sockets?.size === 0) {
    userSockets.delete(userId);
  }
  io.emit("getOnlineUsers", [...userSockets.keys()]);
});
socket.on("call:end", ({ to }) => {
  const receiverSocketId = getReceiverSocketId(to);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("call:ended", {
      from: userId,
    });
  }

});


  socket.on("webrtc-offer", ({ to, offer }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("webrtc-offer", {
        from: userId,
        offer,
      });
    }
  });

  socket.on("webrtc-answer", ({ to, answer }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("webrtc-answer", {
        from: userId,
        answer,
      });
    }
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("ice-candidate", {
        from: userId,
        candidate,
      });
    }
  });
});

export { app, server, io };
