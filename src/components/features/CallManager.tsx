
"use client";

import { useEffect, useRef, useCallback } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useAdminConfig } from '@/contexts/AdminConfigContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle as DialogTitleComponent,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff as PhoneOffIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CallManager() {
  const { user } = useAuth();
  const { t } = useAdminConfig();
  const {
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
  } = useSocket();
  
  // Use callback refs for robust media element handling
  const localVideoRef = useCallback((node: HTMLVideoElement | null) => {
    if (node && localStream) {
      node.srcObject = localStream;
    }
  }, [localStream]);

  const remoteVideoRef = useCallback((node: HTMLVideoElement | null) => {
    if (node && remoteStream) {
      node.srcObject = remoteStream;
    }
  }, [remoteStream]);
  
  if (!user || (!incomingCall && !isCallInProgress)) {
    return null;
  }

  return (
    <>
      {/* Incoming Call Prompt */}
      <AlertDialog open={!!incomingCall && !isCallInProgress}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('userVideoCallIncomingCallTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('userVideoCallIncomingCallFrom', { name: incomingCall?.adminName || 'Admin' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={rejectCall}>{t('userVideoCallRejectButton')}</AlertDialogCancel>
            <AlertDialogAction onClick={acceptCall}>{t('userVideoCallAcceptButton')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Call In Progress Modal */}
      <Dialog open={isCallInProgress} onOpenChange={(open) => !open && endCall()}>
        <DialogContent className="max-w-4xl p-0 border-0" onInteractOutside={(e) => e.preventDefault()}>
           <DialogHeader className="p-4 border-b">
              <DialogTitleComponent>Videollamada con {incomingCall?.adminName || 'Admin'}</DialogTitleComponent>
           </DialogHeader>
           <div className="relative w-full aspect-video bg-black rounded-b-lg overflow-hidden">
                {/* Remote Video (main view) */}
                <video ref={remoteVideoRef} className="w-full h-full object-contain" autoPlay playsInline />
                {!remoteStream && (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="ml-2">Esperando al otro participante...</p>
                  </div>
                )}
                
                {/* Local Video (PiP) */}
                 {localStream && (
                    <div className="absolute bottom-4 right-4 w-1/4 max-w-[200px] aspect-video border-2 border-primary rounded-md overflow-hidden shadow-lg z-10">
                        <video ref={localVideoRef} className={cn("w-full h-full object-cover", isLocalVideoOff && 'hidden')} autoPlay playsInline muted />
                         {isLocalVideoOff && <div className="w-full h-full bg-black flex items-center justify-center"><VideoOff className="text-white"/></div>}
                    </div>
                )}
           </div>
           <DialogFooter className="p-4 border-t bg-background flex justify-center space-x-2">
                <Button onClick={toggleLocalMic} variant="outline" size="icon" aria-label={isLocalMicMuted ? "Unmute" : "Mute"}>
                    {isLocalMicMuted ? <MicOff /> : <Mic />}
                </Button>
                <Button onClick={toggleLocalVideo} variant="outline" size="icon" aria-label={isLocalVideoOff ? "Turn video on" : "Turn video off"}>
                    {isLocalVideoOff ? <VideoOff /> : <Video />}
                </Button>
                <Button onClick={endCall} variant="destructive" size="lg">
                    <PhoneOffIcon className="mr-2 h-5 w-5"/> {t('adminVideoCallEndCallButton')}
                </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
