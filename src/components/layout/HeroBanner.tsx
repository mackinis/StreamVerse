
"use client";

import { useAdminConfig } from '@/contexts/AdminConfigContext';
import Image from 'next/image';

export function HeroBanner() {
  const { config } = useAdminConfig();
  const { mainText, secondaryText, descriptionText, heroImageUrl, mainTextColor } = config.heroConfig;

  return (
    <div className="relative bg-gradient-to-br from-primary via-purple-600 to-pink-500 text-primary-foreground py-20 md:py-32 rounded-lg shadow-xl overflow-hidden mb-12">
      <div className="absolute inset-0">
        {heroImageUrl ? (
            <Image
                src={heroImageUrl}
                alt="Hero background"
                fill
                className="object-cover opacity-20"
            />
        ) : (
           <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-600/10 to-pink-500/10"></div>
        )}
        <div className="absolute inset-0 bg-black opacity-30"></div>
      </div>
      <div className="container mx-auto px-4 relative z-10 text-center">
        <h1 
          className="font-headline text-4xl md:text-6xl font-bold mb-4 animate-fade-in-down"
          style={{ color: mainTextColor || '#FFFFFF' }}
        >
          {mainText}
        </h1>
        <h2 className="font-headline text-2xl md:text-3xl text-accent mb-6 animate-fade-in-up animation-delay-300">
          {secondaryText}
        </h2>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 animate-fade-in-up animation-delay-600 font-body">
          {descriptionText}
        </p>
      </div>
      <style jsx>{`
        .animation-delay-300 { animation-delay: 0.3s; }
        .animation-delay-600 { animation-delay: 0.6s; }
        .animation-delay-900 { animation-delay: 0.9s; }
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.5s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}
