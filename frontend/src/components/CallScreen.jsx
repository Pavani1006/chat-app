import { useEffect, useRef, useState } from "react";
import { authStore } from "../store/authStore";
import { chatStore } from "../store/chatStore";
import { MdCallEnd } from "react-icons/md";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
} from "react-icons/fa";

const CallScreen = () => {
  const socket = authStore((state) => state.socket);
  const loggedUser = authStore((state) => state.loggedUser);
  const { call, endCall, users, inCall } = chatStore();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const startedRef = useRef(false);

  const [timer, setTimer] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoHidden, setIsVideoHidden] = useState(false);

  const timerRef = useRef(null);

  const otherUserId =
    call?.from || chatStore.getState().selectedUser?._id;

  const otherUser = users.find((u) => u._id === otherUserId);
  const isCaller = !call || call.from !== loggedUser?._id;

  const callType =
    call?.type || chatStore.getState().outgoingCallType;

  const isVideoCall = callType === "video";

  /* ================= START WEBRTC ONLY AFTER ACCEPT ================= */
  useEffect(() => {
    if (!socket || !otherUserId || !inCall) return;
    if (startedRef.current) return;

    startedRef.current = true;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    peerRef.current = pc;

    const startSession = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,            // 🔊 audio unchanged
        video: isVideoCall,     // 🎥 video only for video call
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
      }

      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      if (isCaller) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("webrtc-offer", { to: otherUserId, offer });
      }
    };

    pc.ontrack = (e) => {
      if (remoteVideoRef.current && e.streams[0]) {
        remoteVideoRef.current.srcObject = e.streams[0];
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

    const handleOffer = async ({ offer }) => {
      if (pc.signalingState !== "stable") return;
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("webrtc-answer", { to: otherUserId, answer });
    };

    const handleAnswer = async ({ answer }) => {
      if (pc.signalingState === "have-local-offer") {
        await pc.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    };

    const handleCandidate = async ({ candidate }) => {
      try {
        if (pc.remoteDescription) {
          await pc.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        }
      } catch {}
    };

    socket.on("webrtc-offer", handleOffer);
    socket.on("webrtc-answer", handleAnswer);
    socket.on("ice-candidate", handleCandidate);

    startSession();

    return () => {
      socket.off("webrtc-offer", handleOffer);
      socket.off("webrtc-answer", handleAnswer);
      socket.off("ice-candidate", handleCandidate);
      pc.close();
    };
  }, [socket, otherUserId, inCall, isVideoCall, isCaller]);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (isConnected) {
      timerRef.current = setInterval(
        () => setTimer((t) => t + 1),
        1000
      );
    }
    return () => clearInterval(timerRef.current);
  }, [isConnected]);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(
      s % 60
    ).padStart(2, "0")}`;

  /* ================= MUTE (UNCHANGED) ================= */
  const toggleMute = () => {
    const stream = localVideoRef.current?.srcObject;
    if (!stream) return;

    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) return;

    const nextMuted = !isMuted;
    audioTrack.enabled = !nextMuted;
    setIsMuted(nextMuted);
  };

  /* ================= VIDEO TOGGLE (NEW) ================= */
  const toggleVideo = () => {
    const stream = localVideoRef.current?.srcObject;
    if (!stream) return;

    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return;

    const nextHidden = !isVideoHidden;
    videoTrack.enabled = !nextHidden;
    setIsVideoHidden(nextHidden);
  };

  /* ================= HANGUP ================= */
  const handleHangup = () => {
    socket.emit("call:end", { to: otherUserId });

    localVideoRef.current?.srcObject
      ?.getTracks()
      .forEach((t) => t.stop());

    peerRef.current?.close();
    endCall();
  };

  if (!otherUserId) return null;

  /* ================= UI ================= */
  return (
  <div className="fixed inset-0 bg-black text-white z-[999]">

    {/* ================= REMOTE VIDEO ================= */}
    <video
      ref={remoteVideoRef}
      autoPlay
      playsInline
      className="absolute inset-0 w-full h-full object-cover"
    />

    {/* ================= TOP OVERLAY ================= */}
    <div className="absolute top-0 w-full p-4 bg-gradient-to-b from-black/70 to-transparent">
      <div className="flex flex-col items-center gap-1">
  <h2 className="text-xl font-semibold tracking-wide">
    {otherUser?.username}
  </h2>
  <p className="text-sm text-gray-300">
    {!isConnected ? "Connecting…" : formatTime(timer)}
  </p>
</div>

    </div>

    {/* ================= LOCAL VIDEO (PiP) ================= */}
    {!isVideoHidden && (
      <div className="absolute top-20 right-4 w-32 h-44 rounded-xl overflow-hidden border border-white/20 shadow-2xl">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }}
        />
      </div>
    )}

    {/* ================= CALLING OVERLAY ================= */}
    {!isConnected && (
      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
        <p className="text-lg animate-pulse">Calling…</p>
      </div>
    )}

    {/* ================= CONTROLS BAR ================= */}
    <div className="absolute bottom-0 w-full pb-8 pt-6 flex justify-center bg-gradient-to-t from-black/80 to-transparent backdrop-blur-md">
      <div className="flex items-center gap-6">

        {/* VIDEO TOGGLE */}
        <button
          onClick={toggleVideo}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition
            ${isVideoHidden ? "bg-gray-600" : "bg-gray-800 hover:bg-gray-700"}`}
        >
          {isVideoHidden ? <FaVideoSlash size={20} /> : <FaVideo size={20} />}
        </button>

        {/* MUTE */}
        <button
          onClick={toggleMute}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition
            ${isMuted ? "bg-red-600" : "bg-gray-800 hover:bg-gray-700"}`}
        >
          {isMuted ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
        </button>

        {/* END CALL */}
        <button
          onClick={handleHangup}
          className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-xl active:scale-90"
        >
          <MdCallEnd size={28} />
        </button>
      </div>
    </div>
  </div>
);

};

export default CallScreen;
