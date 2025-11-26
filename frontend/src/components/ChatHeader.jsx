import { authStore } from "../store/authStore";
import { chatStore } from "../store/chatStore";
const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = chatStore();
  const { onlineUsers } = authStore();
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-base-200 shadow-lg rounded-md lg:rounded-none w-full bg-gray-800">
      <div className="flex items-center gap-3 relative">
        <img
          src={selectedUser.profilepic}
          alt="User Avatar"
          className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover"
        />
        <div>
          <h2 className="text-lg lg:text-xl font-semibold truncate">
            {selectedUser.username}
          </h2>
          <p className="text-sm lg:text-base text-base-content/60">
            {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
          </p>
        </div>
      </div>
      <button className="p-2 lg:p-3 rounded-full hover:bg-base-300">
        <span
          className="material-icons text-lg lg:text-xl"
          onClick={() => setSelectedUser(null)}
        >
          x
        </span>
      </button>
    </div>
  );
};

export default ChatHeader;
