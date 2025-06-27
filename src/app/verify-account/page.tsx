
"use client";

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useToast } from "@/hooks/use-toast";
import { useAdminConfig } from '@/contexts/AdminConfigContext';
import { useAuth } from '@/contexts/AuthContext';
import { verifyTokenAction, resendTokenAction } from '@/app/actions'; // Server Actions
import type { User } from '@/types';

function VerifyAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get('email');
  
  const [token, setToken] = useState('');
  const [email, setEmail] = useState(emailFromQuery || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  const { toast } = useToast();
  const { t } = useAdminConfig();
  const { login } = useAuth();

  useEffect(() => {
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [emailFromQuery]);

  if (!email) {
    // If no email in query, redirect to signin, maybe user landed here directly.
    // This could be improved with a more robust way to track unverified users.
    if (typeof window !== 'undefined') {
        router.push('/signin?message=Error:%20No%20se%20especificó%20un%20email%20para%20verificación.');
    }
    return <p>Redirigiendo...</p>;
  }

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Por favor, ingresa el token de verificación." });
      return;
    }
    setIsVerifying(true);
    try {
      const result = await verifyTokenAction(email, token);
      if (result.success && result.user) {
        login(result.user as User);
        toast({ 
          title: t('verificationSuccessToastTitle'), 
          description: t('verificationSuccessToastDescription')
        });
        router.push('/'); // Or redirectPath if available
      } else {
        toast({ 
          variant: "destructive", 
          title: t('verificationFailedToastTitle'), 
          description: result.error || t('verificationFailedToastDescription')
        });
      }
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: t('errorVerificationFailed'), 
        description: (error as Error).message || 'Ocurrió un error inesperado.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendToken = async () => {
    setIsResending(true);
    try {
      const result = await resendTokenAction(email);
      if (result.success) {
        toast({ 
          title: t('tokenResentToastTitle'), 
          description: t('tokenResentToastDescription')
        });
      } else {
        toast({ 
          variant: "destructive", 
          title: t('errorResendTokenFailed'), 
          description: result.error || 'No se pudo reenviar el token.'
        });
      }
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: t('errorResendTokenFailed'), 
        description: (error as Error).message || 'Ocurrió un error inesperado.'
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-center">{t('verifyAccountTitle')}</CardTitle>
            <CardDescription className="text-center">
              {t('verifyAccountDescription')} ({email})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="token">{t('verificationTokenLabel')}</Label>
                <Input
                  id="token"
                  type="text"
                  placeholder="Ingresa tu token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isVerifying}>
                {isVerifying ? 'Verificando...' : t('verifyButton')}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Button variant="link" onClick={handleResendToken} disabled={isResending}>
                {isResending ? 'Reenviando...' : t('resendTokenButton')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}


export default function VerifyAccountPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <VerifyAccountContent />
    </Suspense>
  );
}
