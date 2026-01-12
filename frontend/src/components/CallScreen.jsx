import { useEffect, useRef, useState } from "react";
import { authStore } from "../store/authStore";
import { chatStore } from "../store/chatStore";
import { FaUserCircle } from "react-icons/fa";
import { MdCallEnd } from "react-icons/md";

const CallScreen = () => {
  const socket = authStore((state) => state.socket);
  const loggedUser = authStore((state) => state.loggedUser);

  const { call, endCall, users } = chatStore();

  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const peerRef = useRef(null);
  const startedRef = useRef(false);

  /* ---------- TIMER ---------- */
  const [timer, setTimer] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const timerRef = useRef(null);

  /* ---------- USER ---------- */
  const otherUserId =
    call?.from || chatStore.getState().selectedUser?._id;

  const otherUser = users.find((u) => u._id === otherUserId);

  const isCaller = !call || call.from !== loggedUser?._id;

  /* ---------- WEBRTC ---------- */
  useEffect(() => {
    if (!socket || !otherUserId) return;

    const startSession = async () => {
      if (startedRef.current) return;
      startedRef.current = true;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream;
        localAudioRef.current.muted = true;
      }

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      peerRef.current = pc;

      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      pc.ontrack = (e) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = e.streams[0];
          remoteAudioRef.current.play().catch(() => {});
        }
        setIsConnected(true);
      };

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("ice-candidate", {
            to: otherUserId,
            candidate: e.candidate,
          });
        }
      };

      socket.on("webrtc-offer", async ({ offer }) => {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtc-answer", { to: otherUserId, answer });
      });

      socket.on("webrtc-answer", async ({ answer }) => {
        if (pc.signalingState === "have-local-offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
      });

      socket.on("ice-candidate", async ({ candidate }) => {
        if (candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch {}
        }
      });

      if (isCaller) {
        setTimeout(async () => {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("webrtc-offer", { to: otherUserId, offer });
        }, 800);
      }
    };

    startSession();

    return () => {
      socket.off("webrtc-offer");
      socket.off("webrtc-answer");
      socket.off("ice-candidate");
    };
  }, [socket, otherUserId, isCaller]);

  /* ---------- TIMER ---------- */
  useEffect(() => {
    if (isConnected) {
      timerRef.current = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    }
    return () => timerRef.current && clearInterval(timerRef.current);
  }, [isConnected]);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
      2,
      "0"
    )}`;

  const handleHangup = () => {
    socket.emit("call:end", { to: otherUserId });

    localAudioRef.current?.srcObject
      ?.getTracks()
      .forEach((t) => t.stop());

    peerRef.current?.close();
    endCall();
  };

  if (!otherUserId) return null;

  /* ---------- UI ---------- */
  return (
    <div className="fixed inset-0 bg-[#0b141a] text-white z-[999] flex flex-col justify-between py-16">
      {/* TOP */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-slate-700 border-2 border-slate-600 shadow-2xl flex items-center justify-center overflow-hidden">
            <img
  src={
    otherUser?.profilepic?.trim()
      ? otherUser.profilepic
      : "/avatar.avif"
  }
  alt="profile"
  className="w-full h-full object-cover"
/>

          </div>

          {!isConnected && (
            <div className="absolute inset-0 rounded-full border-4 border-green-500/30 animate-ping" />
          )}
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-medium mb-1">
            {otherUser?.username || "User"}
          </h2>
          <p className="text-slate-400 text-lg">
            {!isConnected
              ? isCaller
                ? "Calling..."
                : "Connecting..."
              : formatTime(timer)}
          </p>
        </div>
      </div>

      {/* AUDIO */}
      <audio ref={localAudioRef} autoPlay muted playsInline />
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* BOTTOM CONTROLS */}
      {/* <div className="flex justify-center">
        <div className="flex items-center gap-12 bg-slate-800/80 p-6 rounded-[40px] shadow-2xl backdrop-blur-md">
          <button className="p-4 bg-slate-700 rounded-full text-2xl">🎙️</button>
          <button className="p-4 bg-slate-700 rounded-full text-2xl">🔊</button>
          <button
            onClick={handleHangup}
            className="bg-red-500 hover:bg-red-600 p-5 rounded-full text-3xl"
          >
            📞
          </button>
        </div>
      </div> */}

      <div className="flex justify-center pb-6">
  <button
    onClick={handleHangup}
    className="
      flex items-center gap-3
      bg-red-600 hover:bg-red-700
      px-8 py-4
      rounded-full
      shadow-2xl
      text-white text-lg font-semibold
      transition-all
      active:scale-95
    "
  >
    <span className="tracking-wide">Hang up</span>
    <MdCallEnd size={26} />
  </button>
</div>

    </div>
  );
};

export default CallScreen;
