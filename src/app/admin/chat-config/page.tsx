
"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useAdminConfig } from '@/contexts/AdminConfigContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

export default function ChatConfigPage() {
  const { config, setConfig, t } = useAdminConfig();
  const { toast } = useToast();

  const [chatAccess, setChatAccess] = useState<'public' | 'private' | 'exclusive' | 'loggedIn'>(config.chatAccess);
  const [chatAccessGroup, setChatAccessGroup] = useState(config.chatAccessGroup || '');
  
  // Moderation state
  const [profanityFilterEnabled, setProfanityFilterEnabled] = useState(config.chatModeration.profanityFilterEnabled);
  const [bannedKeywords, setBannedKeywords] = useState(config.chatModeration.bannedKeywords);
  const [bannedUserIds, setBannedUserIds] = useState(config.chatModeration.bannedUserIds);

  useEffect(() => {
    setChatAccess(config.chatAccess);
    setChatAccessGroup(config.chatAccessGroup || '');
    setProfanityFilterEnabled(config.chatModeration.profanityFilterEnabled);
    setBannedKeywords(config.chatModeration.bannedKeywords);
    setBannedUserIds(config.chatModeration.bannedUserIds);
  }, [config]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setConfig(prevConfig => ({
      ...prevConfig,
      chatAccess,
      chatAccessGroup: chatAccess === 'exclusive' ? chatAccessGroup : '',
      chatModeration: {
        profanityFilterEnabled,
        bannedKeywords,
        bannedUserIds,
      }
    }));
    toast({ title: t('toastSettingsSaved'), description: t('adminChatConfigTitle') });
  };

  const handleClearChat = () => {
    setConfig(prevConfig => ({
      ...prevConfig,
      chatMessages: [], // Set chatMessages to an empty array
    }));
    toast({ title: "Chat History Cleared", description: "All messages have been removed from the chat." });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">{t('adminChatConfigTitle')}</h1>
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('adminChatAccessControlTitle')}</CardTitle>
            <CardDescription>{t('adminChatAccessControlDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="chatAccess">{t('adminChatAccessTypeLabel')}</Label>
              <Select value={chatAccess} onValueChange={(value) => setChatAccess(value as 'public' | 'private' | 'exclusive' | 'loggedIn')}>
                <SelectTrigger id="chatAccess">
                  <SelectValue placeholder={t('adminSelectAccessTypePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">{t('adminChatAccessPublic')}</SelectItem>
                  <SelectItem value="loggedIn">{t('adminAccessLoggedIn')}</SelectItem> {/* Use generic 'loggedIn' translation */}
                  <SelectItem value="private">{t('adminChatAccessPrivate')}</SelectItem>
                  <SelectItem value="exclusive">{t('adminChatAccessExclusive')}</SelectItem>
                </SelectContent>
              </Select>
               <p className="text-xs text-muted-foreground mt-1">
                 {t('adminChatAccessPrivateNote')}
              </p>
            </div>

            {chatAccess === 'exclusive' && (
              <div>
                <Label htmlFor="chatAccessGroup">{t('adminRequiredGroupLabel')}</Label>
                <Input 
                  id="chatAccessGroup" 
                  value={chatAccessGroup} 
                  onChange={(e) => setChatAccessGroup(e.target.value)}
                  placeholder={t('adminRequiredGroupPlaceholderChat')}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('adminChatModerationTitle')}</CardTitle>
            <CardDescription>{t('adminChatModerationDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="profanityFilterEnabled" 
                checked={profanityFilterEnabled} 
                onCheckedChange={setProfanityFilterEnabled}
              />
              <Label htmlFor="profanityFilterEnabled">{t('adminEnableProfanityFilterLabel')}</Label>
            </div>

            <div>
              <Label htmlFor="bannedKeywords">{t('adminBannedKeywordsLabel')}</Label>
              <Textarea
                id="bannedKeywords"
                value={bannedKeywords}
                onChange={(e) => setBannedKeywords(e.target.value)}
                placeholder={t('adminBannedKeywordsPlaceholder')}
                rows={3}
                disabled={!profanityFilterEnabled}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t('adminBannedKeywordsHint')}
              </p>
            </div>

            <div>
              <Label htmlFor="bannedUserIds">{t('adminBannedUserIdsLabel')}</Label>
              <Textarea
                id="bannedUserIds"
                value={bannedUserIds}
                onChange={(e) => setBannedUserIds(e.target.value)}
                placeholder={t('adminBannedUserIdsPlaceholder')}
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t('adminBannedUserIdsHint')}
              </p>
            </div>
          </CardContent>
        </Card>
            
        <Button type="submit">{t('adminSaveChatSettingsButton')}</Button>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Chat Management</CardTitle>
          <CardDescription>Perform administrative actions on the live chat.</CardDescription>
        </CardHeader>
        <CardContent>
           <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Chat History
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will permanently delete the entire chat history for all users. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearChat}>
                    Yes, clear history
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <p className="text-xs text-muted-foreground mt-2">
                Clears all messages from the live chat. The change will be reflected for all users in real-time.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
