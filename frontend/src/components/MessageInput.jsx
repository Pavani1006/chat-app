import { MdImage } from "react-icons/md";
import { LuSendHorizontal } from "react-icons/lu";
import { chatStore } from "../store/chatStore";
import { useState, useRef } from "react";
import toast from "react-hot-toast";   // ⬅️ added

const MessageInput = () => {
  const { sendMessage } = chatStore();
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => setImage(reader.result);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    // ⬅️ stop empty messages + toast
    if (!text.trim() && !image) {
      toast.error("Empty message can't be sent!");
      return;
    }

    try {
      await sendMessage({
        text: text.trim(),
        image: image,
      });

      setText("");
      setImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("failed to send message");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.shiftKey) return;
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="bg-base-200 sticky bottom-2">
     <div className="flex items-center gap-2 p-1 md:p-2 w-full">
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className=" rounded-lg hover:bg-base-300 flex items-center justify-center"
          title="Attach image"
        >
          <MdImage className="size-11 text-primary" />
        </button>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleImage}
        />

        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 p-2 rounded-lg md:rounded-xl focus:outline-none focus:ring-1 focus:ring-primary transition-colors text-gray-100 bg-slate-700 shadow-sm border border-base-300 text-sm md:text-base
"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyUp={handleKeyDown}
        />

        <button type="button"
          onClick={handleSendMessage}
          className="p-2 md:p-3 bg-primary text-white rounded-lg md:rounded-xl hover:bg-primary-focus flex items-center justify-center shadow-xl bg-slate-700"
        >
          <LuSendHorizontal className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
