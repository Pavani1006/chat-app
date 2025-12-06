import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    text: { type: String, default: "" },
    image: { type: String, default: "" },
    caption: { type: String, default: "" },
    audio: { type: String, default: "" },

    // store BOTH file URL and filename
    document: {
      url: { type: String, default: "" },
      name: { type: String, default: "" },
    },

    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
