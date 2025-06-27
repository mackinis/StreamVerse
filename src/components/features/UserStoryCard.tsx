
"use client";

import type { UserStory } from '@/types';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlayCircle, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogClose, DialogTitle as DialogTitleComponent, DialogDescription as DialogDescriptionComponent } from '@/components/ui/dialog';
import { CourseVideoPlayer } from './CourseVideoPlayer';
import { useState } from 'react';
import { Button } from '../ui/button';

interface UserStoryCardProps {
  story: UserStory;
}

export function UserStoryCard({ story }: UserStoryCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const formattedDate = story.createdAt ? format(new Date(story.createdAt), 'dd MMM, yyyy') : '';

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full rounded-lg">
        <CardHeader className="p-0 relative">
          <DialogTrigger asChild>
            <div className="block cursor-pointer group">
              <div className="relative aspect-video bg-muted flex items-center justify-center">
                {story.videoPreviewUrl ? (
                  <video
                    key={story.id}
                    src={story.videoPreviewUrl}
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                    aria-label={`${story.title} video preview`}
                  />
                ) : (
                  <Image
                    src="https://placehold.co/600x400.png"
                    alt={story.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    data-ai-hint="story placeholder"
                  />
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <PlayCircle className="h-16 w-16 text-white/80" />
                </div>
              </div>
            </div>
          </DialogTrigger>
        </CardHeader>
        <CardContent className="p-4 flex-grow flex flex-col">
          <DialogTrigger asChild>
            <button className="text-left w-full">
              <CardTitle className="font-headline text-lg mb-2 hover:text-primary transition-colors">{story.title}</CardTitle>
            </button>
          </DialogTrigger>
          <CardDescription className="font-body text-sm text-muted-foreground mb-4 flex-grow line-clamp-4">
            &ldquo;{story.storyText}&rdquo;
          </CardDescription>
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={story.userAvatar || `https://placehold.co/40x40.png`} alt={story.userName} data-ai-hint="profile person" />
                <AvatarFallback>{story.userName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground font-body">{story.userName}</span>
            </div>
            {formattedDate && (
              <div className="flex items-center text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                {formattedDate}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <DialogContent className="max-w-3xl p-0 border-0 bg-card shadow-lg rounded-lg">
        <DialogHeader className="p-4 border-b">
          <DialogTitleComponent>{story.title}</DialogTitleComponent>
          <DialogDescriptionComponent className="text-sm text-muted-foreground">
            By {story.userName} on {formattedDate}
          </DialogDescriptionComponent>
        </DialogHeader>
        <div className="p-4 space-y-4">
           {story.videoPreviewUrl && (
              <div className="aspect-video w-full rounded-md overflow-hidden bg-black">
                <CourseVideoPlayer key={story.id} url={story.videoPreviewUrl} className="w-full h-full" />
              </div>
           )}
          <p className="font-body text-foreground">{story.storyText}</p>
        </div>
         <div className="p-4 border-t flex justify-end">
            <DialogClose asChild>
                <Button variant="outline">Close</Button>
            </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
