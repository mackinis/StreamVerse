
"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Loader2, Lock, Save, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfileAction, changePasswordAction } from '@/app/actions';
import { useState } from 'react';

const profileSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio."),
  lastName: z.string().min(2, "El apellido es obligatorio."),
  dni: z.string().min(5, "El DNI es obligatorio."),
  phone: z.string().min(5, "El teléfono es obligatorio."),
  address: z.string().min(5, "La dirección es obligatoria."),
  postalCode: z.string().min(3, "El código postal es obligatorio."),
  city: z.string().min(2, "La ciudad es obligatoria."),
  country: z.string().min(2, "El país es obligatorio."),
});

const passwordSchema = z.object({
  oldPassword: z.string().min(1, "La contraseña antigua es obligatoria."),
  newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres."),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

export default function ProfilePage() {
  const { user, loading: authLoading, login: updateUserInContext } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      lastName: '',
      dni: '',
      phone: '',
      address: '',
      postalCode: '',
      city: '',
      country: '',
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin?message=Debes+iniciar+sesión+para+ver+tu+perfil');
    }
    if (user) {
      profileForm.reset({
        name: user.name,
        lastName: user.lastName,
        dni: user.dni,
        phone: user.phone,
        address: user.address,
        postalCode: user.postalCode,
        city: user.city,
        country: user.country,
      });
    }
  }, [user, authLoading, router, profileForm]);

  const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!user) return;
    setIsSubmittingProfile(true);
    const result = await updateUserProfileAction(user.id, values);
    if (result.success && result.user) {
      updateUserInContext(result.user);
      toast({ title: "Perfil Actualizado", description: "Tu información ha sido guardada." });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setIsSubmittingProfile(false);
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    if (!user) return;
    setIsSubmittingPassword(true);
    const result = await changePasswordAction(user.id, values.oldPassword, values.newPassword);
    if (result.success) {
      toast({ title: "Contraseña Cambiada", description: "Tu contraseña ha sido actualizada con éxito." });
      passwordForm.reset();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setIsSubmittingPassword(false);
  };

  if (authLoading || !user) {
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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>Revisa y actualiza tus datos personales. Tu correo no puede ser modificado.</CardDescription>
            </CardHeader>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField name="name" control={profileForm.control} render={({ field }) => (
                      <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="lastName" control={profileForm.control} render={({ field }) => (
                      <FormItem><FormLabel>Apellido</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField name="dni" control={profileForm.control} render={({ field }) => (
                    <FormItem><FormLabel>DNI</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormItem><FormLabel>Email</FormLabel><Input value={user.email} disabled /></FormItem>
                  <FormField name="phone" control={profileForm.control} render={({ field }) => (
                    <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField name="address" control={profileForm.control} render={({ field }) => (
                    <FormItem><FormLabel>Dirección</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <FormField name="postalCode" control={profileForm.control} render={({ field }) => (
                      <FormItem><FormLabel>Código Postal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField name="city" control={profileForm.control} render={({ field }) => (
                      <FormItem><FormLabel>Ciudad</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField name="country" control={profileForm.control} render={({ field }) => (
                      <FormItem><FormLabel>País</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmittingProfile}>
                    {isSubmittingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" /> Guardar Cambios
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cambiar Contraseña</CardTitle>
              <CardDescription>Asegúrate de usar una contraseña segura.</CardDescription>
            </CardHeader>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                <CardContent className="space-y-4">
                  <FormField name="oldPassword" control={passwordForm.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña Antigua</FormLabel>
                      <FormControl>
                        <div className="relative">
                            <Input type={showOldPassword ? "text" : "password"} {...field} />
                            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1.5 h-7 w-7" onClick={() => setShowOldPassword(!showOldPassword)}>
                                {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="newPassword" control={passwordForm.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nueva Contraseña</FormLabel>
                       <FormControl>
                        <div className="relative">
                           <Input type={showNewPassword ? "text" : "password"} {...field} />
                             <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1.5 h-7 w-7" onClick={() => setShowNewPassword(!showNewPassword)}>
                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="confirmPassword" control={passwordForm.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                       <FormControl>
                        <div className="relative">
                           <Input type={showConfirmPassword ? "text" : "password"} {...field} />
                            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1.5 h-7 w-7" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmittingPassword}>
                    {isSubmittingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <KeyRound className="mr-2 h-4 w-4" /> Cambiar Contraseña
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
