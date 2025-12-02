import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Tag } from 'lucide-react';
import { MOCK_GLOBAL_EVENTS } from '../mockData';
import { useLanguage } from '../contexts/LanguageContext';

export const GlobalEvents = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{t('global_events_title')}</h1>
        <p className="text-slate-500 mt-2">{t('global_events_subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_GLOBAL_EVENTS.map((event, idx) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col"
          >
            <div className="h-48 bg-slate-200 relative overflow-hidden">
              <img 
                src={event.imageUrl} 
                alt={event.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-600 shadow-sm flex items-center gap-1">
                <Tag className="w-3 h-3" /> {event.category}
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
                <Calendar className="w-4 h-4" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
                <span>•</span>
                <Clock className="w-4 h-4" />
                <span>{event.time}</span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                {event.title}
              </h3>
              
              <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
                {event.description}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate max-w-[150px]">{event.location}</span>
                </div>
                <button className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-lg text-sm hover:bg-indigo-100 transition-colors">
                  {t('btn_details')}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};