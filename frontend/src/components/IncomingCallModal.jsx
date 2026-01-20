import { chatStore } from "../store/chatStore";
import { authStore } from "../store/authStore";
import { useEffect, useRef } from "react";

const IncomingCallModal = () => {
  const { call, clearCall, startCall, users } = chatStore();
  const loggedUser = authStore((state) => state.loggedUser); 
  const socket = authStore.getState().socket;
  const ringtoneRef = useRef(null);

  const caller = users.find((u) => u._id === call?.from);

  useEffect(() => {
    // Only play ringtone if there is an incoming call NOT from me
    if (call && call.from !== loggedUser?._id && ringtoneRef.current) {
      ringtoneRef.current.play().catch(() => {});
    }
    return () => {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }
    };
  }, [call, loggedUser?._id]);

  // Early returns must come AFTER useEffect
  if (!call) return null;
  if (call.from === loggedUser?._id) return null; // Don't show popup to the caller

  const acceptCall = () => {
    ringtoneRef.current?.pause();
    socket.emit("call:accept", { to: call.from });
    startCall();
  };

  const rejectCall = () => {
    ringtoneRef.current?.pause();
    socket.emit("call:reject", { to: call.from });
    clearCall();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]">
      <div className="bg-[#0b141a] text-white rounded-2xl p-6 w-[340px] shadow-2xl">
        <audio ref={ringtoneRef} src="/ringtone.mp3" loop preload="auto" />
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="w-24 h-24 rounded-full bg-slate-700 overflow-hidden">
            <img 
              src={caller?.profilepic?.trim() ? caller.profilepic : "/avatar.avif"} 
              className="w-full h-full object-cover" 
              alt="caller" 
            />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold">{caller?.username || "Unknown"}</h2>
            <p className="text-slate-400">Incoming {call.type} Call</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={acceptCall} className="flex-1 bg-green-500 py-3 rounded-full font-semibold">Accept</button>
          <button onClick={rejectCall} className="flex-1 bg-red-500 py-3 rounded-full font-semibold">Reject</button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;