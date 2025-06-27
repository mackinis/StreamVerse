
"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import type { UserStory } from '@/types';
import { getApprovedUserStoriesAction } from '@/app/actions';
import { useAdminConfig } from '@/contexts/AdminConfigContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ChevronLeft, ChevronRight, Quote, Star, ExternalLink, CalendarDays } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle as DialogTitleComponent, DialogDescription as DialogDescriptionComponent, DialogClose } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CourseVideoPlayer } from './CourseVideoPlayer';
import Image from 'next/image';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export function UserStoryCarousel() {
  const { config } = useAdminConfig();
  // Will be used in the future:
  // const { storiesCarouselAutoPlay, storiesCarouselDelay } = config.homepageConfig;
  const storiesCarouselAutoPlay = true; // Hardcoded for now
  const storiesCarouselDelay = 5; // in seconds

  const [stories, setStories] = useState<UserStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedStory, setSelectedStory] = useState<UserStory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchStories = async () => {
      setIsLoading(true);
      const fetchedStories = await getApprovedUserStoriesAction();
      setStories(fetchedStories);
      setIsLoading(false);
    };
    fetchStories();
  }, []);

  const resetInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (storiesCarouselAutoPlay && stories.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % stories.length);
      }, storiesCarouselDelay * 1000);
    }
  }, [stories.length, storiesCarouselAutoPlay, storiesCarouselDelay]);

  useEffect(() => {
    resetInterval();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [stories.length, resetInterval]);

  const handleNext = () => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % stories.length);
    resetInterval();
  };

  const handlePrevious = () => {
    setCurrentIndex(prevIndex => (prevIndex - 1 + stories.length) % stories.length);
    resetInterval();
  };
  
  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    resetInterval();
  };

  const handleOpenModal = (story: UserStory) => {
    setSelectedStory(story);
    setIsModalOpen(true);
  };

  const currentStory = stories[currentIndex];

  if (isLoading) {
    return <div className="flex h-48 items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }
  if (stories.length === 0) {
    return <p className="text-center text-muted-foreground">No stories available yet.</p>;
  }

  return (
    <>
      <div className="relative w-full max-w-lg mx-auto">
        {currentStory && (
          <Card
            key={currentStory.id}
            className="bg-card/80 shadow-lg border-border/50 flex flex-col min-h-[220px] cursor-pointer hover:border-primary/50 transition-all duration-200"
            onClick={() => handleOpenModal(currentStory)}
            tabIndex={0}
            role="button"
            aria-label={`View story by ${currentStory.userName}`}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                 <div className="flex items-center space-x-3">
                    <Avatar>
                        <AvatarImage src={currentStory.userAvatar} alt={currentStory.userName} data-ai-hint="avatar person" />
                        <AvatarFallback>{currentStory.userName?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="font-headline text-xl text-primary">{currentStory.userName}</CardTitle>
                 </div>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
              </div>
               <p className="text-xs text-muted-foreground pt-1 flex items-center">
                <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                {currentStory.createdAt ? format(new Date(currentStory.createdAt), 'dd MMM, yyyy') : 'Recently'}
              </p>
            </CardHeader>
            <CardContent className="flex-grow">
              <Quote className="h-6 w-6 text-primary/30 mb-2 transform scale-x-[-1]" />
              <p className="text-foreground/90 italic mb-3 text-sm line-clamp-3">&ldquo;{currentStory.storyText}&rdquo;</p>
            </CardContent>
             <div className="p-4 pt-2 text-right">
              <span className="text-xs text-muted-foreground flex items-center justify-end">
                Click to view more <ExternalLink className="ml-1.5 h-3 w-3" />
              </span>
            </div>
          </Card>
        )}

        {stories.length > 1 && (
          <>
            <Button variant="outline" size="icon" onClick={handlePrevious} className="absolute left-0 top-1/2 -translate-y-1/2 transform sm:-translate-x-1/2 bg-background/70 hover:bg-accent disabled:opacity-30 z-10 rounded-full h-10 w-10"><ChevronLeft className="h-6 w-6" /></Button>
            <Button variant="outline" size="icon" onClick={handleNext} className="absolute right-0 top-1/2 -translate-y-1/2 transform sm:translate-x-1/2 bg-background/70 hover:bg-accent disabled:opacity-30 z-10 rounded-full h-10 w-10"><ChevronRight className="h-6 w-6" /></Button>
          </>
        )}
      </div>

       {stories.length > 1 && (
         <div className="flex justify-center mt-4 space-x-2">
          {stories.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={cn(
                "h-2.5 w-2.5 rounded-full transition-colors",
                currentIndex === index ? "bg-primary" : "bg-muted hover:bg-muted-foreground/50"
              )}
              aria-label={`Go to story ${index + 1}`}
            />
          ))}
        </div>
      )}
      
      {selectedStory && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-3xl p-0 border-0 bg-card shadow-lg rounded-lg">
            <DialogHeader className="p-4 border-b">
              <DialogTitleComponent>{selectedStory.title}</DialogTitleComponent>
              <DialogDescriptionComponent className="text-sm text-muted-foreground">
                By {selectedStory.userName} on {selectedStory.createdAt ? format(new Date(selectedStory.createdAt), 'dd MMM, yyyy') : 'Recently'}
              </DialogDescriptionComponent>
            </DialogHeader>
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {selectedStory.videoPreviewUrl ? (
                <div className="aspect-video w-full rounded-md overflow-hidden bg-black">
                  <CourseVideoPlayer key={selectedStory.id} url={selectedStory.videoPreviewUrl} className="w-full h-full" />
                </div>
              ) : (
                <div className="aspect-video w-full rounded-md overflow-hidden bg-black flex items-center justify-center">
                   <Image src="https://placehold.co/600x400.png" alt={selectedStory.title} width={600} height={400} data-ai-hint="story placeholder"/>
                </div>
              )}
              <p className="font-body text-foreground whitespace-pre-wrap">{selectedStory.storyText}</p>
            </div>
            <div className="p-4 border-t flex justify-end">
              <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
