
"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useAdminConfig } from '@/contexts/AdminConfigContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";

export default function StreamConfigPage() {
  const { config, setConfig, t } = useAdminConfig();
  const { toast } = useToast();

  const [streamSource, setStreamSource] = useState<'url' | 'webcam'>(config.streamSource);
  const [liveStreamUrl, setLiveStreamUrl] = useState(config.liveStreamUrl);
  const [liveStreamAccess, setLiveStreamAccess] = useState<'public' | 'loggedIn' | 'group'>(config.liveStreamAccess);
  const [liveStreamAccessGroup, setLiveStreamAccessGroup] = useState(config.liveStreamAccessGroup || '');
  
  const [liveButtonVisible, setLiveButtonVisible] = useState(config.liveButtonVisible);
  const [liveButtonAccess, setLiveButtonAccess] = useState<'public' | 'loggedIn' | 'group'>(config.liveButtonAccess);
  const [liveButtonAccessGroup, setLiveButtonAccessGroup] = useState(config.liveButtonAccessGroup || '');

  useEffect(() => {
    setStreamSource(config.streamSource);
    setLiveStreamUrl(config.liveStreamUrl);
    setLiveStreamAccess(config.liveStreamAccess);
    setLiveStreamAccessGroup(config.liveStreamAccessGroup || '');
    setLiveButtonVisible(config.liveButtonVisible);
    setLiveButtonAccess(config.liveButtonAccess);
    setLiveButtonAccessGroup(config.liveButtonAccessGroup || '');
  }, [config]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setConfig(prevConfig => ({
      ...prevConfig,
      streamSource,
      liveStreamUrl,
      liveStreamAccess,
      liveStreamAccessGroup: liveStreamAccess === 'group' ? liveStreamAccessGroup : '',
      liveButtonVisible,
      liveButtonAccess,
      liveButtonAccessGroup: liveButtonAccess === 'group' ? liveButtonAccessGroup : '',
    }));
    toast({ title: t('toastSettingsSaved'), description: t('adminLiveConfigTitle') });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">{t('adminLiveConfigTitle')}</h1>
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('adminStreamSourceAccessTitle')}</CardTitle>
            <CardDescription>{t('adminStreamSourceAccessDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="streamSource">Fuente de la Transmisión</Label>
               <Select value={streamSource} onValueChange={(value) => setStreamSource(value as 'url' | 'webcam')}>
                <SelectTrigger id="streamSource">
                  <SelectValue placeholder="Seleccionar fuente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="url">URL/Embed</SelectItem>
                  <SelectItem value="webcam">Cámara Web del Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {streamSource === 'url' && (
              <div>
                <Label htmlFor="liveStreamUrl">{t('adminStreamUrlLabel')}</Label>
                <Input 
                  id="liveStreamUrl" 
                  value={liveStreamUrl} 
                  onChange={(e) => setLiveStreamUrl(e.target.value)} 
                  placeholder={t('adminStreamUrlPlaceholder')}
                />
                <p className="text-xs text-muted-foreground mt-1">{t('adminStreamUrlHint')}</p>
              </div>
            )}

            <div>
              <Label htmlFor="liveStreamAccess">{t('adminStreamAccessControlLabel')}</Label>
              <Select value={liveStreamAccess} onValueChange={(value) => setLiveStreamAccess(value as 'public' | 'loggedIn' | 'group')}>
                <SelectTrigger id="liveStreamAccess">
                  <SelectValue placeholder={t('adminSelectAccessTypePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">{t('adminAccessPublic')}</SelectItem>
                  <SelectItem value="loggedIn">{t('adminAccessLoggedIn')}</SelectItem>
                  <SelectItem value="group">{t('adminAccessGroup')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {liveStreamAccess === 'group' && (
              <div>
                <Label htmlFor="liveStreamAccessGroup">{t('adminRequiredGroupLabel')}</Label>
                <Input 
                  id="liveStreamAccessGroup" 
                  value={liveStreamAccessGroup} 
                  onChange={(e) => setLiveStreamAccessGroup(e.target.value)}
                  placeholder={t('adminRequiredGroupPlaceholderStream')}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('adminNavLiveButtonTitle')}</CardTitle>
            <CardDescription>{t('adminNavLiveButtonDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="liveButtonVisible" 
                checked={liveButtonVisible} 
                onCheckedChange={setLiveButtonVisible} 
              />
              <Label htmlFor="liveButtonVisible">{t('adminShowLiveButtonLabel')}</Label>
            </div>
            {liveButtonVisible && (
              <>
                <div>
                  <Label htmlFor="liveButtonAccess">{t('adminLiveButtonAccessLabel')}</Label>
                  <Select value={liveButtonAccess} onValueChange={(value) => setLiveButtonAccess(value as 'public' | 'loggedIn' | 'group')}>
                    <SelectTrigger id="liveButtonAccess">
                      <SelectValue placeholder={t('adminSelectAccessTypePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">{t('adminAccessPublic')}</SelectItem>
                      <SelectItem value="loggedIn">{t('adminAccessLoggedIn')}</SelectItem>
                      <SelectItem value="group">{t('adminAccessGroup')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {liveButtonAccess === 'group' && (
                  <div>
                    <Label htmlFor="liveButtonAccessGroup">{t('adminRequiredGroupLabel')}</Label>
                    <Input 
                      id="liveButtonAccessGroup" 
                      value={liveButtonAccessGroup} 
                      onChange={(e) => setLiveButtonAccessGroup(e.target.value)}
                      placeholder={t('adminRequiredGroupPlaceholderButton')}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
        <Button type="submit" className="mt-6">{t('adminSaveAllStreamSettingsButton')}</Button>
      </form>
    </div>
  );
}
