"use client";

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useToast } from "@/hooks/use-toast";
import { useAdminConfig } from '@/contexts/AdminConfigContext';
import { loginUserAction } from '@/app/actions'; // Server Action
import type { User } from '@/types';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, user: authUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';
  const message = searchParams.get('message');
  const { toast } = useToast();
  const { t } = useAdminConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authUser) { // if user is already in AuthContext (fully logged in)
      router.push(redirectPath);
    }
  }, [authUser, router, redirectPath]);

  useEffect(() => {
    if (message) {
      toast({
        title: t('signUpVerificationEmailSent', { email: '' }), // Generic title
        description: message,
        duration: 10000,
      });
      // Clean the URL, use object form to avoid full page reload
      router.replace('/signin', { scroll: false });
    }
  }, [message, toast, t, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await loginUserAction({ email, password });

      if (result.success && result.user) {
        const loggedInUser = result.user as User; // Cast to User which includes isVerified

        if (loggedInUser.isVerified) {
          login(loggedInUser); // This sets user in AuthContext
          toast({ 
            title: t('loginSuccessToastTitle'), 
            description: t('loginSuccessToastDescription', { name: loggedInUser.name }) 
          });
          router.push(redirectPath);
        } else {
          // User exists, password is correct, but not verified
          toast({
            title: "Verificación Requerida",
            description: "Tu cuenta aún no está verificada. Por favor, revisa tu email o ingresa el token.",
            duration: 8000,
          });
          router.push(`/verify-account?email=${encodeURIComponent(email)}`);
        }
      } else {
        toast({ 
          variant: "destructive", 
          title: t('loginFailedToastTitle'), 
          description: result.error || t('loginFailedToastDescription') 
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({ 
        variant: "destructive", 
        title: t('errorLoginFailed'), 
        description: (error as Error).message || 'An unexpected error occurred.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-center">{t('signInTitle')}</CardTitle>
        <CardDescription className="text-center">{t('signInDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">{t('emailLabel')}</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-required="true"
            />
          </div>
          <div className="space-y-2 relative">
            <Label htmlFor="password">{t('passwordLabel')}</Label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-required="true"
            />
            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-6 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Iniciando sesión...' : t('signInButton')}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2 pt-6">
        <Link href="/forgot-password">
          <Button variant="link" className="text-sm text-primary">{t('forgotPasswordLink')}</Button>
        </Link>
        <p className="text-sm text-muted-foreground">
          {t('signUpPrompt')}{' '}
          <Link href="/signup" className="text-primary hover:underline">
            {t('signUpLink')}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}


export default function SignInPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-4 bg-background">
        <Suspense fallback={
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        }>
          <SignInForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
