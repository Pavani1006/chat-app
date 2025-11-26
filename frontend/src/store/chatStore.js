import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { authStore } from "./authStore";

export const chatStore = create((set, get) => ({
  users: [],
  messages: [],
  selectedUser: null,

  getUsers: async () => {
    try {
      const res = await axiosInstance.get("/message/users");
      set({ users: res.data });
      // optional: remove success toast here to avoid spam
    } catch (error) {
      toast.error("Failed to fetch users.");
    }
  },

  getMessages: async () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    try {
      const res = await axiosInstance.get(
        `/message/getmessages/${selectedUser._id}`
      );
      set({ messages: res.data });
    } catch (error) {
      toast.error("Failed to fetch messages.");
    }
  },

  sendMessage: async (data) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) return;

    try {
      const res = await axiosInstance.post(
        `/message/sendmessage/${selectedUser._id}`,
        data
      );

      // sender: update own chat immediately
      set({ messages: [...messages, res.data] });
      toast.success("Message sent successfully.");
    } catch (error) {
      toast.error("Failed to send message");
    }
  },

  // when switching chat, clear previous messages so they don't mix
  setSelectedUser: (user) => {
    set({ selectedUser: user, messages: [] });
  },

  listenForNewMessage: () => {
    const socket = authStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, messages } = get();
      const loggedUser = authStore.getState().loggedUser;
      if (!selectedUser || !loggedUser) return;

      // 🔥 only handle messages that belong to THIS chat
      const isForThisChat =
        (newMessage.senderId === loggedUser._id &&
          newMessage.receiverId === selectedUser._id) ||
        (newMessage.senderId === selectedUser._id &&
          newMessage.receiverId === loggedUser._id);

      if (!isForThisChat) return;

      set({ messages: [...messages, newMessage] });
    });
  },

  stopListeningForMessages: () => {
    const socket = authStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
  },
}));
