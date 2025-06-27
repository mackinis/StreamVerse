
"use client";

import React, { useMemo, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminConfig } from '@/contexts/AdminConfigContext';
import { useSocket } from '@/contexts/SocketContext';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import Image from 'next/image';
import type { ChatMessage } from '@/types';

export function LiveChat() {
  const { user } = useAuth();
  const { config, setConfig, t } = useAdminConfig(); 
  const { socket } = useSocket();
  const { toast } = useToast();
  
  const [newMessage, setNewMessage] = React.useState('');
  const chatMessagesContainerRef = React.useRef<HTMLDivElement>(null);

  const { profanityFilterEnabled, bannedKeywords, bannedUserIds } = config.chatModeration;

  const parsedBannedKeywords = React.useMemo(() => (bannedKeywords || '').split(',').map(kw => kw.trim().toLowerCase()).filter(Boolean), [bannedKeywords]);
  const parsedBannedUserIds = React.useMemo(() => (bannedUserIds || '').split(',').map(id => id.trim()).filter(Boolean), [bannedUserIds]);
  
  const displayMessages = useMemo(() => config.chatMessages || [], [config.chatMessages]);

  React.useEffect(() => {
    if (chatMessagesContainerRef.current) {
      chatMessagesContainerRef.current.scrollTop = chatMessagesContainerRef.current.scrollHeight;
    }
  }, [displayMessages]);

  const canChat = useMemo(() => {
    if (config.chatAccess === 'public') {
      if (user) { // Logged-in user, check if banned.
        return !parsedBannedUserIds.includes(user.id);
      }
      return true; // Anonymous users can always use the input in public mode.
    }

    // --- From here on, user must be logged in ---
    if (!user) return false;
    
    if (user.isAdmin) return true;
    
    if (parsedBannedUserIds.includes(user.id)) return false;
    
    switch (config.chatAccess) {
      case 'loggedIn': return true;
      case 'exclusive': return user.groups?.includes(config.chatAccessGroup) ?? false;
      default: return false;
    }
  }, [user, config.chatAccess, config.chatAccessGroup, parsedBannedUserIds]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) {
      return;
    }

    // The user is not logged in.
    if (!user) {
      // But if the chat is public, they are allowed to send a message.
      if (config.chatAccess === 'public') {
        const message: ChatMessage = {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
          userId: `guest:${socket?.id || Math.random().toString(36).substring(2, 9)}`,
          userName: 'Visitante',
          userAvatar: `https://placehold.co/40x40.png?text=V`,
          text: newMessage.trim(),
          timestamp: Date.now(),
        };
        setConfig(prevConfig => ({ ...prevConfig, chatMessages: [...(prevConfig.chatMessages || []), message].slice(-100) }));
        setNewMessage('');
        return;
      } else {
        // Not public chat and no user -> show login message.
        toast({ variant: "destructive", title: t('authErrorToastTitle'), description: t('livePageLoginToSendMessage') });
        return;
      }
    }

    // --- From here on, we know a user is logged in ---
    
    if (!canChat) {
      toast({ variant: "destructive", title: t('livePageMessageBlockedBanned')});
      setNewMessage('');
      return;
    }
    
    if (profanityFilterEnabled) {
      const messageTextLower = newMessage.trim().toLowerCase();
      if (parsedBannedKeywords.some(keyword => messageTextLower.includes(keyword))) {
        toast({ variant: "destructive", title: t('livePageMessageBlockedLanguage') });
        return; 
      }
    }

    const message: ChatMessage = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9), 
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar || `https://placehold.co/40x40.png?text=${user.name.charAt(0)}`,
      text: newMessage.trim(),
      timestamp: Date.now(),
    };
    
    setConfig(prevConfig => ({ ...prevConfig, chatMessages: [...(prevConfig.chatMessages || []), message].slice(-100) }));
    setNewMessage('');
  };


  return (
    <Card className="h-full flex flex-col">
      <CardHeader><CardTitle className="font-headline">{t('livePageStreamChatTitle')}</CardTitle></CardHeader>
      <CardContent ref={chatMessagesContainerRef} className="flex-grow overflow-y-auto space-y-3 p-4 bg-muted/30 rounded-b-md">
        {displayMessages.map(msg => (
          <div key={msg.id} className={`flex items-start gap-2 ${msg.userId === user?.id ? 'justify-end' : ''}`}>
            {msg.userId !== user?.id && <Image src={msg.userAvatar || `https://placehold.co/32x32.png`} alt={msg.userName} width={32} height={32} className="rounded-full" data-ai-hint="avatar person" />}
            <div className={`p-2 rounded-lg max-w-[70%] ${msg.userId === user?.id ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
              <p className="text-xs font-semibold">{msg.userName}</p>
              <p className="text-sm break-words">{msg.text}</p>
              <p className="text-xs text-muted-foreground/70 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
            </div>
             {msg.userId === user?.id && <Image src={user.avatar || `https://placehold.co/32x32.png`} alt={user.name} width={32} height={32} className="rounded-full" data-ai-hint="avatar person" />}
          </div>
        ))}
        {displayMessages.length === 0 && <p className="text-center text-muted-foreground">{t('livePageChatNoMessages')}</p>}
      </CardContent>
      <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
        <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={t('livePageChatInputPlaceholder')} disabled={!canChat} />
        <Button type="submit" size="icon" disabled={!canChat || !newMessage.trim()}><Send className="h-5 w-5" /></Button>
      </form>
    </Card>
  );
}
