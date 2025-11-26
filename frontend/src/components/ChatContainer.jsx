import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import Messages from "./Messages";

const ChatContainer = () => {
  return (
    <div className="flex flex-col h-full bg-base-100 shadow-lg md:w-auto">
      <ChatHeader />
      <div className=" flex-1 overflow-y-auto">
        <Messages />
      </div>
      <div className="flex-shrink-1 p-4 bg-base-200">
        <MessageInput />
      </div>
    </div>
  );
};
export default ChatContainer;
