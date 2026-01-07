import { chatStore } from "../store/chatStore";
import { authStore } from "../store/authStore";

const IncomingCallModal = () => {
  const { call, clearCall, startCall } = chatStore();
  const socket = authStore.getState().socket;

  if (!call) return null; // 🚨 THIS IS KEY

  const acceptCall = () => {
    socket.emit("call:accept", { to: call.from });
    startCall();
  };

  const rejectCall = () => {
    socket.emit("call:reject", { to: call.from });
    clearCall();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl p-6 w-[300px] text-center">
        <h2 className="text-lg font-semibold mb-2">Incoming Call</h2>
        <p className="mb-4">
          {call.type === "video" ? "📹 Video Call" : "📞 Audio Call"}
        </p>

        <div className="flex justify-between gap-4">
          <button
            onClick={acceptCall}
            className="flex-1 bg-green-500 text-white py-2 rounded-lg"
          >
            Accept
          </button>

          <button
            onClick={rejectCall}
            className="flex-1 bg-red-500 text-white py-2 rounded-lg"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
