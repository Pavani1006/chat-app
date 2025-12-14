import { FaUserCircle } from "react-icons/fa";
import { chatStore } from "../store/chatStore";
import { useEffect } from "react";
import { authStore } from "../store/authStore";

const Sidebar = () => {
  const { users, getUsers, setSelectedUser, selectedUser } = chatStore();
  const { onlineUsers, loggedUser } = authStore();

  useEffect(() => {
    if (loggedUser) getUsers();
  }, [loggedUser, getUsers]);

  return (
    // Base Container: Original dark gradient theme
    <aside className="h-full w-96 flex flex-col bg-gradient-to-b from-[#0d1a2b] to-[#0a1623] border-r border-[#1c2a3b] shadow-xl">

      {/* Header (UNCHANGED) */}
      <div className="w-full p-5 bg-[#122033]/70 backdrop-blur-md border-b border-[#1c2a3b] shadow-md">
        <div className="flex items-center gap-3">
          <FaUserCircle className="size-7 text-gray-200" />
          <span className="font-semibold text-lg hidden lg:block text-gray-100 tracking-wide">
            Contacts
          </span>
        </div>
      </div>

      {/* Contacts List - Monochromatic UI (with final font size adjustment) */}
      <div className="overflow-y-auto w-full p-4 space-y-2">
        {users.length === 0 && (
          <div className="text-center text-gray-400 py-10">No contacts found.</div>
        )}

        {users.map((user) => {
          const isSelected = selectedUser?._id === user._id;
          const isOnline = onlineUsers.includes(user._id);

          return (
            <button
              key={user._id}
              onClick={() => setSelectedUser({ ...user })}
              className={`
                w-full flex items-center justify-between px-4 py-2.5 rounded-xl 
                transition-all duration-300 group
                border-2 border-transparent 
                ${
                  isSelected
                    ? "bg-[#25374d] ring-2 ring-white/70 shadow-inner"   /* SELECTED: Lighter BG with soft white inner ring/shadow */
                    : "bg-[#182638] hover:bg-[#1f3044] hover:border-gray-600"
                }
              `}
            >
              {/* Left side */}
              <div className="flex items-center gap-3 min-w-0">
                
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={user.profilepic?.trim() ? user.profilepic : "/avatar.avif"}
                    alt="profile"
                    className={`
                      size-11 rounded-full object-cover
                      ring-1 ${isOnline ? "ring-white/50" : "ring-gray-700"} /* Soft white ring for online */
                      transition-all duration-300
                    `}
                  />

                  {/* Status Indicator Dot (Subtle White for Online) */}
                  {/* Status Indicator (✓ / ✕) */}
<span
  className={`absolute bottom-0 right-0 w-4 h-4 flex items-center justify-center 
    rounded-full border-2 border-[#182638] shadow
    ${isOnline ? "bg-gray-200" : "bg-gray-600"}
  `}
>
  <span
    className={`text-[9px] font-bold leading-none ${
      isOnline ? "text-[#182638]" : "text-gray-300"
    }`}
  >
    {isOnline ? "✓" : "✕"}
  </span>
</span>

                </div>

                {/* Name + status */}
                <div className="hidden lg:flex flex-col min-w-0 text-left">
                  <span className={`font-medium text-base truncate ${isSelected ? "text-white" : "text-gray-100"}`}>
                    {user.username} {/* FONT SIZE INCREASED HERE: text-base */}
                  </span>
                  <span className={`text-xs truncate ${isOnline ? "text-gray-400" : "text-gray-400"}`}>
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </div>

              {/* Unread Count */}
              {user.unreadCount > 0 && (
  <span
    className="
      flex-shrink-0 min-w-[20px] h-[20px]
      px-1.5 flex items-center justify-center
      rounded-full text-[11px] font-semibold
      text-white
      bg-gradient-to-br from-indigo-500 to-purple-600
      shadow-[0_0_8px_rgba(99,102,241,0.35)]
    "
  >
    {user.unreadCount}
  </span>
)}

            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;