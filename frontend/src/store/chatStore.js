import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { authStore } from "./authStore";

export const chatStore = create((set, get) => ({
  users: [],
  messages: [],
  selectedUser: null,
  loadingMessages: false, // ⬅ NEW

  getUsers: async () => {
    try {
      const res = await axiosInstance.get("/message/users");
      set({ users: res.data });
    } catch (error) {
      toast.error("Failed to fetch users.");
    }
  },

  getMessages: async () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    set({ loadingMessages: true }); // ⬅ start loading

    try {
      const res = await axiosInstance.get(
        `/message/getmessages/${selectedUser._id}`
      );
      set({ messages: res.data, loadingMessages: false }); // ⬅ stop loading
    } catch (error) {
      set({ loadingMessages: false });
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

      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error("Failed to send message");
    }
  },

  // ⬇ FIX: reset state when switching chat
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
