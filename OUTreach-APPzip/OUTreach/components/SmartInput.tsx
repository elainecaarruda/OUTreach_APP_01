import React from 'react';
import { Mic, Wand2, Loader2, StopCircle } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useOpenAI } from '../hooks/useOpenAI';

interface SmartInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  label?: string;
}

export const SmartInput: React.FC<SmartInputProps> = ({ value, onChange, placeholder, className, minHeight = "100px", label }) => {
  const { isListening, startListening, stopListening, resetTranscript } = useSpeechRecognition();
  const { isProcessing, improveTestimonyText } = useOpenAI();

  const handleMicClick = async () => {
    if (isListening) {
      try {
        const text = await stopListening();
        if (text) {
          onChange(value ? value + ' ' + text : text);
        }
        resetTranscript();
      } catch (e) {
        console.error("Error processing audio:", e);
      }
    } else {
      await startListening();
    }
  };

  const handleAiClick = async () => {
    if (!value) return;
    try {
      const improved = await improveTestimonyText(value);
      onChange(improved);
      alert('✅ Texto melhorado com sucesso!');
    } catch (error: any) {
      console.error('❌ Erro ao melhorar texto:', error);
      alert(`Erro ao melhorar texto: ${error.message || 'Erro desconhecido. Verifique a chave OpenAI.'}`);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {label && <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</label>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-y text-slate-700 text-sm"
        style={{ minHeight }}
        placeholder={isListening ? "Escutando... Fale agora." : placeholder}
        disabled={isProcessing}
      />
      <div className="absolute bottom-3 right-3 flex gap-2">
        <button 
          onClick={handleMicClick}
          disabled={isProcessing}
          className={`p-1.5 rounded-full border transition-colors shadow-sm flex items-center justify-center ${isListening ? 'bg-red-100 border-red-200 text-red-600 animate-pulse' : 'bg-white border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300'}`}
          title={isListening ? "Parar Escuta" : "Começar Ditado"}
        >
          {isProcessing ? <Loader2 className="w-3 h-3 animate-spin"/> : isListening ? <StopCircle className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
        </button>
        <button 
          onClick={handleAiClick}
          disabled={isProcessing || !value || isListening}
          className="p-1.5 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-purple-600 hover:border-purple-300 transition-colors shadow-sm"
          title="Melhorar com IA"
        >
          {isProcessing ? <Loader2 className="w-3 h-3 animate-spin"/> : <Wand2 className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
};