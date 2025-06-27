
"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminConfig } from '@/contexts/AdminConfigContext';
import { useSocket } from '@/contexts/SocketContext';
import { getUserProfileById } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Radio, Video as VideoIconLucideSvg, AlertTriangle, Mic, MicOff, Loader2, VolumeX, Volume2, PhoneCall, PhoneOff, XCircle, Users } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { LiveChat } from '@/components/features/LiveChat';
import type { UserProfile } from '@/types';

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

export default function AdminVideoCallControlPage() {
  const { user: adminUser, loading: authLoading } = useAuth();
  const { config, setConfig, t, siteSettingsForSocket, isClientHydrated } = useAdminConfig();
  const { socket, isConnected: isSocketConnectedToServer } = useSocket();
  const { toast } = useToast();

  const designatedUserId = siteSettingsForSocket?.liveStreamAuthorizedUserId;

  // Shared state
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [isMicrophoneMuted, setIsMicrophoneMuted] = useState(false);

  // Private Call State
  const [isPrivateCallActive, setIsPrivateCallActive] = useState(false);
  const [privateCallStatus, setPrivateCallStatus] = useState('');
  const [localStreamForCall, setLocalStreamForCall] = useState<MediaStream | null>(null);
  const [remoteStreamForCall, setRemoteStreamForCall] = useState<MediaStream | null>(null);
  const privateCallPeerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [isRemoteVideoMuted, setIsRemoteVideoMuted] = useState(false);
  const privateCallTargetSocketId = useRef<string | null>(null);

  // General Stream State
  const [isGeneralStreamActive, setIsGeneralStreamActive] = useState(false);
  const [localStreamForGeneral, setLocalStreamForGeneral] = useState<MediaStream | null>(null);
  const generalStreamPeerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const [isLocalPreviewAudioMuted, setIsLocalPreviewAudioMuted] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);

  // User Presence State
  const [authorizedUserForStream, setAuthorizedUserForStream] = useState<UserProfile | null>(null);
  const [isLoadingAuthorizedUser, setIsLoadingAuthorizedUser] = useState(true);
  const [isAuthorizedUserReadyForCall, setIsAuthorizedUserReadyForCall] = useState(false);

  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const pipVideoRef = useRef<HTMLVideoElement>(null);

  // --- DATA FETCHING & PRESENCE ---
  useEffect(() => {
    if (designatedUserId) {
      setIsLoadingAuthorizedUser(true);
      getUserProfileById(designatedUserId)
        .then(setAuthorizedUserForStream)
        .finally(() => setIsLoadingAuthorizedUser(false));
      socket?.emit('admin:check-user-status', { targetUserId: designatedUserId });
    } else {
      setAuthorizedUserForStream(null);
      setIsAuthorizedUserReadyForCall(false);
      setIsLoadingAuthorizedUser(false);
    }
  }, [designatedUserId, socket]);

  // --- UTILITIES: Get Camera & Cleanup ---
  const getCameraPermission = useCallback(async (): Promise<MediaStream | null> => {
    setIsLoadingVideo(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setHasCameraPermission(true);
      return stream;
    } catch (error) {
      setHasCameraPermission(false);
      toast({ variant: 'destructive', title: t('adminLivestream.toast.cameraAccessDeniedTitle'), description: t('adminLivestream.toast.cameraAccessDeniedDescription') });
      return null;
    } finally {
      setIsLoadingVideo(false);
    }
  }, [toast, t]);

  const cleanupPrivateCall = useCallback((emitToServer = true) => {
    if (privateCallPeerConnectionRef.current) privateCallPeerConnectionRef.current.close();
    privateCallPeerConnectionRef.current = null;
    localStreamForCall?.getTracks().forEach(track => track.stop());
    setLocalStreamForCall(null);
    if (emitToServer && socket && privateCallTargetSocketId.current) {
      socket.emit('webrtc:end-call', { targetSocketId: privateCallTargetSocketId.current });
    }
    setRemoteStreamForCall(null);
    setIsPrivateCallActive(false);
    setPrivateCallStatus('');
    privateCallTargetSocketId.current = null;
  }, [localStreamForCall, socket]);

  const cleanupGeneralStream = useCallback(() => {
    generalStreamPeerConnections.current.forEach(pc => pc.close());
    generalStreamPeerConnections.current.clear();
    setViewerCount(0);
    localStreamForGeneral?.getTracks().forEach(track => track.stop());
    setLocalStreamForGeneral(null);
    setIsGeneralStreamActive(false);
  }, [localStreamForGeneral]);

  // --- HANDLERS: Start Private Call & General Stream ---
  const handleStartPrivateCall = useCallback(async () => {
    if (!socket || !designatedUserId || !isAuthorizedUserReadyForCall || isPrivateCallActive || isGeneralStreamActive) return;
    const stream = await getCameraPermission();
    if (!stream) return;
    setLocalStreamForCall(stream);
    setIsPrivateCallActive(true);
    setPrivateCallStatus(`Inviting ${authorizedUserForStream?.name || 'user'}...`);
    socket.emit('admin:initiate-private-call-request', { targetUserId: designatedUserId, adminName: adminUser?.name || 'Admin' });
  }, [socket, designatedUserId, isAuthorizedUserReadyForCall, isPrivateCallActive, isGeneralStreamActive, getCameraPermission, authorizedUserForStream, adminUser]);

  const handleEndPrivateCall = useCallback(() => {
    cleanupPrivateCall(true);
  }, [cleanupPrivateCall]);

  const handleToggleGeneralStreaming = useCallback(async (title: string, subtitle: string, isLoggedInOnly: boolean) => {
    if (isGeneralStreamActive) {
      socket?.emit('admin:end-general-stream');
      cleanupGeneralStream();
    } else {
      if (isPrivateCallActive) return;
      const stream = await getCameraPermission();
      if (!stream) return;
      setLocalStreamForGeneral(stream);
      setIsGeneralStreamActive(true);
      socket?.emit('admin:start-general-stream', { title, subtitle, isLoggedInOnly });
    }
  }, [isGeneralStreamActive, isPrivateCallActive, getCameraPermission, socket, cleanupGeneralStream]);

  // --- MASTER SOCKET LISTENER ---
  useEffect(() => {
    if (!socket) return;
    const handleUserStatusUpdate = (data: { userId: string, isConnected: boolean, isReadyOnCallPage: boolean }) => {
      if (data.userId === designatedUserId) {
        setIsAuthorizedUserReadyForCall(data.isReadyOnCallPage);
        if (!data.isConnected && isPrivateCallActive) cleanupPrivateCall(false);
      }
    };

    const handleUserAcceptedCall = async (data: { userSocketId: string, userAppUserId: string }) => {
      if (data.userAppUserId !== designatedUserId || !localStreamForCall) return;
      privateCallTargetSocketId.current = data.userSocketId;
      setPrivateCallStatus(`Connecting to ${authorizedUserForStream?.name || 'user'}...`);
      const pc = new RTCPeerConnection(PC_CONFIG);
      privateCallPeerConnectionRef.current = pc;
      localStreamForCall.getTracks().forEach(track => pc.addTrack(track, localStreamForCall));
      
      pc.ontrack = (event) => {
        setRemoteStreamForCall(event.streams[0]);
      };

      pc.onicecandidate = (event) => { if (event.candidate) socket.emit('webrtc:ice-candidate', { targetSocketId: data.userSocketId, candidate: event.candidate }); };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') setPrivateCallStatus(`Connected`);
        if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) cleanupPrivateCall(false);
      };
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('private-sdp-offer', { targetSocketId: data.userSocketId, offer });
    };

    const handlePrivateCallAnswer = (data: { answer: RTCSessionDescriptionInit }) => {
      privateCallPeerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(data.answer));
    };

    const handleNewViewerRequest = async (data: { viewerSocketId: string }) => {
      if (!localStreamForGeneral) return;
      const pc = new RTCPeerConnection(PC_CONFIG);
      generalStreamPeerConnections.current.set(data.viewerSocketId, pc);
      setViewerCount(generalStreamPeerConnections.current.size);
      localStreamForGeneral.getTracks().forEach(track => pc.addTrack(track, localStreamForGeneral));
      pc.onicecandidate = (event) => { if (event.candidate) socket.emit('webrtc:ice-candidate', { targetSocketId: data.viewerSocketId, candidate: event.candidate }); };
      pc.onconnectionstatechange = () => { 
        if (['disconnected', 'closed', 'failed'].includes(pc.connectionState)) {
          generalStreamPeerConnections.current.delete(data.viewerSocketId);
          setViewerCount(generalStreamPeerConnections.current.size);
        }
      };
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('broadcaster:offer-to-viewer', { viewerSocketId: data.viewerSocketId, offer });
    };

    const handleAnswerFromViewer = (data: { viewerSocketId: string, answer: RTCSessionDescriptionInit }) => {
      generalStreamPeerConnections.current.get(data.viewerSocketId)?.setRemoteDescription(new RTCSessionDescription(data.answer));
    };

    const handleRemoteCandidate = (data: { senderSocketId: string, candidate: RTCIceCandidateInit }) => {
      const pc = generalStreamPeerConnections.current.get(data.senderSocketId) || (data.senderSocketId === privateCallTargetSocketId.current ? privateCallPeerConnectionRef.current : null);
      pc?.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(console.error);
    };

    const handleCallEndedByPeer = () => { if (isPrivateCallActive) cleanupPrivateCall(false); };
    
    socket.on('server:user-status-update', handleUserStatusUpdate);
    socket.on('server:user-accepted-call', handleUserAcceptedCall);
    socket.on('server:sdp-answer-received', handlePrivateCallAnswer);
    socket.on('server:new-viewer-request', handleNewViewerRequest);
    socket.on('server:answer-from-viewer', handleAnswerFromViewer);
    socket.on('webrtc:ice-candidate-received', handleRemoteCandidate);
    socket.on('webrtc:call-ended-by-peer', handleCallEndedByPeer);
    return () => {
      socket.off('server:user-status-update', handleUserStatusUpdate);
      socket.off('server:user-accepted-call', handleUserAcceptedCall);
      socket.off('server:sdp-answer-received', handlePrivateCallAnswer);
      socket.off('server:new-viewer-request', handleNewViewerRequest);
      socket.off('server:answer-from-viewer', handleAnswerFromViewer);
      socket.off('webrtc:ice-candidate-received', handleRemoteCandidate);
      socket.off('webrtc:call-ended-by-peer', handleCallEndedByPeer);
    };
  }, [socket, designatedUserId, isPrivateCallActive, localStreamForCall, localStreamForGeneral, cleanupPrivateCall, authorizedUserForStream, cleanupGeneralStream]);

  // --- UI & MEDIA CONTROLS ---
  useEffect(() => {
    if (mainVideoRef.current) {
      const streamToShow = isPrivateCallActive ? remoteStreamForCall : localStreamForGeneral;
      if (mainVideoRef.current.srcObject !== streamToShow) {
        mainVideoRef.current.srcObject = streamToShow;
      }
    }
  }, [isPrivateCallActive, remoteStreamForCall, isGeneralStreamActive, localStreamForGeneral]);

  useEffect(() => {
    if (pipVideoRef.current) {
      const streamToShow = isPrivateCallActive ? localStreamForCall : null; // Only show PiP during private call
      if (pipVideoRef.current.srcObject !== streamToShow) {
        pipVideoRef.current.srcObject = streamToShow;
      }
    }
  }, [localStreamForCall, isPrivateCallActive]);
  
  const toggleMicrophone = useCallback(() => {
    const stream = isPrivateCallActive ? localStreamForCall : localStreamForGeneral;
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicrophoneMuted(!audioTrack.enabled);
      }
    }
  }, [isPrivateCallActive, localStreamForCall, localStreamForGeneral]);
  
  const toggleLocalPreviewAudio = useCallback(() => setIsLocalPreviewAudioMuted(p => !p), []);
  const toggleRemoteVideoMute = useCallback(() => setIsRemoteVideoMuted(p => !p), []);
  const handleClearDesignation = () => setConfig(prev => ({ ...prev, liveStreamAuthorizedUserId: null }));

  if (authLoading || !isClientHydrated) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  const canStartCall = designatedUserId && isAuthorizedUserReadyForCall && !isPrivateCallActive && !isGeneralStreamActive;
  const canStartGeneralStream = !isGeneralStreamActive && !isPrivateCallActive;
  const currentActiveStream = isPrivateCallActive ? localStreamForCall : localStreamForGeneral;
  
  let videoAreaTitle = 'Stream Preview / Call View';
  if (isPrivateCallActive && authorizedUserForStream) videoAreaTitle = `Call with ${authorizedUserForStream.name}`;
  if (isGeneralStreamActive) videoAreaTitle = siteSettingsForSocket?.liveStreamDefaultTitle || 'General Stream';
  
  let videoAreaSubtitle = privateCallStatus;
  if (isGeneralStreamActive) videoAreaSubtitle = siteSettingsForSocket?.persistentSubtitle || '';

  const getUserStatusText = () => {
    if (isLoadingAuthorizedUser) return 'Loading user...';
    if (!designatedUserId || !authorizedUserForStream) return t('adminLivestream.privateCall.noUserConfigured');
    return `${t('adminLivestream.privateCall.configCard.authorizedUserLabel')} ${authorizedUserForStream.name} (${isAuthorizedUserReadyForCall ? 'Ready on Call Page' : 'Not on Call Page / Disconnected'})`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold text-primary flex items-center"><Radio className="mr-3 h-8 w-8" /> {t('adminLivestream.pageTitle')}</h1>
        <div className={cn("text-sm font-medium", isSocketConnectedToServer ? "text-green-500" : "text-destructive")}>Socket: {isSocketConnectedToServer ? "Connected" : "Connecting..."}</div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">{t('adminLivestream.privateCall.cardTitle')}</CardTitle>
            <CardDescription>{getUserStatusText()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              <Button onClick={isPrivateCallActive ? handleEndPrivateCall : handleStartPrivateCall} disabled={!isPrivateCallActive && !canStartCall}>
                {isLoadingVideo && !isPrivateCallActive && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPrivateCallActive ? <PhoneOff className="mr-2 h-4 w-4" /> : <PhoneCall className="mr-2 h-4 w-4" />}
                {isPrivateCallActive ? t('adminLivestream.endPrivateCallButton') : t('adminLivestream.startPrivateCallButton')}
              </Button>
              {designatedUserId && !isPrivateCallActive && <Button variant="outline" onClick={handleClearDesignation}><XCircle className="mr-2 h-4 w-4" /> Limpiar Designación</Button>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">Transmisión General</CardTitle>
            <CardDescription>Transmitir a todos los usuarios en la página "En Vivo".</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              <Button onClick={() => handleToggleGeneralStreaming(siteSettingsForSocket?.liveStreamDefaultTitle || 'Live Stream', siteSettingsForSocket?.persistentSubtitle || '', siteSettingsForSocket?.liveStreamForLoggedInUsersOnly || false)} disabled={!canStartGeneralStream && !isGeneralStreamActive}>
                {isLoadingVideo && !isGeneralStreamActive && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isGeneralStreamActive ? <Radio className="mr-2 h-4 w-4 text-red-500 animate-pulse" /> : <VideoIconLucideSvg className="mr-2 h-4 w-4" />}
                {isGeneralStreamActive ? t('adminLivestream.streamControlCard.stopStreamButton') : t('adminLivestream.streamControlCard.startStreamButton')}
              </Button>
            </div>
            {isGeneralStreamActive && <div className="flex items-center text-sm text-muted-foreground"><Users className="mr-2 h-4 w-4" /> {viewerCount} {t('adminLivestream.statsCard.viewersLabel')}</div>}
          </CardContent>
        </Card>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="font-headline text-xl">{videoAreaTitle}</CardTitle>{videoAreaSubtitle && <CardDescription>{videoAreaSubtitle}</CardDescription>}</CardHeader>
            <CardContent>
              <div className="relative bg-black/80 p-2 rounded-lg border">
                <video ref={mainVideoRef} className="w-full aspect-video rounded-md bg-black" autoPlay playsInline muted={isPrivateCallActive ? isRemoteVideoMuted : isLocalPreviewAudioMuted} />
                {isPrivateCallActive && localStreamForCall && (
                  <div className="absolute bottom-4 right-4 w-1/4 max-w-[200px] aspect-video border-2 border-primary rounded-md overflow-hidden shadow-lg z-10">
                    <video ref={pipVideoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                  </div>
                )}
                {hasCameraPermission === false && (isGeneralStreamActive || isPrivateCallActive) && <Alert variant="destructive" className="mt-4"><AlertTriangle className="h-4 w-4" /><AlertTitle>{t('adminLivestream.toast.cameraAccessDeniedTitle')}</AlertTitle><AlertDescription>{t('adminLivestream.toast.cameraAccessDeniedDescription')}</AlertDescription></Alert>}
                {isLoadingVideo && <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/80"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="mt-2 text-muted-foreground">{privateCallStatus || t('adminLivestream.videoArea.startingCamera')}</p></div>}
                {!isGeneralStreamActive && !isPrivateCallActive && !isLoadingVideo && <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/80"><VideoIconLucideSvg className="h-16 w-16 text-muted-foreground/50" /><p className="mt-4 text-lg text-muted-foreground">{siteSettingsForSocket?.liveStreamOfflineMessage || t('adminLivestream.videoArea.offlineMessage')}</p></div>}
              </div>
              <div className="mt-3 flex items-center justify-center space-x-3">
                {currentActiveStream && <Button onClick={toggleMicrophone} variant="outline" size="sm">{isMicrophoneMuted ? <MicOff /> : <Mic />}{isMicrophoneMuted ? t('adminLivestream.streamControlCard.unmuteMicButton') : t('adminLivestream.streamControlCard.muteMicButton')}</Button>}
                {isGeneralStreamActive && <Button onClick={toggleLocalPreviewAudio} variant="outline" size="sm"><VolumeX className={cn(isLocalPreviewAudioMuted ? '' : 'hidden')} /><Volume2 className={cn(isLocalPreviewAudioMuted ? 'hidden' : '')} />{isLocalPreviewAudioMuted ? t('adminLivestream.streamControlCard.unmuteLocalAudioButton') : t('adminLivestream.streamControlCard.unmuteLocalAudioButton')}</Button>}
                {isPrivateCallActive && remoteStreamForCall && <Button onClick={toggleRemoteVideoMute} variant="outline" size="sm"><VolumeX className={cn(isRemoteVideoMuted ? '' : 'hidden')} /><Volume2 className={cn(isRemoteVideoMuted ? 'hidden' : '')} />{isRemoteVideoMuted ? "Unmute User" : "Mute User"}</Button>}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 h-[calc(100vh-18rem)] max-h-[700px]"><LiveChat /></div>
      </div>
    </div>
  );
}
