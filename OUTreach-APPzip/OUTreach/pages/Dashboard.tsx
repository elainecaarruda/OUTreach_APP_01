import React from 'react';
import { useAuth } from '../App';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { MOCK_EVENTS } from '../mockData';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslationKey } from '../i18n';

export const Dashboard = ({ setPage }: { setPage: (p: string) => void }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  // Simulated data derived from mocks
  const upcomingEvents = MOCK_EVENTS.filter(e => e.status === 'open').slice(0, 2);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 transform translate-x-12"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">{t('dash_welcome')}, {user?.full_name?.split(' ')[0]}!</h1>
          <p className="text-indigo-100 max-w-xl">
            {t('dash_logged_as')} <span className="font-bold bg-white/20 px-2 py-0.5 rounded uppercase text-sm">{user?.role ? t(`role_${user.role}` as TranslationKey) : ''}</span>. 
            {t('dash_ready')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Main Stats & Tasks */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => setPage('Events')} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all text-left group">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">{t('dash_action_browse')}</h3>
              <p className="text-sm text-slate-500 mt-1">{t('dash_action_browse_desc')}</p>
            </button>
            <button onClick={() => setPage('Testimony')} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-amber-200 transition-all text-left group">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">{t('dash_action_share')}</h3>
              <p className="text-sm text-slate-500 mt-1">{t('dash_action_share_desc')}</p>
            </button>
          </div>

          {/* Upcoming Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">{t('dash_upcoming')}</h2>
              <button onClick={() => setPage('Events')} className="text-sm text-indigo-600 font-medium hover:text-indigo-800">{t('dash_view_all')}</button>
            </div>
            <div className="space-y-4">
              {upcomingEvents.map(evt => (
                <div key={evt.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors">
                  <div className="flex items-start gap-4 mb-4 sm:mb-0">
                    <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex flex-col items-center justify-center shadow-sm">
                      <span className="text-xs font-bold text-slate-400 uppercase">{new Date(evt.date).toLocaleDateString('pt-BR', { month: 'short' })}</span>
                      <span className="text-lg font-bold text-slate-900">{new Date(evt.date).getDate()}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{evt.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{evt.time}</span>
                        <span>•</span>
                        <span>{evt.location}</span>
                      </div>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                    {t('btn_details')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Notifications/Status */}
        <div className="space-y-8">
           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
             <h2 className="text-lg font-bold text-slate-900 mb-4">{t('dash_my_status')}</h2>
             <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 text-green-700 border border-green-100">
                  <span className="flex items-center gap-2 font-medium"><CheckCircle className="w-4 h-4"/> {t('dash_active_account')}</span>
                </div>
                {user?.role === 'admin' && (
                  <div className="p-4 bg-slate-900 rounded-xl text-slate-300 text-sm">
                    <p className="mb-2 font-semibold text-white">Admin Stats</p>
                    <div className="flex justify-between mb-1">
                      <span>Pending:</span>
                      <span className="text-white font-mono">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Events:</span>
                      <span className="text-white font-mono">5</span>
                    </div>
                    <button onClick={() => setPage('Admin')} className="w-full mt-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-500">
                      Go to Admin
                    </button>
                  </div>
                )}
             </div>
           </div>
           
           <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-6 text-white shadow-lg">
             <h3 className="font-bold text-lg mb-2">{t('dash_prayer_needed')}</h3>
             <p className="text-pink-100 text-sm mb-4">5 {t('dash_prayer_desc')}</p>
             <button onClick={() => setPage('PrayerRoom')} className="w-full py-2 bg-white text-pink-600 font-bold rounded-lg hover:bg-pink-50 text-sm">
               {t('dash_btn_enter_prayer')}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};