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

//     text: {
//       type: String,
//       default: "",
//     },

//     image: {
//       type: String,
//       default: "",
//     },

//     // 🔥 Instagram-style message status: "delivered" → "seen"
//     status: {
//       type: String,
//       enum: ["delivered", "seen"],
//       default: "delivered",
//     },
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
    image: { type: String, default: "" },

    // ⭐ this is the only field used for Delivered / Seen
    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
