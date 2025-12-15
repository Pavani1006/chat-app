import { authStore } from "../store/authStore";
import { chatStore } from "../store/chatStore";
import { RxCross2 } from "react-icons/rx";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, typingUserId } = chatStore();
  const { onlineUsers } = authStore();

  if (!selectedUser) return null;

  const isTyping = typingUserId === selectedUser._id;

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
              : onlineUsers.includes(selectedUser._id)
              ? "Online"
              : "Offline"}
          </p>
        </div>
      </div>

      <button
        onClick={() => setSelectedUser(null)}
        className="p-2 lg:p-3 rounded-full hover:bg-base-300 transition"
        title="Close chat"
      >
        <RxCross2 className="text-white text-2xl lg:text-2xl" />
      </button>
    </div>
  );
};

export default ChatHeader;
