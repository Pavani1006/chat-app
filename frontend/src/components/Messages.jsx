// import { chatStore } from "../store/chatStore";
// import { authStore } from "../store/authStore";
// import { useEffect, useRef, useState } from "react";
// import { FaRegFileAlt } from "react-icons/fa";

// const Messages = () => {
//   const { selectedUser, getMessages, messages, loadingMessages } = chatStore();
//   const { loggedUser } = authStore();
//   const messagesEndRef = useRef(null);
//   const [previewImage, setPreviewImage] = useState(null);
//   const [hasFetched, setHasFetched] = useState(false);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
//   }, [messages, selectedUser]);

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     const today = new Date();
//     const yesterday = new Date();
//     yesterday.setDate(today.getDate() - 1);
//     if (date.toDateString() === today.toDateString()) return "Today";
//     if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
//     return date.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" });
//   };

//   const handleDownload = (url, filename) => {
//     if (!url) return;
  
//     // 1. Check if it's a Cloudinary URL
//     // We use the raw URL to avoid breaking signatures
//     const isCloudinary = url.includes("res.cloudinary.com");
  
//     if (isCloudinary) {
//       // Open the URL directly in a new window. 
//       // This bypasses many extension listeners that cause the "message channel" error.
//       const win = window.open(url, '_blank');
//       if (win) win.focus();
//     } else {
//       // Standard fallback for other files
//       const link = document.createElement("a");
//       link.href = url;
//       link.target = "_blank";
//       link.download = filename || "document.pdf";
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     }
//   };
// // 1. If no user is selected, show this first.
// // 1. If no user is selected, show this first.
// useEffect(() => {
//     if (selectedUser?._id) {
//       setHasFetched(false); // Reset when user changes
//       getMessages().finally(() => {
//         setHasFetched(true); // Stop loading once API responds
//       });
//     }
//   }, [selectedUser?._id, getMessages]);

//   // --- REPLACE YOUR CURRENT IF STATEMENTS WITH THESE ---

//   if (!selectedUser) return <div className="flex-1 flex items-center justify-center text-gray-400">Select a chat.</div>;

//   // Show "Loading..." only while the network is busy and we haven't finished the first check
//   if (loadingMessages && !hasFetched) {
//     return <div className="flex-1 flex items-center justify-center text-gray-400">Loading...</div>;
//   }

//   // Show "No messages yet" ONLY if the fetch finished and the array is empty
//   if (hasFetched && messages.length === 0) {
//     return <div className="flex-1 flex items-center justify-center text-gray-400">No messages yet</div>;
//   }



//   return (
//     <div className="p-4 space-y-4 overflow-y-auto relative pb-10">
//       {previewImage && (
//         <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
//           <img src={previewImage} alt="preview" className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain" />
//         </div>
//       )}

//       {messages.map((msg, index) => {
//         const showDate = index === 0 || new Date(msg.createdAt).toDateString() !== new Date(messages[index - 1].createdAt).toDateString();
//         const isSender = String(msg.senderId) === String(loggedUser._id);

//         return (
//           <div key={msg._id}>
//             {showDate && (
//   <p className="text-center text-gray-400 font-semibold mb-2">
//     {formatDate(msg.createdAt)}
//   </p>
// )}

//             <div className={isSender ? "flex justify-end" : "flex"}>
//               <div className={`max-w-[70%] py-2 px-4 rounded-2xl shadow ${isSender ? "bg-white text-gray-900 rounded-br-none" : "bg-gray-200 text-gray-900 rounded-bl-none"}`}>
                
//                 {msg.image && <img src={msg.image} onClick={() => setPreviewImage(msg.image)} className="max-w-[250px] rounded-lg cursor-pointer" alt="" />}
                
//                 {/* DOCUMENT (Uploading + Final) */}
// {msg.fileUrl && (
//   <div
//     onClick={() =>
//       msg.fileUrl !== "uploading..." &&
//       handleDownload(msg.fileUrl, msg.fileName)
//     }
//     className={`mt-2 w-[220px] px-3 py-3 rounded-xl flex gap-3 items-center transition
//       ${msg.fileUrl === "uploading..."
//         ? "bg-gray-100 cursor-default"
//         : "bg-[#F6F8FA] cursor-pointer hover:bg-gray-100"
//       }`}
//   >
//     <FaRegFileAlt
//       className={`text-xl ${
//         msg.fileUrl === "uploading..."
//           ? "text-gray-400 animate-pulse"
//           : "text-blue-600"
//       }`}
//     />

//     <div className="overflow-hidden flex flex-col">
//       <p className="truncate font-medium text-sm">
//         {msg.fileName || "Document"}
//       </p>

//       {msg.fileUrl === "uploading..." ? (
//         <p className="text-[11px] text-gray-500">Uploading…</p>
//       ) : (
//         <p className="text-[11px] text-gray-500">Tap to download</p>
//       )}
//     </div>
//   </div>
// )}


//                 {msg.text && <p className="break-words mt-1">{msg.text}</p>}
//                 <div className="flex justify-end gap-1 mt-1 text-[10px] text-gray-500">
//   <span>
//     {new Date(msg.createdAt).toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit",
//     })}
//   </span>

//   {isSender && (
//     msg.seenBy?.includes(selectedUser._id) ? (
//       <span className="text-blue-500">Seen</span>
//     ) : (
//       <span className="text-gray-500">Delivered</span>
//     )
//   )}
// </div>

//               </div>
//             </div>
//           </div>
//         );
//       })}
//       <div ref={messagesEndRef} />
//     </div>
//   );
// };

// export default Messages;


import { chatStore } from "../store/chatStore";
import { authStore } from "../store/authStore";
import { useEffect, useRef, useState } from "react";
import { FaRegFileAlt } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { axiosInstance } from "../lib/axios";


const Messages = () => {
  const { selectedUser, getMessages, messages, loadingMessages } = chatStore();
  const { loggedUser } = authStore();

  const messagesEndRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null); // ✅ CLICK STATE

  /* ===================== CLOSE MENU ON OUTSIDE CLICK ===================== */
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

    if (url.includes("res.cloudinary.com")) {
      const win = window.open(url, "_blank");
      if (win) win.focus();
    } else {
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.download = filename || "document";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  /* ===================== DELETE ===================== */
 const deleteForMe = async (id) => {
  // ✅ 1. INSTANT UI UPDATE
  chatStore.setState((state) => ({
    messages: state.messages.filter((m) => m._id !== id),
  }));

  // ✅ 2. BACKEND UPDATE
  try {
    await axiosInstance.put(`/message/delete-for-me/${id}`);
  } catch (err) {
    console.error(err);
  }
};


  const deleteForEveryone = async (id) => {
    try {
      await axiosInstance.put(`/message/delete-for-everyone/${id}`);
    } catch (err) {
      console.error(err);
    }
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
    <div className="p-4 space-y-4 overflow-y-auto pb-10">
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

        const isSender =
          String(msg.senderId) === String(loggedUser._id);

        return (
          <div key={msg._id}>
            {showDate && (
              <p className="text-center text-gray-400 font-semibold mb-2">
                {formatDate(msg.createdAt)}
              </p>
            )}

            <div className={isSender ? "flex justify-end" : "flex"}>
              <div
                className={`relative max-w-[70%] py-3 px-4 pr-8 rounded-2xl shadow ${
                  isSender
                    ? "bg-white text-gray-900 rounded-br-none"
                    : "bg-gray-200 text-gray-900 rounded-bl-none"
                }`}
              >
                {/* CLICK-BASED DELETE MENU */}
                {isSender && !msg.isDeletedForEveryone && (
                  <div
                    className="absolute top-2 right-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === msg._id ? null : msg._id
                        )
                      }
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <BsThreeDotsVertical size={14} />
                    </button>

                    {openMenuId === msg._id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg text-sm z-50">
                        <button
                          onClick={() => {
                            deleteForMe(msg._id);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100"
                        >
                          Delete for me
                        </button>
                        <button
                          onClick={() => {
                            deleteForEveryone(msg._id);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
                        >
                          Delete for everyone
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* DELETED FOR EVERYONE */}
                {msg.isDeletedForEveryone ? (
                  <p className="text-gray-400 italic text-sm">
                    This message was deleted
                  </p>
                ) : (
                  <>
                    {msg.image && (
                      <img
                        src={msg.image}
                        onClick={() => setPreviewImage(msg.image)}
                        className="max-w-[250px] rounded-lg cursor-pointer"
                        alt=""
                      />
                    )}

                    {msg.fileUrl && (
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

                    {msg.text && (
                      <p className="break-words mt-1">{msg.text}</p>
                    )}

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
                          <span className="text-gray-500">Delivered</span>
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
  );
};

export default Messages;
