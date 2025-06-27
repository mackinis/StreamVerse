
"use client";

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CourseCard } from '@/components/features/CourseCard';
import { Input } from '@/components/ui/input';
import { useState, useMemo, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useAdminConfig } from '@/contexts/AdminConfigContext';
import { getAllCoursesAction } from '@/app/actions';
import type { Course } from '@/types';

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useAdminConfig();

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const fetchedCourses = await getAllCoursesAction(); 
        setCourses(fetchedCourses);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    if (!searchTerm) return courses;
    return courses.filter(course => 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, courses]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="font-headline text-4xl md:text-5xl font-semibold mb-4">
            {t('coursesPageTitle')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('coursesPageDescription')}
          </p>
        </header>

        <div className="mb-8 max-w-lg mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              type="search"
              placeholder={t('searchCoursesPlaceholder')}
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label={t('searchCoursesPlaceholder')}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 justify-items-center">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
                {searchTerm ? t('noCoursesFound') : t('noCoursesAvailable')}
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
