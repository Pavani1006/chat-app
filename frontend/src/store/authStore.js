import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { chatStore } from "./chatStore";

export const authStore = create((set, get) => ({
  loggedUser: null,
  onlineUsers: [],
  socket: null,

  signup: async (data) => {
  try {
    const res = await axiosInstance.post("/auth/signup", data);

    toast.success("Account created successfully.");

    // Delay redirect by delaying loggedUser update
    setTimeout(() => {
      set({ loggedUser: res.data });
      get().connectSocket();
    }, 1100);

  } catch (error) {
    const message =
      error?.response?.data?.message ||
      "We couldn't complete your request. Please try again.";
      
    toast.error(message);
    set({ loggedUser: null });
  }
},



  login: async (data) => {
  try {
    const res = await axiosInstance.post("/auth/login", data);
     toast.success("Login successful.");

    // Delay redirect by delaying loggedUser
    setTimeout(() => {
      set({ loggedUser: res.data });
      get().connectSocket();
    }, 1100); // 2 seconds delay

    // get().connectSocket();
  } catch (error) {
    const message =
      error?.response?.data?.message || "Login failed. Please try again.";
    toast.error(message);
    set({ loggedUser: null });
  }
},


 logout: async () => {
  try {
    await axiosInstance.get("/auth/logout");
    toast.success("Logged out successfully.");

    setTimeout(() => {
      window.location.href = "/"; // 🔥 first redirect to Landing Page
      get().disconnectSocket();
      set({ loggedUser: null });  // ⚠️ after redirect (so Protected Route won't push to /login)
    }, 1000);

  } catch (error) {
    toast.error("Logout failed. Please try again.");
  }

    
  },

  updateProfile: async (data) => {
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ loggedUser: res.data });
      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error("Updating Profile failed.");
    }
  },

connectSocket: () => {
  const { loggedUser } = get();
  if (!loggedUser) return;

  const socket = io("http://192.168.1.9:5000", {
    query: { userId: loggedUser._id },
    withCredentials: true,
  });

  set({ socket });

  socket.on("getOnlineUsers", (userIds) => {
    set({ onlineUsers: userIds });
  });

  // 🔥 chat listeners
  const chat = chatStore.getState();
  chat.stopListeningForMessages();
  chat.listenForNewMessage();
  chat.listenForTyping();

  // 🔥 call listeners (ONCE, GLOBAL)
  get().listenForCalls();
},


listenForCalls: () => {
  const socket = get().socket;
  if (!socket) return;

  socket.off("call:incoming");
  socket.off("call:accepted");
  socket.off("call:rejected");
  socket.off("call:ended"); // Reset

  socket.on("call:incoming", ({ from, type }) => {
    chatStore.getState().setIncomingCall({ from, type });
  });

  socket.on("call:accepted", ({ from }) => {
    chatStore.getState().setIncomingCall({ from, type: "audio" }); 
    chatStore.getState().startCall();
  });

  // 🔥 ADD THIS: Listen for the signal from the other person
  socket.on("call:ended", () => {
    console.log("📴 Call ended by the other user");
   chatStore.getState().clearCall();
  chatStore.getState().endCall();
  });

  socket.on("call:rejected", () => {
    chatStore.getState().clearCall();
  });
},



  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
