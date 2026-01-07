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
//   forwardMessage: null,
//   call: null, // { from, type }
// inCall: false,
// setForwardMessage: (msg) => set({ forwardMessage: msg }),
// clearForwardMessage: () => set({ forwardMessage: null }),
// /* ===================== CALL ===================== */
// setIncomingCall: (call) => set({ call }),
// clearCall: () => set({ call: null, inCall: false }),

// startCall: () => set({ inCall: true }),
// endCall: () => set({ inCall: false, call: null }),

//   /* ===================== USERS ===================== */
//   getUsers: async () => {
//     try {
//       const res = await axiosInstance.get("/message/users");
//       set({ users: res.data });
//     } catch {
//       toast.error("Failed to fetch users.");
//     }
//   },


// forwardToUser: async (receiverId, message) => {
//   try {
//     const payload = {
//       text: message.text || "",
//       image: message.image || "",
//       audio: message.audio || "",
//       audioDuration: message.audioDuration || 0,
//       fileUrl: message.fileUrl || "",
//       fileName: message.fileName || "",
//       fileType: message.fileType || "",
//       caption: message.caption || "",
//       isForwarded: true,
//     };

//     const res = await axiosInstance.post(
//       `/message/sendmessage/${receiverId}`,
//       payload
//     );

//     // optional: add immediately to UI if chat is open
//     // set((state) => ({ messages: [...state.messages, res.data] }));
//   } catch (err) {
//     console.error("Forward message failed", err);
//   }
// },


//   /* ===================== GET MESSAGES ===================== */
//   getMessages: async () => {
//     const { selectedUser } = get();
//     if (!selectedUser) return;

//     set({ loadingMessages: true });
//     try {
//       const res = await axiosInstance.get(
//         `/message/getmessages/${selectedUser._id}`
//       );
//      set((state) => ({
//   messages: res.data
// }));
// console.log("Fetched messages:", res.data);


//     } catch {
//       toast.error("Failed to fetch messages.");
//     } finally {
//       set({ loadingMessages: false });
//     }
//   },

//   /* ===================== SEND MESSAGE ===================== */
//   sendMessage: async (data) => {
//     const { selectedUser, messages } = get();
//     if (!selectedUser) return;

//     const loggedUser = authStore.getState().loggedUser;
//     const tmpId = uuid();

//     // Inside sendMessage: async (data) => ...
// const tempMessage = {
//   _id: tmpId,
//   senderId: loggedUser._id,
//   receiverId: selectedUser._id,
//   text: data.text || "",
//   image: data.image || "",
//   // Use a local blob URL for the optimistic update so it plays instantly
//   fileUrl: data.file instanceof File ? URL.createObjectURL(data.file) : "", 
//   audioDuration: data.audioDuration || 0,
//   isAudio: data.isAudio || false, // Use the flag we sent
//   pending: true,
//   createdAt: new Date().toISOString(),
//   isOptimistic: true,
  
// };

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
//   messages: get().messages.map((m) =>
//     m._id === tmpId
//       ? {
//     ...m,               // keep optimistic data
//     ...res.data,        // overwrite only what backend sends
//     fileUrl: res.data.fileUrl || m.fileUrl,
//     isAudio: res.data.isAudio ?? m.isAudio,
//     audioDuration: res.data.audioDuration ?? m.audioDuration,
//     isOptimistic: false,
//   }

//       : m
//   ),
// });

//     } catch (err) {
//       console.error(err);
//       set({
//         messages: get().messages.filter((m) => m._id !== tmpId),
//       });
//       toast.error("Failed to send message.");
//     }
//   },

//   /* ===================== SELECT CHAT ===================== */
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

//   /* ===================== SOCKET: MESSAGES ===================== */
//   listenForNewMessage: () => {
//     const socket = authStore.getState().socket;
//     if (!socket) return;

//     /* NEW MESSAGE */
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
//         newMessage.seenBy = [
//           ...(newMessage.seenBy || []),
//           loggedUser._id,
//         ];
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

//     /* SEEN */
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

//     /* ✅ DELETE FOR EVERYONE (REAL TIME) */
//     socket.on("messageDeleted", (updatedMessage) => {
//       set((state) => ({
//         messages: state.messages.map((m) =>
//           m._id === updatedMessage._id ? updatedMessage : m
//         ),
//       }));
//     });
//     /* ===================== CALL SOCKETS ===================== */
// socket.on("call:incoming", ({ from, type }) => {
//   console.log("📞 Incoming call from", from, type);
//   set({ call: { from, type } });
// });

// socket.on("call:accepted", () => {
//   console.log("✅ Call accepted");
//   set({ inCall: true });
// });

// socket.on("call:rejected", () => {
//   console.log("❌ Call rejected");
//   set({ call: null, inCall: false });
// });

// socket.on("call:ended", () => {
//   console.log("📴 Call ended");
//   set({ call: null, inCall: false });
// });

//   },

//   stopListeningForMessages: () => {
//     const socket = authStore.getState().socket;
//     if (!socket) return;

//     socket.off("newMessage");
//     socket.off("messagesSeen");
//     socket.off("messageDeleted"); // ✅ important
//   },

//   /* ===================== SOCKET: TYPING ===================== */
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
      fileUrl:"",
      audioDuration: data.audioDuration || 0,
      isAudio: data.isAudio || false,
      pending: true,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
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
        form.append("isAudio", "true"); 

        res = await axiosInstance.post(
          `/message/sendmessage/${selectedUser._id}`,
          form,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
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
      set({ selectedUser: null, messages: [] });
      return;
    }

    const loggedUser = authStore.getState().loggedUser;
    const socket = authStore.getState().socket;

    set((state) => ({
      selectedUser: user,
      // messages: [],
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

  /* ===================== SOCKET LISTENERS ===================== */
  listenForNewMessage: () => {
    const socket = authStore.getState().socket;
    if (!socket) return;

    /* ---- CHAT ---- */
    socket.on("newMessage", (newMessage) => {
      const { messages, selectedUser } = get();
      const loggedUser = authStore.getState().loggedUser;
if (newMessage.senderId === loggedUser._id) return;
      const isChatOpen =
        selectedUser &&
        ((newMessage.senderId === selectedUser._id &&
          newMessage.receiverId === loggedUser._id) ||
          (newMessage.receiverId === selectedUser._id &&
            newMessage.senderId === loggedUser._id));

      if (isChatOpen) {
        set({ messages: [...messages, newMessage] });
      }
    });

    socket.on("messageDeleted", (updatedMessage) => {
      set((state) => ({
        messages: state.messages.map((m) =>
          m._id === updatedMessage._id ? updatedMessage : m
        ),
      }));
    });

    /* ---- CALL ---- */
    socket.on("call:incoming", ({ from, type }) => {
      console.log("📞 Incoming call", from, type);
      set({ call: { from, type } });
    });

    socket.on("call:accepted", () => {
      console.log("✅ Call accepted");
      set({ inCall: true });
    });

    socket.on("call:rejected", () => {
      console.log("❌ Call rejected");
      set({ call: null, inCall: false });
    });

    socket.on("call:ended", () => {
      console.log("📴 Call ended");
      set({ call: null, inCall: false });
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

    socket.off("newMessage");
    socket.off("messageDeleted");

    socket.off("call:incoming");
    socket.off("call:accepted");
    socket.off("call:rejected");
    socket.off("call:ended");
  },
}));
