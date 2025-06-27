
"use client";

import type { AdminConfig, TranslationKey, GeneralSettingsConfig, ChatMessage, SiteSettings, WhatsAppConfig } from '@/types';
import { getTranslation } from '@/lib/translations';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from "firebase/firestore"; // Import onSnapshot
import { db } from '@/lib/firebase';

const initialConfig: AdminConfig = {
  streamSource: 'url',
  liveStreamUrl: 'https://www.youtube.com/embed/live_stream?channel=UC4QZ_LsYcvhLwTBaxgJGv5g',
  liveStreamAccess: 'public', 
  liveStreamAccessGroup: '',
  liveButtonVisible: true,
  liveButtonAccess: 'public',
  liveButtonAccessGroup: '',
  chatAccess: 'public', 
  chatAccessGroup: '',
  heroConfig: {
    mainText: 'Welcome to ONLYfansLY',
    secondaryText: 'Your Universe of Streams',
    descriptionText: 'Discover amazing live content, courses, and connect with creators.',
    heroImageUrl: '',
    mainTextColor: '#D81B60',
  },
  footerConfig: {
    logoText: 'ONLYfansLY',
    slogan: 'Your platform for exclusive content.',
    links: [
      { text: 'footerQuickLinksAboutUs', href: '/about' },
      { text: 'footerQuickLinksPrivacyPolicy', href: '/privacy' },
      { text: 'footerQuickLinksTerms', href: '/terms' },
    ],
    androidAppLink: '#',
    iosAppLink: '#',
    showAndroidApp: true,
    androidAppIconUrl: '',
    showIosApp: true,
    iosAppIconUrl: '',
    mobileAppsSectionTitle: 'Download App',
  },
  chatModeration: {
    profanityFilterEnabled: false,
    bannedKeywords: '',
    bannedUserIds: '',
  },
  chatMessages: [], 
  generalSettings: {
    language: 'es', 
    allowUserLanguageChange: true,
  },
  liveStreamAuthorizedUserId: null,
  whatsAppConfig: {
    whatsAppEnabled: false,
    whatsAppPhoneNumber: '',
    whatsAppDefaultMessage: 'Hola, me gustaría obtener más información.',
    whatsAppIcon: 'default',
    whatsAppCustomIconUrl: '',
    whatsAppButtonSize: 56,
    whatsAppIconSize: 28,
    whatsAppButtonColor: '#25D366',
  }
};

const getAdminEmailForContext = (): string => {
  return process.env.NEXT_PUBLIC_ADMIN_EMAIL_FOR_DEMO || 'admin@onlyfansly.com';
};

interface AdminConfigContextType {
  config: AdminConfig;
  setConfig: (value: AdminConfig | ((prevState: AdminConfig) => AdminConfig)) => Promise<void>;
  currentUserLanguage: GeneralSettingsConfig['language'];
  setCurrentUserLanguage: (lang: GeneralSettingsConfig['language']) => void;
  t: (key: TranslationKey, substitutions?: Record<string, string>) => string;
  isClientHydrated: boolean;
  siteSettingsForSocket: SiteSettings | null; 
}

const AdminConfigContext = createContext<AdminConfigContextType | undefined>(undefined);

export const AdminConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfigState] = useState<AdminConfig>(initialConfig);
  const [currentUserLanguage, setCurrentUserLanguageState] = useState<GeneralSettingsConfig['language']>(initialConfig.generalSettings.language);
  const [isClientHydrated, setIsClientHydrated] = useState(false);
  const [siteSettingsForSocket, setSiteSettingsForSocket] = useState<SiteSettings | null>(null);


  const configDocRef = doc(db, 'admin_settings', 'main_config');

  const isObject = (item: any) => item && typeof item === 'object' && !Array.isArray(item);

  const deepMerge = (target: any, source: any): any => {
    const output = { ...target };
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(key => {
        const sourceValue = source[key];
        if (sourceValue === undefined) { 
          if (!(key in target)) { 
            output[key] = undefined;
          }
        } else if (isObject(sourceValue)) {
          if (!(key in target) || !isObject(target[key])) {
            output[key] = sourceValue; 
          } else {
            output[key] = deepMerge(target[key], sourceValue); 
          }
        } else {
          output[key] = sourceValue; 
        }
      });
    }
    return output;
  };

  const generateSiteSettings = (currentConfig: AdminConfig): SiteSettings => {
    return {
      liveStreamAuthorizedUserId: currentConfig.liveStreamAuthorizedUserId || null,
      liveStreamDefaultTitle: currentConfig.heroConfig?.mainText || 'Live Stream',
      liveStreamForLoggedInUsersOnly: currentConfig.liveStreamAccess === 'loggedIn',
      adminAppUserId: getAdminEmailForContext(), 
    };
  };


  useEffect(() => {
    // Use onSnapshot for real-time updates
    const unsubscribe = onSnapshot(configDocRef, (docSnap) => {
      let activeConfig = initialConfig;

      if (docSnap.exists()) {
        const firestoreData = docSnap.data() as Partial<AdminConfig>;
        activeConfig = deepMerge(initialConfig, firestoreData);
      } else {
        // If doc doesn't exist, create it. onSnapshot will be re-triggered.
        setDoc(configDocRef, initialConfig).catch(error => {
          console.error("AdminConfig: Failed to initialize config in Firestore:", error);
        });
        console.log("AdminConfig: No config found, initializing with defaults.");
        return; // Exit early, the re-trigger will handle state updates
      }
      
      activeConfig.liveStreamUrl = activeConfig.liveStreamUrl ?? initialConfig.liveStreamUrl;
      activeConfig.liveStreamAccessGroup = activeConfig.liveStreamAccessGroup ?? '';
      activeConfig.liveButtonAccessGroup = activeConfig.liveButtonAccessGroup ?? '';
      activeConfig.chatAccessGroup = activeConfig.chatAccessGroup ?? '';
      activeConfig.chatMessages = activeConfig.chatMessages || []; 
      activeConfig.liveStreamAuthorizedUserId = activeConfig.liveStreamAuthorizedUserId || null;
      activeConfig.whatsAppConfig = activeConfig.whatsAppConfig || initialConfig.whatsAppConfig;
      activeConfig.footerConfig = activeConfig.footerConfig || initialConfig.footerConfig;
      activeConfig.heroConfig = activeConfig.heroConfig || initialConfig.heroConfig;
      activeConfig.heroConfig.heroImageUrl = activeConfig.heroConfig.heroImageUrl || '';
      activeConfig.heroConfig.mainTextColor = activeConfig.heroConfig.mainTextColor || initialConfig.heroConfig.mainTextColor;
      activeConfig.footerConfig.slogan = activeConfig.footerConfig.slogan || initialConfig.footerConfig.slogan;
      activeConfig.streamSource = activeConfig.streamSource || 'url';


      setConfigState(activeConfig);
      setSiteSettingsForSocket(generateSiteSettings(activeConfig));

      if (!isClientHydrated) { // Only run this logic on first load
        let langToSet = activeConfig.generalSettings.language;
        if (activeConfig.generalSettings.allowUserLanguageChange) {
          const storedUserLang = localStorage.getItem('onlyfansly-user-lang') as GeneralSettingsConfig['language'] | null;
          if (storedUserLang && (storedUserLang === 'en' || storedUserLang === 'es')) {
            langToSet = storedUserLang;
          }
        }
        setCurrentUserLanguageState(langToSet);
        setIsClientHydrated(true);
      }
    }, (error) => {
      console.error("AdminConfig: Error with Firestore listener:", error);
      // Fallback to initial config on listener error
      setConfigState(initialConfig);
      setSiteSettingsForSocket(generateSiteSettings(initialConfig));
      setIsClientHydrated(true); // Ensure app hydrates even on error
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [isClientHydrated]); // Dependency array to control re-subscription

  const setConfigAndUpdateFirestore: AdminConfigContextType['setConfig'] = useCallback(async (value) => {
    let newConfigCandidate: AdminConfig;
    // We get the latest state directly from the function argument to avoid stale state issues.
    setConfigState(prevConfig => {
        if (typeof value === 'function') {
            newConfigCandidate = value(prevConfig);
        } else {
            newConfigCandidate = value;
        }
        // Save the new state to Firestore. The onSnapshot listener will handle updating the local state.
        setDoc(configDocRef, newConfigCandidate, { merge: true }).catch(error => { 
          console.error("AdminConfig: Error saving config to Firestore:", error);
        });
        
        // We can optimistically update the state here, but onSnapshot is the source of truth
        return newConfigCandidate;
    });
  }, [configDocRef]); 

  useEffect(() => {
    if (isClientHydrated) {
      if (config.generalSettings.allowUserLanguageChange) {
        localStorage.setItem('onlyfansly-user-lang', currentUserLanguage);
      } else {
        if (currentUserLanguage !== config.generalSettings.language) {
          setCurrentUserLanguageState(config.generalSettings.language);
        }
        localStorage.removeItem('onlyfansly-user-lang'); 
      }
    }
  }, [config.generalSettings, currentUserLanguage, isClientHydrated]);


  const setCurrentUserLanguageInternal = useCallback((lang: GeneralSettingsConfig['language']) => {
    if (isClientHydrated) { 
      if (config.generalSettings.allowUserLanguageChange) {
        setCurrentUserLanguageState(lang);
      } else {
        setCurrentUserLanguageState(config.generalSettings.language);
      }
    }
  }, [isClientHydrated, config.generalSettings.allowUserLanguageChange, config.generalSettings.language]);
  
  const t = useCallback((key: TranslationKey, substitutions?: Record<string, string>): string => {
    let langToUse = currentUserLanguage;
    if (!isClientHydrated) { 
      langToUse = initialConfig.generalSettings.language; 
    }
    
    let translation = getTranslation(langToUse, key);
    if (substitutions) {
      Object.entries(substitutions).forEach(([subKey, subValue]) => {
        translation = translation.replace(new RegExp(`{{${subKey}}}`, 'g'), subValue);
      });
    }
    return translation;
  }, [currentUserLanguage, isClientHydrated]);

  return (
    <AdminConfigContext.Provider value={{ 
      config, 
      setConfig: setConfigAndUpdateFirestore, 
      currentUserLanguage, 
      setCurrentUserLanguage: setCurrentUserLanguageInternal, 
      t, 
      isClientHydrated,
      siteSettingsForSocket 
    }}>
      {children}
    </AdminConfigContext.Provider>
  );
};

export const useAdminConfig = () => {
  const context = useContext(AdminConfigContext);
  if (context === undefined) {
    throw new Error('useAdminConfig must be used within an AdminConfigProvider');
  }
  return context;
};
