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
// 2. NEW: Hide "Missed Call" notifications from the Sender's view
  // Only the person who WAS CALLED (receiver) should see the missed call text.
  const isMissedCall = msg.messageType === "missed_call";
  
  const amISender = String(msg.senderId) === String(loggedUser._id);
  if (isMissedCall) {
    if (amISender) return null;

    return (
      <div key={msg._id} className="flex justify-center my-6 w-full group">
        <div className="flex flex-col items-center gap-1">
          {/* Main Badge */}
          <div className="flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-sm border border-red-100 shadow-sm rounded-2xl group-hover:shadow-md transition-all duration-300">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${msg.callType === 'video' ? 'bg-purple-50 text-purple-600' : 'bg-red-50 text-red-600'}`}>
              {msg.callType === 'video' ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
              )}
            </div>
            
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-gray-800 tracking-tight">
                {msg.text}
              </span>
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (isMissedCall && amISender) return null;
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
{/* VIDEO */}
{msg.isVideo && msg.fileUrl && (
  <video
    src={msg.fileUrl}
    controls
    className="mt-2 max-w-[260px] rounded-lg"
  />
)}



                    {/* DOCUMENT */}
                    {msg.fileUrl && !msg.isAudio && !msg.isVideo && (
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
