
"use client";

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAdminConfig } from '@/contexts/AdminConfigContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function TermsOfServicePage() {
  const { config, isClientHydrated } = useAdminConfig();
  const { terms: policy } = config.policiesConfig;

  if (!isClientHydrated) {
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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12 md:py-20">
        <Card className="shadow-xl max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-4xl md:text-5xl font-headline text-center text-primary">{policy.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-base leading-relaxed text-foreground/90">
             {policy.showDate && <p className="text-muted-foreground text-center">Última actualización: {policy.lastUpdated}</p>}
             <div dangerouslySetInnerHTML={{ __html: policy.content }} />
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
