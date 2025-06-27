"use client";

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, PhoneIncoming, Lock } from 'lucide-react';
import { useAdminConfig } from '@/contexts/AdminConfigContext';
import { useSocket } from '@/contexts/SocketContext';
import { useToast } from '@/hooks/use-toast';


export default function CallWaitingPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { config, isClientHydrated, t } = useAdminConfig();
  const router = useRouter();
  const { socket } = useSocket();
  const { toast } = useToast();

  const designatedUserId = config.liveStreamAuthorizedUserId;
  
  // Effect to check authorization and announce presence
  useEffect(() => {
    if (authLoading || !isClientHydrated) return;

    if (!designatedUserId) {
        toast({ variant: 'destructive', title: "No Active Call", description: "There is no private call session active." });
        router.replace('/');
        return;
    }
    if (!user) {
        toast({ variant: 'destructive', title: "Access Restricted", description: "You must be logged in for private calls." });
        router.replace(`/signin?redirect=/call`);
        return;
    }
    if (!isAdmin && user.id !== designatedUserId) {
        toast({ variant: 'destructive', title: "Access Restricted", description: "This private call is for another user." });
        router.replace('/');
        return;
    }

    // If authorized, announce presence on this page
    if(socket && user.id === designatedUserId) {
      socket.emit('user:im-on-call-page');
    }
    
    // Announce departure on cleanup
    return () => {
      if(socket && user && user.id === designatedUserId) {
        socket.emit('user:left-call-page');
      }
    };
  }, [user, isAdmin, designatedUserId, authLoading, isClientHydrated, router, toast, socket]);

  if (authLoading || !isClientHydrated) {
      return (
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow flex items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </main>
            <Footer />
          </div>
      );
  }

  if (!user || (!isAdmin && user.id !== designatedUserId)) {
      return (
         <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8 text-center">
              <Lock size={64} className="mx-auto text-destructive mb-4" />
              <h1 className="font-headline text-3xl font-semibold mb-2">{t('accessDenied')}</h1>
              <p className="text-muted-foreground mb-6">This private call is not for you.</p>
              <Button onClick={() => router.push('/')}>{t('livePageGoToHomepageButton')}</Button>
          </main>
          <Footer />
        </div>
      );
  }


  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex items-center justify-center">
        <Card className="max-w-2xl mx-auto mt-16 shadow-xl">
          <CardHeader className="items-center text-center">
            <PhoneIncoming className="h-16 w-16 text-primary mb-4 animate-pulse" />
            <CardTitle className="font-headline text-2xl">{t('userVideoCallWaitingTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center text-lg">{t('userVideoCallWaitingDescription')}</CardDescription>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
