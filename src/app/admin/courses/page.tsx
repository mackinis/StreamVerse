
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Course } from '@/types';
import {
  createCourseAction,
  updateCourseAction,
  deleteCourseAction,
  getAllCoursesAction,
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
import { Textarea } from '@/components/ui/textarea';
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

const courseSchema = z.object({
  title: z.string().min(3, 'El título es obligatorio'),
  description: z.string().min(10, 'La descripción es obligatoria'),
  courseVideoUrl: z.string().url('La URL del video del curso es obligatoria y debe ser válida'),
  price: z.string().min(1, 'El precio es obligatorio'),
  duration: z.string().min(1, 'La duración es obligatoria'),
  date: z.string().min(1, 'La fecha es obligatoria'),
  imageUrl: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  videoPreviewUrl: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
});

export default function ManageCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof courseSchema>>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      courseVideoUrl: '',
      price: '',
      duration: '',
      date: '',
      imageUrl: '',
      videoPreviewUrl: '',
    },
  });

  const fetchCourses = async () => {
    setIsLoading(true);
    const fetchedCourses = await getAllCoursesAction();
    setCourses(fetchedCourses);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (editingCourse) {
      form.reset({
        ...editingCourse,
        imageUrl: editingCourse.imageUrl || '',
        videoPreviewUrl: editingCourse.videoPreviewUrl || '',
      });
    } else {
      form.reset({
        title: '',
        description: '',
        courseVideoUrl: '',
        price: '',
        duration: '',
        date: '',
        imageUrl: '',
        videoPreviewUrl: '',
      });
    }
  }, [editingCourse, form]);

  const onSubmit = async (values: z.infer<typeof courseSchema>) => {
    setIsSubmitting(true);
    const result = editingCourse
      ? await updateCourseAction(editingCourse.id, values)
      : await createCourseAction(values);

    if (result.success) {
      toast({ title: `Curso ${editingCourse ? 'actualizado' : 'creado'} con éxito` });
      await fetchCourses();
      setIsDialogOpen(false);
      setEditingCourse(null);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (courseId: string) => {
    const result = await deleteCourseAction(courseId);
    if (result.success) {
      toast({ title: 'Curso eliminado' });
      fetchCourses();
    } else {
      toast({ variant: 'destructive', title: 'Error al eliminar', description: result.error });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-semibold">Gestionar Cursos</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCourse(null)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Crear Curso
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>{editingCourse ? 'Editar' : 'Crear'} Curso</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField name="title" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="description" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl><Textarea {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="courseVideoUrl" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL del Video del Curso (Obligatorio)</FormLabel>
                    <FormControl><Input {...field} placeholder="https://ejemplo.com/video-del-curso.mp4" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-3 gap-4">
                   <FormField name="price" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField name="duration" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duración</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField name="date" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField name="imageUrl" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de Imagen (Opcional)</FormLabel>
                      <FormControl><Input {...field} value={field.value || ''} placeholder="URL de imagen para la tarjeta" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                <FormField name="videoPreviewUrl" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de Video Preview (Opcional)</FormLabel>
                      <FormControl><Input {...field} value={field.value || ''} placeholder="URL de video corto para la tarjeta" /></FormControl>
                      <FormMessage />
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
        <CardHeader><CardTitle>Cursos Existentes</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>{course.price}</TableCell>
                    <TableCell>{course.duration}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" onClick={() => { setEditingCourse(course); setIsDialogOpen(true); }}>
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
                              Esta acción no se puede deshacer. Esto eliminará permanentemente el curso.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(course.id)}>Eliminar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!isLoading && courses.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No hay cursos creados.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
