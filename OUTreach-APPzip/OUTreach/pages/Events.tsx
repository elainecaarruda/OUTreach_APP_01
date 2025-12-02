
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Clock, Users, ArrowRight, Filter, CheckCircle } from 'lucide-react';
import { MOCK_EVENTS } from '../mockData';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../App';
import { TranslationKey } from '../i18n';

export const Events = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'open' | 'ongoing' | 'closed'>('open');
  const [dateFilter, setDateFilter] = useState('');
  
  // Local state to manage events (allowing additions)
  const [events, setEvents] = useState(MOCK_EVENTS);

  const filteredEvents = events.filter(event => {
    // Tab Filtering
    if (activeTab === 'open' && event.status !== 'open') return false;
    if (activeTab === 'ongoing' && event.status !== 'ongoing') return false;
    if (activeTab === 'closed' && (event.status !== 'closed' && event.status !== 'completed')) return false;

    // Date Filtering
    if (dateFilter && event.date.split('T')[0] !== dateFilter) return false;

    return true;
  });

  const isAdmin = user?.role === 'admin';

  const handleJoinEvent = (id: string) => {
    setEvents(events.map(ev => {
      if (ev.id === id) {
        return { ...ev, registeredCount: (ev.registeredCount || 0) + 1 };
      }
      return ev;
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('events_title')}</h1>
          <p className="text-slate-500 mt-2">{t('events_subtitle')}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
           {/* Date Filter */}
           <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-slate-400" />
             </div>
             <input 
               type="date" 
               value={dateFilter}
               onChange={(e) => setDateFilter(e.target.value)}
               className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-auto"
               placeholder={t('filter_date')}
             />
           </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex p-1 bg-white rounded-xl border border-slate-200 w-full sm:w-fit">
        {[
          { id: 'open', label: t('tab_open') },
          { id: 'ongoing', label: t('tab_ongoing') },
          { id: 'closed', label: t('tab_closed') },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">{t('evangelismo_empty')}</p>
          </div>
        ) : (
          filteredEvents.map((event, idx) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex flex-col md:flex-row">
                {/* Date Column */}
                <div className={`p-6 flex flex-col items-center justify-center md:w-32 border-b md:border-b-0 md:border-r border-indigo-100 transition-colors ${
                  event.status === 'ongoing' ? 'bg-green-50 group-hover:bg-green-600' : 
                  event.status === 'closed' ? 'bg-slate-50 group-hover:bg-slate-600' : 
                  'bg-indigo-50 group-hover:bg-indigo-600'
                }`}>
                   <span className={`font-bold text-sm uppercase transition-colors ${
                     event.status === 'ongoing' ? 'text-green-600 group-hover:text-green-100' : 
                     event.status === 'closed' ? 'text-slate-500 group-hover:text-slate-200' : 
                     'text-indigo-600 group-hover:text-indigo-200'
                   }`}>
                     {new Date(event.date).toLocaleDateString('pt-BR', { month: 'short' })}
                   </span>
                   <span className="text-3xl font-extrabold text-slate-900 group-hover:text-white transition-colors">
                     {new Date(event.date).getDate()}
                   </span>
                   <span className={`text-xs mt-1 transition-colors ${
                      event.status === 'ongoing' ? 'text-green-700 group-hover:text-green-100' :
                      event.status === 'closed' ? 'text-slate-400 group-hover:text-slate-200' :
                      'text-slate-500 group-hover:text-indigo-200'
                   }`}>
                     {new Date(event.date).toLocaleDateString('pt-BR', { weekday: 'short' })}
                   </span>
                </div>
                
                {/* Content */}
                <div className="p-6 flex-1">
                   <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-slate-900">{event.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        event.status === 'open' ? 'bg-indigo-100 text-indigo-700' : 
                        event.status === 'ongoing' ? 'bg-green-100 text-green-700 animate-pulse' : 
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {event.status === 'open' ? t('event_open') : event.status === 'ongoing' ? t('tab_ongoing') : t('event_closed')}
                      </span>
                   </div>
                   <p className="text-slate-600 mb-6">{event.description}</p>
                   
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        {event.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-indigo-500" />
                        <span className="truncate max-w-[120px]">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-500" />
                        <span className="font-semibold text-slate-700">{event.registeredCount || 0}</span> / {event.evangelistsPerTeam} {t('event_registered')}
                      </div>
                   </div>
                </div>

                {/* Action */}
                <div className="p-6 md:w-48 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-100 bg-slate-50/50 gap-2">
                   {event.status === 'open' && !isAdmin && (
                     <button 
                       onClick={() => handleJoinEvent(event.id)}
                       className="w-full py-2.5 px-4 bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                     >
                       <Plus className="w-4 h-4" />
                       {t('btn_join')}
                     </button>
                   )}
                   <button className={`w-full py-2.5 px-4 bg-white border border-slate-200 text-slate-900 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                     event.status === 'closed' 
                       ? 'opacity-50 cursor-not-allowed' 
                       : 'hover:bg-slate-200'
                   }`}>
                     {t('btn_details')}
                     <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

    </div>
  );
};
