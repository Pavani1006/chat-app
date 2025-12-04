import { MdImage } from "react-icons/md";
import { LuSendHorizontal } from "react-icons/lu";
import { IoClose } from "react-icons/io5";
import { chatStore } from "../store/chatStore";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

const MessageInput = () => {
  const { sendMessage, selectedUser } = chatStore();
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);

  const fileInputRef = useRef(null);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);

  const addEmoji = (emoji) => setText((prev) => prev + emoji.native);

  // close emoji picker when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // clear text & image when switching user
  useEffect(() => {
    setText("");
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [selectedUser]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => setImage(reader.result);
  };

  // SMART SEND logic → works for text OR image + caption
  const handleSendMessage = async () => {
    if (!text.trim() && !image) {
      toast.error("Empty message cannot be sent!");
      return;
    }

    await sendMessage({
      text: image ? "" : text.trim(),       // text only if no image
      image,
      caption: image ? text.trim() : "",    // caption only if image exists
    });

    setText("");
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setShowPicker(false);
  };

  // ENTER fix — don't auto-send while preview modal open
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.shiftKey) return;
    if (e.key === "Enter") {
      e.preventDefault();
      if (image) return;
      handleSendMessage();
    }
  };

  return (
    <>
      {/* === IMAGE PREVIEW MODAL === */}
      {image && (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-4">

          {/* Close */}
          <button
            onClick={() => setImage(null)}
            className="absolute top-4 right-4 text-white text-3xl hover:scale-110 transition"
          >
            <IoClose />
          </button>

          {/* Preview image */}
          <img
            src={image}
            alt="preview"
            className="max-h-[38vh] max-w-[35vw] rounded-lg shadow-lg border border-white/20 object-cover"
          />

          {/* Caption input */}
          <input
            type="text"
            placeholder="Add a caption..."
            className="w-[55%] max-w-[20vw] mt-2 px-3 py-3 text-white bg-black/30 border border-white/30 rounded-md outline-none text-sm"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {/* Premium Send button */}
          <button
            onClick={handleSendMessage}
            className="mt-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 text-white text-sm font-semibold px-6 py-2 rounded-xl shadow-lg shadow-black/30 active:scale-95 transition"
          >
            Send
          </button>
        </div>
      )}

      {/* === MAIN INPUT BAR === */}
      <div className="bg-base-200 sticky bottom-2 pb-2">
        <div className="flex items-center gap-2 p-1 md:p-2 w-full relative">

          {/* Emoji */}
          <button
            type="button"
            onClick={() => setShowPicker((p) => !p)}
            className="text-2xl hover:scale-110 transition"
          >
            😊
          </button>

          {showPicker && (
            <div ref={pickerRef} className="absolute bottom-16 left-2 z-[999]">
              <Picker data={data} theme="dark" onEmojiSelect={addEmoji} />
            </div>
          )}

          {/* Upload Image */}
          <button type="button" onClick={() => fileInputRef.current.click()}>
            <MdImage className="size-11 text-primary" />
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImage}
          />

          {/* Text input */}
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 p-2 bg-slate-700 text-white rounded-lg outline-none"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          {/* Send button */}
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!text.trim() && !image}
            className="p-2 md:p-3 bg-primary text-white rounded-lg hover:bg-primary-focus shadow-xl disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <LuSendHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
};

export default MessageInput;
