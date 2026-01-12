import { chatStore } from "../store/chatStore";
import { authStore } from "../store/authStore";
import { FaUserCircle } from "react-icons/fa";
import { useEffect, useRef } from "react";

const IncomingCallModal = () => {
  const { call, clearCall, startCall, users } = chatStore();
  const socket = authStore.getState().socket;

  const ringtoneRef = useRef(null);

  const caller = users.find((u) => u._id === call?.from);

  /* 🔔 RINGTONE EFFECT — MUST BE ABOVE EARLY RETURN */
  useEffect(() => {
    if (call && ringtoneRef.current) {
      ringtoneRef.current.play().catch(() => {});
    }

    return () => {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }
    };
  }, [call]);

  /* ✅ EARLY RETURN AFTER ALL HOOKS */
  if (!call) return null;

  const acceptCall = () => {
    ringtoneRef.current?.pause();
    ringtoneRef.current.currentTime = 0;

    socket.emit("call:accept", { to: call.from });
    startCall();
  };

  const rejectCall = () => {
    ringtoneRef.current?.pause();
    ringtoneRef.current.currentTime = 0;

    socket.emit("call:reject", { to: call.from });
    clearCall();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]">
      <div className="bg-[#0b141a] text-white rounded-2xl p-6 w-[340px] shadow-2xl">

        {/* 🔔 RINGTONE AUDIO */}
        <audio
          ref={ringtoneRef}
          src="/ringtone.mp3"
          loop
          preload="auto"
        />

        {/* Caller Info */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
            <img
  src={
    caller?.profilepic?.trim()
      ? caller.profilepic
      : "/avatar.avif"
  }
  alt="profile"
  className="w-full h-full object-cover"
/>

          </div>

          <div className="text-center">
            <h2 className="text-xl font-semibold">
              {caller?.username || "Unknown User"}
            </h2>
            <p className="text-slate-400">
              Incoming {call.type === "video" ? "Video" : "Audio"} Call
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={acceptCall}
            className="flex-1 bg-green-500 hover:bg-green-600 py-3 rounded-full font-semibold"
          >
            Accept
          </button>

          <button
            onClick={rejectCall}
            className="flex-1 bg-red-500 hover:bg-red-600 py-3 rounded-full font-semibold"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
