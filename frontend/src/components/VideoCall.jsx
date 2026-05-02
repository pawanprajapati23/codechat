import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Phone, PhoneOff, SwitchCamera, User, Video, VideoOff, X } from 'lucide-react';
import { getSocket } from '../utils/socketConnection';

const ICE_SERVERS = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
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
  const [isInCall, setIsInCall] = useState(false);
  const [callType, setCallType] = useState('video');
  const [incomingCall, setIncomingCall] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [error, setError] = useState('');

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
  }, [stopLocalStream]);

  const getLocalStream = useCallback(async (type) => {
    if (localStreamRef.current) {
      return localStreamRef.current;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: type === 'video' ? { facingMode: facingModeRef.current } : false,
    });

    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    return stream;
  }, []);

  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [isInCall, callType]);

  const createPeer = useCallback((targetSocketId) => {
    const existingPeer = peersRef.current.get(targetSocketId);
    if (existingPeer) {
      return existingPeer;
    }

    const peer = new RTCPeerConnection(ICE_SERVERS);
    peersRef.current.set(targetSocketId, peer);

    localStreamRef.current?.getTracks().forEach((track) => {
      peer.addTrack(track, localStreamRef.current);
    });

    peer.ontrack = (event) => {
      const [stream] = event.streams;
      setRemoteStreams((streams) => {
        const existingIndex = streams.findIndex((item) => item.socketId === targetSocketId);
        const nextStream = { socketId: targetSocketId, stream };
        if (existingIndex === -1) return [...streams, nextStream];
        return streams.map((item, index) => (index === existingIndex ? nextStream : item));
      });
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('call:ice-candidate', {
          targetSocketId,
          candidate: event.candidate,
        });
      }
    };

    peer.onconnectionstatechange = () => {
      if (['closed', 'disconnected', 'failed'].includes(peer.connectionState)) {
        removePeer(targetSocketId);
        pendingIceCandidatesRef.current.delete(targetSocketId);
      }
    };

    return peer;
  }, [removePeer, socket]);

  const sendOffer = useCallback(async (targetSocketId) => {
    const peer = createPeer(targetSocketId);
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.emit('call:offer', {
      targetSocketId,
      offer,
      roomCode,
      callType: callTypeRef.current,
    });
  }, [createPeer, roomCode, socket]);

  const answerOffer = useCallback(async ({ fromSocketId, offer, callType: incomingType }) => {
    const type = incomingType || callTypeRef.current;
    await getLocalStream(type);
    callTypeRef.current = type;
    setCallType(type);
    isInCallRef.current = true;
    setIsInCall(true);

    const peer = createPeer(fromSocketId);
    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    const queuedCandidates = pendingIceCandidatesRef.current.get(fromSocketId) || [];
    await Promise.all(queuedCandidates.map((candidate) => peer.addIceCandidate(new RTCIceCandidate(candidate))));
    pendingIceCandidatesRef.current.delete(fromSocketId);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    socket.emit('call:answer', { targetSocketId: fromSocketId, answer });
  }, [createPeer, getLocalStream, socket]);

  const startCall = useCallback(async (type) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Audio and video calls are not supported in this browser.');
      return;
    }

    try {
      setError('');
      await getLocalStream(type);
      callTypeRef.current = type;
      setCallType(type);
      isInCallRef.current = true;
      setIsInCall(true);
      socket.emit('call:join', { roomCode, callType: type });

      const pendingOffers = pendingOffersRef.current;
      pendingOffersRef.current = [];
      await Promise.all(pendingOffers.map((offer) => answerOffer(offer)));
    } catch (err) {
      setError(err.name === 'NotAllowedError' ? 'Camera or microphone permission was blocked.' : 'Could not start the call.');
      resetCall();
    }
  }, [answerOffer, getLocalStream, resetCall, roomCode, socket]);

  const endCall = useCallback((notifyAll = false) => {
    socket.emit(notifyAll ? 'call:end' : 'call:leave', { roomCode });
    resetCall();
  }, [resetCall, roomCode, socket]);

  useEffect(() => {
    if (requestedCall) {
      startCall(requestedCall);
      onRequestHandled();
    }
  }, [onRequestHandled, requestedCall, startCall]);

  useEffect(() => {
    const handleUserJoined = async ({ socketId, userName, callType: joinedCallType }) => {
      if (socketId === socket.id) return;

      if (!isInCallRef.current) {
        callTypeRef.current = joinedCallType || 'video';
        setIncomingCall({ socketId, userName, callType: callTypeRef.current });
        return;
      }

      try {
        await sendOffer(socketId);
      } catch {
        setError('Could not connect to a caller.');
      }
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

      try {
        await answerOffer(offerData);
      } catch {
        setError('Could not answer the call.');
      }
    };

    const handleAnswer = async ({ fromSocketId, answer }) => {
      const peer = peersRef.current.get(fromSocketId);
      if (peer && peer.signalingState !== 'stable') {
        await peer.setRemoteDescription(new RTCSessionDescription(answer));
        const queuedCandidates = pendingIceCandidatesRef.current.get(fromSocketId) || [];
        await Promise.all(queuedCandidates.map((candidate) => peer.addIceCandidate(new RTCIceCandidate(candidate))));
        pendingIceCandidatesRef.current.delete(fromSocketId);
      }
    };

    const handleIceCandidate = async ({ fromSocketId, candidate }) => {
      const peer = peersRef.current.get(fromSocketId);
      if (peer?.remoteDescription) {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
        return;
      }

      const queuedCandidates = pendingIceCandidatesRef.current.get(fromSocketId) || [];
      pendingIceCandidatesRef.current.set(fromSocketId, [...queuedCandidates, candidate]);
    };

    const handleUserLeft = ({ socketId }) => removePeer(socketId);
    const handleCallEnded = () => resetCall();

    socket.on('call:user-joined', handleUserJoined);
    socket.on('call:offer', handleOffer);
    socket.on('call:answer', handleAnswer);
    socket.on('call:ice-candidate', handleIceCandidate);
    socket.on('call:user-left', handleUserLeft);
    socket.on('call:ended', handleCallEnded);

    return () => {
      socket.off('call:user-joined', handleUserJoined);
      socket.off('call:offer', handleOffer);
      socket.off('call:answer', handleAnswer);
      socket.off('call:ice-candidate', handleIceCandidate);
      socket.off('call:user-left', handleUserLeft);
      socket.off('call:ended', handleCallEnded);
      if (isInCallRef.current) {
        socket.emit('call:leave', { roomCode });
      }
      resetCall();
    };
  }, [answerOffer, removePeer, resetCall, roomCode, sendOffer, socket]);

  const toggleMic = () => {
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = isMicMuted;
    });
    setIsMicMuted((value) => !value);
  };

  const toggleCamera = () => {
    localStreamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = isCameraOff;
    });
    setIsCameraOff((value) => !value);
  };

  const switchCamera = async () => {
    if (callType !== 'video' || !localStreamRef.current) return;

    const nextFacingMode = facingModeRef.current === 'user' ? 'environment' : 'user';

    try {
      setError('');
      const nextStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: nextFacingMode },
      });
      const [nextVideoTrack] = nextStream.getVideoTracks();
      if (!nextVideoTrack) return;

      const [currentVideoTrack] = localStreamRef.current.getVideoTracks();
      if (currentVideoTrack) {
        localStreamRef.current.removeTrack(currentVideoTrack);
        currentVideoTrack.stop();
      }
      localStreamRef.current.addTrack(nextVideoTrack);

      await Promise.all(Array.from(peersRef.current.values()).map(async (peer) => {
        const sender = peer.getSenders().find((item) => item.track?.kind === 'video');
        if (sender) {
          await sender.replaceTrack(nextVideoTrack);
        }
      }));

      facingModeRef.current = nextFacingMode;
      setIsCameraOff(false);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    } catch {
      setError('Could not switch camera on this device.');
    }
  };

  const acceptIncomingCall = () => {
    const type = incomingCall?.callType || 'video';
    setIncomingCall(null);
    startCall(type);
  };

  const rejectIncomingCall = () => {
    pendingOffersRef.current = [];
    setIncomingCall(null);
  };

  if (!isInCall && !incomingCall && !error) {
    return null;
  }

  return (
    <>
      {incomingCall && !isInCall && (
        <div className="fixed inset-x-3 top-20 sm:top-24 z-[70] mx-auto max-w-sm rounded-2xl border border-emerald-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                {incomingCall.callType === 'video' ? <Video className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {incomingCall.userName || 'Someone'} started a {incomingCall.callType} call
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Incoming CodeChat call
                </p>
              </div>
            </div>
            <button onClick={rejectIncomingCall} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Dismiss call">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={acceptIncomingCall} className="flex-1 px-3 py-2 rounded-full bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700">
              Pick up
            </button>
            <button onClick={rejectIncomingCall} className="px-3 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold">
              Ignore
            </button>
          </div>
        </div>
      )}

      {isInCall && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 z-[60] sm:w-[min(92vw,420px)] sm:rounded-3xl border border-gray-800 bg-[#0b141a] shadow-2xl overflow-hidden">
          <div className="relative min-h-[100dvh] sm:min-h-[520px] bg-[#111b21]">
            <div className="absolute inset-0">
              {callType === 'video' && remoteStreams[0] ? (
                <RemoteVideo stream={remoteStreams[0].stream} isAudioOnly={false} className="h-full w-full rounded-none" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center bg-[#111b21] text-white">
                  <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-600/20 text-emerald-200">
                    <User className="h-12 w-12" />
                  </div>
                  <p className="text-lg font-semibold">{remoteStreams.length ? 'Connected' : 'Calling...'}</p>
                  <p className="mt-1 text-sm text-gray-400">{callType === 'audio' ? 'Audio call' : 'Waiting for video'}</p>
                </div>
              )}
            </div>

            {callType === 'video' && (
              <div className="absolute right-3 top-4 h-36 w-24 overflow-hidden rounded-2xl border border-white/20 bg-gray-950 shadow-xl sm:h-32 sm:w-24">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`h-full w-full object-cover ${isCameraOff ? 'hidden' : ''}`}
                />
                {isCameraOff && (
                  <div className="flex h-full w-full items-center justify-center bg-gray-900 text-gray-300">
                    <VideoOff className="h-6 w-6" />
                  </div>
                )}
              </div>
            )}

            <div className="absolute left-0 right-0 top-0 bg-gradient-to-b from-black/70 to-transparent px-4 py-5 text-white">
              <p className="text-sm font-medium">{remoteStreams.length + 1} in {callType} call</p>
              <p className="text-xs text-gray-300">{username}</p>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-5 pb-7 pt-20">
              <div className="mx-auto flex max-w-xs items-center justify-center gap-4 rounded-full bg-[#202c33]/90 px-4 py-3 backdrop-blur">
                <button onClick={toggleMic} className={`p-3 rounded-full text-white ${isMicMuted ? 'bg-white/20' : 'bg-[#2a3942] hover:bg-[#324650]'}`} aria-label={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}>
                  {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                {callType === 'video' && (
                  <>
                    <button onClick={switchCamera} className="p-3 rounded-full bg-[#2a3942] text-white hover:bg-[#324650]" aria-label="Switch camera">
                      <SwitchCamera className="w-5 h-5" />
                    </button>
                    <button onClick={toggleCamera} className={`p-3 rounded-full text-white ${isCameraOff ? 'bg-white/20' : 'bg-[#2a3942] hover:bg-[#324650]'}`} aria-label={isCameraOff ? 'Turn camera on' : 'Turn camera off'}>
                      {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                    </button>
                  </>
                )}
                <button onClick={() => endCall(true)} className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white" aria-label="End call">
                  <PhoneOff className="w-5 h-5" />
                </button>
              </div>
            </div>

            {remoteStreams.slice(callType === 'video' ? 1 : 0).map(({ socketId, stream }) => (
              <RemoteVideo key={socketId} stream={stream} isAudioOnly={callType === 'audio'} />
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="fixed inset-x-3 top-20 z-[80] mx-auto max-w-sm rounded-xl bg-red-600 text-white shadow-xl px-4 py-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span>{error}</span>
            <button onClick={() => setError('')} className="p-1" aria-label="Dismiss error">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const RemoteVideo = ({ stream, isAudioOnly, className = 'aspect-video w-full rounded-lg' }) => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    if (audioRef.current) {
      audioRef.current.srcObject = stream;
      audioRef.current.play().catch(() => {});
    }
  }, [stream]);

  if (isAudioOnly) {
    return <audio ref={audioRef} autoPlay />;
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className={`${className} bg-gray-900 object-cover`}
    />
  );
};

export default VideoCall;
