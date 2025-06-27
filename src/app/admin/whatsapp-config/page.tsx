
"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription as ShadFormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Save, Loader2, HelpCircle, Paperclip, Smile, Moon, Sun, Phone, Send, ThumbsUp, Heart, Star, Bell } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useAdminConfig } from '@/contexts/AdminConfigContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const phoneRegex = /^\+?[1-9]\d{1,14}$/;

const whatsAppConfigSchema = z.object({
  whatsAppEnabled: z.boolean().default(false),
  whatsAppPhoneNumber: z.string().optional(),
  whatsAppDefaultMessage: z.string().optional(),
  whatsAppIcon: z.string().default('default'),
  whatsAppCustomIconUrl: z.string().url({ message: "Debe ser una URL válida." }).optional().or(z.literal('')),
  whatsAppButtonSize: z.coerce.number().int().min(30).max(100),
  whatsAppIconSize: z.coerce.number().int().min(10).max(60),
  whatsAppButtonColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, { message: "Debe ser un código de color hexadecimal válido, ej: #25D366" }).default('#25D366'),
}).refine(data => !data.whatsAppEnabled || (data.whatsAppEnabled && data.whatsAppPhoneNumber && phoneRegex.test(data.whatsAppPhoneNumber)), {
    message: "Se requiere un número de teléfono válido cuando WhatsApp está habilitado.",
    path: ["whatsAppPhoneNumber"],
});

type WhatsAppConfigFormValues = z.infer<typeof whatsAppConfigSchema>;

const lucideIconOptions = [
  { value: 'Phone', label: 'Teléfono', Icon: Phone },
  { value: 'MessageSquare', label: 'Mensaje', Icon: MessageSquare },
  { value: 'Send', label: 'Enviar', Icon: Send },
  { value: 'HelpCircle', label: 'Ayuda', Icon: HelpCircle },
  { value: 'Smile', label: 'Sonrisa', Icon: Smile },
  { value: 'Heart', label: 'Corazón', Icon: Heart },
  { value: 'Star', label: 'Estrella', Icon: Star },
];

export default function WhatsAppConfigPage() {
  const { config, setConfig, t } = useAdminConfig();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WhatsAppConfigFormValues>({
    resolver: zodResolver(whatsAppConfigSchema),
    defaultValues: config.whatsAppConfig || {
      whatsAppEnabled: false,
      whatsAppPhoneNumber: '',
      whatsAppDefaultMessage: 'Hola, me gustaría obtener más información.',
      whatsAppIcon: 'default',
      whatsAppCustomIconUrl: '',
      whatsAppButtonSize: 56,
      whatsAppIconSize: 28,
      whatsAppButtonColor: '#25D366',
    },
  });

  const watchedWhatsAppIcon = form.watch('whatsAppIcon');
  const watchedButtonColor = form.watch('whatsAppButtonColor');


  useEffect(() => {
    if (config.whatsAppConfig) {
      form.reset(config.whatsAppConfig);
    }
  }, [config.whatsAppConfig, form]);

  async function onSubmit(data: WhatsAppConfigFormValues) {
    setIsSubmitting(true);
    try {
      await setConfig(prevConfig => ({
        ...prevConfig,
        whatsAppConfig: data,
      }));
      toast({ 
          title: "Configuración de WhatsApp Actualizada",
          description: "Los cambios se han guardado correctamente."
      });
    } catch (error) {
      toast({ 
          title: "Error al Guardar",
          description: error instanceof Error ? error.message : 'Ocurrió un error desconocido.', 
          variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="font-headline text-3xl font-bold text-primary flex items-center">
        <MessageSquare className="mr-3 h-8 w-8" /> Configuración del Botón de WhatsApp
      </h1>

      <Card className="shadow-xl border-primary/20">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Botón Flotante de WhatsApp</CardTitle>
          <CardDescription>
            Configura un botón de chat de WhatsApp que aparecerá en tu sitio para que los visitantes puedan contactarte fácilmente.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              <FormField control={form.control} name="whatsAppEnabled" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Habilitar Botón de WhatsApp</FormLabel>
                    <ShadFormDescription>Muestra u oculta el botón de chat en todo el sitio.</ShadFormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )} />

              {form.watch('whatsAppEnabled') && (
                <div className="space-y-6 pl-2 border-l-2 border-primary/20 ml-1 pt-2">
                  <FormField control={form.control} name="whatsAppPhoneNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Teléfono de WhatsApp</FormLabel>
                      <FormControl><Input placeholder="+5491122334455" {...field} value={field.value || ''} /></FormControl>
                      <ShadFormDescription>Incluye el código de país. Ej: +54 para Argentina.</ShadFormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="whatsAppDefaultMessage" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensaje Predeterminado</FormLabel>
                      <FormControl><Textarea placeholder="Hola, me gustaría obtener más información." rows={3} {...field} value={field.value || ''} /></FormControl>
                      <ShadFormDescription>Este mensaje se precargará cuando el usuario haga clic en el botón.</ShadFormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                  
                  <FormField
                    control={form.control}
                    name="whatsAppIcon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ícono del Botón</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un tipo de ícono" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="default">Ícono de WhatsApp (predeterminado)</SelectItem>
                            <SelectItem value="customUrl">URL de Ícono Personalizado</SelectItem>
                            {lucideIconOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>
                                <div className="flex items-center">
                                  <opt.Icon className="mr-2 h-4 w-4" />
                                  {opt.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchedWhatsAppIcon === 'customUrl' && (
                    <FormField control={form.control} name="whatsAppCustomIconUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL del Ícono Personalizado</FormLabel>
                        <FormControl><Input placeholder="https://example.com/icon.png" {...field} value={field.value || ''} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <FormField control={form.control} name="whatsAppButtonColor" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Color del Botón</FormLabel>
                        <div className="flex items-center gap-2">
                             <FormControl>
                               <Input type="color" {...field} className="p-1 h-10 w-14" />
                             </FormControl>
                             <Input type="text" {...field} placeholder="#25D366" value={field.value?.toUpperCase() || ''}/>
                        </div>
                        <FormMessage />
                        </FormItem>
                    )} />
                 </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="whatsAppButtonSize" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tamaño del Botón (px)</FormLabel>
                        <FormControl><Input type="number" placeholder="56" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="whatsAppIconSize" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tamaño del Ícono (px)</FormLabel>
                        <FormControl><Input type="number" placeholder="28" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-6 flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" /> Guardar Cambios
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
