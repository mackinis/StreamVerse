
"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useToast } from "@/hooks/use-toast";
import { useAdminConfig } from '@/contexts/AdminConfigContext';
import { Eye, EyeOff } from 'lucide-react';
import { registerUserAction } from '@/app/actions'; // Server Action

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { user } = useAuth(); // We don't call login here, just redirect if already logged in
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useAdminConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (password !== confirmPassword) {
      toast({ 
        variant: "destructive", 
        title: t('signupPasswordsMismatchToastTitle'), 
        description: t('signupPasswordsMismatchToastDescription')
      });
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
        toast({
            variant: "destructive",
            title: "Error de Contraseña",
            description: "La contraseña debe tener al menos 6 caracteres."
        });
        setIsSubmitting(false);
        return;
    }

    const formData = {
        name, lastName, dni, email, phone, address, postalCode, city, country, password
    };

    try {
      const result = await registerUserAction(formData);
      if (result.success) {
        toast({ 
          title: t('signupSuccessToastTitle'), 
          description: t('signupVerificationEmailSent', { email }),
          duration: 10000, // Longer duration for this important message
        });
        router.push(`/signin?message=${encodeURIComponent(t('signupVerificationEmailSent', { email }))}`);
      } else {
        toast({ 
          variant: "destructive", 
          title: t('errorRegistrationFailed'), 
          description: result.error || 'An unknown error occurred.'
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({ 
        variant: "destructive", 
        title: t('errorRegistrationFailed'), 
        description: (error as Error).message || 'Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-center">{t('signUpTitle')}</CardTitle>
            <CardDescription className="text-center">{t('signUpDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="name">{t('nameLabel')}</Label>
                  <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lastName">{t('lastNameLabel')}</Label>
                  <Input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="dni">{t('dniLabel')}</Label>
                <Input id="dni" type="text" value={dni} onChange={(e) => setDni(e.target.value)} required />
              </div>

              <div className="space-y-1">
                <Label htmlFor="email">{t('emailLabel')}</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone">{t('phoneLabel')}</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>

              <div className="space-y-1">
                <Label htmlFor="address">{t('addressLabel')}</Label>
                <Input id="address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="postalCode">{t('postalCodeLabel')}</Label>
                  <Input id="postalCode" type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="city">{t('cityLabel')}</Label>
                  <Input id="city" type="text" value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="country">{t('countryLabel')}</Label>
                  <Input id="country" type="text" value={country} onChange={(e) => setCountry(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-1 relative">
                <Label htmlFor="password">{t('passwordLabel')}</Label>
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  minLength={6}
                />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-6 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>

              <div className="space-y-1 relative">
                <Label htmlFor="confirmPassword">{t('confirmPasswordLabel')}</Label>
                <Input 
                  id="confirmPassword" 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                  minLength={6}
                />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-6 h-7 w-7" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Registrando...' : t('signUpButton')}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center">
            <p className="text-sm text-muted-foreground">
              {t('signInPrompt')}{' '}
              <Link href="/signin" className="text-primary hover:underline">
                {t('signInLink')}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
