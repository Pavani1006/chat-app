// // components/Messages.jsx
// import { chatStore } from "../store/chatStore";
// import { authStore } from "../store/authStore";
// import { useEffect, useRef, useState } from "react";
// import { FaRegFileAlt } from "react-icons/fa";

// const Messages = () => {
//   const {
//     selectedUser,
//     getMessages,
//     messages,
//     listenForNewMessage,
//     stopListeningForMessages,
//     loadingMessages,
//   } = chatStore();

//   const { loggedUser } = authStore();
//   const messagesEndRef = useRef(null);
//   const [previewImage, setPreviewImage] = useState(null);

//   const formatDuration = (seconds = 0) => {
//     const m = Math.floor(seconds / 60);
//     const s = Math.floor(seconds % 60);
//     return `${m}:${s.toString().padStart(2, "0")}`;
//   };


// // useEffect(() => {
// //   listenForNewMessage();
// //   return () => stopListeningForMessages();
// // }, [listenForNewMessage, stopListeningForMessages]);



// useEffect(() => {
//   if (selectedUser) getMessages();
// }, [selectedUser, getMessages]);

// useEffect(() => {
//   if (!selectedUser) return;
//   messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
// }, [selectedUser]);

// useEffect(() => {
//   messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
// }, [messages]);



//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     const today = new Date();
//     const yesterday = new Date();
//     yesterday.setDate(today.getDate() - 1);

//     if (date.toDateString() === today.toDateString()) return "Today";
//     if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

//     return date.toLocaleDateString([], {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   if (!selectedUser)
//     return (
//       <div className="flex-1 flex items-center justify-center text-gray-400 p-2">
//         Select a chat to start messaging.
//       </div>
//     );

//   if (loadingMessages)
//     return (
//       <div className="flex-1 flex items-center justify-center text-gray-400 p-2">
//         Loading messages...
//       </div>
//     );

//   if (messages.length === 0)
//     return (
//       <div className="flex-1 flex items-center justify-center text-gray-400 p-2">
//         No messages yet.
//       </div>
//     );

//   return (
//     <div className="p-4 space-y-4 overflow-y-auto relative pb-10">

//       {/* FULL SCREEN IMAGE PREVIEW */}
//       {previewImage && (
//         <div
//           className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4"
//           onClick={() => setPreviewImage(null)}
//         >
//           <img
//             src={previewImage}
//             alt="preview"
//             onClick={(e) => e.stopPropagation()}
//             className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
//           />
//         </div>
//       )}

//       {messages.map((msg, index) => {
//         const showDate =
//           index === 0 ||
//           new Date(msg.createdAt).toDateString() !==
//             new Date(messages[index - 1].createdAt).toDateString();

//         const isSender = String(msg.senderId) === String(loggedUser._id);

//         return (
//           <div key={msg._id}>
//             {showDate && (
//               <p className="text-center text-gray-400 font-semibold">
//                 {formatDate(msg.createdAt)}
//               </p>
//             )}

//             {/* ======================= SENDER ======================= */}
//             {isSender ? (
//               <div className="flex justify-end">
//                 <div className="max-w-[70%] bg-white text-gray-900 py-2 px-4 rounded-2xl rounded-br-none shadow">

//                   {/* IMAGE FIXED NO CROP */}
//                   {msg.image && (
//                     <img
//                       src={msg.image}
//                       onClick={() => setPreviewImage(msg.image)}
//                       className="max-w-[250px] max-h-[250px] object-contain rounded-lg cursor-pointer shadow-md bg-black/10"
//                       alt=""
//                     />
//                   )}

//                   {/* CAPTION */}
//                   {msg.caption && msg.image && (
//                     <p className="text-base mt-2 break-words">{msg.caption}</p>
//                   )}

//                   {/* AUDIO */}
//                   {msg.audio && (
//   <div className="mt-3">
//     <audio
//       controls
//       className="w-[230px] rounded-xl bg-gray-100 p-2 shadow-md"
//       src={msg.audio}
//     />

//     {msg.audioDuration > 0 && (
//       <p className="text-[10px] text-gray-500 mt-1 text-right">
//         {formatDuration(msg.audioDuration)}
//       </p>
//     )}
//   </div>
// )}


//                   {/* DOCUMENT PREVIEW (baseALL & CLEAN) */}
//                   {msg.fileUrl && (
//                     <div
//                       onClick={() => window.open(msg.fileUrl, "_blank")}
//                       className="mt-2 w-[220px] bg-[#F6F8FA] px-3 py-3 rounded-xl shadow cursor-pointer hover:bg-[#eef1f4] transition flex gap-3 items-center"
//                     >
//                       <div className="bg-[#E7EEFF] text-[#3662E3] p-2 rounded-md flex items-center justify-center">
//                         <FaRegFileAlt className="text-xl" />
//                       </div>

//                       <div className="flex flex-col overflow-hidden">
//                         <span className="font-medium text-base text-[#1C1F23] truncate">
//                           {msg.fileName || "Document"}
//                         </span>
//                         <span className="text-[11px] text-[#5A6270]">Tap to view / download</span>
//                       </div>
//                     </div>
//                   )}

//                   {/* TEXT */}
//                   {msg.text && <p className="text-base break-words">{msg.text}</p>}

//                   {/* TIME + SEEN */}
//                   <div className="flex justify-end gap-1 mt-1">
//                     <span className="text-[10px] text-gray-500 opacity-70">
//                       {new Date(msg.createdAt).toLocaleTimeString([], {
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       })}
//                     </span>

//                     {msg.seenBy?.includes(selectedUser._id) ? (
//                       <span className="text-[10px] text-blue-500 opacity-80">Seen</span>
//                     ) : (
//                       <span className="text-[10px] text-gray-500 opacity-70">Delivered</span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               /* ======================= RECEIVER ======================= */
//               <div className="flex">
//                 <div className="max-w-[70%] bg-gray-200 text-gray-900 py-2 px-4 rounded-2xl rounded-bl-none shadow">

//                   {/* IMAGE FIXED */}
//                   {msg.image && (
//                     <img
//                       src={msg.image}
//                       onClick={() => setPreviewImage(msg.image)}
//                       className="max-w-[250px] max-h-[250px] object-contain rounded-lg cursor-pointer shadow-md bg-black/10"
//                       alt=""
//                     />
//                   )}

//                   {/* CAPTION */}
//                   {msg.caption && msg.image && (
//                     <p className="text-base mt-2 break-words">{msg.caption}</p>
//                   )}

//                   {/* AUDIO */}
//                   {msg.audio && (
//   <div className="mt-3">
//     <audio
//       controls
//       className="w-[230px] rounded-xl bg-gray-100 p-2 shadow-md"
//       src={msg.audio}
//     />

//     {msg.audioDuration > 0 && (
//       <p className="text-[10px] text-gray-500 mt-1 text-right">
//         {formatDuration(msg.audioDuration)}
//       </p>
//     )}
//   </div>
// )}


//                   {/* DOCUMENT FIXED baseALL */}
//                   {msg.fileUrl && (
//                     <div
//                       onClick={() => window.open(msg.fileUrl, "_blank")}
//                       className="mt-2 w-[220px] bg-[#F6F8FA] px-3 py-3 rounded-xl shadow cursor-pointer hover:bg-[#eef1f4] transition flex gap-3 items-center"
//                     >
//                       <div className="bg-[#E7EEFF] text-[#3662E3] p-2 rounded-md flex items-center justify-center">
//                         <FaRegFileAlt className="text-xl" />
//                       </div>

//                       <div className="flex flex-col overflow-hidden">
//                         <span className="font-medium text-base truncate">
//                           {msg.fileName || "Document"}
//                         </span>
//                         <span className="text-[11px] text-[#5A6270]">
//                           Tap to view / download
//                         </span>
//                       </div>
//                     </div>
//                   )}

//                   {/* TEXT */}
//                   {msg.text && <p className="text-base break-words">{msg.text}</p>}

//                   {/* TIME */}
//                   <span className="text-[10px] text-gray-500 opacity-70 mt-1 block text-right">
//                     {new Date(msg.createdAt).toLocaleTimeString([], {
//                       hour: "2-digit",
//                       minute: "2-digit",
//                     })}
//                   </span>
//                 </div>
//               </div>
//             )}
//           </div>
//         );
//       })}

//       <div ref={messagesEndRef}></div>
//     </div>
//   );
// };

// export default Messages;


import { chatStore } from "../store/chatStore";
import { authStore } from "../store/authStore";
import { useEffect, useRef, useState } from "react";
import { FaRegFileAlt } from "react-icons/fa";

const Messages = () => {
  const { selectedUser, getMessages, messages, loadingMessages } = chatStore();
  const { loggedUser } = authStore();
  const messagesEndRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);


  // useEffect(() => {
  //   if (selectedUser) getMessages();
  // }, [selectedUser, getMessages]);

//   useEffect(() => {
//   if (!selectedUser) return;

//   setHasFetched(false);
//   getMessages().finally(() => {
//     setHasFetched(true);
//   });
// }, [selectedUser, getMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages, selectedUser]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" });
  };

  const handleDownload = (url, filename) => {
    if (!url) return;
  
    // 1. Check if it's a Cloudinary URL
    // We use the raw URL to avoid breaking signatures
    const isCloudinary = url.includes("res.cloudinary.com");
  
    if (isCloudinary) {
      // Open the URL directly in a new window. 
      // This bypasses many extension listeners that cause the "message channel" error.
      const win = window.open(url, '_blank');
      if (win) win.focus();
    } else {
      // Standard fallback for other files
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.download = filename || "document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
// 1. If no user is selected, show this first.
// 1. If no user is selected, show this first.
useEffect(() => {
    if (selectedUser?._id) {
      setHasFetched(false); // Reset when user changes
      getMessages().finally(() => {
        setHasFetched(true); // Stop loading once API responds
      });
    }
  }, [selectedUser?._id, getMessages]);

  // --- REPLACE YOUR CURRENT IF STATEMENTS WITH THESE ---

  if (!selectedUser) return <div className="flex-1 flex items-center justify-center text-gray-400">Select a chat.</div>;

  // Show "Loading..." only while the network is busy and we haven't finished the first check
  if (loadingMessages && !hasFetched) {
    return <div className="flex-1 flex items-center justify-center text-gray-400">Loading...</div>;
  }

  // Show "No messages yet" ONLY if the fetch finished and the array is empty
  if (hasFetched && messages.length === 0) {
    return <div className="flex-1 flex items-center justify-center text-gray-400">No messages yet</div>;
  }



  return (
    <div className="p-4 space-y-4 overflow-y-auto relative pb-10">
      {previewImage && (
        <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} alt="preview" className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain" />
        </div>
      )}

      {messages.map((msg, index) => {
        const showDate = index === 0 || new Date(msg.createdAt).toDateString() !== new Date(messages[index - 1].createdAt).toDateString();
        const isSender = String(msg.senderId) === String(loggedUser._id);

        return (
          <div key={msg._id}>
            {showDate && (
  <p className="text-center text-gray-400 font-semibold mb-2">
    {formatDate(msg.createdAt)}
  </p>
)}

            <div className={isSender ? "flex justify-end" : "flex"}>
              <div className={`max-w-[70%] py-2 px-4 rounded-2xl shadow ${isSender ? "bg-white text-gray-900 rounded-br-none" : "bg-gray-200 text-gray-900 rounded-bl-none"}`}>
                
                {msg.image && <img src={msg.image} onClick={() => setPreviewImage(msg.image)} className="max-w-[250px] rounded-lg cursor-pointer" alt="" />}
                
                {/* DOCUMENT (Uploading + Final) */}
{msg.fileUrl && (
  <div
    onClick={() =>
      msg.fileUrl !== "uploading..." &&
      handleDownload(msg.fileUrl, msg.fileName)
    }
    className={`mt-2 w-[220px] px-3 py-3 rounded-xl flex gap-3 items-center transition
      ${msg.fileUrl === "uploading..."
        ? "bg-gray-100 cursor-default"
        : "bg-[#F6F8FA] cursor-pointer hover:bg-gray-100"
      }`}
  >
    <FaRegFileAlt
      className={`text-xl ${
        msg.fileUrl === "uploading..."
          ? "text-gray-400 animate-pulse"
          : "text-blue-600"
      }`}
    />

    <div className="overflow-hidden flex flex-col">
      <p className="truncate font-medium text-sm">
        {msg.fileName || "Document"}
      </p>

      {msg.fileUrl === "uploading..." ? (
        <p className="text-[11px] text-gray-500">Uploading…</p>
      ) : (
        <p className="text-[11px] text-gray-500">Tap to download</p>
      )}
    </div>
  </div>
)}


                {msg.text && <p className="break-words mt-1">{msg.text}</p>}
                <div className="flex justify-end gap-1 mt-1 text-[10px] text-gray-500">
  <span>
    {new Date(msg.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}
  </span>

  {isSender && (
    msg.seenBy?.includes(selectedUser._id) ? (
      <span className="text-blue-500">Seen</span>
    ) : (
      <span className="text-gray-500">Delivered</span>
    )
  )}
</div>

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