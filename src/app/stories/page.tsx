
"use client";

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { UserStoryCard } from '@/components/features/UserStoryCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useAdminConfig } from '@/contexts/AdminConfigContext';
import { useEffect, useState } from 'react';
import { getApprovedUserStoriesAction } from '@/app/actions';
import type { UserStory } from '@/types';
import { Loader2 } from 'lucide-react';

export default function UserStoriesPage() {
  const [approvedStories, setApprovedStories] = useState<UserStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useAdminConfig();

  useEffect(() => {
    const fetchStories = async () => {
      setIsLoading(true);
      try {
        const stories = await getApprovedUserStoriesAction();
        setApprovedStories(stories);
      } catch (error) {
        console.error("Failed to fetch approved stories:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStories();
  }, []);

  const handleStorySubmitClick = () => {
    if (authLoading) return; 
    if (user) {
      router.push('/submit-story');
    } else {
      router.push(`/signin?redirect=/submit-story&message=${encodeURIComponent(t('loginRequiredSubmitStory'))}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="font-headline text-4xl md:text-5xl font-semibold mb-4">
            {t('userStoriesPageTitle')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('userStoriesPageDescription')}
          </p>
        </header>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : approvedStories.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {approvedStories.map((story) => (
               <div key={story.id} className="w-full max-w-sm">
                <UserStoryCard story={story} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">{t('noUserStoriesFound')}</p>
          </div>
        )}

        <div className="text-center mt-12">
          <Button size="lg" onClick={handleStorySubmitClick} className="bg-primary hover:bg-primary/90">
            {t('shareYourStoryButton')}
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
