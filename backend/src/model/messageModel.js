// // models/messageModel.js
// import mongoose from "mongoose";

// const messageSchema = new mongoose.Schema(
//   {
//     senderId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     receiverId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     text: { type: String, default: "" },

//     // 📸 Image message
//     image: { type: String, default: "" },
//     caption: { type: String, default: "" },

//     // 🎤 Audio message
//     audio: { type: String, default: "" },
    
// audioDuration: { type: Number, default: 0 },
// isAudio: { type: Boolean, default: false },

//     // 📄 File message (PDF/docs)
//     fileUrl: { type: String, default: "" }, // localhost URL
//     fileName: { type: String, default: "" }, // original file name
//     fileType: { type: String, default: "" }, // pdf / doc / ppt etc.
// isForwarded: {
//   type: Boolean,
//   default: false,
// },
//     // 👁️ Seen status
//     seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//      // ✅ DELETE FEATURE
//     isDeletedForEveryone: { type: Boolean, default: false },
//     deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Message", messageSchema);


import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: { type: String, default: "" },

    // 🔔 MESSAGE TYPE
    messageType: {
      type: String,
      enum: ["text", "image", "audio", "file", "missed_call"],
      default: "text",
    },

    // 📞 CALL TYPE
    callType: {
      type: String,
      enum: ["audio", "video", ""],
      default: "",
    },

    image: { type: String, default: "" },
    caption: { type: String, default: "" },

    audio: { type: String, default: "" },
    audioDuration: { type: Number, default: 0 },
    isAudio: { type: Boolean, default: false },

    fileUrl: { type: String, default: "" },
    fileName: { type: String, default: "" },
    fileType: { type: String, default: "" },

    isForwarded: { type: Boolean, default: false },

    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    isDeletedForEveryone: { type: Boolean, default: false },
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
