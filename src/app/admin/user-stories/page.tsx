
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { UserStory } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { PlayCircle, Loader2, Edit, Trash2 } from 'lucide-react';
import {
  getAllUserStoriesAction,
  updateUserStoryApprovalAction,
  updateUserStoryAction,
  deleteUserStoryAction
} from '@/app/actions';
import { useAdminConfig } from '@/contexts/AdminConfigContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const storySchema = z.object({
  title: z.string().min(3, 'El título es obligatorio'),
  storyText: z.string().min(10, 'La historia es obligatoria'),
  videoPreviewUrl: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
});


export default function UserStoriesAdminPage() {
  const [stories, setStories] = useState<UserStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStory, setEditingStory] = useState<UserStory | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { toast } = useToast();
  const { t } = useAdminConfig();

  const form = useForm<z.infer<typeof storySchema>>({
    resolver: zodResolver(storySchema),
    defaultValues: {
      title: '',
      storyText: '',
      videoPreviewUrl: '',
    },
  });

  const fetchStories = async () => {
    setIsLoading(true);
    try {
      const fetchedStories = await getAllUserStoriesAction();
      setStories(fetchedStories);
    } catch (error) {
      console.error("Failed to fetch stories:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not load user stories." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (editingStory) {
      form.reset({
        title: editingStory.title,
        storyText: editingStory.storyText,
        videoPreviewUrl: editingStory.videoPreviewUrl || '',
      });
    } else {
      form.reset({
        title: '',
        storyText: '',
        videoPreviewUrl: '',
      });
    }
  }, [editingStory, form]);


  const toggleApproval = async (storyId: string, currentApprovalStatus: boolean) => {
    const storyToUpdate = stories.find(s => s.id === storyId);
    if (!storyToUpdate) return;

    setStories(prevStories =>
      prevStories.map(story =>
        story.id === storyId ? { ...story, approved: !story.approved } : story
      )
    );

    const result = await updateUserStoryApprovalAction(storyId, !currentApprovalStatus);

    if (result.success) {
      toast({ 
        title: t(storyToUpdate.approved ? 'adminUserStoriesToastUnapproved' : 'adminUserStoriesToastApproved', { title: storyToUpdate.title }), 
        description: "Status updated." 
      });
    } else {
      setStories(prevStories =>
        prevStories.map(story =>
          story.id === storyId ? { ...story, approved: currentApprovalStatus } : story 
        )
      );
      toast({ 
        variant: "destructive", 
        title: t('adminUserStoriesUpdateError'), 
        description: result.error || "Failed to update story status." 
      });
    }
  };
  
  const handleEditSubmit = async (values: z.infer<typeof storySchema>) => {
    if (!editingStory) return;

    setIsSubmitting(true);
    const result = await updateUserStoryAction(editingStory.id, values);

    if (result.success) {
      toast({ title: 'Historia actualizada', description: 'Los cambios se han guardado con éxito.' });
      await fetchStories();
      setIsDialogOpen(false);
      setEditingStory(null);
    } else {
      toast({ variant: 'destructive', title: 'Error al actualizar', description: result.error });
    }
    setIsSubmitting(false);
  };
  
  const handleDelete = async (storyId: string) => {
    const result = await deleteUserStoryAction(storyId);
    if (result.success) {
      toast({ title: 'Historia eliminada' });
      fetchStories();
    } else {
      toast({ variant: 'destructive', title: 'Error al eliminar', description: result.error });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">{t('loadingAdminArea')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">{t('adminUserStoriesTitle')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t('adminUserStoriesSubmittedTitle')}</CardTitle>
          <CardDescription>{t('adminUserStoriesSubmittedDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('adminUserStoriesPreviewHeader')}</TableHead>
                <TableHead>{t('adminUserStoriesTitleHeader')}</TableHead>
                <TableHead>{t('adminUserStoriesUserHeader')}</TableHead>
                <TableHead>{t('adminUserStoriesStatusHeader')}</TableHead>
                <TableHead className="text-right">{t('adminUserStoriesActionsHeader')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stories.map((story) => (
                <TableRow key={story.id}>
                  <TableCell>
                     <div className="relative w-24 h-14 bg-muted rounded overflow-hidden">
                        {story.videoPreviewUrl ? (
                           <video src={story.videoPreviewUrl} className="w-full h-full object-cover" muted playsInline loop autoPlay />
                        ) : (
                           <Image src="https://placehold.co/96x56.png" alt={t('adminUserStoriesNoPreview')} layout="fill" data-ai-hint="video placeholder"/>
                        )}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <PlayCircle className="h-6 w-6 text-white/70" />
                        </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{story.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <Image src={story.userAvatar || 'https://placehold.co/32x32.png'} alt={story.userName} width={32} height={32} className="rounded-full" data-ai-hint="avatar person"/>
                        <span>{story.userName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Switch
                        checked={story.approved}
                        onCheckedChange={() => toggleApproval(story.id, story.approved)}
                        aria-label={t('adminUserStoriesToggleApprovalLabel', {title: story.title})}
                      />
                      <span className="ml-2 text-sm text-muted-foreground">
                          {story.approved ? t('adminUserStoriesStatusApproved') : t('adminUserStoriesStatusPending')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" onClick={() => { setEditingStory(story); setIsDialogOpen(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente la historia.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(story.id)}>Eliminar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {stories.length === 0 && <p className="text-center text-muted-foreground py-8">{t('adminUserStoriesNoStories')}</p>}
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Editar Historia de Usuario</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleEditSubmit)} className="space-y-4">
                <FormField name="title" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField name="videoPreviewUrl" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL del Video Preview (Opcional)</FormLabel>
                      <FormControl><Input {...field} value={field.value || ''} placeholder="URL de video corto para la tarjeta" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                <FormField name="storyText" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texto de la historia</FormLabel>
                    <FormControl><Textarea {...field} rows={8} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <DialogFooter>
                  <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar Cambios
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
    </div>
  );
}
