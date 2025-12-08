// components/Messages.jsx
import { chatStore } from "../store/chatStore";
import { authStore } from "../store/authStore";
import { useEffect, useRef, useState } from "react";
import { FaRegFileAlt } from "react-icons/fa";

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
  const [previewImage, setPreviewImage] = useState(null);

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
    <div className="p-4 space-y-4 overflow-y-auto relative ">
      {/* Full screen image preview */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="preview"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
          />
        </div>
      )}

      {messages.map((message, index) => {
        const showDate =
          index === 0 ||
          new Date(message.createdAt).toDateString() !==
            new Date(messages[index - 1].createdAt).toDateString();

        const isSender = String(message.senderId) === String(loggedUser._id);

        return (
          <div key={message._id}>
            {showDate && (
              <p className="text-center text-gray-400 font-semibold">
                {formatDate(message.createdAt)}
              </p>
            )}

            {/* =================== SENDER =================== */}
            {isSender ? (
              <div className="flex justify-end">
                <div className="max-w-[70%] bg-white text-gray-900 py-2 px-4 rounded-2xl rounded-br-none shadow">

                  {/* Image */}
                  {message.image && (
                    <img
                      src={message.image}
                      className="rounded-lg max-h-60 cursor-pointer"
                      onClick={() => setPreviewImage(message.image)}
                    />
                  )}

                  {/* Caption (image OR document) */}
                  {message.caption && (
                    <p className="text-sm mt-2 break-words">{message.caption}</p>
                  )}

                  {/* Audio */}
                  {message.audio && (
                    <audio
                      controls
                      className="mt-3 w-[230px] rounded-xl bg-gray-100 p-2 shadow-md"
                      src={message.audio}
                    />
                  )}

                  {/* File */}
                  {message.fileUrl && (
                    <div
                      onClick={() => window.open(message.fileUrl, "_blank")}
                      className="mt-2 bg-[#F6F8FA] px-4 py-3 rounded-xl shadow cursor-pointer hover:bg-[#eef1f4] transition flex gap-3 items-center"
                    >
                      <div className="bg-[#E7EEFF] text-[#3662E3] p-2 rounded-md flex items-center justify-center">
                        <FaRegFileAlt className="text-xl" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-[14px] text-[#1C1F23] break-all">
                          {message.fileName || "Document"}
                        </span>
                        <span className="text-[11px] text-[#5A6270]">
                          Tap to view / download
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Text */}
                  {message.text && <p className="text-sm break-words">{message.text}</p>}

                  <div className="mt-1 text-right">
                    <p className="text-[10px] opacity-75">
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {message.seenBy?.includes(selectedUser._id) ? (
                      <p className="text-[11px] text-blue-500 mt-[1px]">Seen</p>
                    ) : (
                      <p className="text-[11px] text-gray-500 mt-[1px]">Delivered</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* =================== RECEIVER =================== */
              <div className="flex">
                <div className="max-w-[70%] bg-gray-200 text-gray-900 py-2 px-4 rounded-2xl rounded-bl-none shadow">

                  {/* Image */}
                  {message.image && (
                    <img
                      src={message.image}
                      className="rounded-lg max-h-60 cursor-pointer"
                      onClick={() => setPreviewImage(message.image)}
                    />
                  )}

                  {/* Caption (image OR document) */}
                  {message.caption && (
                    <p className="text-sm mt-2 break-words">{message.caption}</p>
                  )}

                  {/* Audio */}
                  {message.audio && (
                    <audio
                      controls
                      className="mt-3 w-[230px] rounded-xl bg-gray-100 p-2 shadow-md"
                      src={message.audio}
                    />
                  )}

                  {/* File */}
                  {message.fileUrl && (
                    <div
                      onClick={() => window.open(message.fileUrl, "_blank")}
                      className="mt-2 bg-[#F6F8FA] px-4 py-3 rounded-xl shadow cursor-pointer hover:bg-[#eef1f4] transition flex gap-3 items-center"
                    >
                      <div className="bg-[#E7EEFF] text-[#3662E3] p-2 rounded-md flex items-center justify-center">
                        <FaRegFileAlt className="text-xl" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-[14px] text-[#1C1F23] break-all">
                          {message.fileName || "Document"}
                        </span>
                        <span className="text-[11px] text-[#5A6270]">
                          Tap to view / download
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Text */}
                  {message.text && <p className="text-sm break-words">{message.text}</p>}

                  <p className="text-[10px] opacity-70 mt-1">
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
