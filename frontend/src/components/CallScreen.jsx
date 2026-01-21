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

  // refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const peerRef = useRef(null);
  const startedRef = useRef(false);

  // state
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
 const avatarSrc =
  otherUser?.profilepic && otherUser.profilepic.trim() !== ""
    ? otherUser.profilepic
    : "/avatar.avif";
  /* ================= WEBRTC ================= */
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
        audio: true,
        video: isVideoCall,
      });

      // attach local stream
      if (isVideoCall) {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.muted = true;
        }
      } else {
        if (localAudioRef.current) {
          localAudioRef.current.srcObject = stream;
          localAudioRef.current.muted = true;
        }
      }

      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      if (isCaller) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("webrtc-offer", { to: otherUserId, offer });
      }
    };

    pc.ontrack = (e) => {
      const stream = e.streams[0];
      if (!stream) return;

      if (isVideoCall) {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      } else {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = stream;
          remoteAudioRef.current.play().catch(() => {});
        }
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
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("webrtc-answer", { to: otherUserId, answer });
    };

    const handleAnswer = async ({ answer }) => {
      if (pc.signalingState === "have-local-offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    const handleCandidate = async ({ candidate }) => {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
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

  /* ================= MUTE ================= */
  const toggleMute = () => {
    const stream =
      localVideoRef.current?.srcObject ||
      localAudioRef.current?.srcObject;

    if (!stream) return;

    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) return;

    const next = !isMuted;
    audioTrack.enabled = !next;
    setIsMuted(next);
  };

  /* ================= VIDEO TOGGLE ================= */
  const toggleVideo = () => {
    const stream = localVideoRef.current?.srcObject;
    if (!stream) return;

    const track = stream.getVideoTracks()[0];
    if (!track) return;

    const next = !isVideoHidden;
    track.enabled = !next;
    setIsVideoHidden(next);
  };

  /* ================= HANGUP ================= */
  const handleHangup = () => {
    socket.emit("call:end", { to: otherUserId });

    const stream =
      localVideoRef.current?.srcObject ||
      localAudioRef.current?.srcObject;

    stream?.getTracks().forEach((t) => t.stop());

    peerRef.current?.close();
    endCall();
  };

  if (!otherUserId) return null;

  /* ================= UI ================= */
  /* ================= UI ================= */
return (
  <div className="fixed inset-0 bg-black text-white z-[999] flex items-center justify-center">

    {/* ================= VIDEO CALL ================= */}
    {isVideoCall && (
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        <div className="w-[85%] max-w-4xl aspect-video rounded-xl overflow-hidden border border-white/20 shadow-2xl relative">

          {/* REMOTE VIDEO */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* LOCAL VIDEO */}
          <div className="absolute top-4 right-4 w-32 h-44 rounded-xl overflow-hidden border border-white/20">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
          </div>

          {/* TOP INFO */}
        {/* TOP INFO (AVATAR + NAME + TIMER) */}
<div className="absolute top-4 left-0 right-0 flex flex-col items-center gap-2">

  {/* AVATAR (same logic as ChatHeader) */}
  <img
    src={
      otherUser?.profilepic && otherUser.profilepic.trim() !== ""
        ? otherUser.profilepic
        : "/avatar.avif"
    }
    alt="User Avatar"
    className="w-16 h-16 rounded-full object-cover border-2 border-white/30"
  />

  {/* USERNAME */}
  <h2 className="text-lg font-semibold">
    {otherUser?.username}
  </h2>

  {/* TIMER */}
  <p className="text-sm text-gray-300">
    {!isConnected ? "Connecting…" : formatTime(timer)}
  </p>
</div>


          {/* CONTROLS */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6">
            <button
              onClick={toggleVideo}
              className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center"
            >
              {isVideoHidden ? <FaVideoSlash size={22} /> : <FaVideo size={22} />}
            </button>

            <button
              onClick={toggleMute}
              className={`w-14 h-14 rounded-full flex items-center justify-center
                ${isMuted ? "bg-red-600" : "bg-gray-800"}`}
            >
              {isMuted ? <FaMicrophoneSlash size={22} /> : <FaMicrophone size={22} />}
            </button>

            <button
              onClick={handleHangup}
              className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center"
            >
              <MdCallEnd size={26} />
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ================= AUDIO CALL ================= */}
    {!isVideoCall && (
      <>
        {/* AUDIO STREAMS */}
        <audio ref={localAudioRef} autoPlay muted playsInline />
        <audio ref={remoteAudioRef} autoPlay playsInline />

        {/* AUDIO CARD */}
        <div className="w-[420px] max-w-[90%] h-[520px] border-2 border-white/20 rounded-xl shadow-2xl bg-black/90 flex flex-col justify-between">

          {/* TOP */}
          <div className="pt-10 flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 shadow-lg">
              <img
                src={avatarSrc}
                alt="User avatar"
                className="w-full h-full object-cover"
              />
            </div>

            <h2 className="text-xl font-semibold">
              {otherUser?.username}
            </h2>

            <p className="text-sm text-gray-300">
              {!isConnected ? "Calling…" : formatTime(timer)}
            </p>
          </div>
          

          {/* CONTROLS */}
          <div className="pb-10 flex justify-center gap-6">
            <button
              onClick={toggleMute}
              className={`w-16 h-16 rounded-full flex items-center justify-center
                ${isMuted ? "bg-red-600" : "bg-gray-800"}`}
            >
              {isMuted ? <FaMicrophoneSlash size={24} /> : <FaMicrophone size={24} />}
            </button>

            <button
              onClick={handleHangup}
              className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center"
            >
              <MdCallEnd size={28} />
            </button>
          </div>
        </div>
      </>
    )}
  </div>
);

};

export default CallScreen;
