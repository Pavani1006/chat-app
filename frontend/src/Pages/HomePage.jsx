import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";
import Sidebar from "../components/Sidebar";
import { chatStore } from "../store/chatStore";

const HomePage = () => {
  const { selectedUser } = chatStore();
  const isChatSelected = Boolean(selectedUser);

  return (
    <div className="flex h-full w-full overflow-hidden bg-base-100 rounded-lg shadow-cl">
      <div
        className={`${isChatSelected ? "hidden" : "flex"} md:flex h-full w-full md:w-96 md:flex-none`}
      >
        <Sidebar />
      </div>

      <main
        className={`${isChatSelected ? "flex" : "hidden"} md:flex flex-1 bg-gray-900 overflow-hidden min-w-0`}
      >
        {isChatSelected ? <ChatContainer /> : <NoChatSelected />}
      </main>
    </div>
  );
};

export default HomePage;
