import { useState, useRef, useEffect } from "react";
import { MdImage } from "react-icons/md";
import { LuSendHorizontal } from "react-icons/lu";
import { BsEmojiSmile } from "react-icons/bs";
import { HiDocumentText } from "react-icons/hi";
import { FaVideo, FaMicrophone, FaPause, FaPlay } from "react-icons/fa";
import { chatStore } from "../store/chatStore";
import toast from "react-hot-toast";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { IoTrashBin } from "react-icons/io5";
import { FiPlus } from "react-icons/fi";
import { authStore } from "../store/authStore";

const MessageInput = () => {
  const { sendMessage, selectedUser } = chatStore();
  const socket = authStore.getState().socket;

  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  const [showRecordingUI, setShowRecordingUI] = useState(false);
  const [paused, setPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const typingTimeoutRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordStartTimeRef = useRef(0);


  // ✅ ADDED: flag to control when audio should be sent
  const shouldSendAudioRef = useRef(false);

  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const pickerRef = useRef(null);
  const attachmentRef = useRef(null);

  /* -------------------- CLOSE POPUPS ON OUTSIDE CLICK -------------------- */
  useEffect(() => {
    const handleOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
      if (attachmentRef.current && !attachmentRef.current.contains(e.target)) {
        setShowAttachmentMenu(false);
      }
    };
   document.addEventListener("click", handleOutside);
return () => document.removeEventListener("click", handleOutside);

  }, []);

  useEffect(() => {
    setText("");
    setImage(null);
    setShowAttachmentMenu(false);
  }, [selectedUser]);

  useEffect(() => {
  socket?.emit("stopTyping", selectedUser?._id);
}, [selectedUser]);

  /* -------------------- ENTER TO SEND -------------------- */
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (sec) =>
    `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(
      sec % 60
    ).padStart(2, "0")}`;

  const resetRecordingState = () => {
    clearInterval(timerRef.current);
    setShowRecordingUI(false);
    setPaused(false);
    setRecordingTime(0);
    audioChunksRef.current = [];
    if (mediaRecorderRef.current?.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
  };

  /* -------------------- AUDIO RECORDING -------------------- */
 /* -------------------- AUDIO RECORDING FIX -------------------- */
const startRecording = async () => {
  try {
    shouldSendAudioRef.current = false;
    setShowRecordingUI(true);
    setPaused(false);
    setRecordingTime(0);
    audioChunksRef.current = [];
    recordStartTimeRef.current = Date.now();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Specify MIME type. webm is standard, but some browsers prefer mp4/aac
  const mimeType = MediaRecorder.isTypeSupported("audio/mp4")
  ? "audio/mp4"
  : "audio/webm;codecs=opus";

const recorder = new MediaRecorder(stream, { mimeType });
mediaRecorderRef.current = recorder;


    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        audioChunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
  if (!shouldSendAudioRef.current) {
    resetRecordingState();
    return;
  }

  
  // ✅ FIX: Use the actual recordingTime state for accuracy
  const finalDuration = recordingTime; 

 const blob = new Blob(audioChunksRef.current, {
  type: recorder.mimeType,
});

const ext = recorder.mimeType.includes("mp4") ? "mp4" : "webm";

const file = new File(
  [blob],
  `voice_${Date.now()}.${ext}`,
  { type: recorder.mimeType }
);


  resetRecordingState();

  sendMessage({
    file,
    text: "",
    audioDuration: finalDuration, // This sends the seconds to the server
    isAudio: true, 
  });
};

    // IMPORTANT: Collect data every 1 second (1000ms) 
    // This ensures audioChunksRef isn't empty if the stop is sudden
    recorder.start(1000); 

    timerRef.current = setInterval(() => {
      setRecordingTime((t) => t + 1);
    }, 1000);
  } catch (err) {
    console.error("Mic Error:", err);
    toast.error("Microphone blocked or not found!");
    setShowRecordingUI(false);
  }
};

  const pauseRecording = () => {
    mediaRecorderRef.current?.pause();
    setPaused(true);
    clearInterval(timerRef.current);
  };

  const resumeRecording = () => {
    mediaRecorderRef.current?.resume();
    setPaused(false);
    timerRef.current = setInterval(() => {
      setRecordingTime((t) => t + 1);
    }, 1000);
  };

  const deleteRecording = () => {
    // ✅ ADDED: block sending
    shouldSendAudioRef.current = false;
    audioChunksRef.current = [];

    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current.stop();
    } else {
      resetRecordingState();
    }
  };

  const sendAudio = () => {
    // ✅ ADDED: allow sending
    shouldSendAudioRef.current = true;
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  /* -------------------- SEND TEXT / IMAGE -------------------- */
  const handleSendMessage = () => {
    if (!text.trim() && !image) return;
    socket?.emit("stopTyping", selectedUser._id);
    sendMessage({
      text: image ? "" : text.trim(),
      image: image || "",
      caption: image ? text.trim() : "",
      audio: "",
    });

    setText("");
    setImage(null);
  };

  /* -------------------- IMAGE PICK -------------------- */
  const handleImagePick = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    reader.readAsDataURL(file);
    setShowAttachmentMenu(false);
  };

  /* -------------------- DOCUMENT PICK -------------------- */
  /* -------------------- DOCUMENT PICK -------------------- */
const handleDocumentPick = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // We send the file, but we also pass the filename explicitly 
  // so the bubble isn't empty while uploading
  sendMessage({
    file,
    text: "",
    fileName: file.name, // Ensure your sendMessage function handles this
    fileUrl: "uploading...", // This acts as a flag for the UI
    image: "",
    audio: "",
  });

  toast.success("Sending document...");
  setShowAttachmentMenu(false);
  
  // Clear the input so you can upload the same file again if needed
  e.target.value = null; 
};

  /* -------------------- VIDEO PICK -------------------- */
  const handleVideoPick = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    sendMessage({
      file,
      text: "",
      caption: file.name,
      image: "",
      audio: "",
    });

    toast.success("Video sending...");
    setShowAttachmentMenu(false);
  };

  return (
    <>
      {/* IMAGE PREVIEW OVERLAY */}
      {image && (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-md flex justify-center items-center px-3">
          <button
            onClick={() => setImage(null)}
            className="absolute top-4 right-4 bg-white/20 text-white size-9 rounded-full flex justify-center items-center font-bold"
          >
            ✕
          </button>

          <div className="flex flex-col items-center max-w-[350px] w-full">
            <img
              src={image}
              className="max-h-[72vh] rounded-lg shadow-xl border border-white/30"
              alt=""
            />

            <input
              type="text"
              placeholder="Caption..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={60}
              className="w-[85%] px-2 py-2 rounded-md bg-black/30 text-white mt-3 text-sm"
              onKeyDown={handleKeyDown}
            />

            <button
              onClick={handleSendMessage}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 w-[85%] mt-3 py-2 rounded-md text-white font-semibold"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* AUDIO RECORDING OVERLAY (UI UNCHANGED) */}
      {showRecordingUI && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="relative w-[320px] bg-[#0f1220] rounded-3xl px-6 py-6 shadow-2xl border border-white/10 flex flex-col items-center gap-5">
            <button
              onClick={deleteRecording}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-indigo-500/20 flex items-center justify-center"
            >
              ×
            </button>

            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />
<div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
 <FaMicrophone className="text-white text-2xl" />
              </div>
            </div>

            <div className="text-lg font-mono tracking-widest text-pink-200">
              {formatTime(recordingTime)}
            </div>

            <div className="text-xs text-gray-400">
              {paused ? "Recording paused" : "Recording…"}
            </div>

            <div className="flex items-center justify-between w-full mt-2">
              <button
                onClick={deleteRecording}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-red-500/20 flex items-center justify-center"
              >
                <IoTrashBin className="text-red-400 text-lg" />
              </button>

              {!paused ? (
                <button
                  onClick={pauseRecording}
                  className="w-14 h-14 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center"
                >
                  <FaPause className="text-white text-xl" />
                </button>
              ) : (
                <button
                  onClick={resumeRecording}
                  className="w-14 h-14 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center"
                >
                  <FaPlay className="text-white text-xl" />
                </button>
              )}

              <button
                onClick={sendAudio}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 hover:scale-105 transition flex items-center justify-center"

 >
                <LuSendHorizontal className="text-white text-lg" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN INPUT (UNCHANGED) */}
      <div className="bg-base-200 sticky bottom-2 pb-2">
        <div className="flex items-center gap-2 p-2 w-full max-w-[98%] mx-auto relative">
          <div className="flex flex-1 items-center bg-slate-700 rounded-2xl px-3 py-2 shadow-inner">
            <div ref={attachmentRef} className="relative flex items-center">
  <button
    onClick={() => setShowAttachmentMenu((p) => !p)}
    className="text-2xl mr-1 text-white p-1 hover:bg-white/10 rounded-full"
  >
    <FiPlus />
  </button>

  {showAttachmentMenu && (
    <div className="absolute bottom-14 left-0 z-[999] bg-[#121827] text-white rounded-xl shadow-xl p-3 space-y-2 w-40 border border-white/20">
      
      <button
        onClick={() => fileInputRef.current.click()}
        className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-white/10"
      >
        <MdImage size={22} /> Image
      </button>

      <button
        onClick={() => docInputRef.current.click()}
        className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-white/10"
      >
        <HiDocumentText size={22} /> Document
      </button>

      <button
        onClick={() => videoInputRef.current.click()}
        className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-white/10"
      >
        <FaVideo size={20} className="ml-1" /> Video
      </button>

    </div>
  )}
</div>



            <div ref={pickerRef} className="relative flex items-center">
              <button
                onClick={() => setShowPicker((p) => !p)}
                className="text-white p-1 mr-1.5 hover:bg-white/10 rounded-full"
              >
                <BsEmojiSmile size={20} />
              </button>
            </div>
            {showPicker && (
  <div className="absolute bottom-14 left-0 z-[999]">
    <Picker
  data={data}
  theme="dark"
  onEmojiSelect={(e) => {
    setText((t) => t + e.native);
    setShowPicker(false);            // close emoji picker
    setTimeout(() => {
      inputRef.current?.focus();     // focus input again
    }, 0);
  }}
/>

  </div>
)}


            <input
  ref={inputRef}
  type="text"
  placeholder="Type a message..."
  className="flex-1 px-2 bg-transparent text-white outline-none text-base"
  value={text}
  onChange={(e) => {
  setText(e.target.value);

  if (!socket || !selectedUser) return;

  socket.emit("typing", selectedUser._id);

  if (typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
  }

  typingTimeoutRef.current = setTimeout(() => {
    socket.emit("stopTyping", selectedUser._id);
  }, 1000);
}}

  onKeyDown={handleKeyDown}
/>

          </div>

          {text || image ? (
            <button
              onClick={handleSendMessage}
              className="w-12 h-12 flex justify-center items-center bg-slate-700 text-white rounded-full"
            >
              <LuSendHorizontal className="text-2xl" />
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="w-12 h-12 flex justify-center items-center bg-slate-700 text-white rounded-full"
            >
              <FaMicrophone className="text-xl" />
            </button>
          )}
          {/* HIDDEN FILE INPUTS — ADD HERE */}
<input
  type="file"
  ref={fileInputRef}
  accept="image/*"
  className="hidden"
  onChange={handleImagePick}
/>

<input
  type="file"
  ref={docInputRef}
  accept=".pdf,.doc,.docx,.ppt,.pptx"
  className="hidden"
  onChange={handleDocumentPick}
/>

<input
  type="file"
  ref={videoInputRef}
  accept="video/*"
  className="hidden"
  onChange={handleVideoPick}
/>

        </div>
      </div>
    </>
  );
};

export default MessageInput;
