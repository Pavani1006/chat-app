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

const MessageInput = () => {
  const { sendMessage, selectedUser } = chatStore();

  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  const [showRecordingUI, setShowRecordingUI] = useState(false);
  const [paused, setPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const timerRef = useRef(null);

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
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    setText("");
    setImage(null);
    setShowAttachmentMenu(false);
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
  const startRecording = async () => {
    try {
      setShowRecordingUI(true);
      setPaused(false);
      setRecordingTime(0);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `voice_${Date.now()}.webm`, {
          type: "audio/webm",
        });

        resetRecordingState();

        sendMessage({
          file,
          text: "",
          caption: "",
          image: "",
          audio: "",
        });
      };

      recorder.start();
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch {
      toast.error("Microphone blocked!");
    }
  };

  const pauseRecording = () => {
    try {
      mediaRecorderRef.current?.pause();
    } catch {}
    setPaused(true);
    clearInterval(timerRef.current);
  };

  const resumeRecording = () => {
    try {
      mediaRecorderRef.current?.resume();
    } catch {}
    setPaused(false);
    timerRef.current = setInterval(() => {
      setRecordingTime((t) => t + 1);
    }, 1000);
  };

  const deleteRecording = () => {
    audioChunksRef.current = [];
    resetRecordingState();
  };

  const sendAudio = () => {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  /* -------------------- SEND TEXT / IMAGE -------------------- */
  const handleSendMessage = () => {
    if (!text.trim() && !image) return;

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
  const handleDocumentPick = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    sendMessage({
      file,
      text: "",
      caption: file.name,
      image: "",
      audio: "",
    });

    toast.success("Document sending...");
    setShowAttachmentMenu(false);
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

      {/* AUDIO RECORDING OVERLAY */}
      {/* AUDIO RECORDING OVERLAY */}
{showRecordingUI && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md">
    <div className="relative w-[320px] bg-[#0f1220] rounded-3xl px-6 py-6 shadow-2xl border border-white/10 flex flex-col items-center gap-5">
{/* Close (Cancel Recording) */}
<button
  onClick={deleteRecording}
  className="absolute top-3 right-3 w-8 h-8 rounded-full
             bg-white/10 hover:bg-red-500/20
             flex items-center justify-center transition"
>
  <span className="text-white text-sm font-bold">×</span>
</button>

      {/* Recording Indicator */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg">
          <FaMicrophone className="text-white text-2xl" />
        </div>
      </div>

      {/* Timer */}
      <div className="text-lg font-mono tracking-widest text-pink-200">
        {formatTime(recordingTime)}
      </div>

      {/* Status */}
      <div className="text-xs text-gray-400">
        {paused ? "Recording paused" : "Recording…"}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between w-full mt-2">

        {/* Delete */}
        <button
          onClick={deleteRecording}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-red-500/20 flex items-center justify-center transition"
        >
          <IoTrashBin className="text-red-400 text-lg" />
        </button>

        {/* Pause / Resume */}
        {!paused ? (
          <button
            onClick={pauseRecording}
            className="w-14 h-14 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition"
          >
            <FaPause className="text-white text-xl" />
          </button>
        ) : (
          <button
            onClick={resumeRecording}
            className="w-14 h-14 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition"
          >
            <FaPlay className="text-white text-xl" />
          </button>
        )}

        {/* Send */}
        <button
          onClick={sendAudio}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 hover:scale-105 flex items-center justify-center transition"
        >
          <LuSendHorizontal className="text-white text-lg" />
        </button>

      </div>
    </div>
  </div>
)}


      {/* MAIN INPUT */}
      <div className="bg-base-200 sticky bottom-2 pb-2">
        <div className="flex items-center gap-2 p-2 w-full max-w-[98%] mx-auto relative">
          <div className="flex flex-1 items-center bg-slate-700 rounded-2xl px-3 py-2 shadow-inner">
            {/* ATTACHMENTS */}
            <div ref={attachmentRef} className="relative flex items-center">
              <button
                onClick={() => setShowAttachmentMenu((p) => !p)}
                className="text-2xl mr-1 text-white p-1 hover:bg-white/10 rounded-full"
              >
                <FiPlus />
              </button>

              {showAttachmentMenu && (
                <div className="absolute bottom-16 left-2 z-[999] bg-[#121827] text-white rounded-xl shadow-xl p-3 space-y-2 w-40 border border-white/30">
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-white/10"
                  >
                    <MdImage size={24} /> Image
                  </button>
                  <button
                    onClick={() => docInputRef.current.click()}
                    className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-white/10"
                  >
                    <HiDocumentText size={24} /> Document
                  </button>
                  <button
                    onClick={() => videoInputRef.current.click()}
                    className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-white/10"
                  >
                    <FaVideo size={20} /> Video
                  </button>
                </div>
              )}
            </div>

            {/* EMOJI */}
            <div ref={pickerRef} className="relative flex items-center">
              <button
                onClick={() => setShowPicker((p) => !p)}
                className="text-white p-1 mr-1.5 hover:bg-white/10 rounded-full"
              >
                <BsEmojiSmile size={20} />
              </button>

              {showPicker && (
                <div className="absolute bottom-16 left-0 z-[999]">
                  <Picker
                    data={data}
                    theme="dark"
                    onEmojiSelect={(e) =>
                      setText((t) => t + e.native)
                    }
                  />
                </div>
              )}
            </div>

            {/* TEXT INPUT */}
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 px-2 bg-transparent text-white outline-none text-base"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* FILE INPUTS */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImagePick}
          />
          <input
            type="file"
            ref={docInputRef}
            className="hidden"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
            onChange={handleDocumentPick}
          />
          <input
            type="file"
            ref={videoInputRef}
            className="hidden"
            accept="video/*"
            onChange={handleVideoPick}
          />

          {/* SEND / MIC */}
          {text || image ? (
            <button
              onClick={handleSendMessage}
              className="w-12 h-12 flex justify-center items-center bg-slate-700 text-white rounded-full shadow-md active:scale-95 transition"
            >
              <LuSendHorizontal className="text-2xl" />
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="w-12 h-12 flex justify-center items-center bg-slate-700 text-white rounded-full shadow-md active:scale-95 transition"
            >
              <FaMicrophone className="text-xl" />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default MessageInput;
