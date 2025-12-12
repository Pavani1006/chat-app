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
    <aside className="h-full w-96 flex flex-col bg-gradient-to-b from-[#0d1a2b] to-[#0a1623] border-r border-[#1c2a3b] shadow-xl">

      {/* Header */}
      <div className="w-full p-5 bg-[#122033]/70 backdrop-blur-md border-b border-[#1c2a3b] shadow-md">
        <div className="flex items-center gap-3">
          <FaUserCircle className="size-7 text-gray-200" />
          <span className="font-semibold text-lg hidden lg:block text-gray-100 tracking-wide">
            Contacts
          </span>
        </div>
      </div>

      {/* Contacts */}
      <div className="overflow-y-auto w-full p-4 space-y-3">
        {users.length === 0 && (
          <div className="text-center text-gray-400 py-10">No contacts found.</div>
        )}

        {users.map((user) => {
          const isSelected = selectedUser?._id === user._id;

          return (
            <button
              key={user._id}
              onClick={() => setSelectedUser({ ...user })}
              className={`
                w-full flex items-center justify-between px-4 py-3 rounded-xl
                transition-all duration-200 group
                border 
                ${
                  isSelected
                    ? "border-white bg-[#1c2b3d] shadow-lg"   /* WHITE BORDER ON SELECT */
                    : "border-white/10 bg-[#152233] hover:border-white/40 hover:bg-[#1d2d44] hover:shadow-md"
                }
              `}
            >
              {/* Left side */}
              <div className="flex items-center gap-4 min-w-0">
                
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={user.profilepic?.trim() ? user.profilepic : "/avatar.avif"}
                    alt="profile"
                    className="
                      size-12 rounded-full object-cover
                      ring-2 ring-white/10 group-hover:ring-white/35
                      transition-all duration-200
                    "
                  />

                  {onlineUsers.includes(user._id) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#152233] rounded-full shadow" />
                  )}
                </div>

                {/* Name + status */}
                <div className="hidden lg:flex flex-col min-w-0">
                  <span className="font-semibold text-gray-100 truncate text-[15px]">
                    {user.username}
                  </span>
                  <span className="text-xs text-gray-400 truncate">
                    {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                  </span>
                </div>
              </div>

              {/* Unread Count */}
              {user.unreadCount > 0 && (
                <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
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
