"use client";

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminConfig } from '@/contexts/AdminConfigContext';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, Tv, Signal, SignalZero, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { LiveChat } from '@/components/features/LiveChat';
import { useSocket } from '@/contexts/SocketContext';

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

const StreamPlayer = ({ streamUrl, t }: { streamUrl: string, t: (key: any, subs?: Record<string,string>) => string }) => {
  const isIframe = streamUrl.trim().toLowerCase().startsWith('<iframe');
  if (isIframe) return <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg [&>iframe]:w-full [&>iframe]:h-full" dangerouslySetInnerHTML={{ __html: streamUrl }} />;
  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
      <video key={streamUrl} width="100%" height="100%" src={streamUrl} controls autoPlay playsInline muted className="w-full h-full object-contain" title={t('livePageStreamTitleCardDefault')}>
        {t('livePageStreamVideoNotSupported')}
      </video>
    </div>
  );
};

export default function LivePage() {
  const { user, loading: authLoading } = useAuth();
  const { config, isClientHydrated, t } = useAdminConfig();
  const router = useRouter();
  const { toast } = useToast();
  const { socket, isConnected } = useSocket();
  
  const designatedUserId = config.liveStreamAuthorizedUserId;

  const videoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [streamInfo, setStreamInfo] = useState<{title: string, subtitle:string} | null>(null);
  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'connected' | 'failed'>('idle');
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (authLoading || !isClientHydrated) return;
    if (designatedUserId) {
        toast({ variant: 'destructive', title: t('livePageAccessDeniedPrivateCallTitle'), description: t('livePageAccessDeniedPrivateCallDesc') });
        router.replace('/'); 
        return;
    }
    const hasAccess = () => {
        if (config.liveStreamAccess === 'public') return true;
        if (!user) return false; 
        if (config.liveStreamAccess === 'loggedIn') return true;
        if (config.liveStreamAccess === 'group' && user.groups?.includes(config.liveStreamAccessGroup || '')) return true;
        return false;
    }
    if (!hasAccess()) {
        toast({ variant: "destructive", title: t('accessDenied'), description: t('livePageStreamAccessDeniedUser') });
        router.replace(user ? '/' : `/signin?redirect=/live`);
    }
  }, [user, authLoading, isClientHydrated, designatedUserId, config.liveStreamAccess, config.liveStreamAccessGroup, router, t, toast]);

  // Main connection logic effect
  useEffect(() => {
    if (!socket || !isConnected) {
        return;
    }

    const cleanupConnection = () => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        setRemoteStream(null);
        setConnectionState('idle');
        setStreamInfo(null);
    };

    const handleOffer = async (data: { offer: RTCSessionDescriptionInit, broadcasterSocketId: string }) => {
        if (!data.offer) return;
        
        setConnectionState('connecting');
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }

        const pc = new RTCPeerConnection(PC_CONFIG);
        peerConnectionRef.current = pc;
        
        pc.ontrack = (event) => { 
            setRemoteStream(event.streams[0]);
        };
        pc.onicecandidate = (event) => { 
            if (event.candidate) {
                socket.emit('webrtc:ice-candidate', { targetSocketId: data.broadcasterSocketId, candidate: event.candidate });
            }
        };
        pc.onconnectionstatechange = () => {
            if (!peerConnectionRef.current) return;
            const state = peerConnectionRef.current.connectionState;
            if(state === 'connected') setConnectionState('connected');
            if (['failed', 'disconnected', 'closed'].includes(state)) {
                cleanupConnection();
            }
        };

        try {
            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('viewer:answer-to-broadcaster', { broadcasterSocketId: data.broadcasterSocketId, answer });
        } catch (error) {
            console.error("Error handling offer:", error);
            setConnectionState('failed');
        }
    };
    
    const handleStreamInfo = (data: { title: string, subtitle: string }) => {
        setStreamInfo(data);
    };

    const handleStreamEnded = () => {
        cleanupConnection();
    };

    const handleRemoteCandidate = (data: { senderSocketId: string, candidate: RTCIceCandidateInit }) => {
        if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription && data.candidate) {
            peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(err => {
                console.error("Error adding received ICE candidate", err);
            });
        }
    };
    
    // Attach all listeners
    socket.on('server:offer-from-broadcaster', handleOffer);
    socket.on('server:general-stream-info', handleStreamInfo);
    socket.on('server:general-stream-ended', handleStreamEnded);
    socket.on('webrtc:ice-candidate-received', handleRemoteCandidate);

    // Announce presence now that listeners are ready
    socket.emit('viewer:im-on-live-page');

    // Cleanup function
    return () => {
        socket.off('server:offer-from-broadcaster', handleOffer);
        socket.off('server:general-stream-info', handleStreamInfo);
        socket.off('server:general-stream-ended', handleStreamEnded);
        socket.off('webrtc:ice-candidate-received', handleRemoteCandidate);
        cleanupConnection();
    };
  }, [socket, isConnected]);


  // Effect to assign stream to video element
  useEffect(() => {
      if (videoRef.current && remoteStream) {
          videoRef.current.srcObject = remoteStream;
      } else if (videoRef.current) {
          videoRef.current.srcObject = null;
      }
  }, [remoteStream]);


  if (authLoading || !isClientHydrated) {
    return <div className="flex flex-col min-h-screen"><Navbar /><main className="flex-grow flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></main><Footer /></div>;
  }
  
  const renderWebRTCPlayer = () => (
      <Card>
          <CardHeader>
              <CardTitle className="flex items-center">
                  {connectionState === 'connected' ? <Signal className="text-green-500 mr-2"/> : <SignalZero className="text-destructive mr-2"/>}
                  {streamInfo?.title || "Transmisión en Vivo"}
              </CardTitle>
              {streamInfo?.subtitle && <CardDescription>{streamInfo.subtitle}</CardDescription>}
          </CardHeader>
          <CardContent>
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
                  <video ref={videoRef} className="w-full h-full object-contain" autoPlay playsInline muted />
                  {connectionState === 'connecting' && <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white"><Loader2 className="h-12 w-12 animate-spin text-primary mb-4" /><p className="text-lg">Conectando a la transmisión...</p></div>}
                  {(connectionState === 'idle' || connectionState === 'failed') && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white">
                        <Tv className="h-16 w-16 text-muted-foreground mb-4" />
                        <p className="text-lg">{t('adminLivestream.videoArea.offlineMessage')}</p>
                        {connectionState === 'failed' && <Button variant="secondary" className="mt-4" onClick={() => socket?.emit('viewer:im-on-live-page')}><RefreshCw className="mr-2 h-4 w-4"/>Reintentar Conexión</Button>}
                    </div>
                  )}
              </div>
          </CardContent>
      </Card>
  );

  const renderStreamContent = () => {
    if (config.streamSource === 'webcam') return renderWebRTCPlayer();
    if (config.streamSource === 'url') {
      return config.liveStreamUrl ? <StreamPlayer streamUrl={config.liveStreamUrl} t={t} /> : <Card className="aspect-video bg-muted flex flex-col items-center justify-center"><Tv className="h-16 w-16 text-muted-foreground mb-4" /><CardHeader className="p-0"><CardTitle>{t('livePageStreamNotConfiguredTitle')}</CardTitle></CardHeader></Card>;
    }
    return <Card className="aspect-video bg-muted flex flex-col items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></Card>;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">{renderStreamContent()}</div>
          <div className="lg:col-span-1 h-[calc(100vh-10rem)] max-h-[700px]"><LiveChat /></div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
