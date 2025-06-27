
"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminConfig } from '@/contexts/AdminConfigContext';
import { Button } from '@/components/ui/button';
import { Menu, X, Tv, Users, LogIn, LogOut, UserCircle, Settings, Home, BookOpen, Film, Globe, Loader2, ChevronDown, Phone } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { GeneralSettingsConfig } from '@/types';

const ONLYfansLYLogo = () => (
  <svg width="32" height="32" viewBox="0 0 100 100" className="text-primary mr-2">
    <path fill="currentColor" d="M50 5C25.16 5 5 25.16 5 50s20.16 45 45 45 45-20.16 45-45S74.84 5 50 5zm0 82.5C29.33 87.5 12.5 70.67 12.5 50S29.33 12.5 50 12.5 87.5 29.33 87.5 50 70.67 87.5 50 87.5z"/>
    <path fill="currentColor" d="M66.62 35.58c-1.3-1.31-3.41-1.31-4.71 0L42.06 55.42l-6.95-6.95c-1.3-1.31-3.41-1.31-4.71 0-1.31 1.3-1.31 3.41 0 4.71l9.31 9.31c.65.65 1.51.98 2.36.98s1.7-.32 2.36-.98l22.22-22.2c1.31-1.31 1.31-3.41-.02-4.71z"/>
  </svg>
);


export function Navbar() {
  const { user, logout, isAdmin, loading: authLoading } = useAuth();
  const { config, t, currentUserLanguage, setCurrentUserLanguage, isClientHydrated } = useAdminConfig();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/', label: t('navHome'), icon: <Home /> },
    { href: '/courses', label: t('navCourses'), icon: <BookOpen /> },
    { href: '/stories', label: t('navStories'), icon: <Film /> },
  ];

  const isCallDesignated = isClientHydrated && !!config.liveStreamAuthorizedUserId;

  const shouldShowLiveButton = () => {
    if (!isClientHydrated || isCallDesignated) return false;
    
    // Original logic for general stream access
    if (!config.liveButtonVisible) return false;
    if (config.liveButtonAccess === 'public') return true;
    if (!user) return false; 
    if (config.liveButtonAccess === 'loggedIn') return true;
    if (config.liveButtonAccess === 'group' && user.groups?.includes(config.liveButtonAccessGroup || '')) return true;
    return false;
  };

  const shouldShowCallButton = () => {
    if (!isClientHydrated || !isCallDesignated || !user) return false;
    // Show for the designated user ONLY. Admin uses the admin panel.
    return user.id === config.liveStreamAuthorizedUserId;
  };


  const NavLinkItem = ({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) => (
    <Link href={href} passHref>
      <Button variant={pathname === href ? "secondary" : "ghost"} className="w-full justify-start md:w-auto">
        {React.cloneElement(icon as React.ReactElement, { className: "mr-2 h-5 w-5" })}
        {label}
      </Button>
    </Link>
  );

  const LanguageSelector = ({ inMobileMenu = false }: { inMobileMenu?: boolean}) => {
    return (
      <Select value={currentUserLanguage} onValueChange={(value) => setCurrentUserLanguage(value as GeneralSettingsConfig['language'])}>
        <SelectTrigger 
          className={cn(
            "w-auto md:w-[130px] border-0 md:border md:border-input focus:ring-0 md:focus:ring-2 md:focus:ring-ring", 
            inMobileMenu ? "w-full justify-start" : "px-2 md:px-3"
          )}
          aria-label={t('navLanguage')}
        >
          <Globe className="h-5 w-5 md:mr-1 text-muted-foreground" />
          <div className="hidden md:block">
            <SelectValue placeholder={t('navLanguage')} />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">{t('navLanguageEN')}</SelectItem>
          <SelectItem value="es">{t('navLanguageES')}</SelectItem>
        </SelectContent>
      </Select>
    );
  };
  
  return (
    <nav className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center text-primary hover:text-accent transition-colors">
            <ONLYfansLYLogo />
            <span className="font-headline text-2xl font-semibold">ONLYfansLY</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map(link => <NavLinkItem key={link.href} {...link} />)}
            {shouldShowLiveButton() && (
              <Link href="/live" passHref>
                <Button variant={pathname === "/live" ? "secondary" : "ghost"} className="text-primary hover:text-accent-foreground hover:bg-accent">
                  <Tv className="mr-2 h-5 w-5" /> {t('navLive')}
                </Button>
              </Link>
            )}
             {shouldShowCallButton() && (
              <Link href="/call" passHref>
                <Button variant={pathname === "/call" ? "secondary" : "ghost"} className="text-primary hover:text-accent-foreground hover:bg-accent animate-pulse">
                  <Phone className="mr-2 h-5 w-5" /> {t('navCall')}
                </Button>
              </Link>
            )}
            {isClientHydrated && config.generalSettings.allowUserLanguageChange && <LanguageSelector />}
            
            {authLoading ? (
              <Button variant="ghost" disabled size="icon"><Loader2 className="h-5 w-5 animate-spin" /></Button>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">
                    {user.name.split(' ')[0]}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <Link href="/admin/dashboard" passHref>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>{t('navAdminPanel')}</span>
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <Link href="/profile" passHref> {/* Assume /profile page exists or will be created */}
                    <DropdownMenuItem>
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>{t('navUserProfileDropdownProfile')}</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('navLogout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/signin" passHref>
                <Button>
                  <LogIn className="mr-2 h-5 w-5" /> {t('navLogin')}
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {isClientHydrated && config.generalSettings.allowUserLanguageChange && <LanguageSelector />}
            <Button variant="ghost" onClick={toggleMobileMenu} aria-label="Toggle menu">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isClientHydrated && isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-card shadow-lg p-4 z-40 border-t">
          <div className="flex flex-col space-y-2">
            {navLinks.map(link => <NavLinkItem key={link.href} {...link} />)}
            {shouldShowLiveButton() && (
               <Link href="/live" passHref>
                <Button variant={pathname === "/live" ? "secondary" : "ghost"} className="w-full justify-start text-primary hover:text-accent-foreground hover:bg-accent">
                  <Tv className="mr-2 h-5 w-5" /> {t('navLive')}
                </Button>
              </Link>
            )}
            {shouldShowCallButton() && (
               <Link href="/call" passHref>
                <Button variant={pathname === "/call" ? "secondary" : "ghost"} className="w-full justify-start text-primary hover:text-accent-foreground hover:bg-accent animate-pulse">
                  <Phone className="mr-2 h-5 w-5" /> {t('navCall')}
                </Button>
              </Link>
            )}

            <hr className="my-2 border-border" />

            {authLoading ? (
               <Button variant="ghost" disabled className="w-full justify-start"><Loader2 className="h-5 w-5 animate-spin mr-2" /> {t('loadingAdminArea')}</Button>
            ) : user ? (
              <>
                <div className="px-2 py-2">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
                {isAdmin && (
                  <Link href="/admin/dashboard" passHref>
                    <Button variant={pathname.startsWith("/admin") ? "secondary" : "ghost"} className="w-full justify-start">
                        <Settings className="mr-2 h-5 w-5" /> {t('navAdminPanel')}
                    </Button>
                  </Link>
                )}
                <Link href="/profile" passHref>
                  <Button variant={pathname === "/profile" ? "secondary" : "ghost"} className="w-full justify-start">
                    <UserCircle className="mr-2 h-5 w-5" /> {t('navUserProfileDropdownProfile')}
                  </Button>
                </Link>
                <Button variant="ghost" onClick={logout} className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10">
                  <LogOut className="mr-2 h-5 w-5" /> {t('navLogout')}
                </Button>
              </>
            ) : (
              <Link href="/signin" passHref>
                <Button className="w-full justify-start">
                  <LogIn className="mr-2 h-5 w-5" /> {t('navLogin')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
