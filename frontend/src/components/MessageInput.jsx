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

  // refs for closing popups
  const pickerRef = useRef(null);
  const attachmentRef = useRef(null);

  // close popups on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setShowPicker(false);
      if (attachmentRef.current && !attachmentRef.current.contains(e.target)) setShowAttachmentMenu(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    setText("");
    setImage(null);
    setShowAttachmentMenu(false);
  }, [selectedUser]);

  const formatTime = (sec) =>
    `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

  const resetRecordingState = () => {
    clearInterval(timerRef.current);
    setShowRecordingUI(false);
    setPaused(false);
    setRecordingTime(0);
    audioChunksRef.current = [];
    if (mediaRecorderRef.current?.stream)
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
  };

  const startRecording = async () => {
    try {
      setShowRecordingUI(true);
      setPaused(false);
      setRecordingTime(0);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => e.data.size > 0 && audioChunksRef.current.push(e.data);

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `voice_${Date.now()}.webm`, { type: "audio/webm" });
        resetRecordingState();
        sendMessage({ file, text: "", caption: "", image: "", audio: "" });
      };

      recorder.start();
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch {
      toast.error("Microphone blocked!");
    }
  };

  const pauseRecording = () => {
    try { mediaRecorderRef.current?.pause(); } catch {}
    setPaused(true);
    clearInterval(timerRef.current);
  };

  const resumeRecording = () => {
    try { mediaRecorderRef.current?.resume(); } catch {}
    setPaused(false);
    timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
  };

  const deleteRecording = () => {
    audioChunksRef.current = [];
    resetRecordingState();
  };

  const sendAudio = () => {
    if (mediaRecorderRef.current?.state !== "inactive") mediaRecorderRef.current.stop();
  };

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

  const handleImagePick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    reader.readAsDataURL(file);
    setShowAttachmentMenu(false);
  };

  const handleDocumentPick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    sendMessage({ file, text: "", caption: file.name, image: "", audio: "" });
    toast.success("Document sending...");
    setShowAttachmentMenu(false);
  };

  const handleVideoPick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    sendMessage({ file, text: "", caption: file.name, image: "", audio: "" });
    toast.success("Video sending...");
    setShowAttachmentMenu(false);
  };

  return (
    <>
      {image && (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-md flex justify-center items-center px-3">
          <button
            onClick={() => setImage(null)}
            className="absolute top-4 right-4 bg-white/20 text-white size-9 rounded-full flex justify-center items-center font-bold"
          >
            ✕
          </button>
          <div className="flex flex-col items-center max-w-[350px] w-full">
            <img src={image} className="max-h-[72vh] rounded-lg shadow-xl border border-white/30" />
            <input
              type="text"
              placeholder="Caption..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-[85%] px-2 py-2 rounded-md bg-black/30 text-white mt-3 text-sm"
              maxLength={60}
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

      {showRecordingUI && (
        <div className="fixed inset-0 z-[9999] flex justify-center items-center bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-4 bg-[#130c1c] text-pink-200 px-4 py-2 rounded-full shadow-xl border border-pink-300/20">
            <span className="text-base font-bold">● {formatTime(recordingTime)}</span>
            {!paused ? <button onClick={pauseRecording}><FaPause size={18} /></button>
                     : <button onClick={resumeRecording}><FaPlay size={18} /></button>}
            <button onClick={deleteRecording}><IoTrashBin size={20} /></button>
            <button onClick={sendAudio} className="text-cyan-300"><LuSendHorizontal size={24} /></button>
          </div>
        </div>
      )}

      <div className="bg-base-200 sticky bottom-2 pb-2">
        <div className="flex items-center gap-2 p-2 w-full max-w-[98%] mx-auto relative">
          <div className="flex flex-1 items-center bg-slate-700 rounded-2xl px-3 py-2 relative shadow-inner">

            {/* Attachment */}
            <div ref={attachmentRef} className="relative flex items-center">
              <button
                onClick={() => setShowAttachmentMenu((p) => !p)}
                className="text-3xl text-white p-1 hover:bg-white/10 rounded-full"
              >
                <FiPlus />
              </button>

              {showAttachmentMenu && (
                <div
                  className="absolute bottom-16 left-2 z-[999] bg-[#121827] text-white rounded-xl shadow-xl p-3 space-y-2 w-40 border border-white/30"
                >
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="flex items-center gap-3 w-full p-2 rounded-md transition-all hover:bg-white/10 hover:translate-x-[3px]"
                  >
                    <span className="w-8 flex justify-start items-center"><MdImage size={24} /></span>
                    Image
                  </button>

                  <button
                    onClick={() => docInputRef.current.click()}
                    className="flex items-center gap-3 w-full p-2 rounded-md transition-all hover:bg-white/10 hover:translate-x-[3px]"
                  >
                    <span className="w-8 flex justify-start items-center"><HiDocumentText size={24} /></span>
                    Document
                  </button>

                  <button
                    onClick={() => videoInputRef.current.click()}
                    className="flex items-center gap-3 w-full p-2 rounded-md transition-all hover:bg-white/10 hover:translate-x-[3px]"
                  >
                    <span className="w-8 flex justify-start items-center ml-1"><FaVideo size={20} /></span>
                    Video
                  </button>
                </div>
              )}
            </div>

            {/* Emoji */}
            <div ref={pickerRef} className="relative flex items-center">
              <button
                onClick={() => setShowPicker((p) => !p)}
                className="text-white p-1 hover:bg-white/10 rounded-full"
              >
                <BsEmojiSmile size={24} />
              </button>
              {showPicker && (
                <div className="absolute bottom-16 left-0 z-[999]">
                  <Picker data={data} theme="dark" onEmojiSelect={(e) => setText((t) => t + e.native)} />
                </div>
              )}
            </div>

            {/* Input */}
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 px-2 bg-transparent text-white outline-none text-lg"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          {/* Hidden Pickers */}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImagePick} />
          <input type="file" ref={docInputRef} className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,.zip" onChange={handleDocumentPick} />
          <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={handleVideoPick} />

          {/* Send/Mic */}
          {text || image ? (
            <button
              onClick={handleSendMessage}
              className="w-14 h-14 flex justify-center items-center bg-slate-700 text-white rounded-full shadow-md active:scale-95 transition"
            >
              <LuSendHorizontal className="text-2xl" />
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="w-14 h-14 flex justify-center items-center bg-slate-700 text-white rounded-full shadow-md active:scale-95 transition"
            >
              <FaMicrophone className="text-2xl" />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default MessageInput;
