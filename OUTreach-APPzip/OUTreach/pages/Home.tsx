
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Globe, Heart, Users, Sparkles, LogIn, Shield, UserPlus, CheckCircle } from 'lucide-react';
import { useAuth } from '../App';
import { UserRole } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslationKey } from '../i18n';

export const Home = ({ setPage }: { setPage: (p: string) => void }) => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const [showLogin, setShowLogin] = useState(false);

  const handleLogin = (role: UserRole) => {
    login(role);
    setPage('Dashboard');
  };

  const roles = [
    { 
      id: 'admin', 
      icon: Shield, 
      color: 'bg-slate-800 text-white', 
      border: 'border-slate-800',
      hover: 'hover:bg-slate-900'
    },
    { 
      id: 'leader', 
      icon: Users, 
      color: 'bg-purple-600 text-white', 
      border: 'border-purple-600',
      hover: 'hover:bg-purple-700'
    },
    { 
      id: 'evangelist', 
      icon: Globe, 
      color: 'bg-blue-600 text-white', 
      border: 'border-blue-600',
      hover: 'hover:bg-blue-700'
    },
    { 
      id: 'intercessor', 
      icon: Heart, 
      color: 'bg-pink-600 text-white', 
      border: 'border-pink-600',
      hover: 'hover:bg-pink-700'
    },
  ];

  const features = [
    { 
      icon: Globe, 
      titleKey: 'feat_evangelism_title', 
      descKey: 'feat_evangelism_desc', 
      color: 'bg-blue-500' 
    },
    { 
      icon: Users, 
      titleKey: 'feat_training_title', 
      descKey: 'feat_training_desc', 
      color: 'bg-indigo-500' 
    },
    { 
      icon: Heart, 
      titleKey: 'feat_prayer_title', 
      descKey: 'feat_prayer_desc', 
      color: 'bg-pink-500' 
    },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 rounded-full bg-indigo-500 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 rounded-full bg-pink-500 opacity-20 blur-3xl"></div>
        
        <div className="relative z-10 px-6 py-20 md:px-12 md:py-32 text-center md:text-left">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Espalhando as Boas Novas</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
              {t('hero_title_1')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">{t('hero_title_2')}</span>
            </h1>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed">
              {t('hero_desc')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button 
                onClick={() => setShowLogin(!showLogin)}
                className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                <LogIn className="w-5 h-5" />
                {t('btn_login')}
              </button>
              
              <button 
                onClick={() => setPage('Registration')}
                className="px-8 py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                {t('btn_join_us')}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Login Modal Overlay */}
      <AnimatePresence>
        {showLogin && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogin(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            
            {/* Modal */}
            <div
              className="fixed inset-0 flex items-center justify-center z-50 px-4 sm:px-6 py-4"
            >
              <motion.section 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 sm:p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t('login_modal_title' as TranslationKey)}</h2>
                  <p className="text-sm sm:text-base text-slate-500 mt-2">{t('login_modal_desc' as TranslationKey)}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => handleLogin(role.id as UserRole)}
                      className="flex flex-col items-center p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border-2 border-slate-100 hover:border-indigo-500 hover:shadow-lg transition-all group bg-white relative overflow-hidden"
                    >
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-2 sm:mb-3 md:mb-4 ${role.color} shadow-md`}>
                        <role.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm md:text-lg mb-1 text-center line-clamp-2">{t((`role_${role.id}` as any) as TranslationKey)}</h3>
                      <p className="text-slate-500 text-[10px] sm:text-xs md:text-xs mb-3 md:mb-6 font-medium uppercase tracking-wide line-clamp-2">{t((`role_desc_${role.id}` as any) as TranslationKey)}</p>
                      
                      <div className="w-full mt-auto">
                        <span className={`block w-full py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold text-white transition-colors ${role.color} opacity-90 group-hover:opacity-100`}>
                          {t('btn_select' as TranslationKey)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.section>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Feature Grid */}
      <section className="space-y-8">
         <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">{t('features_title')}</h2>
              <p className="text-slate-500 mt-2">{t('features_desc')}</p>
            </div>
            <button 
                onClick={() => setPage('Events')}
                className="px-6 py-3 bg-white border border-slate-200 text-indigo-600 font-bold rounded-xl hover:bg-slate-50 hover:border-indigo-200 transition-all flex items-center gap-2 shadow-sm"
            >
                {t('btn_view_events')} <ArrowRight className="w-4 h-4" />
            </button>
         </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="p-8 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t(feature.titleKey as TranslationKey)}</h3>
              <p className="text-slate-500 leading-relaxed">{t(feature.descKey as TranslationKey)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-indigo-900 rounded-3xl p-12 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { labelKey: 'stat_lives', val: '10k+' },
            { labelKey: 'stat_teams', val: '45' },
            { labelKey: 'stat_cities', val: '12' },
            { labelKey: 'stat_testimonies', val: '850' },
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-4xl md:text-5xl font-extrabold mb-2 text-indigo-300">{stat.val}</div>
              <div className="text-indigo-100 text-sm uppercase tracking-wider font-medium">{t(stat.labelKey as TranslationKey)}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
