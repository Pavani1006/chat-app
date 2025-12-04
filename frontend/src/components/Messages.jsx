import { chatStore } from "../store/chatStore";
import { authStore } from "../store/authStore";
import { useEffect, useRef } from "react";

const Messages = () => {
  const {
    selectedUser,
    getMessages,
    messages,
    listenForNewMessage,
    stopListeningForMessages,
    loadingMessages,
  } = chatStore();

  const { loggedUser } = authStore();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser) getMessages();
  }, [selectedUser, getMessages]);

  useEffect(() => {
    listenForNewMessage();
    return () => stopListeningForMessages();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

    return date.toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (!selectedUser)
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 p-2">
        Select a chat to start messaging.
      </div>
    );

  if (loadingMessages)
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 p-2">
        Loading messages...
      </div>
    );

  if (messages.length === 0)
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 p-2">
        No messages yet.
      </div>
    );

  return (
    <div className="p-4 space-y-4 overflow-y-auto">
      {messages.map((message, index) => {
        const showDateSeparator =
          index === 0 ||
          new Date(message.createdAt).toDateString() !==
            new Date(messages[index - 1].createdAt).toDateString();

        const isSender =
          String(message.senderId) === String(loggedUser._id);

        // 💙 STATUS FIX — this is the correct way
        const isSeenBySelectedUser =
          isSender &&
          Array.isArray(message.seenBy) &&
          message.seenBy.some(
            (id) => String(id) === String(selectedUser._id)
          );

        return (
          <div key={message._id}>
            {showDateSeparator && (
              <div className="text-center my-4">
                <span className="text-gray-400 text-base font-semibold tracking-wide">
                  {formatDate(message.createdAt)}
                </span>
              </div>
            )}

            {isSender ? (
              <div className="flex justify-end gap-2">
                <div className="max-w-[70%] bg-white text-gray-900 py-2 px-4 rounded-2xl rounded-br-none shadow-md">
                  {message.text && (
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  )}

                  {message.image && (
                    <img
                      src={message.image}
                      alt="attachment"
                      className="mt-2 rounded-lg max-h-52 border border-white/20"
                    />
                  )}

                  <p className="text-[10px] text-right opacity-75 mt-1">
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                  {/* ⭐ FINAL WORKING SEEN / DELIVERED */}
                  <p
                    className={`text-[11px] text-right mt-1 tracking-wide ${
                      isSeenBySelectedUser
                        ? "text-blue-500"
                        : "text-gray-400"
                    }`}
                  >
                    {isSeenBySelectedUser ? "Seen" : "Delivered"}
                  </p>
                </div>

                <img
                  src={
                    loggedUser.profilepic &&
                    loggedUser.profilepic.trim() !== ""
                      ? loggedUser.profilepic
                      : "/avatar.avif"
                  }
                  alt="avatar"
                  className="w-9 h-9 rounded-full object-cover shadow-sm"
                />
              </div>
            ) : (
              <div className="flex gap-2">
                <img
                  src={
                    selectedUser.profilepic &&
                    selectedUser.profilepic.trim() !== ""
                      ? selectedUser.profilepic
                      : "/avatar.avif"
                  }
                  alt="avatar"
                  className="w-9 h-9 rounded-full object-cover shadow-sm"
                />

                <div className="max-w-[70%] bg-gray-200 text-gray-900 py-2 px-4 rounded-2xl rounded-bl-none shadow">
                  {message.text && (
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  )}

                  {message.image && (
                    <img
                      src={message.image}
                      alt="attachment"
                      className="mt-2 rounded-lg max-h-52 border border-black/10"
                    />
                  )}

                  <p className="text-[10px] text-left opacity-75 mt-1">
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div ref={messagesEndRef}></div>
    </div>
  );
};

export default Messages;
