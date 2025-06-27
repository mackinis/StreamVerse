
"use client";

import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import { AdminConfigProvider } from '@/contexts/AdminConfigContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { PopupDisplayManager } from '@/components/features/PopupDisplayManager';
import { WhatsAppButton } from '@/components/features/WhatsAppButton';
import { CallManager } from '@/components/features/CallManager';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminConfigProvider>
        <SocketProvider>
          <PopupDisplayManager />
          <WhatsAppButton />
          <CallManager />
          {children}
          <Toaster />
        </SocketProvider>
      </AdminConfigProvider>
    </AuthProvider>
  );
}
