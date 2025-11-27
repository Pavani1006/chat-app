import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";
import Sidebar from "../components/Sidebar";
import { chatStore } from "../store/chatStore";

const HomePage = () => {
 const { selectedUser } = chatStore();
 return (
  
 <div className="flex flex-row h-full overflow-hidden bg-base-100 rounded-lg shadow-cl w-full"
> <Sidebar />
 <main className="flex-1 bg-gray-900 overflow-hidden min-w-0"> 

{selectedUser ? <ChatContainer /> : <NoChatSelected />}
</main>
 </div>
 );
};
export default HomePage;
