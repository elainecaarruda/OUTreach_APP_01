import React from 'react';
import { CheckCircle, XCircle, User, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslationKey } from '../i18n';

const MOCK_PENDING_MEMBERS = [
  { id: '1', name: 'Carlos Ferreira', role: 'evangelist', status: 'pending', email: 'carlos@example.com' },
  { id: '2', name: 'Ana Souza', role: 'evangelist', status: 'pending', email: 'ana@example.com' }
];

export const TeamManagement = () => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{t('team_title' as TranslationKey)}</h1>
        <p className="text-slate-500 mt-2">{t('team_subtitle' as TranslationKey)}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-500" />
          {t('team_pending_approvals' as TranslationKey)}
        </h2>

        <div className="space-y-4">
          {MOCK_PENDING_MEMBERS.map(member => (
            <div key={member.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{member.name}</h3>
                  <p className="text-sm text-slate-500">{member.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-semibold hover:bg-green-200 transition-colors flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> {t('admin_btn_approve' as TranslationKey)}
                </button>
                <button className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> {t('admin_btn_reject' as TranslationKey)}
                </button>
              </div>
            </div>
          ))}
          {MOCK_PENDING_MEMBERS.length === 0 && (
            <p className="text-slate-500 italic">{t('team_no_pending' as TranslationKey)}</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">{t('team_active_members' as TranslationKey)}</h2>
        <div className="text-slate-500 text-center py-8">
          {t('team_feature_in_dev' as TranslationKey)}
        </div>
      </div>
    </div>
  );
};