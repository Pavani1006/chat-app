// components/MessageInput.jsx
import { MdImage } from "react-icons/md";
import { LuSendHorizontal } from "react-icons/lu";
import { chatStore } from "../store/chatStore";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

import { FaMicrophone, FaPause, FaPlay } from "react-icons/fa";
import { IoTrashBin } from "react-icons/io5";

const MessageInput = () => {
  const { sendMessage, selectedUser } = chatStore();

  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  // 🎤 Recording States
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);
  const documentRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    setText("");
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (documentRef.current) documentRef.current.value = "";
  }, [selectedUser]);

  const formatTime = (sec) =>
    `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(
      2,
      "0"
    )}`;

  const resetRecordingState = () => {
    clearInterval(timerRef.current);
    setRecording(false);
    setPaused(false);
    setRecordingTime(0);
    audioChunksRef.current = [];

    if (mediaRecorderRef.current?.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
    mediaRecorderRef.current = null;
  };

  const startRecording = async () => {
    try {
      setRecording(true);
      setPaused(false);
      setRecordingTime(0);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.start();
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch {
      toast.error("Microphone blocked!");
      setRecording(false);
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
    timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
  };

  const deleteRecording = () => {
    mediaRecorderRef.current?.stop();
    resetRecordingState();
  };

  const sendAudio = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    clearInterval(timerRef.current);

    recorder.onstop = () => {
      if (!audioChunksRef.current.length) {
        toast.error("No audio recorded");
        resetRecordingState();
        return;
      }

      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64Audio = reader.result;

        resetRecordingState();
        sendMessage({
          text: "",
          image: "",
          caption: "",
          audio: base64Audio,
        });
      };

      reader.readAsDataURL(blob);
    };

    recorder.stop();
  };

  const handleSendMessage = () => {
    if (image && !text.trim())
      return toast.error("Please add a caption before sending!");
    if (!text.trim() && !image) return;

    sendMessage({
      text: image ? "" : text.trim(),
      image,
      caption: image ? text.trim() : "",
      audio: "",
    });

    setText("");
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImagePick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => setImage(reader.result);
  };

const handleDocumentPick = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  sendMessage(file); // send file directly
  toast.success("Document uploading...");
};


  return (
    <>
      {/* IMAGE PREVIEW UI */}
      {image && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-md animate-fadeIn px-3">
          <button
            onClick={() => setImage(null)}
            className="absolute top-4 right-4 text-white bg-white/20 hover:bg-white/35 size-9 flex items-center justify-center rounded-full text-lg font-bold transition backdrop-blur-sm border border-white/30"
          >
            ✕
          </button>

          <div className="flex flex-col items-center max-w-[350px] w-full">
            <img
              src={image}
              className="max-h-[72vh] w-auto rounded-xl shadow-2xl border border-white/20 object-contain"
            />

            <input
              type="text"
              placeholder="Caption..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={60}
              className="w-[85%] mt-3 p-2 text-white bg-black/25 border border-white/25 rounded-md outline-none placeholder:text-gray-300 text-[13px]"
            />

            <button
              onClick={handleSendMessage}
              className="w-[85%] mt-3 py-2 text-white bg-gradient-to-r from-blue-500 to-indigo-600 text-sm rounded-md font-semibold shadow-md hover:scale-[1.02] transition"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* MAIN INPUT BAR */}
      <div className="bg-base-200 sticky bottom-2 pb-2">
        <div className="flex items-center gap-2 p-2 w-full relative">
          {recording ? (
            <div className="flex items-center justify-center flex-1">
              <div className="relative">
                <div className="absolute inset-0 rounded-full animate-pulse bg-red-500/20 scale-[2.2] blur-md"></div>

                <div className="flex items-center gap-4 bg-slate-900 text-white px-5 py-2 rounded-full shadow-xl relative">
                  <span className="text-lg font-semibold">
                    ● {formatTime(recordingTime)}
                  </span>

                  {!paused ? (
                    <button onClick={pauseRecording} className="text-xl">
                      <FaPause />
                    </button>
                  ) : (
                    <button onClick={resumeRecording} className="text-xl">
                      <FaPlay />
                    </button>
                  )}

                  <button onClick={deleteRecording} className="text-2xl">
                    <IoTrashBin />
                  </button>

                  {paused && (
                    <button
                      onClick={sendAudio}
                      className="text-[#00E5FF] text-3xl ml-auto"
                    >
                      <LuSendHorizontal />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                className="text-2xl"
                onClick={() => setShowPicker((p) => !p)}
              >
                😊
              </button>

              {showPicker && (
                <div className="absolute bottom-20 left-2 z-[999]">
                  <Picker
                    data={data}
                    theme="dark"
                    onEmojiSelect={(emoji) =>
                      setText((prev) => prev + emoji.native)
                    }
                  />
                </div>
              )}

              {/* IMAGE PICK */}
              <button onClick={() => fileInputRef.current.click()}>
                <MdImage className="text-primary size-8" />
              </button>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImagePick}
              />

              {/* DOCUMENT PICK */}
              <button onClick={() => documentRef.current.click()} className="text-2xl">
                📄
              </button>
              <input
                type="file"
                ref={documentRef}
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                onChange={handleDocumentPick}
              />

              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 p-2 bg-slate-700 text-white rounded-lg outline-none"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />

              {text.trim() || image ? (
                <button
                  onClick={handleSendMessage}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-700 border border-slate-500 text-white shadow-md"
                >
                  <LuSendHorizontal className="text-xl" />
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  className="w-12 h-12 flex items-center justify-center bg-slate-700 text-white rounded-full shadow-md"
                >
                  <FaMicrophone className="text-xl" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MessageInput;
