import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { authStore } from "./authStore";

export const chatStore = create((set, get) => ({
  users: [],
  messages: [],
  selectedUser: null,
  loadingMessages: false,

  getUsers: async () => {
    try {
      const res = await axiosInstance.get("/message/users");
      set({ users: res.data });
    } catch {
      toast.error("Failed to fetch users.");
    }
  },

  getMessages: async () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
    set({ loadingMessages: true });

    try {
      const res = await axiosInstance.get(`/message/getmessages/${selectedUser._id}`);
      set({ messages: res.data, loadingMessages: false });
    } catch {
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
    } catch {
      toast.error("Failed to send message");
    }
  },

  setSelectedUser: (user) => {
    if (!user) return set({ selectedUser: null, messages: [] });

    const loggedUser = authStore.getState().loggedUser;
    const socket = authStore.getState().socket;

    set((state) => ({
      selectedUser: user,
      messages: [],
      users: state.users.map((u) =>
        u._id === user._id ? { ...u, unreadCount: 0 } : u
      ),
    }));

    get()
      .getMessages()
      .then(() => {
        axiosInstance.put(`/message/mark-seen/${user._id}`).catch(() => {});
        socket?.emit("markSeen", {
          userId: loggedUser._id,
          chatUserId: user._id,
        });
      });
  },

  listenForNewMessage: () => {
    const socket = authStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, messages, users } = get();
      const loggedUser = authStore.getState().loggedUser;

      const isChatOpen =
        selectedUser &&
        (
          (String(newMessage.senderId) === String(selectedUser._id) &&
            String(newMessage.receiverId) === String(loggedUser._id)) ||
          (String(newMessage.receiverId) === String(selectedUser._id) &&
            String(newMessage.senderId) === String(loggedUser._id))
        );

      if (isChatOpen) {
        newMessage.seenBy = [...(newMessage.seenBy || []), loggedUser._id];
        set({ messages: [...messages, newMessage] });

        axiosInstance.put(`/message/mark-seen/${newMessage.senderId}`).catch(() => {});
        socket.emit("markSeen", {
          userId: loggedUser._id,
          chatUserId: newMessage.senderId,
        });
        return;
      }

      const updatedUsers = users.map((u) =>
        u._id === newMessage.senderId
          ? { ...u, unreadCount: (u.unreadCount || 0) + 1 }
          : u
      );
      set({ users: updatedUsers });
    });

    socket.on("messagesSeen", (viewerId) => {
      const loggedUser = authStore.getState().loggedUser;
      const { selectedUser, messages } = get();

      if (selectedUser && String(selectedUser._id) === String(viewerId)) {
        const updatedMsgs = messages.map((m) =>
          String(m.senderId) === String(loggedUser._id)
            ? { ...m, seenBy: [...new Set([...(m.seenBy || []), viewerId])] }
            : m
        );
        set({ messages: updatedMsgs });
      }
    });
  },

  stopListeningForMessages: () => {
    const socket = authStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
    socket.off("messagesSeen");
  },
}));
