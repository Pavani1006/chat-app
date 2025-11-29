import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
     profilepic: {
      type: String,
      default:
        "/avatar.avif",
    },
    profilepicPublicId: {      // ⚠️ NEW field for Cloudinary delete
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);
export default mongoose.model("User", userSchema);
