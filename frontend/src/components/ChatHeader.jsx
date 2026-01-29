import { useEffect, useState } from "react";
import { authStore } from "../store/authStore";
import { chatStore } from "../store/chatStore";
import { RxCross2 } from "react-icons/rx";
import { FaPhoneAlt, FaVideo } from "react-icons/fa";
import toast from "react-hot-toast";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, typingUserId } = chatStore();
  const { onlineUsers, loggedUser } = authStore();
  const socket = authStore.getState().socket;

  const [isCalling, setIsCalling] = useState(false);
  const [callType, setCallType] = useState(null); 
  const [callStatus, setCallStatus] = useState("Calling..."); 

  if (!selectedUser) return null;

  const isTyping = typingUserId === selectedUser._id;
  const isUserOnline = onlineUsers.includes(selectedUser._id);

  /* ===================== CALL UI HELPER ===================== */
  const initiateCallUI = (type) => {
    setIsCalling(true);
    setCallType(type);
    setCallStatus("Calling...");

    // Switch to "Ringing..." after 2 seconds
    setTimeout(() => {
      setCallStatus("Ringing...");
    }, 2000);
  };

  /* ===================== START AUDIO CALL ===================== */
  const startAudioCall = () => {
    if (!socket || !selectedUser) return;

    if (!isUserOnline) {
      toast.error(`${selectedUser.username} is currently offline`, { duration: 3500 });
    } else {
      // Show UI only if online
      initiateCallUI("audio");
    }

    socket.emit("call:start", {
      to: selectedUser._id,
      type: "audio",
    });
  };

  /* ===================== START VIDEO CALL ===================== */
const startVideoCall = () => {
  if (!socket || !selectedUser) return;

  if (!isUserOnline) {
    toast.error(`${selectedUser.username} is currently offline`);
    return;
  }

  // 🔥 THIS IS THE MISSING LINE (BRINGS BACK VIDEO)
  chatStore.getState().setIncomingCall({
    from: loggedUser._id,
    type: "video",
  });

  // Show your calling UI
  initiateCallUI("video");

  socket.emit("call:start", {
    to: selectedUser._id,
    type: "video",
  });
};


  /* ===================== STOP CALLING UI ===================== */
  useEffect(() => {
    if (!socket) return;

    const stopCallingUI = () => {
      setIsCalling(false);
      setCallType(null);
      setCallStatus("Calling..."); // Reset status for next time
    };

    socket.on("call:accepted", stopCallingUI);
    socket.on("call:rejected", stopCallingUI);
    socket.on("call:no_answer", stopCallingUI);
    socket.on("call:ended", stopCallingUI);

    return () => {
      socket.off("call:accepted", stopCallingUI);
      socket.off("call:rejected", stopCallingUI);
      socket.off("call:no_answer", stopCallingUI);
      socket.off("call:ended", stopCallingUI);
    };
  }, [socket]);

  return (
    <>
      <div className="flex items-center justify-between px-3 py-2 shadow-lg w-full bg-gray-800">
        <div className="flex items-center gap-3">
          <img
            src={selectedUser.profilepic && selectedUser.profilepic.trim() !== "" ? selectedUser.profilepic : "/avatar.avif"}
            alt="User Avatar"
            className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover"
          />
          <div>
            <h2 className="text-base lg:text-xl font-semibold truncate text-white">{selectedUser.username}</h2>
            <p className="text-xs text-gray-300">
              {isTyping ? "Typing..." : isUserOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={startAudioCall} className="p-2 rounded-full hover:bg-gray-700 transition" title="Audio Call">
            <FaPhoneAlt className="text-white" />
          </button>
          <button onClick={startVideoCall} className="p-2 rounded-full hover:bg-gray-700 transition" title="Video Call">
            <FaVideo className="text-white" />
          </button>
          <button onClick={() => setSelectedUser(null)} className="p-2 rounded-full hover:bg-gray-700 transition" title="Close chat">
            <RxCross2 className="text-white text-2xl" />
          </button>
        </div>
      </div>

      {/* ===================== CALLER CALLING UI ===================== */}
     {/* ===================== CALLER CALLING UI ===================== */}
{isCalling && selectedUser && (
  <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-between text-white pt-28 pb-24">

    {/* Avatar */}
   {/* Caller Info */}
<div className="flex flex-col items-center">
  <img
    src={
      selectedUser.profilepic && selectedUser.profilepic.trim() !== ""
        ? selectedUser.profilepic
        : "/avatar.avif"
    }
    alt=""
className="w-32 h-32 rounded-full mb-6 ring-4 ring-gray-500"

  />

  <h2 className="text-3xl font-semibold tracking-wide">
  {selectedUser.username}
</h2>

<p className="text-xs uppercase tracking-[0.2em] text-gray-400 mt-3">
  {callType === "video" ? "Video Call" : "Audio Call"}
</p>

<p className="mt-5 text-base font-medium text-gray-200 animate-pulse">
  {callStatus}
</p>


</div>


    {/* Hang Up */}
    <button
      onClick={() => {
        socket.emit("call:end", { to: selectedUser._id });
        setIsCalling(false);
        setCallType(null);
        setCallStatus("Calling...");
      }}
      className="mt-16 bg-red-600 hover:bg-red-700 w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition"
    >
      <FaPhoneAlt className="text-white text-3xl rotate-[135deg]" />
    </button>
  </div>
)}


    </>
  );
};

export default ChatHeader;