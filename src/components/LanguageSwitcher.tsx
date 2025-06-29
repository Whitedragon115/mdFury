'use client'

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="h-10 flex items-center gap-2 text-foreground hover:text-foreground/80 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-inset"
    >
      <Globe className="h-4 w-4" />
      <span className="hidden sm:inline">
        {i18n.language === 'en' ? '中文' : 'English'}
      </span>
    </Button>
  );
}
