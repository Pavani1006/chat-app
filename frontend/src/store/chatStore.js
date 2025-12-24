// // store/chatStore.js
// import { create } from "zustand";
// import toast from "react-hot-toast";
// import { axiosInstance } from "../lib/axios";
// import { authStore } from "./authStore";
// import { v4 as uuid } from "uuid";

// export const chatStore = create((set, get) => ({
//   users: [],
//   messages: [],
//   selectedUser: null,
//   typingUserId: null,
//   loadingMessages: false,

//   /* -------------------- USERS -------------------- */
//   getUsers: async () => {
//     try {
//       const res = await axiosInstance.get("/message/users");
//       set({ users: res.data });
//     } catch {
//       toast.error("Failed to fetch users.");
//     }
//   },

//   /* -------------------- MESSAGES -------------------- */
//  /* -------------------- MESSAGES -------------------- */
//   getMessages: async () => {
//     const { selectedUser } = get();
//     if (!selectedUser) return;

//     set({ loadingMessages: true });
//     try {
//       const res = await axiosInstance.get(`/message/getmessages/${selectedUser._id}`);
//       set({ messages: res.data });
//     } catch (error) {
//       toast.error("Failed to fetch messages.");
//     } finally {
//       // This "finally" block ensures loading stops no matter what
//       set({ loadingMessages: false });
//     }
//   },

//   /* -------------------- SEND MESSAGE -------------------- */
//   sendMessage: async (data) => {
//     const { selectedUser, messages } = get();
//     if (!selectedUser) return;

//     const loggedUser = authStore.getState().loggedUser;

//     const tmpId = uuid();
//     const tempMessage = {
//       _id: tmpId,
//       senderId: loggedUser._id,
//       receiverId: selectedUser._id,
//       text: data.text || "",
//       image: data.image || "",
//       audio: data.audio || "",
//       audioDuration: data.audioDuration || 0,
//       caption: data.caption || "",
//       fileName: data.file?.name || "",
//       fileUrl: data.file ? "uploading..." : "",
//       pending: true,
//       seenBy: [loggedUser._id],
//       createdAt: new Date().toISOString(),
//     };

//     set({ messages: [...messages, tempMessage] });

//     try {
//       let res;

//       if (data.file instanceof File) {
//         const form = new FormData();
//         form.append("file", data.file);
//         form.append("text", data.text || "");
//         form.append("caption", data.caption || "");
//         form.append("image", data.image || "");
//         form.append("audio", data.audio || "");
//         form.append("audioDuration", data.audioDuration || 0);


//         res = await axiosInstance.post(
//           `/message/sendmessage/${selectedUser._id}`,
//           form,
//           { headers: { "Content-Type": "multipart/form-data" } }
//         );
//       } else {
//         res = await axiosInstance.post(
//           `/message/sendmessage/${selectedUser._id}`,
//           data
//         );
//       }

//       set({
//         messages: get().messages.map((m) =>
//           m._id === tmpId ? res.data : m
//         ),
//       });
//     } catch (err) {
//       console.error(err);
//       set({
//         messages: get().messages.filter((m) => m._id !== tmpId),
//       });
//       toast.error("Failed to send message.");
//     }
//   },

//   /* -------------------- SELECT CHAT -------------------- */
//   setSelectedUser: (user) => {
//     if (!user) {
//       set({ selectedUser: null, messages: [] });
//       return;
//     }

//     const loggedUser = authStore.getState().loggedUser;
//     const socket = authStore.getState().socket;

//     set((state) => ({
//       selectedUser: user,
//       messages: [],
//       typingUserId: null,
//       users: state.users.map((u) =>
//         u._id === user._id ? { ...u, unreadCount: 0 } : u
//       ),
//     }));

//     get().getMessages().then(() => {
//       axiosInstance.put(`/message/mark-seen/${user._id}`).catch(() => {});
//       socket?.emit("markSeen", {
//         userId: loggedUser._id,
//         chatUserId: user._id,
//       });
//     });
//   },

//   /* -------------------- SOCKET: MESSAGES -------------------- */
//   listenForNewMessage: () => {
//     const socket = authStore.getState().socket;
//     if (!socket) return;

//     socket.on("newMessage", (newMessage) => {
//       const { messages, selectedUser, users } = get();
//       const loggedUser = authStore.getState().loggedUser;

//       const isChatOpen =
//         selectedUser &&
//         ((newMessage.senderId === selectedUser._id &&
//           newMessage.receiverId === loggedUser._id) ||
//           (newMessage.receiverId === selectedUser._id &&
//             newMessage.senderId === loggedUser._id));

//       if (isChatOpen) {
//         newMessage.seenBy = [...(newMessage.seenBy || []), loggedUser._id];
//         set({ messages: [...messages, newMessage] });
//         return;
//       }

//       const updatedUsers = users.map((u) =>
//         u._id === newMessage.senderId
//           ? { ...u, unreadCount: (u.unreadCount || 0) + 1 }
//           : u
//       );

//       set({ users: updatedUsers });
//     });

//     socket.on("messagesSeen", (viewerId) => {
//       const loggedUser = authStore.getState().loggedUser;
//       const { selectedUser, messages } = get();

//       if (selectedUser && viewerId === selectedUser._id) {
//         set({
//           messages: messages.map((m) =>
//             m.senderId === loggedUser._id
//               ? {
//                   ...m,
//                   seenBy: [...new Set([...(m.seenBy || []), viewerId])],
//                 }
//               : m
//           ),
//         });
//       }
//     });
//   },

//   stopListeningForMessages: () => {
//     const socket = authStore.getState().socket;
//     if (!socket) return;
//     socket.off("newMessage");
//     socket.off("messagesSeen");
//   },

//   /* -------------------- SOCKET: TYPING -------------------- */
//   listenForTyping: () => {
//     const socket = authStore.getState().socket;
//     if (!socket) return;

//     socket.on("typing", ({ senderId }) => {
//       set({ typingUserId: senderId });
//     });

//     socket.on("stopTyping", ({ senderId }) => {
//       const { typingUserId } = get();
//       if (typingUserId === senderId) {
//         set({ typingUserId: null });
//       }
//     });
//   },

//   stopListeningForTyping: () => {
//     const socket = authStore.getState().socket;
//     if (!socket) return;
//     socket.off("typing");
//     socket.off("stopTyping");
//   },
// }));


import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { authStore } from "./authStore";
import { v4 as uuid } from "uuid";

export const chatStore = create((set, get) => ({
  users: [],
  messages: [],
  selectedUser: null,
  typingUserId: null,
  loadingMessages: false,

  /* ===================== USERS ===================== */
  getUsers: async () => {
    try {
      const res = await axiosInstance.get("/message/users");
      set({ users: res.data });
    } catch {
      toast.error("Failed to fetch users.");
    }
  },

  /* ===================== GET MESSAGES ===================== */
  getMessages: async () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    set({ loadingMessages: true });
    try {
      const res = await axiosInstance.get(
        `/message/getmessages/${selectedUser._id}`
      );
      set({ messages: res.data });
    } catch {
      toast.error("Failed to fetch messages.");
    } finally {
      set({ loadingMessages: false });
    }
  },

  /* ===================== SEND MESSAGE ===================== */
  sendMessage: async (data) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) return;

    const loggedUser = authStore.getState().loggedUser;
    const tmpId = uuid();

    const tempMessage = {
      _id: tmpId,
      senderId: loggedUser._id,
      receiverId: selectedUser._id,
      text: data.text || "",
      image: data.image || "",
      audio: data.audio || "",
      audioDuration: data.audioDuration || 0,
      caption: data.caption || "",
      fileName: data.file?.name || "",
      fileUrl: data.file ? "uploading..." : "",
      pending: true,
      seenBy: [loggedUser._id],
      createdAt: new Date().toISOString(),
    };

    set({ messages: [...messages, tempMessage] });

    try {
      let res;

      if (data.file instanceof File) {
        const form = new FormData();
        form.append("file", data.file);
        form.append("text", data.text || "");
        form.append("caption", data.caption || "");
        form.append("image", data.image || "");
        form.append("audio", data.audio || "");
        form.append("audioDuration", data.audioDuration || 0);

        res = await axiosInstance.post(
          `/message/sendmessage/${selectedUser._id}`,
          form,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        res = await axiosInstance.post(
          `/message/sendmessage/${selectedUser._id}`,
          data
        );
      }

      set({
        messages: get().messages.map((m) =>
          m._id === tmpId ? res.data : m
        ),
      });
    } catch (err) {
      console.error(err);
      set({
        messages: get().messages.filter((m) => m._id !== tmpId),
      });
      toast.error("Failed to send message.");
    }
  },

  /* ===================== SELECT CHAT ===================== */
  setSelectedUser: (user) => {
    if (!user) {
      set({ selectedUser: null, messages: [] });
      return;
    }

    const loggedUser = authStore.getState().loggedUser;
    const socket = authStore.getState().socket;

    set((state) => ({
      selectedUser: user,
      messages: [],
      typingUserId: null,
      users: state.users.map((u) =>
        u._id === user._id ? { ...u, unreadCount: 0 } : u
      ),
    }));

    get().getMessages().then(() => {
      axiosInstance.put(`/message/mark-seen/${user._id}`).catch(() => {});
      socket?.emit("markSeen", {
        userId: loggedUser._id,
        chatUserId: user._id,
      });
    });
  },

  /* ===================== SOCKET: MESSAGES ===================== */
  listenForNewMessage: () => {
    const socket = authStore.getState().socket;
    if (!socket) return;

    /* NEW MESSAGE */
    socket.on("newMessage", (newMessage) => {
      const { messages, selectedUser, users } = get();
      const loggedUser = authStore.getState().loggedUser;

      const isChatOpen =
        selectedUser &&
        ((newMessage.senderId === selectedUser._id &&
          newMessage.receiverId === loggedUser._id) ||
          (newMessage.receiverId === selectedUser._id &&
            newMessage.senderId === loggedUser._id));

      if (isChatOpen) {
        newMessage.seenBy = [
          ...(newMessage.seenBy || []),
          loggedUser._id,
        ];
        set({ messages: [...messages, newMessage] });
        return;
      }

      const updatedUsers = users.map((u) =>
        u._id === newMessage.senderId
          ? { ...u, unreadCount: (u.unreadCount || 0) + 1 }
          : u
      );

      set({ users: updatedUsers });
    });

    /* SEEN */
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

    /* ✅ DELETE FOR EVERYONE (REAL TIME) */
    socket.on("messageDeleted", (updatedMessage) => {
      set((state) => ({
        messages: state.messages.map((m) =>
          m._id === updatedMessage._id ? updatedMessage : m
        ),
      }));
    });
  },

  stopListeningForMessages: () => {
    const socket = authStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.off("messagesSeen");
    socket.off("messageDeleted"); // ✅ important
  },

  /* ===================== SOCKET: TYPING ===================== */
  listenForTyping: () => {
    const socket = authStore.getState().socket;
    if (!socket) return;

    socket.on("typing", ({ senderId }) => {
      set({ typingUserId: senderId });
    });

    socket.on("stopTyping", ({ senderId }) => {
      const { typingUserId } = get();
      if (typingUserId === senderId) {
        set({ typingUserId: null });
      }
    });
  },

  stopListeningForTyping: () => {
    const socket = authStore.getState().socket;
    if (!socket) return;

    socket.off("typing");
    socket.off("stopTyping");
  },
}));
