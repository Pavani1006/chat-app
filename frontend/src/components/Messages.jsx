import { chatStore } from "../store/chatStore";
import { authStore } from "../store/authStore";
import { useEffect, useRef, useState } from "react";
import { FaRegFileAlt } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { axiosInstance } from "../lib/axios";

const Messages = () => {
  const {
    selectedUser,
    getMessages,
    messages,
    loadingMessages,
    setForwardMessage,
    forwardMessage,
    clearForwardMessage,
    sendMessage,
    users,
  } = chatStore();
  const { loggedUser } = authStore();

  const messagesEndRef = useRef(null);

  const [previewImage, setPreviewImage] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  // per-message audio timing state
  const [audioTimes, setAudioTimes] = useState({});
  useEffect(() => {
    if (forwardMessage) {
      console.log("FORWARD CLICKED → fetching users");
      chatStore.getState().getUsers();
    }
  }, [forwardMessage]);

  /* ===================== CLOSE MENU ===================== */
  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  /* ===================== SCROLL ===================== */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages, selectedUser]);

  /* ===================== FETCH ===================== */
  useEffect(() => {
    if (selectedUser?._id) {
      setHasFetched(false);
      getMessages().finally(() => setHasFetched(true));
    }
  }, [selectedUser?._id, getMessages]);

  /* ===================== HELPERS ===================== */
  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return "00:00";
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };
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

  const handleDownload = (url, filename) => {
    if (!url) return;
    const win = window.open(url, "_blank");
    if (win) win.focus();
  };

  /* ===================== DELETE ===================== */
  const deleteForMe = async (id) => {
    chatStore.setState((state) => ({
      messages: state.messages.filter((m) => m._id !== id),
    }));
    try {
      await axiosInstance.put(`/message/delete-for-me/${id}`);
    } catch {}
  };

  const deleteForEveryone = async (id) => {
    chatStore.setState((state) => ({
      messages: state.messages.map((m) =>
        m._id === id ? { ...m, isDeletedForEveryone: true } : m
      ),
    }));
    try {
      await axiosInstance.put(`/message/delete-for-everyone/${id}`);
    } catch {}
  };

  /* ===================== STATES ===================== */
  if (!selectedUser)
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Select a chat.
      </div>
    );

  if (loadingMessages && !hasFetched)
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );

  if (hasFetched && messages.length === 0)
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        No messages yet
      </div>
    );

  /* ===================== RENDER ===================== */
  return (
    <>
    <div className="p-4 space-y-4 pb-10 overflow-y-auto">
      {previewImage && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="preview"
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
          />
        </div>
      )}

      {messages.map((msg, index) => {
        if (msg.deletedFor?.includes(loggedUser._id)) return null;

        const showDate =
          index === 0 ||
          new Date(msg.createdAt).toDateString() !==
            new Date(messages[index - 1].createdAt).toDateString();

        const isSender = String(msg.senderId) === String(loggedUser._id);

        const audioState = audioTimes[msg._id] || {
          current: 0,
          duration: 0,
        };

        return (
          <div key={msg._id}>
            {showDate && (
              <p className="text-center text-gray-400 font-semibold mb-2">
                {formatDate(msg.createdAt)}
              </p>
            )}

            <div className={isSender ? "flex justify-end" : "flex"}>
              <div
                className={`relative w-fit max-w-[70%] py-2.5 px-4 rounded-2xl shadow ${
                  isSender
                    ? "bg-white text-gray-900 rounded-br-none"
                    : "bg-gray-200 text-gray-900 rounded-bl-none"
                }`}
              >
                {/* MENU */}
                {!msg.isDeletedForEveryone && (
                  <div
                    className="absolute top-2 right-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() =>
                        setOpenMenuId(openMenuId === msg._id ? null : msg._id)
                      }
                    >
                      <BsThreeDotsVertical size={14} />
                    </button>

                    {openMenuId === msg._id && (
                      <div
                        className={`absolute mt-2 min-w-[180px] bg-white border rounded-lg shadow text-sm z-50
      ${isSender ? "right-0" : "left-0"}
    `}
                      >
                        <button
                          onClick={() => deleteForMe(msg._id)}
                          className="w-full px-4 py-2 text-left whitespace-nowrap hover:bg-gray-100"
                        >
                          Delete for me
                        </button>

                        {isSender && (
                          <button
                            onClick={() => deleteForEveryone(msg._id)}
                            className="w-full px-4 py-2 text-left whitespace-nowrap text-red-600 hover:bg-red-50"
                          >
                            Delete for everyone
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setForwardMessage(msg);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left whitespace-nowrap hover:bg-gray-100"
                        >
                          Forward
                        </button>
                      </div>
                    )}
                  </div>
                )}

                

                {msg.isDeletedForEveryone ? (
                  <p className="italic text-gray-400 text-sm">
                    This message was deleted
                  </p>
                ) : (
                  <>
                  {msg.isForwarded && (
  <p className="text-[11px] text-gray-400 italic mb-1">
    Forwarded
  </p>
)}
                    {/* IMAGE */}
                    {msg.image && (
                      <img
                        src={msg.image}
                        onClick={() => setPreviewImage(msg.image)}
                        className="max-w-[250px] rounded-lg cursor-pointer"
                        alt=""
                      />
                    )}

                    {/* AUDIO */}
                    {/* AUDIO */}
                   {/* AUDIO */}
{msg.isAudio && (
  <>
    {msg.fileUrl ? (
      <div className="mt-2 inline-flex max-w-[220px] bg-gray-100 rounded-lg px-2 py-1.5">
        <audio
          className="h-8 w-[220px]"
          src={msg.fileUrl}
          preload="metadata"
          controls
          onLoadedMetadata={(e) => {
            const audio = e.currentTarget;
            if (!audio || !isFinite(audio.duration)) return;

            setAudioTimes((prev) => ({
              ...prev,
              [msg._id]: {
                current: 0,
                duration: Math.floor(audio.duration),
              },
            }));
          }}
          onTimeUpdate={(e) => {
            const audio = e.currentTarget;
            if (!audio) return;

            setAudioTimes((prev) => ({
              ...prev,
              [msg._id]: {
                current: Math.floor(audio.currentTime || 0),
                duration: prev[msg._id]?.duration || 0,
              },
            }));
          }}
        />
      </div>
    ) : (
      <div className="mt-2 px-3 py-2 rounded-lg bg-gray-100 text-xs text-gray-500">
        Sending voice message…
      </div>
    )}
  </>
)}


                    {/* DOCUMENT */}
                    {msg.fileUrl && !msg.isAudio && (
                      <div
                        onClick={() =>
                          handleDownload(msg.fileUrl, msg.fileName)
                        }
                        className="mt-2 w-[220px] px-3 py-3 rounded-xl flex gap-3 items-center bg-[#F6F8FA] cursor-pointer hover:bg-gray-100"
                      >
                        <FaRegFileAlt className="text-xl text-blue-600" />
                        <div className="overflow-hidden">
                          <p className="truncate font-medium text-sm">
                            {msg.fileName || "Document"}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            Tap to download
                          </p>
                        </div>
                      </div>
                    )}

                    {msg.text && <p className="mt-1 break-words">{msg.text}</p>}

                    <div className="flex justify-end gap-1 mt-1 text-[10px] text-gray-500">
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      {isSender &&
                        (msg.seenBy?.includes(selectedUser._id) ? (
                          <span className="text-blue-500">Seen</span>
                        ) : (
                          <span>Delivered</span>
                        ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <div ref={messagesEndRef} />
    </div>
    {forwardMessage && (
      <div className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center">
        <div className="bg-white text-gray-900 rounded-xl w-[320px] h-[420px] overflow-y-auto p-4">

          <h3 className="font-semibold mb-3">Forward to</h3>

          {users.length === 0 ? (
            <p className="text-center text-sm text-gray-400">
              Loading contacts...
            </p>
          ) : (
            users
  .filter((u) => u._id !== loggedUser._id)
  .map((user) => {
    console.log("FORWARD USER OBJECT:", user);

    return (
      <button
        key={user._id}
        className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-gray-900"
        onClick={() => {
          chatStore
            .getState()
            .forwardToUser(user._id, forwardMessage);
          clearForwardMessage();
        }}
      >
        {user.username}
      </button>
    );
  })
          )}

          <button
            className="mt-3 w-full text-sm text-red-500"
            onClick={clearForwardMessage}
          >
            Cancel
          </button>
        </div>
      </div>
    )}
    </>
  );
};

export default Messages;
