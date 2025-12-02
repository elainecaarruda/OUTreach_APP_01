import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { TranslationOutput, TranslationOutputData } from './TranslationOutput';
import { useLanguage } from '../contexts/LanguageContext';

export const AITranslationDemo: React.FC = () => {
  const { language, t } = useLanguage();
  const [showOutput, setShowOutput] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'leader' | 'evangelist' | 'intercessor'>('evangelist');

  // Sample data to demonstrate the output
  const sampleData: TranslationOutputData = {
    interface: {
      app_title: language === 'pt-BR' ? 'OUTreach!' : language === 'pt-PT' ? 'OUTreach!' : 'OUTreach!',
      welcome: language === 'pt-BR' ? 'Bem-vindo' : language === 'pt-PT' ? 'Bem-vindo' : 'Welcome',
      btn_save: language === 'pt-BR' ? 'Salvar' : language === 'pt-PT' ? 'Guardar' : 'Save',
      btn_cancel: language === 'pt-BR' ? 'Cancelar' : language === 'pt-PT' ? 'Cancelar' : 'Cancel'
    },
    dados_traduzidos: {
      name: 'João Silva',
      email: 'joao@example.com',
      church: 'Igreja da Vitória',
      experience: 'Tenho 5 anos de experiência em evangelismo',
      testimony: 'Deus fez um milagre incrível durante nosso evento.'
    },
    permissoes: {
      ADM: ['schedule_evangelism', 'create_training', 'upload_files', 'upload_recordings', 'approve_applications'],
      Lider: ['approve_applications', 'apply_evangelism', 'manage_team'],
      Evangelista: ['apply_evangelism', 'submit_testimony'],
      Intercessor: ['submit_testimony', 'create_prayer_agenda']
    },
    metadata: {
      targetLanguage: language === 'pt-BR' ? 'Brazilian Portuguese' : language === 'pt-PT' ? 'European Portuguese' : language === 'en' ? 'English' : 'German',
      userRole,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }
  };

  return (
    <div className="space-y-6 p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-slate-900">AI Translation & Permissions Output</h2>
        </div>
        <p className="text-slate-600">
          Demonstrates how the system translates interface, user data, and generates role-based permissions in JSON format.
        </p>
      </div>

      {/* Role Selector */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700">Select User Role:</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(['admin', 'leader', 'evangelist', 'intercessor'] as const).map(role => (
            <button
              key={role}
              onClick={() => setUserRole(role)}
              className={`px-3 py-2 rounded-lg font-bold text-sm transition-all ${
                userRole === role
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-400'
              }`}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* View Output Button */}
      <button
        onClick={() => setShowOutput(!showOutput)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all"
      >
        {showOutput ? 'Hide Output' : 'View JSON Output'}
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* Translation Output */}
      {showOutput && (
        <div className="mt-6">
          <TranslationOutput 
            data={sampleData}
            title={`Translation Output - ${userRole.toUpperCase()}`}
          />
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700 space-y-2">
        <p><strong>✨ Features Implemented:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>Dynamic interface translation to target language</li>
          <li>User data translation (names, emails, testimonies, etc)</li>
          <li>Role-based permission generation</li>
          <li>Structured JSON output ready for integration</li>
          <li>Full metadata tracking (timestamp, language, role)</li>
        </ul>
      </div>
    </div>
  );
};
