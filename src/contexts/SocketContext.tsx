
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useAdminConfig } from './AdminConfigContext';
import type { IncomingCall } from '@/types';
import { useToast } from '@/hooks/use-toast';

const PC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    {
      urls: 'turn:global.relay.metered.ca:80',
      username: 'adec321c101830c29b8d5f53',
      credential: 'onjnB9t/tAaZs6km'
    },
    {
      urls: 'turn:global.relay.metered.ca:80?transport=tcp',
      username: 'adec321c101830c29b8d5f53',
      credential: 'onjnB9t/tAaZs6km'
    },
    {
      urls: 'turn:global.relay.metered.ca:443',
      username: 'adec321c101830c29b8d5f53',
      credential: 'onjnB9t/tAaZs6km'
    },
    {
      urls: 'turns:global.relay.metered.ca:443?transport=tcp',
      username: 'adec321c101830c29b8d5f53',
      credential: 'onjnB9t/tAaZs6km'
    }
  ],
};

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  incomingCall: IncomingCall | null;
  isCallInProgress: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isLocalMicMuted: boolean;
  isLocalVideoOff: boolean;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  toggleLocalMic: () => void;
  toggleLocalVideo: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { config } = useAdminConfig();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  // --- Call State ---
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [isCallInProgress, setIsCallInProgress] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isLocalMicMuted, setIsLocalMicMuted] = useState(false);
  const [isLocalVideoOff, setIsLocalVideoOff] = useState(false);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!socketRef.current) {
      socketRef.current = io({ path: '/api/socket_io', autoConnect: false });
    }
    const socket = socketRef.current;
    if (!socket.connected) {
      socket.connect();
    }
    const onConnect = () => { setIsConnected(true); socket.emit('identify', { userId: user?.id || null, isAdmin: isAdmin || false }); };
    const onDisconnect = () => {
        setIsConnected(false);
    };
    
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      if (socket.connected) socket.disconnect();
    };
  }, [authLoading, user, isAdmin]);

  const cleanupCall = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    localStream?.getTracks().forEach(track => track.stop());
    setLocalStream(null);
    setRemoteStream(null);
    setIsCallInProgress(false);
    setIncomingCall(null);
  }, [localStream]);

  const endCall = useCallback(() => {
    if (socketRef.current && incomingCall) {
      socketRef.current.emit('webrtc:end-call', { targetSocketId: incomingCall.adminSocketId });
    }
    cleanupCall();
  }, [incomingCall, cleanupCall]);

  const rejectCall = useCallback(() => {
    // Optionally notify admin that call was rejected
    setIncomingCall(null);
  }, []);

  const acceptCall = useCallback(async () => {
    if (!incomingCall || !socketRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setIsCallInProgress(true);
      socketRef.current.emit('user:accepts-private-call', { adminSocketId: incomingCall.adminSocketId });
    } catch (error) {
      console.error("Error getting user media:", error);
      toast({ variant: 'destructive', title: "Camera/Mic Error", description: "Could not access your camera or microphone." });
      setIncomingCall(null);
    }
  }, [incomingCall, toast]);

  const toggleLocalMic = useCallback(() => {
    if(localStream){
      localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsLocalMicMuted(prev => !prev);
    }
  }, [localStream]);

  const toggleLocalVideo = useCallback(() => {
    if(localStream){
      localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setIsLocalVideoOff(prev => !prev);
    }
  }, [localStream]);

  // --- Call-related Socket Listeners ---
  useEffect(() => {
    if (!socketRef.current || !user) return;
    const socket = socketRef.current;

    const handleInvite = (data: IncomingCall) => {
      if (user.id === config.liveStreamAuthorizedUserId && !isCallInProgress) {
        setIncomingCall(data);
      }
    };

    const handleOffer = async (data: { offer: RTCSessionDescriptionInit, senderSocketId: string }) => {
        if (!localStream || data.senderSocketId !== incomingCall?.adminSocketId) return;
        const pc = new RTCPeerConnection(PC_CONFIG);
        peerConnectionRef.current = pc;
        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
        
        pc.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
        };
        pc.onicecandidate = (event) => {
            if (event.candidate) socket.emit('webrtc:ice-candidate', { targetSocketId: data.senderSocketId, candidate: event.candidate });
        };
        pc.onconnectionstatechange = () => {
            if (['failed', 'disconnected', 'closed'].includes(pc.connectionState || '')) endCall();
        };

        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('private-sdp-answer', { targetSocketId: data.senderSocketId, answer });
    };

    const handleRemoteCandidate = (data: { senderSocketId: string, candidate: RTCIceCandidateInit }) => {
        if (data.senderSocketId === incomingCall?.adminSocketId && peerConnectionRef.current?.remoteDescription) {
            peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(console.error);
        }
    };
    
    const handleCallEndedByPeer = () => cleanupCall();
    
    socket.on('server:private-call-invite', handleInvite);
    socket.on('server:sdp-offer-received', handleOffer);
    socket.on('webrtc:ice-candidate-received', handleRemoteCandidate);
    socket.on('webrtc:call-ended-by-peer', handleCallEndedByPeer);

    return () => {
        socket.off('server:private-call-invite', handleInvite);
        socket.off('server:sdp-offer-received', handleOffer);
        socket.off('webrtc:ice-candidate-received', handleRemoteCandidate);
        socket.off('webrtc:call-ended-by-peer', handleCallEndedByPeer);
    };

  }, [user, config.liveStreamAuthorizedUserId, localStream, incomingCall, isCallInProgress, cleanupCall, endCall]);

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      isConnected,
      incomingCall,
      isCallInProgress,
      localStream,
      remoteStream,
      isLocalMicMuted,
      isLocalVideoOff,
      acceptCall,
      rejectCall,
      endCall,
      toggleLocalMic,
      toggleLocalVideo,
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
