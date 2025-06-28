
"use client";

import type { AdminConfig, TranslationKey, GeneralSettingsConfig, ChatMessage, SiteSettings, WhatsAppConfig, PoliciesConfig } from '@/types';
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
    mainText: '',
    secondaryText: '',
    descriptionText: '',
    heroImageUrl: '',
    mainTextColor: '#D81B60',
  },
  footerConfig: {
    logoText: '',
    slogan: '',
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
  },
  policiesConfig: {
    about: {
      title: 'Sobre Nosotros',
      content: `<div class="space-y-8 text-lg text-foreground/90">
  <div class="space-y-4 text-center">
    <p class="font-semibold text-xl text-accent">Nuestra Misión</p>
    <p>
      En ONLYfansLY, nuestra misión es proporcionar una plataforma dinámica y atractiva para el aprendizaje y la interacción en vivo. Creemos en el poder del conocimiento y las experiencias compartidas para conectar e inspirar a personas de todo el mundo. Nos esforzamos por ofrecer cursos de alta calidad, transmisiones en vivo fluidas y herramientas interactivas que satisfagan a una audiencia diversa, fomentando una comunidad de aprendices, creadores y entusiastas.
    </p>
  </div>
  
  <div class="space-y-4 text-center">
    <h2 class="text-2xl font-headline font-semibold text-accent">Nuestra Visión</h2>
    <p>
      Ser el principal destino en línea donde la creatividad se encuentra con la educación, y donde cada individuo tiene la oportunidad de aprender, compartir y crecer. Visualizamos un universo digital donde los eventos en vivo y los cursos bajo demanda coexisten para crear una experiencia rica e interactiva.
    </p>
  </div>

  <div class="space-y-4">
    <h2 class="text-2xl font-headline font-semibold text-accent text-center">Nuestros Valores</h2>
    <ul class="list-disc list-inside space-y-3 max-w-2xl mx-auto">
      <li><span class="font-semibold text-primary">Innovación:</span> Evolucionar continuamente nuestra plataforma con la última tecnología para ofrecer una experiencia de usuario superior y herramientas de vanguardia.</li>
      <li><span class="font-semibold text-primary">Comunidad:</span> Fomentar un entorno de apoyo, respeto e interacción, donde los miembros puedan colaborar, aprender unos de otros y construir conexiones significativas.</li>
      <li><span class="font-semibold text-primary">Calidad:</span> Comprometernos con la excelencia en todo lo que hacemos, desde el contenido de nuestros cursos hasta la fiabilidad de nuestra tecnología y el soporte que ofrecemos.</li>
      <li><span class="font-semibold text-primary">Accesibilidad:</span> Esforzarnos por hacer que el aprendizaje y los eventos en vivo sean accesibles para todos, en cualquier lugar, eliminando barreras y promoviendo la inclusión.</li>
    </ul>
  </div>
</div>`,
      showDate: true,
      lastUpdated: '1 de Julio, 2024',
    },
    privacy: {
      title: 'Política de Privacidad',
      content: `<section class="space-y-4">
  <h2 class="text-2xl font-headline font-semibold mb-2 text-accent">1. Introducción</h2>
  <p>Bienvenido a ONLYfansLY ("nosotros", "nuestro"). Nos comprometemos a proteger su privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos su información cuando visita nuestro sitio web y utiliza nuestros servicios. Por favor, lea esta política de privacidad detenidamente. Si no está de acuerdo con los términos de esta política de privacidad, por favor no acceda al sitio.</p>
</section>
<section class="space-y-4">
  <h2 class="text-2xl font-headline font-semibold mb-2 text-accent">2. Recopilación de su Información</h2>
  <p>Podemos recopilar información sobre usted de diversas maneras. La información que podemos recopilar en el Sitio incluye:</p>
  <ul class="list-disc list-inside space-y-2 ml-4">
    <li><strong>Datos Personales:</strong> Información de identificación personal, como su nombre, dirección de correo electrónico, número de teléfono y DNI, que nos proporciona voluntariamente cuando se registra en el Sitio o cuando elige participar en diversas actividades relacionadas con el Sitio.</li>
    <li><strong>Datos Derivados:</strong> Información que nuestros servidores recopilan automáticamente cuando accede al Sitio, como su dirección IP, tipo de navegador, sistema operativo y las páginas que ha visto.</li>
    <li><strong>Datos Financieros:</strong> Datos relacionados con sus métodos de pago (por ejemplo, número de tarjeta de crédito válido, marca de la tarjeta, fecha de vencimiento) que podemos recopilar al comprar, ordenar, devolver o solicitar información sobre nuestros servicios. Almacenamos solo una cantidad muy limitada, si acaso, de información financiera.</li>
  </ul>
</section>
<section class="space-y-4">
  <h2 class="text-2xl font-headline font-semibold mb-2 text-accent">3. Uso de su Información</h2>
  <p>Tener información precisa sobre usted nos permite brindarle una experiencia fluida, eficiente y personalizada. Específicamente, podemos usar la información recopilada sobre usted a través del Sitio para:</p>
  <ul class="list-disc list-inside space-y-2 ml-4">
    <li>Crear y administrar su cuenta.</li>
    <li>Procesar sus transacciones y enviarle información relacionada, incluidas confirmaciones de compra y facturas.</li>
    <li>Mejorar el Sitio y nuestros servicios.</li>
    <li>Prevenir actividades fraudulentas, supervisar contra robos y proteger contra actividades delictivas.</li>
    <li>Enviarle un correo electrónico sobre su cuenta o pedido.</li>
  </ul>
</section>
<section class="space-y-4">
  <h2 class="text-2xl font-headline font-semibold mb-2 text-accent">4. Divulgación de su Información</h2>
  <p>No compartiremos, venderemos, alquilaremos ni comercializaremos su información con terceros para sus fines promocionales. Podemos compartir información que hemos recopilado sobre usted en ciertas situaciones, como por ley o para proteger derechos, con proveedores de servicios de terceros que realizan servicios para nosotros o en nuestro nombre, o durante transferencias comerciales.</p>
</section>
<section class="space-y-4">
  <h2 class="text-2xl font-headline font-semibold mb-2 text-accent">5. Seguridad de su Información</h2>
  <p>Utilizamos medidas de seguridad administrativas, técnicas y físicas para ayudar a proteger su información personal. Si bien hemos tomado medidas razonables para proteger la información personal que nos proporciona, tenga en cuenta que, a pesar de nuestros esfuerzos, ninguna medida de seguridad es perfecta o impenetrable, y ningún método de transmisión de datos puede garantizarse contra cualquier intercepción u otro tipo de uso indebido.</p>
</section>
<section class="space-y-4">
  <h2 class="text-2xl font-headline font-semibold mb-2 text-accent">6. Contacto</h2>
  <p>Si tiene preguntas o comentarios sobre esta Política de Privacidad, por favor contáctenos a través de nuestro <a href="/contact" class="text-primary hover:underline">formulario de contacto</a> o al correo electrónico: legal@onlyfansly.example.com</p>
</section>`,
      showDate: true,
      lastUpdated: '1 de Julio, 2024',
    },
    terms: {
      title: 'Términos de Servicio',
      content: `<section class="space-y-4">
  <h2 class="text-2xl font-headline font-semibold mb-2 text-accent">1. Aceptación de los Términos</h2>
  <p>Al acceder o utilizar ONLYfansLY (el "Servicio"), usted acepta estar sujeto a estos Términos de Servicio ("Términos"). Si no está de acuerdo con alguna parte de los términos, no podrá acceder al Servicio. Estos Términos se aplican a todos los visitantes, usuarios y otras personas que accedan o utilicen el Servicio.</p>
</section>
<section class="space-y-4">
  <h2 class="text-2xl font-headline font-semibold mb-2 text-accent">2. Cuentas de Usuario</h2>
  <p>Cuando crea una cuenta con nosotros, debe proporcionarnos información precisa, completa y actualizada en todo momento. El no hacerlo constituye una violación de los Términos, lo que puede resultar en la terminación inmediata de su cuenta en nuestro Servicio. Usted es responsable de salvaguardar la contraseña que utiliza para acceder al Servicio y de cualquier actividad o acción bajo su contraseña.</p>
</section>
<section class="space-y-4">
  <h2 class="text-2xl font-headline font-semibold mb-2 text-accent">3. Contenido del Usuario</h2>
  <p>Nuestro Servicio le permite publicar, enlazar, almacenar, compartir y de otra manera hacer disponible cierta información, texto, gráficos, videos u otro material ("Contenido"). Usted es responsable del Contenido que publica en el Servicio, incluida su legalidad, fiabilidad y adecuación. Al publicar Contenido en el Servicio, nos otorga el derecho y la licencia para usar, modificar, ejecutar públicamente, mostrar públicamente, reproducir y distribuir dicho Contenido en y a través del Servicio.</p>
</section>
<section class="space-y-4">
  <h2 class="text-2xl font-headline font-semibold mb-2 text-accent">4. Propiedad Intelectual</h2>
  <p>El Servicio y su contenido original (excluyendo el Contenido proporcionado por los usuarios), características y funcionalidades son y seguirán siendo propiedad exclusiva de ONLYfansLY y sus licenciantes. El Servicio está protegido por derechos de autor, marcas registradas y otras leyes tanto de la jurisdicción aplicable como de países extranjeros.</p>
</section>
<section class="space-y-4">
  <h2 class="text-2xl font-headline font-semibold mb-2 text-accent">5. Terminación de la Cuenta</h2>
  <p>Podemos terminar o suspender su cuenta inmediatamente, sin previo aviso ni responsabilidad, por cualquier motivo, incluido, entre otros, si incumple los Términos. Tras la terminación, su derecho a utilizar el Servicio cesará inmediatamente.</p>
</section>
<section class="space-y-4">
  <h2 class="text-2xl font-headline font-semibold mb-2 text-accent">6. Legislación Aplicable</h2>
  <p>Estos Términos se regirán e interpretarán de acuerdo con las leyes de la jurisdicción correspondiente, sin tener en cuenta sus disposiciones sobre conflicto de leyes.</p>
</section>
<section class="space-y-4">
  <h2 class="text-2xl font-headline font-semibold mb-2 text-accent">7. Cambios en los Términos</h2>
  <p>Nos reservamos el derecho, a nuestra entera discreción, de modificar o reemplazar estos Términos en cualquier momento. Si una revisión es material, intentaremos proporcionar un aviso de al menos 30 días antes de que los nuevos términos entren en vigencia. Lo que constituye un cambio material se determinará a nuestra entera discreción.</p>
</section>
<section class="space-y-4">
  <h2 class="text-2xl font-headline font-semibold mb-2 text-accent">8. Contacto</h2>
  <p>Si tiene alguna pregunta sobre estos Términos, por favor contáctenos a través de nuestro <a href="/contact" class="text-primary hover:underline">formulario de contacto</a> o al correo electrónico: legal@onlyfansly.example.com</p>
</section>`,
      showDate: true,
      lastUpdated: '1 de Julio, 2024',
    }
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
      activeConfig.policiesConfig = activeConfig.policiesConfig || initialConfig.policiesConfig;
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
