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

  // Load sidebar users
  getUsers: async () => {
    try {
      const res = await axiosInstance.get("/message/users");
      set({ users: res.data });
    } catch {
      toast.error("Failed to fetch users.");
    }
  },

  // Load chat messages
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

  // SEND MESSAGE — handles video, audio, docs, images, base64 images, text
  sendMessage: async (data) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) return;

    const loggedUser = authStore.getState().loggedUser;

    // Create optimistic temp message
    const tmpId = uuid();
    const temp = {
      _id: tmpId,
      senderId: loggedUser._id,
      receiverId: selectedUser._id,
      text: data.text || "",
      image: data.image || "",
      audio: data.audio || "",
      caption: data.caption || "",
      fileName: data.file?.name || "",
      fileUrl: data.file ? "uploading..." : "",
      pending: true,
      seenBy: [loggedUser._id],
      createdAt: new Date().toISOString(),
    };

    set({ messages: [...messages, temp] });

    try {
      let res;

      // If file exists → MUST use FormData
      if (data.file instanceof File) {
        const form = new FormData();
        form.append("file", data.file);
        form.append("text", data.text || "");
        form.append("caption", data.caption || "");
        form.append("image", data.image || "");
        form.append("audio", data.audio || "");

        res = await axiosInstance.post(
          `/message/sendmessage/${selectedUser._id}`,
          form,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } 
      
      else {
        // Text-only / base64 image / audio-only
        res = await axiosInstance.post(
          `/message/sendmessage/${selectedUser._id}`,
          data
        );
      }

      // Replace temp with actual message from backend
      set({
        messages: get().messages.map((m) => (m._id === tmpId ? res.data : m)),
      });

    } catch (err) {
      console.log("SEND ERROR:", err);
      set({ messages: get().messages.filter((m) => m._id !== tmpId) });
      toast.error("Failed to send message.");
    }
  },

  // Select chat
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

  // Socket listener
  listenForNewMessage: () => {
    const socket = authStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      const { messages, selectedUser, users } = get();
      const loggedUser = authStore.getState().loggedUser;

      const isPendingMatch = messages.some(
        (m) =>
          m.pending &&
          m.senderId === newMessage.senderId &&
          m.receiverId === newMessage.receiverId
      );

      if (isPendingMatch) {
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
