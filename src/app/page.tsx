
"use client";

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroBanner } from '@/components/layout/HeroBanner';
import { CourseCard } from '@/components/features/CourseCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminConfig } from '@/contexts/AdminConfigContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAllCoursesAction } from '@/app/actions';
import type { Course } from '@/types';
import { Loader2 } from 'lucide-react';
import { UserStoryCarousel } from '@/components/features/UserStoryCarousel';

export default function HomePage() {
  const { user, loading } = useAuth();
  const { t } = useAdminConfig();
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  useEffect(() => {
    const fetchHomepageData = async () => {
      setIsLoadingCourses(true);
      try {
        const fetchedCourses = await getAllCoursesAction();
        setCourses(fetchedCourses.slice(0, 4)); // Show first 4 courses
      } catch (error) {
        console.error("Failed to fetch homepage data:", error);
      } finally {
        setIsLoadingCourses(false);
      }
    };
    fetchHomepageData();
  }, []);


  const handleStorySubmitClick = () => {
    if (loading) return; 
    if (user) {
      router.push('/submit-story');
    } else {
      router.push(`/signin?redirect=/submit-story&message=${encodeURIComponent(t('loginRequiredSubmitStory'))}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <HeroBanner />
        
        <section id="courses" className="py-12 md:py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="font-headline text-3xl md:text-4xl font-semibold text-center mb-10">
              {t('featuredCourses')}
            </h2>
            {isLoadingCourses ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : courses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 justify-items-center">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">{t('noCoursesAvailable')}</p>
            )}
            <div className="text-center mt-12">
              <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <Link href="/courses">{t('viewAllCourses')}</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="user-stories" className="py-12 md:py-16 bg-card">
          <div className="container mx-auto px-4">
            <h2 className="font-headline text-3xl md:text-4xl font-semibold text-center mb-10">
              {t('successStories')}
            </h2>
            
            <UserStoryCarousel />
            
            <div className="text-center mt-12">
              <Button size="lg" onClick={handleStorySubmitClick} className="bg-primary hover:bg-primary/90">
                {t('submitYourStory')}
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
