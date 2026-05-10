import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Phone, PhoneOff, SwitchCamera, User, Video, VideoOff, X, MonitorUp, Maximize2, Minimize2 } from 'lucide-react';
import { getSocket } from '../utils/socketConnection';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
};

// Bandwidth optimization: Default constraints
const VIDEO_CONSTRAINTS = {
  width: { ideal: 640, max: 1280 },
  height: { ideal: 480, max: 720 },
  frameRate: { ideal: 15, max: 24 }
};

const VideoCall = ({ roomCode, username, requestedCall, onRequestHandled }) => {
  const socket = getSocket();
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef(new Map());
  const pendingIceCandidatesRef = useRef(new Map());
  const isInCallRef = useRef(false);
  const callTypeRef = useRef('video');
  const facingModeRef = useRef('user');
  const pendingOffersRef = useRef([]);
  const screenStreamRef = useRef(null);
  
  const [isInCall, setIsInCall] = useState(false);
  const [callType, setCallType] = useState('video');
  const [incomingCall, setIncomingCall] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const removePeer = useCallback((socketId) => {
    const peer = peersRef.current.get(socketId);
    if (peer) {
      peer.close();
      peersRef.current.delete(socketId);
    }
    setRemoteStreams((streams) => streams.filter((stream) => stream.socketId !== socketId));
  }, []);

  const stopLocalStream = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current = null;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  }, []);

  const resetCall = useCallback(() => {
    peersRef.current.forEach((peer) => peer.close());
    peersRef.current.clear();
    pendingIceCandidatesRef.current.clear();
    pendingOffersRef.current = [];
    stopLocalStream();
    isInCallRef.current = false;
    setIsInCall(false);
    setIncomingCall(null);
    setRemoteStreams([]);
    setIsMicMuted(false);
    setIsCameraOff(false);
    setIsScreenSharing(false);
    setIsFullscreen(false);
  }, [stopLocalStream]);

  const endCall = useCallback((notifyAll = false) => {
    if (notifyAll) {
      socket.emit('call:end', { roomCode });
    } else {
      socket.emit('call:leave', { roomCode });
    }
    resetCall();
  }, [resetCall, roomCode, socket]);

  const getLocalStream = useCallback(async (type) => {
    if (localStreamRef.current && type !== 'screen') {
      return localStreamRef.current;
    }

    let stream;
    try {
      if (type === 'screen') {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        screenStreamRef.current = stream;
        setIsScreenSharing(true);
        
        const [screenTrack] = stream.getVideoTracks();
        screenTrack.onended = () => {
          if (isInCallRef.current) toggleScreenShare(); 
        };
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
          video: type === 'video' ? { ...VIDEO_CONSTRAINTS, facingMode: facingModeRef.current } : false,
        });
      }

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.error('Error getting local stream:', err);
      throw err;
    }
  }, []);

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingModeRef.current },
          audio: true
        });
        const [videoTrack] = stream.getVideoTracks();
        
        const [currentVideoTrack] = localStreamRef.current.getVideoTracks();
        if (currentVideoTrack) {
          currentVideoTrack.stop();
          localStreamRef.current.removeTrack(currentVideoTrack);
        }
        localStreamRef.current.addTrack(videoTrack);

        for (const peer of peersRef.current.values()) {
          const sender = peer.getSenders().find(s => s.track?.kind === 'video');
          if (sender) await sender.replaceTrack(videoTrack);
        }

        screenStreamRef.current?.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
        setIsScreenSharing(false);
      } else {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = stream;
        const [screenTrack] = stream.getVideoTracks();
        
        screenTrack.onended = () => toggleScreenShare();

        const [currentVideoTrack] = localStreamRef.current.getVideoTracks();
        if (currentVideoTrack) {
          currentVideoTrack.stop();
          localStreamRef.current.removeTrack(currentVideoTrack);
        }
        localStreamRef.current.addTrack(screenTrack);

        for (const peer of peersRef.current.values()) {
          const sender = peer.getSenders().find(s => s.track?.kind === 'video');
          if (sender) await sender.replaceTrack(screenTrack);
        }

        setIsScreenSharing(true);
      }
    } catch (err) {
      setError('Screen sharing failed.');
    }
  };

  const createPeer = useCallback((targetSocketId) => {
    const existingPeer = peersRef.current.get(targetSocketId);
    if (existingPeer) return existingPeer;

    const peer = new RTCPeerConnection(ICE_SERVERS);
    peersRef.current.set(targetSocketId, peer);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peer.addTrack(track, localStreamRef.current);
      });
    }

    peer.ontrack = (event) => {
      const [stream] = event.streams;
      setRemoteStreams((streams) => {
        const existingIndex = streams.findIndex((item) => item.socketId === targetSocketId);
        if (existingIndex === -1) return [...streams, { socketId: targetSocketId, stream }];
        return streams.map((item, i) => (i === existingIndex ? { socketId: targetSocketId, stream } : item));
      });
    };

    peer.onicecandidate = (event) => {
      if (event.candidate && socket.connected) {
        socket.emit('call:ice-candidate', { targetSocketId, candidate: event.candidate });
      }
    };

    peer.onconnectionstatechange = () => {
      if (['closed', 'disconnected', 'failed'].includes(peer.connectionState)) {
        removePeer(targetSocketId);
      }
    };

    peer.oniceconnectionstatechange = () => {
      if (peer.iceConnectionState === 'failed') {
        peer.restartIce();
      }
    };

    peer.onnegotiationneeded = async () => {
      if (peer.signalingState !== 'stable') return;
      try {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit('call:offer', {
          targetSocketId,
          offer,
          roomCode,
          callType: callTypeRef.current,
        });
      } catch (err) {
        console.error('Negotiation error:', err);
      }
    };

    return peer;
  }, [removePeer, socket, roomCode]);

  const sendOffer = useCallback(async (targetSocketId) => {
    const peer = createPeer(targetSocketId);
    if (peer.signalingState === 'stable') {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socket.emit('call:offer', {
        targetSocketId,
        offer,
        roomCode,
        callType: callTypeRef.current,
      });
    }
  }, [createPeer, roomCode, socket]);

  const answerOffer = useCallback(async ({ fromSocketId, offer, callType: incomingType }) => {
    const type = incomingType || callTypeRef.current;
    
    if (type !== 'screen') {
      await getLocalStream(type);
    } else if (!localStreamRef.current) {
      try { await getLocalStream('video'); } catch { /* ignore if no cam */ }
    }

    callTypeRef.current = type;
    setCallType(type);
    setIsInCall(true);
    isInCallRef.current = true;

    const peer = createPeer(fromSocketId);
    try {
      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const candidates = pendingIceCandidatesRef.current.get(fromSocketId) || [];
      for (const candidate of candidates) {
        await peer.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error(e));
      }
      pendingIceCandidatesRef.current.delete(fromSocketId);
      
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit('call:answer', { targetSocketId: fromSocketId, answer });
    } catch (err) {
      console.error('Answer offer error:', err);
    }
  }, [createPeer, getLocalStream, socket]);

  const startCall = useCallback(async (type) => {
    if (type === 'screen' && !navigator.mediaDevices?.getDisplayMedia) {
      setError('Screen sharing not supported.');
      return;
    }
    try {
      setError('');
      await getLocalStream(type);
      callTypeRef.current = type;
      setCallType(type);
      setIsInCall(true);
      isInCallRef.current = true;
      socket.emit('call:join', { roomCode, callType: type });

      const pendingOffers = pendingOffersRef.current;
      pendingOffersRef.current = [];
      await Promise.all(pendingOffers.map((offer) => answerOffer(offer)));
    } catch (err) {
      setError('Could not start call.');
      resetCall();
    }
  }, [answerOffer, getLocalStream, resetCall, roomCode, socket]);

  useEffect(() => {
    if (requestedCall) {
      startCall(requestedCall);
      onRequestHandled();
    }
  }, [requestedCall, startCall, onRequestHandled]);

  useEffect(() => {
    const handleUserJoined = async (data) => {
      if (data.socketId === socket.id) return;
      if (!isInCallRef.current) {
        callTypeRef.current = data.callType || 'video';
        setIncomingCall({ ...data });
        return;
      }
      await sendOffer(data.socketId);
    };

    const handleOffer = async (offerData) => {
      if (!isInCallRef.current) {
        pendingOffersRef.current = [offerData];
        setIncomingCall({
          socketId: offerData.fromSocketId,
          userName: offerData.fromUserName,
          callType: offerData.callType || 'video',
        });
        return;
      }
      await answerOffer(offerData);
    };

    const handleAnswer = async ({ fromSocketId, answer }) => {
      const peer = peersRef.current.get(fromSocketId);
      if (peer && peer.signalingState !== 'stable') {
        await peer.setRemoteDescription(new RTCSessionDescription(answer));
        const candidates = pendingIceCandidatesRef.current.get(fromSocketId) || [];
        await Promise.all(candidates.map((c) => peer.addIceCandidate(new RTCIceCandidate(c))));
        pendingIceCandidatesRef.current.delete(fromSocketId);
      }
    };

    const handleIceCandidate = async ({ fromSocketId, candidate }) => {
      const peer = peersRef.current.get(fromSocketId);
      if (peer?.remoteDescription) {
        await peer.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error(e));
      } else {
        const queued = pendingIceCandidatesRef.current.get(fromSocketId) || [];
        pendingIceCandidatesRef.current.set(fromSocketId, [...queued, candidate]);
      }
    };

    socket.on('call:user-joined', handleUserJoined);
    socket.on('call:offer', handleOffer);
    socket.on('call:answer', handleAnswer);
    socket.on('call:ice-candidate', handleIceCandidate);
    socket.on('call:user-left', ({ socketId }) => removePeer(socketId));
    socket.on('call:ended', () => resetCall());

    return () => {
      socket.off('call:user-joined');
      socket.off('call:offer');
      socket.off('call:answer');
      socket.off('call:ice-candidate');
      socket.off('call:user-left');
      socket.off('call:ended');
      if (isInCallRef.current) socket.emit('call:leave', { roomCode });
      resetCall();
    };
  }, [answerOffer, removePeer, resetCall, roomCode, sendOffer, socket]);

  const toggleMic = () => {
    localStreamRef.current?.getAudioTracks().forEach(t => t.enabled = isMicMuted);
    setIsMicMuted(!isMicMuted);
  };

  const toggleCamera = () => {
    localStreamRef.current?.getVideoTracks().forEach(t => t.enabled = isCameraOff);
    setIsCameraOff(!isCameraOff);
  };

  const acceptIncomingCall = () => {
    const type = incomingCall?.callType === 'screen' ? 'video' : (incomingCall?.callType || 'video');
    setIncomingCall(null);
    startCall(type);
  };

  if (!isInCall && !incomingCall && !error) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col transition-all duration-500 ${isInCall ? 'bg-[#1a1a1a]' : 'pointer-events-none'}`}>
      {/* Incoming Call Toast */}
      {incomingCall && !isInCall && (
        <div className="fixed inset-x-3 top-10 z-[110] mx-auto max-w-sm rounded-2xl bg-[#242424] border border-[#333] shadow-2xl p-4 pointer-events-auto animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
              {incomingCall.callType === 'audio' ? <Phone /> : <Video />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-white truncate">{incomingCall.userName || 'Someone'} is calling</p>
              <p className="text-xs text-gray-400">Incoming {incomingCall.callType} call</p>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={acceptIncomingCall} className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-colors">Accept</button>
            <button onClick={() => setIncomingCall(null)} className="flex-1 py-2 rounded-lg bg-[#333] hover:bg-[#444] text-white font-bold transition-colors">Decline</button>
          </div>
        </div>
      )}

      {/* Meeting Interface */}
      {isInCall && (
        <div className={`relative flex-1 flex flex-col overflow-hidden ${isFullscreen ? 'h-screen w-screen' : ''}`}>
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/80 to-transparent z-20 flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 p-1.5 rounded-lg">
                <Video size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-sm">Meeting Room: {roomCode}</h2>
                <p className="text-[10px] text-gray-300 uppercase tracking-widest">{callType} Session</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 text-gray-300 hover:text-white transition-colors">
                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
              <button onClick={() => endCall(true)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Main Stage */}
          <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-[#000]">
            {(callType === 'screen' || remoteStreams.length > 0) ? (
              <div className="w-full h-full max-w-6xl relative group rounded-2xl overflow-hidden shadow-2xl border border-[#333]">
                {remoteStreams.length > 0 ? (
                  <RemoteVideo 
                    stream={remoteStreams[0].stream} 
                    isAudioOnly={callType === 'audio'} 
                    className="w-full h-full object-contain bg-black"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <User size={64} className="mb-4 opacity-20" />
                    <p>Connecting to presentation...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="h-24 w-24 rounded-full bg-[#333] flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <User size={40} className="text-gray-500" />
                </div>
                <p className="text-gray-400">Waiting for participants to join...</p>
              </div>
            )}
          </div>

          {/* Participants bar */}
          <div className="h-28 sm:h-32 bg-[#1a1a1a] border-t border-[#333] flex items-center gap-4 px-6 overflow-x-auto no-scrollbar">
            <div className="relative h-20 sm:h-24 aspect-video rounded-xl overflow-hidden border-2 border-emerald-500/50 bg-[#222] shrink-0">
              <video ref={localVideoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${isCameraOff ? 'hidden' : ''}`} />
              {isCameraOff && <div className="w-full h-full flex items-center justify-center text-gray-600"><User size={20}/></div>}
              <div className="absolute bottom-1 left-2 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white font-medium">You {isScreenSharing && '(Presenting)'}</div>
            </div>

            {remoteStreams.slice(1).map(({ socketId, stream }) => (
              <div key={socketId} className="relative h-20 sm:h-24 aspect-video rounded-xl overflow-hidden border border-[#333] bg-[#222] shrink-0">
                <RemoteVideo stream={stream} isAudioOnly={callType === 'audio'} className="w-full h-full object-cover" />
                <div className="absolute bottom-1 left-2 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white font-medium">Participant</div>
              </div>
            ))}
          </div>

          {/* Meeting Controls */}
          <div className="absolute bottom-32 sm:bottom-8 left-1/2 -translate-x-1/2 z-30">
            <div className="flex items-center gap-4 bg-[#242424]/90 backdrop-blur-xl border border-[#444] px-6 py-3 rounded-2xl shadow-2xl">
              <button onClick={toggleMic} className={`p-3 rounded-xl transition-all ${isMicMuted ? 'bg-red-500/20 text-red-500' : 'bg-[#333] text-white hover:bg-[#444]'}`}>
                {isMicMuted ? <MicOff size={22} /> : <Mic size={22} />}
              </button>
              <button onClick={toggleCamera} className={`p-3 rounded-xl transition-all ${isCameraOff ? 'bg-red-500/20 text-red-500' : 'bg-[#333] text-white hover:bg-[#444]'}`}>
                {isCameraOff ? <VideoOff size={22} /> : <Video size={22} />}
              </button>
              <button onClick={toggleScreenShare} className={`p-3 rounded-xl transition-all ${isScreenSharing ? 'bg-emerald-500 text-white' : 'bg-[#333] text-white hover:bg-[#444]'}`}>
                <MonitorUp size={22} />
              </button>
              <div className="w-px h-8 bg-gray-700 mx-2"></div>
              <button onClick={() => endCall(true)} className="p-3 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg shadow-red-600/20">
                <PhoneOff size={22} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[120] px-6 py-3 rounded-xl bg-red-500 text-white font-bold shadow-2xl">
          {error}
        </div>
      )}
    </div>
  );
};

const RemoteVideo = ({ stream, isAudioOnly, className = 'w-full h-full' }) => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
    if (audioRef.current) {
      audioRef.current.srcObject = stream;
      audioRef.current.play().catch(() => {});
    }
  }, [stream]);

  if (isAudioOnly) return <audio ref={audioRef} autoPlay />;
  return <video ref={videoRef} autoPlay playsInline className={className} />;
};

export default VideoCall;
