
"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useAdminConfig } from '@/contexts/AdminConfigContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import type { AdminConfig } from '@/types';

type HeroConfigState = AdminConfig['heroConfig'];

export default function HeroConfigPage() {
  const { config, setConfig } = useAdminConfig();
  const { toast } = useToast();

  const [heroState, setHeroState] = useState<HeroConfigState>(config.heroConfig);

  useEffect(() => {
    setHeroState(config.heroConfig);
  }, [config.heroConfig]);

  const handleInputChange = (field: keyof HeroConfigState, value: string) => {
    setHeroState(prevState => ({ ...prevState, [field]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setConfig(prevConfig => ({
      ...prevConfig,
      heroConfig: heroState,
    }));
    toast({ title: "Hero Banner Updated", description: "Changes saved successfully." });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">Hero Banner Configuration</h1>
      <Card>
        <CardHeader>
          <CardTitle>Customize Hero Section</CardTitle>
          <CardDescription>Update the text elements and background image displayed on the main hero banner.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="mainText">Main Headline</Label>
              <Input
                id="mainText"
                value={heroState.mainText}
                onChange={(e) => handleInputChange('mainText', e.target.value)}
                placeholder="e.g., Welcome to ONLYfansLY"
              />
            </div>
             <div className="space-y-2">
                <Label htmlFor="mainTextColor">Main Headline Color</Label>
                <div className="flex items-center gap-2">
                    <Input 
                        id="mainTextColor"
                        type="color" 
                        value={heroState.mainTextColor || '#FFFFFF'}
                        onChange={(e) => handleInputChange('mainTextColor', e.target.value)} 
                        className="p-1 h-10 w-14"
                    />
                    <Input 
                        type="text" 
                        value={(heroState.mainTextColor || '').toUpperCase()}
                        onChange={(e) => handleInputChange('mainTextColor', e.target.value)}
                        placeholder="#FFFFFF"
                    />
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryText">Secondary Headline</Label>
              <Input
                id="secondaryText"
                value={heroState.secondaryText}
                onChange={(e) => handleInputChange('secondaryText', e.target.value)}
                placeholder="e.g., Your Universe of Streams"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descriptionText">Descriptive Text</Label>
              <Textarea
                id="descriptionText"
                value={heroState.descriptionText}
                onChange={(e) => handleInputChange('descriptionText', e.target.value)}
                placeholder="e.g., Discover amazing live content..."
                rows={3}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="heroImageUrl">Hero Image URL (Optional)</Label>
              <Input
                id="heroImageUrl"
                value={heroState.heroImageUrl || ''}
                onChange={(e) => handleInputChange('heroImageUrl', e.target.value)}
                placeholder="https://example.com/your-image.png"
              />
              <p className="text-xs text-muted-foreground">If left empty, the default gradient background will be used.</p>
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>This is how your hero banner currently looks (simplified).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative bg-gradient-to-br from-primary via-purple-600 to-pink-500 text-primary-foreground py-20 md:py-32 rounded-lg shadow-xl overflow-hidden">
            <div className="absolute inset-0">
                {heroState.heroImageUrl ? (
                    <Image
                        src={heroState.heroImageUrl}
                        alt="Hero background"
                        layout="fill"
                        objectFit="cover"
                        className="opacity-20"
                    />
                ) : (
                    <Image
                        src="https://picsum.photos/1200/400"
                        alt="Default abstract background"
                        layout="fill"
                        objectFit="cover"
                        className="opacity-20"
                        data-ai-hint="abstract streaming"
                    />
                )}
                <div className="absolute inset-0 bg-black opacity-30"></div>
            </div>
            <div className="container mx-auto px-4 relative z-10 text-center">
                <h1 
                  className="font-headline text-4xl md:text-6xl font-bold mb-4" 
                  style={{ color: heroState.mainTextColor || '#FFFFFF' }}
                >
                  {heroState.mainText || "Main Headline"}
                </h1>
                <h2 className="font-headline text-2xl md:text-3xl text-accent mb-6">{heroState.secondaryText || "Secondary Headline"}</h2>
                <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 font-body">{heroState.descriptionText || "Description text goes here."}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
