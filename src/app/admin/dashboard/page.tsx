
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Tv, Film, MessageCircle, Loader2 } from "lucide-react";
import { useAdminConfig } from "@/contexts/AdminConfigContext";
import { useEffect, useState } from "react";
import { getAllUsersAction, getAllUserStoriesAction } from "@/app/actions";
import type { User, UserStory } from "@/types";
import { useRouter } from 'next/navigation';


const ADMIN_EMAIL_FOR_FILTERING = process.env.NEXT_PUBLIC_ADMIN_EMAIL_FOR_DEMO || 'admin@onlyfansly.com';

export default function AdminDashboardPage() {
  const { config, t, isClientHydrated } = useAdminConfig();
  const [totalUsers, setTotalUsers] = useState(0);
  const [pendingStoriesCount, setPendingStoriesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const users = await getAllUsersAction();
        const filteredUsers = users.filter(user => user.email.toLowerCase() !== ADMIN_EMAIL_FOR_FILTERING.toLowerCase());
        setTotalUsers(filteredUsers.length);

        const stories = await getAllUserStoriesAction();
        setPendingStoriesCount(stories.filter(story => !story.approved).length);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setTotalUsers(0);
        setPendingStoriesCount(0);
      } finally {
        setIsLoading(false);
      }
    }
    if (isClientHydrated) { 
        fetchData();
    }
  }, [isClientHydrated]);

  const activeGeneralStreams = config.liveStreamUrl ? 1 : 0;
  const activePrivateCalls = config.liveStreamAuthorizedUserId ? 1 : 0;
  const totalActiveStreams = activeGeneralStreams + activePrivateCalls;
  
  const totalChatMessages = config.chatMessages?.length || 0;

  if (isLoading && !isClientHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">{t('loadingAdminArea')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">{t('adminDashboardTitle')}</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminTotalUsers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>}
            <p className="text-xs text-muted-foreground">{/* Placeholder for future % change */}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminActiveStreams')}</CardTitle>
            <Tv className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveStreams}</div>
            <p className="text-xs text-muted-foreground">
              ({activeGeneralStreams} {t('adminLiveConfigTitle')}, {activePrivateCalls} {t('adminVideoCallTitle')})
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminPendingStories')}</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{pendingStoriesCount}</div>}
            <p className="text-xs text-muted-foreground">{t('adminUserStoriesStatusPending')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminChatMessagesTotal')}</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalChatMessages}</div>
            <p className="text-xs text-muted-foreground">{/* Placeholder for future % change */}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">{t('adminAnalyticsPlaceholderTitle')}</CardTitle>
          <CardDescription>{t('adminAnalyticsPlaceholderDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Detailed analytics and charts will be available in a future update.</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">{t('adminRecentActivityTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('adminRecentActivityPlaceholder')}</p>
            {/* Future: List real recent activities */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">{t('adminQuickActionsTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-2">
            <Button variant="outline" disabled>{t('adminManageCoursesButton')} (Coming Soon)</Button>
            <Button variant="outline" onClick={() => router.push('/admin/user-stories')}>{t('adminReviewUserSubmissionsButton')}</Button>
            <Button variant="outline" disabled>{t('adminSendAnnouncementButton')} (Coming Soon)</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


    
