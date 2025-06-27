
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Popup } from '@/types';
import {
  createPopupAction,
  updatePopupAction,
  deletePopupAction,
  getAllPopupsAction,
} from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const popupSchema = z.object({
  title: z.string().min(3, 'El título es obligatorio'),
  description: z.string().optional(),
  type: z.enum(['image', 'video']),
  contentUrl: z.string().url('Debe ser una URL válida'),
  displayCondition: z.enum(['once-per-session', 'always']),
  isActive: z.boolean(),
});

export default function ManagePopupsPage() {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPopup, setEditingPopup] = useState<Popup | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof popupSchema>>({
    resolver: zodResolver(popupSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'image',
      contentUrl: '',
      displayCondition: 'once-per-session',
      isActive: true,
    },
  });

  const fetchPopups = async () => {
    setIsLoading(true);
    const fetchedPopups = await getAllPopupsAction();
    setPopups(fetchedPopups);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPopups();
  }, []);

  useEffect(() => {
    if (editingPopup) {
      form.reset({
        ...editingPopup,
        description: editingPopup.description || '',
      });
    } else {
      form.reset({
        title: '',
        description: '',
        type: 'image',
        contentUrl: '',
        displayCondition: 'once-per-session',
        isActive: true,
      });
    }
  }, [editingPopup, form]);

  const onSubmit = async (values: z.infer<typeof popupSchema>) => {
    setIsSubmitting(true);
    const result = editingPopup
      ? await updatePopupAction(editingPopup.id, values)
      : await createPopupAction(values);

    if (result.success) {
      toast({ title: `Popup ${editingPopup ? 'actualizado' : 'creado'} con éxito` });
      await fetchPopups();
      setIsDialogOpen(false);
      setEditingPopup(null);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (popupId: string) => {
    const result = await deletePopupAction(popupId);
    if (result.success) {
      toast({ title: 'Popup eliminado' });
      fetchPopups();
    } else {
      toast({ variant: 'destructive', title: 'Error al eliminar', description: result.error });
    }
  };

  const handleToggleActive = async (popup: Popup) => {
    const result = await updatePopupAction(popup.id, { isActive: !popup.isActive });
    if (result.success) {
      toast({ title: 'Estado del popup actualizado' });
      fetchPopups();
    } else {
      toast({ variant: 'destructive', title: 'Error al actualizar', description: result.error });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-semibold">Gestionar Popups</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingPopup(null)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Crear Popup
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>{editingPopup ? 'Editar' : 'Crear'} Popup</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField name="title" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl><Input placeholder="Ej: ¡Oferta de Verano!" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="description" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción (Opcional)</FormLabel>
                    <FormControl><Textarea placeholder="Añade un texto o descripción para el popup..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="contentUrl" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL del Contenido</FormLabel>
                    <FormControl><Input placeholder="https://example.com/image.png" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                 <div className="grid grid-cols-2 gap-4">
                    <FormField name="type" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="image">Imagen</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField name="displayCondition" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condición de Muestra</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="once-per-session">Una vez por sesión</SelectItem>
                            <SelectItem value="always">Siempre</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                </div>
                 <FormField name="isActive" control={form.control} render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Activo</FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )} />
                <DialogFooter>
                  <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>Popups Existentes</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Condición</TableHead>
                  <TableHead>Activo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {popups.map((popup) => (
                  <TableRow key={popup.id}>
                    <TableCell className="font-medium">{popup.title}</TableCell>
                    <TableCell>{popup.type}</TableCell>
                    <TableCell>{popup.displayCondition}</TableCell>
                    <TableCell>
                      <Switch checked={popup.isActive} onCheckedChange={() => handleToggleActive(popup)} />
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" onClick={() => { setEditingPopup(popup); setIsDialogOpen(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>Esta acción eliminará permanentemente el popup.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(popup.id)}>Eliminar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!isLoading && popups.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No hay popups creados.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

