
"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useAdminConfig } from '@/contexts/AdminConfigContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from "@/hooks/use-toast";
import type { GeneralSettingsConfig } from '@/types';

export default function GeneralSettingsPage() {
  const { config, setConfig, t } = useAdminConfig();
  const { toast } = useToast();

  const [language, setLanguage] = useState<GeneralSettingsConfig['language']>(config.generalSettings.language);
  const [allowUserLanguageChange, setAllowUserLanguageChange] = useState<boolean>(config.generalSettings.allowUserLanguageChange);

  useEffect(() => {
    setLanguage(config.generalSettings.language);
    setAllowUserLanguageChange(config.generalSettings.allowUserLanguageChange);
  }, [config.generalSettings]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setConfig(prevConfig => ({
      ...prevConfig,
      generalSettings: {
        language,
        allowUserLanguageChange,
      }
    }));
    toast({ title: t('toastSettingsSaved'), description: t('adminSaveLanguageButton') });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">{t('adminGeneralSettingsTitle')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t('adminLanguageSettingsCardTitle')}</CardTitle>
          <CardDescription>
            {t('adminLanguageSettingsCardDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="languageSelect">{t('adminPreferredLanguageLabel')}</Label>
              <Select value={language} onValueChange={(value) => setLanguage(value as GeneralSettingsConfig['language'])}>
                <SelectTrigger id="languageSelect" className="w-[280px]">
                  <SelectValue placeholder={t('adminSelectLanguagePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t('navLanguageEN')} (English)</SelectItem>
                  <SelectItem value="es">{t('navLanguageES')} (Español)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="allowUserLanguageChange"
                  checked={allowUserLanguageChange}
                  onCheckedChange={setAllowUserLanguageChange}
                />
                <Label htmlFor="allowUserLanguageChange">{t('adminAllowUserLangChangeLabel')}</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('adminAllowUserLangChangeDescription')}
              </p>
            </div>
            
            <Button type="submit">{t('adminSaveLanguageButton')}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

    