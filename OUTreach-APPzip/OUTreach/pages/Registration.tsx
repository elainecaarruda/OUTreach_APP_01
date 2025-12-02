import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Heart, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../App';
import { UserRole } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslationKey } from '../i18n';

export const Registration = ({ setPage }: { setPage: (p: string) => void }) => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    church: '',
    reason: ''
  });

  const roles = [
    {
      id: 'evangelist',
      titleKey: 'role_evangelist',
      icon: Users,
      descKey: 'reg_desc_evangelist',
      color: 'blue'
    },
    {
      id: 'leader',
      titleKey: 'role_leader',
      icon: Shield,
      descKey: 'reg_desc_leader',
      color: 'purple'
    },
    {
      id: 'intercessor',
      titleKey: 'role_intercessor',
      icon: Heart,
      descKey: 'reg_desc_intercessor',
      color: 'pink'
    }
  ];

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role as UserRole);
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      // Auto-login for demo purposes
      if (selectedRole) {
        login(selectedRole);
        setPage('Dashboard');
      }
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button - Always visible */}
      <button 
        onClick={() => setPage('Home')}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('reg_back' as TranslationKey)}</span>
      </button>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">{t('reg_title' as TranslationKey)}</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          {t('reg_subtitle' as TranslationKey)}
        </p>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <motion.button
              key={role.id}
              whileHover={{ y: -5 }}
              onClick={() => handleRoleSelect(role.id)}
              className={`text-left p-6 rounded-2xl border-2 transition-all duration-300 bg-white shadow-sm hover:shadow-xl ${
                role.color === 'blue' ? 'border-blue-100 hover:border-blue-500' :
                role.color === 'purple' ? 'border-purple-100 hover:border-purple-500' :
                'border-pink-100 hover:border-pink-500'
              }`}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${
                 role.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                 role.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                 'bg-pink-50 text-pink-600'
              }`}>
                <role.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t(role.titleKey as TranslationKey)}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{t(role.descKey as TranslationKey)}</p>
              <div className="mt-6 flex items-center text-sm font-semibold text-slate-900">
                {t('reg_step_1_btn' as TranslationKey)} <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {step === 2 && selectedRole && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 max-w-2xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
            <button onClick={() => setStep(1)} className="text-sm text-slate-400 hover:text-slate-600 flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              {t('reg_back' as TranslationKey)}
            </button>
            <div className="flex-1 text-center">
              <span className="uppercase text-xs font-bold text-slate-400 tracking-wider">{t('reg_for' as TranslationKey)}</span>
              <h2 className="text-2xl font-bold text-slate-900 capitalize">
                {t(roles.find(r => r.id === selectedRole)?.titleKey as TranslationKey)}
              </h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t('reg_label_name' as TranslationKey)}</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder={t('reg_placeholder_name' as TranslationKey)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t('reg_label_email' as TranslationKey)}</label>
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder={t('reg_placeholder_email' as TranslationKey)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">{t('reg_label_church' as TranslationKey)}</label>
              <input 
                required
                type="text" 
                value={formData.church}
                onChange={e => setFormData({...formData, church: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder={t('reg_placeholder_church' as TranslationKey)}
              />
            </div>

            {(selectedRole === 'leader' || selectedRole === 'evangelist') && (
               <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t('reg_label_exp' as TranslationKey)}</label>
                <textarea 
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none h-24 resize-none"
                  placeholder={t('reg_placeholder_exp' as TranslationKey)}
                />
              </div>
            )}

            <button 
              type="submit"
              className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <CheckCircle className="w-5 h-5" />
              {t('reg_btn_confirm' as TranslationKey)}
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
};