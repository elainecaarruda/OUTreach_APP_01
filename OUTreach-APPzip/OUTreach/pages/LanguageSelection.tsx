
import React from 'react';
import { motion } from 'framer-motion';
import { Globe, ArrowLeft } from 'lucide-react';
import { Language } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslationKey } from '../i18n';

interface LanguageSelectionProps {
  onSelect: () => void;
  onBack?: () => void;
}

export const LanguageSelection: React.FC<LanguageSelectionProps> = ({ onSelect, onBack }) => {
  const { setLanguage, t, language } = useLanguage();

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'pt-BR', label: 'Português (Brasil)', flag: '🇧🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  ];

  const handleSelect = (code: Language) => {
    setLanguage(code);
    onSelect();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors z-20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10 max-w-md w-full"
      >
        <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/10">
          <Globe className="w-10 h-10 text-indigo-400" />
        </div>
        
        <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">OUTreach!</h1>
        <p className="text-slate-400 mb-12 text-lg">Select your language to begin</p>

        <div className="grid grid-cols-1 gap-4">
          {languages.map((lang, index) => (
            <motion.button
              key={lang.code}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.5 }}
              onClick={() => handleSelect(lang.code)}
              className="flex items-center p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-indigo-500/50 rounded-2xl transition-all group backdrop-blur-sm"
            >
              <span className="text-3xl mr-6 filter drop-shadow-lg">{lang.flag}</span>
              <div className="text-left">
                <span className="block text-white font-bold text-lg group-hover:text-indigo-300 transition-colors">
                  {lang.label}
                </span>
              </div>
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400">
                →
              </div>
            </motion.button>
          ))}
        </div>
        
        <p className="mt-12 text-xs text-slate-600 uppercase tracking-widest">🔥 Until Everyone Hears | Matthew 24:14</p>
      </motion.div>
    </div>
  );
};
