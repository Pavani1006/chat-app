import { useEffect } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { chatStore } from "../store/chatStore";
import IncomingCallModal from "./IncomingCallModal"; 
import "../index.css";

const ChatContainer = () => {
  useEffect(() => {
    const store = chatStore.getState();

    console.log("🔌 Registering socket listeners");

    store.listenForNewMessage();
    store.listenForTyping();

    return () => {
      console.log("🧹 Cleaning up socket listeners");

      store.stopListeningForMessages();
      store.stopListeningForTyping();
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-base-100 shadow-lg w-full">
        <IncomingCallModal />
      <ChatHeader />

      <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
        <Messages />
      </div>

      <div className="flex-none bg-base-200">
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatContainer;
