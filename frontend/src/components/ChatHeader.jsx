import { authStore } from "../store/authStore";
import { chatStore } from "../store/chatStore";
import { RxCross2 } from "react-icons/rx";
import { FaPhoneAlt, FaVideo } from "react-icons/fa";
import toast from "react-hot-toast"; 

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, typingUserId } = chatStore();
  const { onlineUsers } = authStore();
  const socket = authStore.getState().socket;

  if (!selectedUser) return null;

  const isTyping = typingUserId === selectedUser._id;
  const isUserOnline = onlineUsers.includes(selectedUser._id);

const startAudioCall = () => {
  if (!socket || !selectedUser) return;

  if (!isUserOnline) {
    toast.error(`${selectedUser.username} is currently offline`, {
  duration: 3500, 
});

  }
  console.log("📞 Starting audio call to", selectedUser._id);
  socket.emit("call:start", {
    to: selectedUser._id,
    type: "audio",
  });
};

const startVideoCall = () => {
  if (!socket || !selectedUser) return;

  // 1. Show the toaster to the caller immediately if user is offline
  if (!isUserOnline) {
    toast.error(`${selectedUser.username} is currently offline.`);
  }

  // FIX: Set the call state locally so CallScreen opens with "video" type
  chatStore.getState().setIncomingCall({ 
    from: authStore.getState().loggedUser._id, 
    type: "video" 
  });

  // 2. Emit the event regardless so the missed call logic works
  socket.emit("call:start", {
    to: selectedUser._id,
    type: "video",
  });
};

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-base-200 shadow-lg rounded-md lg:rounded-none w-full bg-gray-800">
      <div className="flex items-center gap-3 relative">
        <img
          src={
            selectedUser.profilepic && selectedUser.profilepic.trim() !== ""
              ? selectedUser.profilepic
              : "/avatar.avif"
          }
          alt="User Avatar"
          className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover"
        />

        <div>
          <h2 className="text-base lg:text-xl font-semibold truncate">
            {selectedUser.username}
          </h2>

          <p className="text-xs text-gray-300">
            {isTyping
              ? "Typing..."
              : isUserOnline
              ? "Online"
              : "Offline"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={startAudioCall}
          className="p-2 rounded-full hover:bg-gray-700 transition"
          title="Audio Call"
        >
          <FaPhoneAlt className="text-white" />
        </button>

        <button
          onClick={startVideoCall}
          className="p-2 rounded-full hover:bg-gray-700 transition"
          title="Video Call"
        >
          <FaVideo className="text-white" />
        </button>

        <button
          onClick={() => setSelectedUser(null)}
          className="p-2 rounded-full hover:bg-gray-700 transition"
          title="Close chat"
        >
          <RxCross2 className="text-white text-2xl" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;