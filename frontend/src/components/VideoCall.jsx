import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, MicOff, PhoneOff, Video, VideoOff, X } from 'lucide-react';
import { getSocket } from '../utils/socketConnection';

const ICE_SERVERS = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

const VideoCall = ({ roomCode, username, requestedCall, onRequestHandled }) => {
  const socket = getSocket();
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef(new Map());
  const isInCallRef = useRef(false);
  const callTypeRef = useRef('video');
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
      audio: true,
      video: type === 'video',
    });

    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    return stream;
  }, []);

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
      }
    };

    const handleIceCandidate = async ({ fromSocketId, candidate }) => {
      const peer = peersRef.current.get(fromSocketId);
      if (peer) {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      }
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
        <div className="fixed inset-x-3 top-20 sm:top-24 z-[70] mx-auto max-w-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {incomingCall.userName || 'Someone'} started a {incomingCall.callType} call
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Join the room call when you are ready.
              </p>
            </div>
            <button onClick={rejectIncomingCall} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Dismiss call">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={acceptIncomingCall} className="flex-1 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700">
              Join
            </button>
            <button onClick={rejectIncomingCall} className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold">
              Ignore
            </button>
          </div>
        </div>
      )}

      {isInCall && (
        <div className="fixed bottom-20 sm:bottom-24 right-3 sm:right-6 z-[60] w-[min(92vw,420px)] rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-950 shadow-2xl overflow-hidden">
          <div className="grid grid-cols-2 gap-1 p-1 min-h-48">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className={`aspect-video w-full rounded-lg bg-gray-900 object-cover ${callType === 'audio' ? 'hidden' : ''}`}
            />
            {callType === 'audio' && (
              <div className="col-span-2 flex min-h-36 items-center justify-center rounded-lg bg-gray-900 text-white text-sm font-semibold">
                {username}
              </div>
            )}
            {remoteStreams.map(({ socketId, stream }) => (
              <RemoteVideo key={socketId} stream={stream} isAudioOnly={callType === 'audio'} />
            ))}
          </div>
          <div className="flex items-center justify-between gap-2 bg-gray-900 px-3 py-2">
            <span className="text-xs font-medium text-gray-300">
              {remoteStreams.length + 1} in {callType} call
            </span>
            <div className="flex items-center gap-2">
              <button onClick={toggleMic} className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white" aria-label={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}>
                {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              {callType === 'video' && (
                <button onClick={toggleCamera} className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white" aria-label={isCameraOff ? 'Turn camera on' : 'Turn camera off'}>
                  {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                </button>
              )}
              <button onClick={() => endCall(true)} className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white" aria-label="End call">
                <PhoneOff className="w-4 h-4" />
              </button>
            </div>
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

const RemoteVideo = ({ stream, isAudioOnly }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (isAudioOnly) {
    return null;
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className="aspect-video w-full rounded-lg bg-gray-900 object-cover"
    />
  );
};

export default VideoCall;
