
"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock } from 'lucide-react';
import { useAdminConfig } from '@/contexts/AdminConfigContext';
import { submitUserStoryAction } from '@/app/actions';
import type { UserStory } from '@/types';

export default function SubmitStoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [storyText, setStoryText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useAdminConfig();
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/signin?redirect=/submit-story&message=${encodeURIComponent(t('loginRequiredSubmitStory'))}`);
    }
  }, [user, authLoading, router, t]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ 
        variant: "destructive", 
        title: t('authErrorToastTitle'), 
        description: t('authErrorToastDescriptionLoggedIn') 
      });
      return;
    }
    if (!title.trim() || !storyText.trim()) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Title and story text are required."
        });
        return;
    }

    setIsSubmitting(true);
    const storyData: Pick<UserStory, 'title' | 'videoPreviewUrl' | 'storyText'> = {
      title,
      videoPreviewUrl: videoUrl || '', // Ensure it's a string
      storyText,
    };

    const result = await submitUserStoryAction(storyData, user);

    if (result.success) {
      toast({ 
        title: t('storySubmittedToastTitle'), 
        description: t('storySubmittedToastDescription') 
      });
      router.push('/stories'); 
    } else {
      toast({ 
        variant: "destructive", 
        title: t('storySubmissionFailed'),
        description: result.error || "An unknown error occurred."
      });
    }
    setIsSubmitting(false);
  };
  
  if (authLoading) {
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

  if (!user) {
     return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
          <Lock size={64} className="mx-auto text-destructive mb-4" />
          <h1 className="font-headline text-3xl font-semibold mb-2">{t('accessDenied')}</h1>
          <p className="text-muted-foreground mb-6">{t('pleaseLoginSubmit')}</p>
          <Button onClick={() => router.push(`/signin?redirect=/submit-story`)}>{t('navLogin')}</Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-center">{t('submitStoryTitle')}</CardTitle>
            <CardDescription className="text-center">{t('submitStoryDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">{t('storyTitleLabel')}</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder={t('storyTitlePlaceholder')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  aria-required="true"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoUrl">{t('videoUrlLabel')}</Label>
                <Input
                  id="videoUrl"
                  type="url"
                  placeholder={t('videoUrlPlaceholderOptional')}
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">{t('videoUrlHint')}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storyText">{t('yourStoryLabel')}</Label>
                <Textarea
                  id="storyText"
                  placeholder={t('yourStoryPlaceholder')}
                  value={storyText}
                  onChange={(e) => setStoryText(e.target.value)}
                  required
                  aria-required="true"
                  rows={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? 'Submitting...' : t('submitStoryButton')}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
              {t('submitStoryFooter')}
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
