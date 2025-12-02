import { FiMessageSquare } from "react-icons/fi";

const NoChatSelected = () => {
  return (
    <div className="relative flex flex-col justify-center items-center h-full text-center px-4 overflow-hidden">

      {/* Background floating blur lights */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-700 opacity-20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-900 opacity-10 blur-[160px] rounded-full"></div>

      {/* Icon + subtle glow ring */}
      <div className="relative">
        <div className="absolute inset-0 bg-purple-600 opacity-20 blur-2xl rounded-2xl"></div>
        <FiMessageSquare className="text-[75px] text-purple-300 bg-[#0E0E17] p-5 rounded-2xl shadow-[0_0_25px_rgba(124,58,237,0.35)]" />
      </div>

      {/* Slogan */}
      <h1 className="mt-8 text-4xl font-bold tracking-wide text-white drop-shadow-[0_0_5px_rgba(130,100,255,0.25)]">
        Connect & Start Conversations
      </h1>

      {/* Description */}
      <p className="text-gray-400 text-lg mt-3 max-w-md">
        Select a chat from the sidebar and jump right in.  
      </p>

       <div className="mt-3 text-purple-300 text-xl font-medium tracking-wide animate-pulse select-none drop-shadow-[0_0_8px_rgba(124,58,237,0.4)]">
        Conversations start with a hello 👋
      </div>

     
    </div>
  );
};

export default NoChatSelected;
