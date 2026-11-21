import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { authStore } from "./authStore";
import { v4 as uuid } from "uuid";

export const chatStore = create((set, get) => ({
  /* ===================== STATE ===================== */
  users: [],
  messages: [],
  selectedUser: null,
  typingUserId: null,
  loadingMessages: false,

  /* ---------- FORWARD ---------- */
  forwardMessage: null,

  /* ---------- CALL ---------- */
  call: null, // { from, type: "audio" | "video" }
  inCall: false,

  /* ===================== FORWARD ===================== */
  setForwardMessage: (msg) => set({ forwardMessage: msg }),
  clearForwardMessage: () => set({ forwardMessage: null }),

  /* ===================== CALL ===================== */
  setIncomingCall: (call) => set({ call }),
  clearCall: () => set({ call: null, inCall: false }),
  startCall: () => set({ inCall: true }),
  endCall: () => set({ inCall: false, call: null }),

  /* ===================== USERS ===================== */
  getUsers: async () => {
    try {
      const res = await axiosInstance.get("/message/users");
      set({ users: res.data });
    } catch {
      toast.error("Failed to fetch users.");
    }
  },

  /* ===================== FORWARD MESSAGE ===================== */
  forwardToUser: async (receiverId, message) => {
    try {
      const payload = {
        text: message.text || "",
        image: message.image || "",
        audio: message.audio || "",
        audioDuration: message.audioDuration || 0,
        isAudio: message.isAudio || !!message.audio, 
         isVideo: message.isVideo || false,
        fileUrl: message.fileUrl || "",
        fileName: message.fileName || "",
        fileType: message.fileType || "",
        caption: message.caption || "",
        isForwarded: true,
      };

      await axiosInstance.post(
        `/message/sendmessage/${receiverId}`,
        payload
      );
    } catch (err) {
      console.error("Forward message failed", err);
    }
  },

  /* ===================== GET MESSAGES ===================== */
  getMessages: async () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const selectedUserId = selectedUser._id;
    set({ loadingMessages: true });
    try {
      const res = await axiosInstance.get(
        `/message/getmessages/${selectedUserId}`
      );
      if (String(get().selectedUser?._id) !== String(selectedUserId)) return;

      set((state) => {
        const fetchedIds = new Set(res.data.map((message) => String(message._id)));
        const newMessages = state.messages.filter(
          (message) =>
            !message.isOptimistic && !fetchedIds.has(String(message._id))
        );
        return {
          messages: [...res.data, ...newMessages].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          ),
        };
      });
      get().markMessagesSeen(selectedUserId);
    } catch (error) {
      console.error("Fetch messages failed:", error);
      toast.error("Failed to fetch messages.");
    } finally {
      if (String(get().selectedUser?._id) === String(selectedUserId)) {
        set({ loadingMessages: false });
      }
    }
  },

  markMessagesSeen: async (chatUserId) => {
    const loggedUser = authStore.getState().loggedUser;
    if (!loggedUser || !chatUserId) return;

    try {
      await axiosInstance.put(`/message/mark-seen/${chatUserId}`);
      const viewerId = String(loggedUser._id);
      set((state) => ({
        users: state.users.map((user) =>
          String(user._id) === String(chatUserId)
            ? { ...user, unreadCount: 0 }
            : user
        ),
        messages: state.messages.map((message) => {
          if (
            String(message.senderId) !== String(chatUserId) ||
            String(message.receiverId) !== viewerId
          ) {
            return message;
          }
          const seenBy = (message.seenBy || []).map(String);
          return seenBy.includes(viewerId)
            ? message
            : { ...message, seenBy: [...seenBy, viewerId] };
        }),
      }));
    } catch (error) {
      console.error("Mark messages seen failed:", error);
      get().getUsers();
    }
  },

  /* ===================== SEND MESSAGE ===================== */
 /* ===================== SEND MESSAGE ===================== */
  sendMessage: async (data) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) return;

    const loggedUser = authStore.getState().loggedUser;
    const tmpId = uuid();

    const isAudio = data.file?.type?.startsWith("audio/");
const isVideo = data.file?.type?.startsWith("video/");

const tempMessage = {
  _id: tmpId,
  senderId: loggedUser._id,
  receiverId: selectedUser._id,
  text: data.text || "",
  image: data.image || "",
  fileUrl: data.file ? "uploading..." : "",
  fileName: data.file?.name || "",
  isAudio,
  isVideo,
  audioDuration: isAudio ? data.audioDuration || 0 : 0,
  pending: true,
  createdAt: new Date().toISOString(),
  isOptimistic: true,
};


    set({ messages: [...messages, tempMessage] });

    try {
      let res;

   if (data.file instanceof File) {
  const isAudio = data.file.type.startsWith("audio/");
const isVideo = data.file?.type?.startsWith("video/");

  const form = new FormData();
  form.append("file", data.file);
  form.append("text", data.text || "");
  form.append("caption", data.caption || "");
  form.append("image", data.image || "");
  form.append("audioDuration", isAudio ? data.audioDuration || 0 : 0);
  form.append("isAudio", isAudio);
form.append("isVideo", isVideo);


  res = await axiosInstance.post(
    `/message/sendmessage/${selectedUser._id}`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
}
else {
        res = await axiosInstance.post(
          `/message/sendmessage/${selectedUser._id}`,
          { ...data, isAudio: data.isAudio || !!data.audio }
        );
      }

console.log("🎯 BACKEND RESPONSE:", res.data);
      // ✅ FIXED: Using 'res.data' instead of 'responseData'
      set((state) => ({
        messages: state.messages.map((m) =>
          m._id === tmpId
            ? {
                ...m,
                ...res.data, // This contains the real _id from MongoDB
                isOptimistic: false,
                pending: false,
              }
            : m
        ),
      }));

    } catch (err) {
      console.error("Send Error:", err);
      set((state) => ({
        messages: state.messages.filter((m) => m._id !== tmpId),
      }));
      toast.error("Failed to send message.");
    }
  },

  /* ===================== SELECT CHAT ===================== */
  setSelectedUser: (user) => {
    if (!user) {
      set({ selectedUser: null, messages: [], loadingMessages: false });
      return;
    }

    if (String(get().selectedUser?._id) === String(user._id)) return;

    set((state) => ({
      selectedUser: user,
      messages: [],
      typingUserId: null,
      users: state.users.map((u) =>
        String(u._id) === String(user._id) ? { ...u, unreadCount: 0 } : u
      ),
    }));
  },

  /* ===================== SOCKET LISTENERS ===================== */
listenForNewMessage: () => {
  const socket = authStore.getState().socket;
  if (!socket) return;

  socket.off("newMessage");
  socket.off("messagesSeen");
  socket.off("unreadCountUpdated");

  socket.on("newMessage", (newMessage) => {
    const { messages, selectedUser, users } = get();
    const loggedUser = authStore.getState().loggedUser;

    if (String(newMessage.senderId) === String(loggedUser?._id)) return;

    const isChatOpen =
      selectedUser &&
      String(newMessage.senderId) === String(selectedUser._id) &&
      String(newMessage.receiverId) === String(loggedUser?._id);

    if (isChatOpen) {
      if (!messages.some((message) => String(message._id) === String(newMessage._id))) {
        set({ messages: [...messages, newMessage] });
      }
      get().markMessagesSeen(newMessage.senderId);
      return;
    }

    set({
      users: users.map((u) =>
        String(u._id) === String(newMessage.senderId)
          ? { ...u, unreadCount: (u.unreadCount || 0) + 1 }
          : u
      ),
    });
  });

  socket.on("messagesSeen", (viewerId) => {
    const loggedUser = authStore.getState().loggedUser;
    if (!loggedUser) return;

    set((state) => ({
      messages: state.messages.map((message) => {
        if (
          String(message.senderId) !== String(loggedUser._id) ||
          String(message.receiverId) !== String(viewerId)
        ) {
          return message;
        }
        const seenBy = (message.seenBy || []).map(String);
        return seenBy.includes(String(viewerId))
          ? message
          : { ...message, seenBy: [...seenBy, String(viewerId)] };
      }),
    }));
  });

  socket.on("unreadCountUpdated", (chatUserId) => {
    set((state) => ({
      users: state.users.map((user) =>
        String(user._id) === String(chatUserId)
          ? { ...user, unreadCount: 0 }
          : user
      ),
    }));
  });
},


  /* ===================== SOCKET: TYPING ===================== */
listenForTyping: () => {
  const socket = authStore.getState().socket;
  if (!socket) return;

  socket.on("typing", ({ senderId }) => {
    set({ typingUserId: senderId });
  });

  socket.on("stopTyping", ({ senderId }) => {
    set({ typingUserId: null });
  });
},

stopListeningForTyping: () => {
  const socket = authStore.getState().socket;
  if (!socket) return;

  socket.off("typing");
  socket.off("stopTyping");
},


  /* ===================== SOCKET CLEANUP ===================== */
 stopListeningForMessages: () => {
  const socket = authStore.getState().socket;
  if (!socket) return;

  // ONLY message-related listeners
  socket.off("newMessage");
  socket.off("messageDeleted");
  socket.off("messagesSeen");
  socket.off("unreadCountUpdated");
},

}));
