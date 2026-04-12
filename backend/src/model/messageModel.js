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

    messageType: {
      type: String,
      enum: ["text", "image", "audio", "file", "missed_call"],
      default: "text",
    },

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
isVideo: {
  type: Boolean,
  default: false,
},

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
