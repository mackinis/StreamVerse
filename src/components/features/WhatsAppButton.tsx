
"use client";

import { useAdminConfig } from '@/contexts/AdminConfigContext';
import Link from 'next/link';
import Image from 'next/image';
import * as LucideIcons from 'lucide-react';

const WhatsAppDefaultIcon = ({ size }: { size: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
    >
        <path d="M16.75 13.96c.25.13.43.2.5.25a.48.48 0 01.2.45v1.03a1 1 0 01-.26.75c-.24.26-1.16.8-2.62.16s-2.8-1.5-4.41-3.12c-1.84-1.84-2.88-3.4-2.73-4.52s.8-1.5.94-1.7a.86.86 0 01.59-.27h1a.48.48 0 01.44.25c.06.06.2.44.34.82a.48.48 0 010 .42c-.1.14-.2.2-.32.35s-.24.2-.34.35a.48.48 0 00-.08.43c.18.34.7.94 1.37 1.6s1.26 1.2 1.6 1.36a.48.48 0 00.43-.08c.13-.1.2-.2.34-.34s.2-.2.34-.32a.48.48 0 01.42 0c.38.13.76.28.82.34a.48.48 0 01.24.44zM12 2a10 10 0 100 20 10 10 0 000-20z" />
    </svg>
);

export function WhatsAppButton() {
  const { config, isClientHydrated } = useAdminConfig();

  if (!isClientHydrated || !config.whatsAppConfig?.whatsAppEnabled || !config.whatsAppConfig?.whatsAppPhoneNumber) {
    return null;
  }

  const {
    whatsAppPhoneNumber,
    whatsAppDefaultMessage,
    whatsAppIcon,
    whatsAppCustomIconUrl,
    whatsAppButtonSize,
    whatsAppIconSize,
    whatsAppButtonColor,
  } = config.whatsAppConfig;

  const phoneNumber = whatsAppPhoneNumber.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(whatsAppDefaultMessage || '');
  const href = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  const renderIcon = () => {
    if (whatsAppIcon === 'default') {
      return <WhatsAppDefaultIcon size={whatsAppIconSize} />;
    }
    if (whatsAppIcon === 'customUrl' && whatsAppCustomIconUrl) {
      return <Image src={whatsAppCustomIconUrl} alt="WhatsApp" width={whatsAppIconSize} height={whatsAppIconSize} />;
    }
    const IconComponent = (LucideIcons as any)[whatsAppIcon];
    if (IconComponent) {
      return <IconComponent style={{ width: whatsAppIconSize, height: whatsAppIconSize }} />;
    }
    return <WhatsAppDefaultIcon size={whatsAppIconSize} />;
  };

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-50 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
      style={{
        width: whatsAppButtonSize,
        height: whatsAppButtonSize,
        backgroundColor: whatsAppButtonColor,
      }}
      aria-label="Chat on WhatsApp"
    >
      <div className="text-white">
        {renderIcon()}
      </div>
    </Link>
  );
}
