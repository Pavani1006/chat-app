// store/chatStore.js
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { authStore } from "./authStore";
import { v4 as uuid } from "uuid";

export const chatStore = create((set, get) => ({
  users: [],
  messages: [],
  selectedUser: null,
  loadingMessages: false,

  // 📌 Load sidebar users
  getUsers: async () => {
    try {
      const res = await axiosInstance.get("/message/users");
      set({ users: res.data });
    } catch {
      toast.error("Failed to fetch users.");
    }
  },

  // 📌 Load chat messages
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

  // 📩 SEND MESSAGE  (supports JSON + FormData)
// 📩 SEND MESSAGE  (JSON for text / img / audio, FormData for files)
sendMessage: async (data) => {
  const { selectedUser, messages } = get();
  if (!selectedUser) return;

  const loggedUser = authStore.getState().loggedUser;
  
  // Optimistic update
  const tmpId = uuid();
  const temp = {
    _id: tmpId,
    senderId: loggedUser._id,
    receiverId: selectedUser._id,
    text: data.text || "",
    image: data.image || "",
    fileName: data.fileName || "",
    fileUrl: data.pdfFile ? "uploading..." : "",
    pending: true,
    seenBy: [loggedUser._id],
    createdAt: new Date().toISOString(),
  };

  set({ messages: [...messages, temp] });

  try {
    const res = await axiosInstance.post(`/message/sendmessage/${selectedUser._id}`, data);
    set({
      messages: get().messages.map((m) => (m._id === tmpId ? res.data : m)),
    });
  } catch {
    set({ messages: get().messages.filter((m) => m._id !== tmpId) });
  }
},



  // 📌 Select chat
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

  // 🔔 socket listener
  listenForNewMessage: () => {
    const socket = authStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      const { messages, selectedUser, users } = get();
      const loggedUser = authStore.getState().loggedUser;

      const matchPending = messages.some(
        (m) =>
          m.pending &&
          m.senderId === newMessage.senderId &&
          m.receiverId === newMessage.receiverId
      );

      if (matchPending) {
        set({
          messages: messages.map((m) =>
            m.pending &&
            m.senderId === newMessage.senderId &&
            m.receiverId === newMessage.receiverId
              ? newMessage
              : m
          ),
        });
        return;
      }

      const isChatOpen =
        selectedUser &&
        ((newMessage.senderId === selectedUser._id &&
          newMessage.receiverId === loggedUser._id) ||
          (newMessage.receiverId === selectedUser._id &&
            newMessage.senderId === loggedUser._id));

      if (isChatOpen) {
        newMessage.seenBy = [...(newMessage.seenBy || []), loggedUser._id];
        set({ messages: [...messages, newMessage] });
        return;
      }

      const updated = users.map((u) =>
        u._id === newMessage.senderId
          ? { ...u, unreadCount: (u.unreadCount || 0) + 1 }
          : u
      );
      set({ users: updated });
    });

    socket.on("messagesSeen", (viewerId) => {
      const loggedUser = authStore.getState().loggedUser;
      const { selectedUser, messages } = get();
      if (selectedUser && viewerId === selectedUser._id) {
        set({
          messages: messages.map((m) =>
            m.senderId === loggedUser._id
              ? {
                  ...m,
                  seenBy: [...new Set([...(m.seenBy || []), viewerId])],
                }
              : m
          ),
        });
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
