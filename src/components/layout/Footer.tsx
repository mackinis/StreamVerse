
"use client";

import Link from 'next/link';
import { useAdminConfig } from '@/contexts/AdminConfigContext';
import { Button } from '@/components/ui/button';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import Image from 'next/image';

const ONLYfansLYLogoSmall = () => (
  <svg width="24" height="24" viewBox="0 0 100 100" className="text-primary mr-1">
    <path fill="currentColor" d="M50 5C25.16 5 5 25.16 5 50s20.16 45 45 45 45-20.16 45-45S74.84 5 50 5zm0 82.5C29.33 87.5 12.5 70.67 12.5 50S29.33 12.5 50 12.5 87.5 29.33 87.5 50 70.67 87.5 50 87.5z"/>
    <path fill="currentColor" d="M66.62 35.58c-1.3-1.31-3.41-1.31-4.71 0L42.06 55.42l-6.95-6.95c-1.3-1.31-3.41-1.31-4.71 0-1.31 1.3-1.31 3.41 0 4.71l9.31 9.31c.65.65 1.51.98 2.36.98s1.7-.32 2.36-.98l22.22-22.2c1.31-1.31 1.31-3.41-.02-4.71z"/>
  </svg>
);

const AndroidIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 12L12 15.5L8.5 12L5 15.5L1.5 12L5 8.5L8.5 5L12 1.5L15.5 5L19 8.5M19.5 12L19 11.5L15.5 15L19 18.5L19.5 19L22.5 15.5Z"/></svg>
);

const IosIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24"><path fill="currentColor" d="M17.26 16.74C17.22 16.86 17.12 17.23 17.05 17.35C16.56 18.32 15.83 19.68 14.82 19.95C14.7 19.99 14.28 20.06 13.81 20.04C12.86 20.03 12.5 19.54 11.48 19.54C10.45 19.54 10.11 20.01 9.18 20.05C8.72 20.07 8.33 19.99 8.2 19.95C7.16 19.67 6.41 18.28 5.92 17.33C5.86 17.21 5.76 16.86 5.73 16.75C5.01 14.69 5.59 12.67 6.37 11.73C6.92 11.05 7.93 10.44 9.03 10.42C9.56 10.41 10.22 10.7 10.66 10.73C11.08 10.76 11.67 10.36 12.26 10.37C13.31 10.45 14.01 10.92 14.53 11.56C14.75 11.83 14.93 12.13 15.05 12.45C15.04 12.46 15.03 12.47 15.02 12.48C13.07 13.43 13.03 16.22 15.02 17.05C15.03 17.04 15.04 17.03 15.05 17.02C15.17 16.7 15.24 16.35 15.35 16.07C15.72 15.04 17.31 14.53 17.33 12.33C17.33 12.26 17.33 12.19 17.33 12.13C17.33 10.06 15.56 8.83 15.46 8.76C14.43 8.03 13.22 7.72 12.04 7.75C11.21 7.78 10.33 8.07 9.69 8.61C9.08 9.12 8.66 9.81 8.45 10.59C8.42 10.69 8.39 10.79 8.36 10.89C7.22 13.92 9.07 16.75 11.52 16.75C12.53 16.75 13.21 16.28 13.76 16.28C14.32 16.28 14.87 16.75 15.97 16.73C16.42 16.72 16.86 16.44 17.26 16.74Z"/></svg>
);


export function Footer() {
  const { config, t } = useAdminConfig();
  const { 
    logoText, 
    slogan,
    links, 
    androidAppLink, 
    iosAppLink,
    showAndroidApp,
    androidAppIconUrl,
    showIosApp,
    iosAppIconUrl,
    mobileAppsSectionTitle
  } = config.footerConfig;

  const socialLinks = [
    { href: "#", icon: <Facebook className="h-5 w-5" />, label: "Facebook" },
    { href: "#", icon: <Twitter className="h-5 w-5" />, label: "Twitter" },
    { href: "#", icon: <Instagram className="h-5 w-5" />, label: "Instagram" },
    { href: "#", icon: <Youtube className="h-5 w-5" />, label: "YouTube" },
  ];
  
  const isAndroidVisible = showAndroidApp && androidAppLink;
  const isIosVisible = showIosApp && iosAppLink;
  const isAppSectionVisible = isAndroidVisible || isIosVisible;

  return (
    <footer className="bg-card border-t border-border mt-12 py-8 text-card-foreground">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <Link href="/" className="flex items-center text-primary hover:text-accent transition-colors mb-4">
              <ONLYfansLYLogoSmall />
              <span className="font-headline text-xl font-semibold">{logoText}</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {slogan || t('footerSlogan')}
            </p>
          </div>

          <div>
            <h5 className="font-headline text-lg font-semibold mb-3">{t('footerQuickLinks')}</h5>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.text}>
                  <Link href={link.href} className="text-sm hover:text-primary transition-colors">
                    {link.text.startsWith('footer') ? t(link.text as any) : link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {isAppSectionVisible && (
            <div>
              <h5 className="font-headline text-lg font-semibold mb-3">{mobileAppsSectionTitle || t('footerDownloadApp')}</h5>
              <div className="flex flex-col space-y-3">
                 {isAndroidVisible && (
                    <a href={androidAppLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 text-sm hover:text-primary transition-colors">
                      {androidAppIconUrl ? (
                        <Image src={androidAppIconUrl} alt="Android App Icon" width={24} height={24} className="rounded-sm" data-ai-hint="android playstore" />
                      ) : (
                        <AndroidIcon />
                      )}
                      <span>{t('footerGetOnGooglePlay')}</span>
                    </a>
                  )}
                 {isIosVisible && (
                    <a href={iosAppLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 text-sm hover:text-primary transition-colors">
                      {iosAppIconUrl ? (
                        <Image src={iosAppIconUrl} alt="iOS App Icon" width={24} height={24} className="rounded-sm" data-ai-hint="apple appstore" />
                      ) : (
                        <IosIcon />
                      )}
                      <span>{t('footerDownloadOnAppStore')}</span>
                    </a>
                  )}
              </div>
            </div>
          )}
          
          <div>
            <h5 className="font-headline text-lg font-semibold mb-3">{t('footerFollowUs')}</h5>
            <div className="flex space-x-4">
              {socialLinks.map(social => (
                <a key={social.label} href={social.href} aria-label={social.label} className="text-muted-foreground hover:text-primary transition-colors">
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {logoText}. {t('footerCopyright')}
        </div>
      </div>
    </footer>
  );
}
