
"use client";

import { useState, useEffect } from 'react';
import type { UserStory } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { PlayCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getAllUserStoriesAction, updateUserStoryApprovalAction } from '@/app/actions';
import { useAdminConfig } from '@/contexts/AdminConfigContext';

export default function UserStoriesAdminPage() {
  const [stories, setStories] = useState<UserStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useAdminConfig();

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
  }, []);

  const toggleApproval = async (storyId: string, currentApprovalStatus: boolean) => {
    const storyToUpdate = stories.find(s => s.id === storyId);
    if (!storyToUpdate) return;

    // Optimistically update UI
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
      // No need to re-fetch, UI is already updated. If server failed, we revert.
    } else {
      // Revert optimistic update
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
                           <video src={story.videoPreviewUrl} className="w-full h-full object-cover" muted playsInline />
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
                    {story.approved ? (
                        <span className="flex items-center text-green-600 dark:text-green-400">
                            <CheckCircle className="mr-1.5 h-4 w-4" /> {t('adminUserStoriesStatusApproved')}
                        </span>
                    ) : (
                        <span className="flex items-center text-yellow-600 dark:text-yellow-400">
                            <XCircle className="mr-1.5 h-4 w-4" /> {t('adminUserStoriesStatusPending')}
                        </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Switch
                      checked={story.approved}
                      onCheckedChange={() => toggleApproval(story.id, story.approved)}
                      aria-label={t('adminUserStoriesToggleApprovalLabel', {title: story.title})}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {stories.length === 0 && <p className="text-center text-muted-foreground py-8">{t('adminUserStoriesNoStories')}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
