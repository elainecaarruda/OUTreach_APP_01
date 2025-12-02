import React, { useState } from 'react';
import { Wand2, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGemini } from '../hooks/useGemini';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslatableText } from './TranslatableText';
import { TranslationKey } from '../i18n';

interface ImproveWithAIProps {
  text: string;
  onImprove: (improvedText: string) => void;
  disabled?: boolean;
}

export const ImproveWithAI: React.FC<ImproveWithAIProps> = ({ 
  text, 
  onImprove, 
  disabled = false 
}) => {
  const { improveText, isProcessing } = useGemini();
  const { language, t } = useLanguage();
  const [showPreview, setShowPreview] = useState(false);
  const [improvedText, setImprovedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImprove = async () => {
    if (!text.trim()) {
      setError('Text cannot be empty');
      return;
    }

    setError(null);
    setImprovedText(null);
    
    try {
      const result = await improveText(text, language);
      setImprovedText(result);
      setShowPreview(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to improve text');
    }
  };

  const handleAccept = () => {
    if (improvedText) {
      onImprove(improvedText);
      setShowPreview(false);
      setImprovedText(null);
    }
  };

  const handleReject = () => {
    setShowPreview(false);
    setImprovedText(null);
  };

  return (
    <div className="space-y-3">
      {/* Main Button */}
      <button
        onClick={handleImprove}
        disabled={disabled || isProcessing || !text.trim()}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-indigo-700 font-bold"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{t('loading' as TranslationKey)}</span>
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4" />
            <span>{t('testimony_improve_ai' as TranslationKey)}</span>
          </>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-200"
        >
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </motion.div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && improvedText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200"
          >
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  {t('ai_improved_version' as TranslationKey)}
                </p>
                <div className="bg-white rounded-lg p-3 max-h-48 overflow-y-auto text-sm text-slate-700 leading-relaxed">
                  {improvedText}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleAccept}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                {t('btn_accept' as TranslationKey)}
              </button>
              <button
                onClick={handleReject}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm transition-all"
              >
                {t('btn_reject' as TranslationKey)}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
