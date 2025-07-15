
"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useAdminConfig } from '@/contexts/AdminConfigContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Trash2 } from 'lucide-react';
import type { FooterLink, AdminConfig } from '@/types';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';

type FooterConfigState = AdminConfig['footerConfig'];

export default function FooterConfigPage() {
  const { config, setConfig } = useAdminConfig();
  const { toast } = useToast();

  const [footerState, setFooterState] = useState<FooterConfigState>(config.footerConfig);

  useEffect(() => {
    setFooterState(config.footerConfig);
  }, [config.footerConfig]);

  const handleInputChange = (field: keyof FooterConfigState, value: string | boolean) => {
    setFooterState(prevState => ({ ...prevState, [field]: value }));
  };

  const handleLinkChange = (index: number, field: keyof FooterLink, value: string) => {
    const newLinks = [...footerState.links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setFooterState(prevState => ({ ...prevState, links: newLinks }));
  };

  const addLink = () => {
    const newLinks = [...footerState.links, { text: '', href: '' }];
    setFooterState(prevState => ({ ...prevState, links: newLinks }));
  };

  const removeLink = (index: number) => {
    const newLinks = footerState.links.filter((_, i) => i !== index);
    setFooterState(prevState => ({ ...prevState, links: newLinks }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setConfig(prevConfig => ({
      ...prevConfig,
      footerConfig: footerState,
    }));
    toast({ title: "Footer Configuration Updated", description: "Settings saved successfully." });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">Footer Configuration</h1>
      <Card>
        <CardHeader>
          <CardTitle>Customize Footer Section</CardTitle>
          <CardDescription>Update logo, navigation links, and app download URLs for the site footer.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="logoText">Logo Text</Label>
              <Input
                id="logoText"
                value={footerState.logoText}
                onChange={(e) => handleInputChange('logoText', e.target.value)}
                placeholder="e.g., ONLYfansLY"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="footerLogoUrl">Footer Logo URL (Optional)</Label>
              <Input
                id="footerLogoUrl"
                type="url"
                value={footerState.footerLogoUrl || ''}
                onChange={(e) => handleInputChange('footerLogoUrl', e.target.value)}
                placeholder="https://example.com/your-logo.png"
              />
              <p className="text-xs text-muted-foreground">If provided, this image will be used instead of the default icon. Recommended size: 24x24 pixels.</p>
              {footerState.footerLogoUrl && (
                <div className="mt-2 p-2 border rounded-md inline-block">
                  <Image src={footerState.footerLogoUrl} alt="Logo Preview" width={24} height={24} className="object-contain" />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slogan">Slogan Text</Label>
              <Textarea
                id="slogan"
                value={footerState.slogan}
                onChange={(e) => handleInputChange('slogan', e.target.value)}
                placeholder="e.g., Your universe of streams..."
                rows={2}
              />
            </div>

            <fieldset className="space-y-4 border p-4 rounded-md">
              <legend className="text-sm font-medium px-1">Footer Links</legend>
              {footerState.links.map((link, index) => (
                <div key={index} className="flex items-end gap-2 p-2 border rounded-md">
                  <div className="flex-grow space-y-2">
                    <Label htmlFor={`linkText-${index}`}>Link Text</Label>
                    <Input
                      id={`linkText-${index}`}
                      value={link.text}
                      onChange={(e) => handleLinkChange(index, 'text', e.target.value)}
                      placeholder="e.g., About Us"
                    />
                  </div>
                  <div className="flex-grow space-y-2">
                    <Label htmlFor={`linkHref-${index}`}>Link URL</Label>
                    <Input
                      id={`linkHref-${index}`}
                      value={link.href}
                      onChange={(e) => handleLinkChange(index, 'href', e.target.value)}
                      placeholder="e.g., /about"
                    />
                  </div>
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeLink(index)} aria-label="Remove link">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addLink} className="mt-2">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Link
              </Button>
            </fieldset>
            
            <fieldset className="space-y-4 border p-4 rounded-md">
              <legend className="text-sm font-medium px-1">App Download Links</legend>
              <div className="space-y-2">
                <Label htmlFor="mobileAppsSectionTitle">Section Title</Label>
                <Input
                  id="mobileAppsSectionTitle"
                  value={footerState.mobileAppsSectionTitle}
                  onChange={(e) => handleInputChange('mobileAppsSectionTitle', e.target.value)}
                  placeholder="e.g., Download Our App"
                />
              </div>

              <Separator />

              <div className="flex items-center space-x-2">
                  <Switch id="showAndroidApp" checked={footerState.showAndroidApp} onCheckedChange={(checked) => handleInputChange('showAndroidApp', checked)} />
                  <Label htmlFor="showAndroidApp">Show Android App Link</Label>
              </div>
               {footerState.showAndroidApp && (
                <div className="pl-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="androidAppLink">Android App Link</Label>
                    <Input id="androidAppLink" type="url" value={footerState.androidAppLink} onChange={(e) => handleInputChange('androidAppLink', e.target.value)} placeholder="Google Play Store URL" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="androidAppIconUrl">Android App Icon URL (Optional)</Label>
                    <Input id="androidAppIconUrl" type="url" value={footerState.androidAppIconUrl} onChange={(e) => handleInputChange('androidAppIconUrl', e.target.value)} placeholder="Link to custom icon image" />
                  </div>
                </div>
               )}

              <Separator />

              <div className="flex items-center space-x-2">
                  <Switch id="showIosApp" checked={footerState.showIosApp} onCheckedChange={(checked) => handleInputChange('showIosApp', checked)} />
                  <Label htmlFor="showIosApp">Show iOS App Link</Label>
              </div>
              {footerState.showIosApp && (
                <div className="pl-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="iosAppLink">iOS App Link</Label>
                    <Input id="iosAppLink" type="url" value={footerState.iosAppLink} onChange={(e) => handleInputChange('iosAppLink', e.target.value)} placeholder="Apple App Store URL" />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="iosAppIconUrl">iOS App Icon URL (Optional)</Label>
                    <Input id="iosAppIconUrl" type="url" value={footerState.iosAppIconUrl} onChange={(e) => handleInputChange('iosAppIconUrl', e.target.value)} placeholder="Link to custom icon image" />
                  </div>
                </div>
              )}
            </fieldset>
            
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
