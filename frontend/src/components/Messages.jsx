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
}, [listenForNewMessage, stopListeningForMessages]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth",block:"end" });
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
    <div className="p-4 space-y-4 overflow-y-auto relative pb-10">

      {/* FULL SCREEN IMAGE PREVIEW */}
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

      {messages.map((msg, index) => {
        const showDate =
          index === 0 ||
          new Date(msg.createdAt).toDateString() !==
            new Date(messages[index - 1].createdAt).toDateString();

        const isSender = String(msg.senderId) === String(loggedUser._id);

        return (
          <div key={msg._id}>
            {showDate && (
              <p className="text-center text-gray-400 font-semibold">
                {formatDate(msg.createdAt)}
              </p>
            )}

            {/* ======================= SENDER ======================= */}
            {isSender ? (
              <div className="flex justify-end">
                <div className="max-w-[70%] bg-white text-gray-900 py-2 px-4 rounded-2xl rounded-br-none shadow">

                  {/* IMAGE FIXED NO CROP */}
                  {msg.image && (
                    <img
                      src={msg.image}
                      onClick={() => setPreviewImage(msg.image)}
                      className="max-w-[250px] max-h-[250px] object-contain rounded-lg cursor-pointer shadow-md bg-black/10"
                      alt=""
                    />
                  )}

                  {/* CAPTION */}
                  {msg.caption && msg.image && (
                    <p className="text-base mt-2 break-words">{msg.caption}</p>
                  )}

                  {/* AUDIO */}
                  {msg.audio && (
                    <audio
                      controls
                      className="mt-3 w-[230px] rounded-xl bg-gray-100 p-2 shadow-md"
                      src={msg.audio}
                    />
                  )}

                  {/* DOCUMENT PREVIEW (baseALL & CLEAN) */}
                  {msg.fileUrl && (
                    <div
                      onClick={() => window.open(msg.fileUrl, "_blank")}
                      className="mt-2 w-[220px] bg-[#F6F8FA] px-3 py-3 rounded-xl shadow cursor-pointer hover:bg-[#eef1f4] transition flex gap-3 items-center"
                    >
                      <div className="bg-[#E7EEFF] text-[#3662E3] p-2 rounded-md flex items-center justify-center">
                        <FaRegFileAlt className="text-xl" />
                      </div>

                      <div className="flex flex-col overflow-hidden">
                        <span className="font-medium text-base text-[#1C1F23] truncate">
                          {msg.fileName || "Document"}
                        </span>
                        <span className="text-[11px] text-[#5A6270]">Tap to view / download</span>
                      </div>
                    </div>
                  )}

                  {/* TEXT */}
                  {msg.text && <p className="text-base break-words">{msg.text}</p>}

                  {/* TIME + SEEN */}
                  <div className="flex justify-end gap-1 mt-1">
                    <span className="text-[10px] text-gray-500 opacity-70">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>

                    {msg.seenBy?.includes(selectedUser._id) ? (
                      <span className="text-[10px] text-blue-500 opacity-80">Seen</span>
                    ) : (
                      <span className="text-[10px] text-gray-500 opacity-70">Delivered</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* ======================= RECEIVER ======================= */
              <div className="flex">
                <div className="max-w-[70%] bg-gray-200 text-gray-900 py-2 px-4 rounded-2xl rounded-bl-none shadow">

                  {/* IMAGE FIXED */}
                  {msg.image && (
                    <img
                      src={msg.image}
                      onClick={() => setPreviewImage(msg.image)}
                      className="max-w-[250px] max-h-[250px] object-contain rounded-lg cursor-pointer shadow-md bg-black/10"
                      alt=""
                    />
                  )}

                  {/* CAPTION */}
                  {msg.caption && msg.image && (
                    <p className="text-base mt-2 break-words">{msg.caption}</p>
                  )}

                  {/* AUDIO */}
                  {msg.audio && (
                    <audio
                      controls
                      className="mt-3 w-[230px] rounded-xl bg-gray-100 p-2 shadow-md"
                      src={msg.audio}
                    />
                  )}

                  {/* DOCUMENT FIXED baseALL */}
                  {msg.fileUrl && (
                    <div
                      onClick={() => window.open(msg.fileUrl, "_blank")}
                      className="mt-2 w-[220px] bg-[#F6F8FA] px-3 py-3 rounded-xl shadow cursor-pointer hover:bg-[#eef1f4] transition flex gap-3 items-center"
                    >
                      <div className="bg-[#E7EEFF] text-[#3662E3] p-2 rounded-md flex items-center justify-center">
                        <FaRegFileAlt className="text-xl" />
                      </div>

                      <div className="flex flex-col overflow-hidden">
                        <span className="font-medium text-base truncate">
                          {msg.fileName || "Document"}
                        </span>
                        <span className="text-[11px] text-[#5A6270]">
                          Tap to view / download
                        </span>
                      </div>
                    </div>
                  )}

                  {/* TEXT */}
                  {msg.text && <p className="text-base break-words">{msg.text}</p>}

                  {/* TIME */}
                  <span className="text-[10px] text-gray-500 opacity-70 mt-1 block text-right">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
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
