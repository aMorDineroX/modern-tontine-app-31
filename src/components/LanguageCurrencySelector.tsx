
import React, { useState } from 'react';
import { Globe, ChevronsUpDown, Check } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { currencies, Language } from '@/utils/translations';

type SelectorProps = {
  type: 'language' | 'currency';
};

export default function LanguageCurrencySelector({ type }: SelectorProps) {
  const { language, setLanguage, currency, setCurrency, t } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
    { value: 'es', label: 'Español' },
    { value: 'ar', label: 'العربية' },
    { value: 'sw', label: 'Kiswahili' }
  ];

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  const handleSelectCurrency = (curr: typeof currencies[0]) => {
    setCurrency(curr);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-left text-sm"
      >
        <div className="flex items-center">
          <Globe size={16} className="mr-2 text-gray-500 dark:text-gray-400" />
          {type === 'language' 
            ? languageOptions.find(opt => opt.value === language)?.label
            : `${currency.code} (${currency.symbol})`
          }
        </div>
        <ChevronsUpDown size={16} className="text-gray-500 dark:text-gray-400" />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-1 shadow-lg">
            {type === 'language' ? (
              <div className="max-h-56 overflow-y-auto">
                {languageOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      language === option.value ? 'bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                    onClick={() => handleSelectLanguage(option.value as Language)}
                  >
                    {language === option.value && (
                      <Check size={14} className="mr-2 text-tontine-purple" />
                    )}
                    <span className={language === option.value ? 'ml-5' : 'ml-7'}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto">
                {currencies.map((curr) => (
                  <button
                    key={curr.code}
                    className={`flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      currency.code === curr.code ? 'bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                    onClick={() => handleSelectCurrency(curr)}
                  >
                    {currency.code === curr.code && (
                      <Check size={14} className="mr-2 text-tontine-purple" />
                    )}
                    <span className={currency.code === curr.code ? 'ml-5' : 'ml-7'}>
                      {curr.code} ({curr.symbol}) - {curr.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
