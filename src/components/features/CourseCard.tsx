
"use client";

import type { Course } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CalendarDays, Tag, PlayCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { useState } from 'react';
import { CourseVideoPlayer } from './CourseVideoPlayer';

export function CourseCard({ course }: { course: Course }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full rounded-lg w-full max-w-sm">
        <CardHeader className="p-0 relative">
          <DialogTrigger asChild>
            <div className="block cursor-pointer group">
              <div className="relative aspect-video bg-muted flex items-center justify-center">
                {course.videoPreviewUrl ? (
                   <CourseVideoPlayer 
                      url={course.videoPreviewUrl}
                      isPreview={true}
                      className="w-full h-full object-cover"
                    />
                ) : (
                  <Image
                    src={course.imageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(course.title)}`}
                    alt={course.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{objectFit: "cover"}}
                    data-ai-hint={course.dataAiHint || "education technology"}
                  />
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <PlayCircle className="h-16 w-16 text-white/80" />
                </div>
              </div>
            </div>
          </DialogTrigger>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <DialogTrigger asChild>
            <button className="text-left w-full">
              <CardTitle className="font-headline text-xl mb-2 hover:text-primary transition-colors">{course.title}</CardTitle>
            </button>
          </DialogTrigger>
          <CardDescription className="text-sm text-muted-foreground mb-3 font-body line-clamp-3">{course.description}</CardDescription>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center"><Tag className="w-3.5 h-3.5 mr-1.5 text-primary" /> {course.price}</span>
            <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1.5 text-primary" /> {course.duration}</span>
            <span className="flex items-center"><CalendarDays className="w-3.5 h-3.5 mr-1.5 text-primary" /> {course.date}</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 border-t">
          <DialogTrigger asChild>
            <Button className="w-full">Ver</Button>
          </DialogTrigger>
        </CardFooter>
      </Card>
      
      <DialogContent className="max-w-3xl p-0 border-0 bg-black">
          <DialogTitle className="sr-only">{course.title}</DialogTitle>
          <DialogDescription className="sr-only">{course.description}</DialogDescription>
          <div className="aspect-video">
             <CourseVideoPlayer key={course.id} url={course.courseVideoUrl} className="w-full h-full rounded-lg" />
          </div>
          <DialogClose />
      </DialogContent>
    </Dialog>
  );
}
