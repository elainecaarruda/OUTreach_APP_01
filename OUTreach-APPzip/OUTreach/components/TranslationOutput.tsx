import React, { useState } from 'react';
import { Copy, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';

export interface TranslationOutputData {
  interface: Record<string, string>;
  dados_traduzidos: Record<string, any>;
  permissoes: {
    ADM: string[];
    Lider: string[];
    Evangelista: string[];
    Intercessor: string[];
  };
  metadata?: {
    targetLanguage: string;
    userRole: string;
    timestamp: string;
    version: string;
  };
}

interface TranslationOutputProps {
  data: TranslationOutputData;
  title?: string;
}

export const TranslationOutput: React.FC<TranslationOutputProps> = ({ 
  data, 
  title = 'Translation Output' 
}) => {
  const [expanded, setExpanded] = useState({
    interface: true,
    dados: true,
    permissoes: true,
    metadata: false
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    element.href = URL.createObjectURL(file);
    element.download = `translation-output-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const Section = ({ 
    title, 
    section, 
    content 
  }: { 
    title: string; 
    section: keyof typeof expanded; 
    content: any 
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-slate-200 rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setExpanded(prev => ({ ...prev, [section]: !prev[section] }))}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
      >
        <h3 className="font-bold text-slate-900">{title}</h3>
        {expanded[section] ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {expanded[section] && (
        <div className="bg-slate-50 border-t border-slate-200 p-4">
          <pre className="bg-white p-4 rounded-lg overflow-x-auto text-xs text-slate-700 border border-slate-200 font-mono">
            {JSON.stringify(content, null, 2)}
          </pre>
          <button
            onClick={() => handleCopy(JSON.stringify(content, null, 2))}
            className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm transition-all"
          >
            <Copy className="w-4 h-4" />
            Copy JSON
          </button>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="space-y-4 p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          {data.metadata && (
            <p className="text-sm text-slate-600 mt-1">
              {data.metadata.targetLanguage} • {data.metadata.userRole}
            </p>
          )}
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all"
        >
          <Download className="w-4 h-4" />
          Download JSON
        </button>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        <Section 
          title="🌐 Translated Interface" 
          section="interface"
          content={data.interface}
        />
        <Section 
          title="📝 Translated User Data" 
          section="dados"
          content={data.dados_traduzidos}
        />
        <Section 
          title="🔐 Permissions by Role" 
          section="permissoes"
          content={data.permissoes}
        />
        {data.metadata && (
          <Section 
            title="ℹ️ Metadata" 
            section="metadata"
            content={data.metadata}
          />
        )}
      </div>

      {/* Info */}
      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700">
        <p>✅ <strong>Ready to integrate:</strong> Copy the JSON above to use in your application state management.</p>
      </div>
    </div>
  );
};
