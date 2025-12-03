import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { authStore } from "./authStore";

export const chatStore = create((set, get) => ({
  users: [],
  messages: [],
  selectedUser: null,
  loadingMessages: false,

  // 📌 Load users for sidebar (each user now has unreadCount from backend)
  getUsers: async () => {
    try {
      const res = await axiosInstance.get("/message/users");
      set({ users: res.data });
    } catch (error) {
      toast.error("Failed to fetch users.");
    }
  },

  // 📌 Load messages between loggedUser and selectedUser
  getMessages: async () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    set({ loadingMessages: true });

    try {
      const res = await axiosInstance.get(
        `/message/getmessages/${selectedUser._id}`
      );
      set({ messages: res.data, loadingMessages: false });
    } catch (error) {
      set({ loadingMessages: false });
      toast.error("Failed to fetch messages.");
    }
  },

  // 📌 Send a message
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

  // 📌 When clicking a user → open chat & reset unreadCount to 0
  setSelectedUser: (user) => {
    if (!user) return set({ selectedUser: null, messages: [] });

    set((state) => ({
      selectedUser: user,
      messages: [],
      users: state.users.map((u) =>
        u._id === user._id ? { ...u, unreadCount: 0 } : u
      ),
    }));

    // 🔥 Call backend to mark seen
    axiosInstance.put(`/message/mark-seen/${user._id}`).catch(() => {});
    const socket = authStore.getState().socket;
    socket?.emit("markSeen", {
      userId: authStore.getState().loggedUser._id,
      chatUserId: user._id,
    });
  },

  // 📌 Listen for new real-time messages
  listenForNewMessage: () => {
    const socket = authStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, messages, users } = get();
      const loggedUser = authStore.getState().loggedUser;

      if (!loggedUser) return;

      // If current chat is open → push message into box
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        return set({ messages: [...messages, newMessage] });
      }

      // If chat is closed → increase unread count
      const updatedUsers = users.map((u) =>
        u._id === newMessage.senderId
          ? { ...u, unreadCount: (u.unreadCount || 0) + 1 }
          : u
      );

      set({ users: updatedUsers });
    });

    // 🔥 Real-time "Seen" socket update
    socket.on("messagesSeen", ({ userId }) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.seenBy?.includes(userId)
            ? msg
            : { ...msg, seenBy: [...msg.seenBy, userId] }
        ),
      }));
    });
  },

  // 📌 Stop listeners
  stopListeningForMessages: () => {
    const socket = authStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
    socket.off("messagesSeen");
  },
}));
