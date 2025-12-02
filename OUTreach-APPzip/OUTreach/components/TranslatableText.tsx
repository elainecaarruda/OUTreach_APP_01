import React, { useState, useEffect } from 'react';
import { useGemini } from '../hooks/useGemini';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe, Loader2, RotateCcw } from 'lucide-react';

interface TranslatableTextProps {
  text: string;
  className?: string;
  maxLength?: number; // Optional truncation
}

export const TranslatableText: React.FC<TranslatableTextProps> = ({ text, className = '', maxLength }) => {
  const { language, t } = useLanguage();
  const { translateText } = useGemini();
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset if source text changes
  useEffect(() => {
    setTranslatedText(null);
  }, [text]);

  const handleTranslate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (translatedText) {
      setTranslatedText(null); // Toggle back to original
      return;
    }

    setLoading(true);
    const result = await translateText(text, language);
    setTranslatedText(result);
    setLoading(false);
  };

  const displayText = translatedText || text;
  const isTranslated = !!translatedText;

  // Truncation logic if needed
  const showText = maxLength && displayText.length > maxLength 
    ? displayText.substring(0, maxLength) + '...' 
    : displayText;

  return (
    <div className={`relative group ${className}`}>
      <p className="whitespace-pre-line leading-relaxed">{showText}</p>
      
      {/* Translation Control */}
      <div className="absolute -top-2 right-0 transform -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        <button
          onClick={handleTranslate}
          disabled={loading}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium shadow-sm transition-all ${
            isTranslated 
              ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
              : 'bg-white text-slate-500 hover:text-indigo-600 hover:bg-slate-50 border border-slate-200'
          }`}
          title={isTranslated ? "Ver Original" : "Traduzir"}
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : isTranslated ? (
            <RotateCcw className="w-3 h-3" />
          ) : (
            <Globe className="w-3 h-3" />
          )}
          <span className="hidden sm:inline">
            {loading ? t('loading') : isTranslated ? 'Original' : 'Traduzir'}
          </span>
        </button>
      </div>
    </div>
  );
};