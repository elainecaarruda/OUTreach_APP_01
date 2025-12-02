import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Clock, Users, ArrowRight, Filter, Plus, X, CheckCircle, Loader2, Edit2, Save, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../App';
import { TranslationKey } from '../i18n';

interface Evangelismo {
  id: number;
  title: string;
  description?: string;
  data?: string;
  evangelismoDate?: string;
  hora_inicio?: string;
  evangelismoTimeStart?: string;
  hora_fim?: string;
  evangelismoTimeEnd?: string;
  localizacao?: string;
  location?: string;
  status: 'aberto' | 'em_andamento' | 'encerrado';
}

// Helper function to safely parse dates
const parseDate = (dateStr: string | undefined | null): Date | null => {
  if (!dateStr) return null;
  try {
    // If it's in ISO format (YYYY-MM-DD), add time component
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return new Date(dateStr + 'T00:00:00Z');
    }
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
};

export const Evangelismo = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'aberto' | 'em_andamento' | 'encerrado'>('aberto');
  const [dateFilter, setDateFilter] = useState('');
  const [evangelismos, setEvangelismos] = useState<Evangelismo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedEvangelismo, setSelectedEvangelismo] = useState<Evangelismo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    data: new Date().toISOString().split('T')[0],
    hora_inicio: '',
    hora_fim: '',
    localizacao: '',
    description: ''
  });
  const [editData, setEditData] = useState<any>(null);

  // Fetch evangelismos from API
  useEffect(() => {
    fetchEvangelismos();
  }, []);

  const fetchEvangelismos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/evangelismos');
      const data = await response.json();
      if (data.success) {
        setEvangelismos(data.evangelismos || []);
      }
    } catch (error) {
      console.error('Erro ao buscar evangelismos:', error);
      showToast('❌ Erro ao carregar evangelismos');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleViewDetails = (ev: Evangelismo) => {
    setSelectedEvangelismo(ev);
    setEditData(ev);
    setShowDetails(true);
    setIsEditing(false);
  };

  const handleDeleteEvangelismo = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja deletar este evangelismo?')) return;

    try {
      setFormLoading(true);
      const res = await fetch(`/api/evangelismos/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.success || res.ok) {
        showToast('✅ Evangelismo deletado com sucesso!');
        fetchEvangelismos();
        setShowDetails(false);
      } else {
        showToast(`❌ Erro: ${data.error || 'Falha ao deletar'}`);
      }
    } catch (err) {
      showToast('❌ Erro ao deletar evangelismo');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editData.title || !editData.evangelismoDate || !editData.location) {
      showToast('❌ Preencha título, data e localização');
      return;
    }

    try {
      setFormLoading(true);
      const res = await fetch(`/api/evangelismos/${selectedEvangelismo?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editData.title,
          evangelismoDate: editData.evangelismoDate,
          evangelismoTimeStart: editData.evangelismoTimeStart,
          evangelismoTimeEnd: editData.evangelismoTimeEnd,
          location: editData.location,
          description: editData.description
        }),
      });

      const data = await res.json();
      if (data.success || res.ok) {
        showToast('✅ Evangelismo atualizado com sucesso!');
        fetchEvangelismos();
        setIsEditing(false);
      } else {
        showToast(`❌ Erro: ${data.error || 'Falha ao salvar'}`);
      }
    } catch (err) {
      showToast('❌ Erro ao salvar evangelismo');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSaveEvangelismo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.data || !formData.localizacao) {
      showToast('❌ Preencha título, data e localização');
      return;
    }

    setFormLoading(true);
    try {
      const res = await fetch('/api/evangelismos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          evangelismoDate: formData.data,
          evangelismoTimeStart: formData.hora_inicio,
          evangelismoTimeEnd: formData.hora_fim,
          location: formData.localizacao,
          description: formData.description
        }),
      });

      const data = await res.json();
      if (data.success || res.ok) {
        showToast('✅ Evangelismo agendado com sucesso!');
        setFormData({
          title: '',
          data: new Date().toISOString().split('T')[0],
          hora_inicio: '',
          hora_fim: '',
          localizacao: '',
          description: ''
        });
        setShowForm(false);
        fetchEvangelismos();
      } else {
        showToast(`❌ Erro: ${data.error || 'Falha ao salvar'}`);
      }
    } catch (err) {
      showToast('❌ Erro ao salvar evangelismo');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredEvangelismos = evangelismos.filter(ev => {
    // Tab Filtering
    if (activeTab === 'aberto' && ev.status !== 'aberto') return false;
    if (activeTab === 'em_andamento' && ev.status !== 'em_andamento') return false;
    if (activeTab === 'encerrado' && ev.status !== 'encerrado') return false;

    // Date Filtering
    const evDate = ev.data || ev.evangelismoDate || '';
    if (dateFilter && evDate.split('T')[0] !== dateFilter) return false;

    return true;
  });

  const getStatusLabel = (status: string) => {
    if (status === 'aberto') return t('event_open');
    if (status === 'em_andamento') return t('tab_ongoing');
    return t('event_closed');
  };

  const getStatusColor = (status: string) => {
    if (status === 'aberto') return 'bg-indigo-50 group-hover:bg-indigo-600';
    if (status === 'em_andamento') return 'bg-green-50 group-hover:bg-green-600';
    return 'bg-slate-50 group-hover:bg-slate-600';
  };

  const getStatusTextColor = (status: string) => {
    if (status === 'aberto') return 'text-indigo-600 group-hover:text-indigo-200';
    if (status === 'em_andamento') return 'text-green-600 group-hover:text-green-100';
    return 'text-slate-500 group-hover:text-slate-200';
  };

  const getStatusBadge = (status: string) => {
    if (status === 'aberto') return 'bg-indigo-100 text-indigo-700';
    if (status === 'em_andamento') return 'bg-green-100 text-green-700 animate-pulse';
    return 'bg-slate-100 text-slate-500';
  };

  return (
    <div className="space-y-8">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-4 right-4 p-4 bg-slate-900 text-white rounded-lg shadow-lg z-50 text-sm font-medium"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('events_title')}</h1>
          <p className="text-slate-500 mt-2">{t('evangelismo_subtitle')}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
           {/* Create Button (Admin Only) */}
           {user?.role === 'admin' && !showForm && (
             <button
               onClick={() => setShowForm(true)}
               className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-md"
             >
               <Plus className="w-4 h-4" />
               {t('evangelismo_schedule_btn' as TranslationKey)}
             </button>
           )}
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

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">📅 {t('evangelismo_new_modal' as TranslationKey)}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvangelismo} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t('evangelismo_title_label' as TranslationKey)} *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t('evangelismo_title_placeholder' as TranslationKey)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t('evangelismo_date_label' as TranslationKey)} *</label>
                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t('evangelismo_time_start_label' as TranslationKey)}</label>
                  <input
                    type="time"
                    value={formData.hora_inicio}
                    onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t('evangelismo_time_end_label' as TranslationKey)}</label>
                  <input
                    type="time"
                    value={formData.hora_fim}
                    onChange={(e) => setFormData({ ...formData, hora_fim: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t('evangelismo_location_label' as TranslationKey)} *</label>
                <input
                  type="text"
                  value={formData.localizacao}
                  onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                  placeholder={t('evangelismo_location_placeholder' as TranslationKey)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t('evangelismo_description_label' as TranslationKey)}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('evangelismo_description_placeholder' as TranslationKey)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-h-[80px] resize-none"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
                >
                  {formLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  {t('evangelismo_btn_schedule' as TranslationKey)}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-all"
                >
                  {t('btn_cancel' as TranslationKey)}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs Navigation */}
      <div className="flex p-1 bg-white rounded-xl border border-slate-200 w-full sm:w-fit">
        {[
          { id: 'aberto', label: t('event_open') },
          { id: 'em_andamento', label: t('tab_ongoing') },
          { id: 'encerrado', label: t('event_closed') },
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
        {loading ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-500">Carregando...</p>
          </div>
        ) : filteredEvangelismos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">{t('evangelismo_empty')}</p>
          </div>
        ) : (
          filteredEvangelismos.map((ev, idx) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex flex-col md:flex-row">
                {/* Date Column */}
                <div className={`p-6 flex flex-col items-center justify-center md:w-32 border-b md:border-b-0 md:border-r border-indigo-100 transition-colors ${getStatusColor(ev.status)}`}>
                   {(() => {
                     const dateStr = ev.data || ev.evangelismoDate;
                     const date = parseDate(dateStr);
                     if (!date) {
                       return (
                         <div className="text-center">
                           <span className="text-xs font-bold text-slate-500">--</span>
                           <span className="text-sm font-extrabold text-slate-500">--</span>
                         </div>
                       );
                     }
                     return (
                       <>
                         <span className={`font-bold text-sm uppercase transition-colors ${getStatusTextColor(ev.status)}`}>
                           {date.toLocaleDateString('pt-BR', { month: 'short' })}
                         </span>
                         <span className="text-3xl font-extrabold text-slate-900 group-hover:text-white transition-colors">
                           {date.getDate()}
                         </span>
                         <span className={`text-xs mt-1 transition-colors ${
                            ev.status === 'em_andamento' ? 'text-green-700 group-hover:text-green-100' :
                            ev.status === 'encerrado' ? 'text-slate-400 group-hover:text-slate-200' :
                            'text-slate-500 group-hover:text-indigo-200'
                         }`}>
                           {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                         </span>
                       </>
                     );
                   })()}
                </div>
                
                {/* Content */}
                <div className="p-6 flex-1">
                   <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-slate-900">{ev.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusBadge(ev.status)}`}>
                        {getStatusLabel(ev.status)}
                      </span>
                   </div>
                   {ev.description && <p className="text-slate-600 mb-6">{ev.description}</p>}
                   
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-slate-600">
                      {(ev.hora_inicio || ev.evangelismoTimeStart) && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                          <span className="font-medium">{ev.hora_inicio || ev.evangelismoTimeStart}{(ev.hora_fim || ev.evangelismoTimeEnd) ? ` - ${ev.hora_fim || ev.evangelismoTimeEnd}` : ''}</span>
                        </div>
                      )}
                      {(ev.localizacao || ev.location) && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                          <span className="truncate max-w-[150px] font-medium">{ev.localizacao || ev.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                        <span className="font-semibold text-slate-700">0 / 0 {t('event_registered')}</span>
                      </div>
                   </div>
                </div>

                {/* Action */}
                <div className="p-6 md:w-48 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-100 bg-slate-50/50 gap-2">
                   {ev.status === 'aberto' && user?.role !== 'admin' && (
                     <button 
                       className="w-full py-2.5 px-4 bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                     >
                       ✋ {t('btn_apply')}
                     </button>
                   )}
                   <button 
                     onClick={() => handleViewDetails(ev)}
                     className={`w-full py-2.5 px-4 bg-white border border-slate-200 text-slate-900 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                       ev.status === 'encerrado' 
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

      {/* Details Modal */}
      <AnimatePresence>
        {showDetails && selectedEvangelismo && editData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => !isEditing && setShowDetails(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex justify-between items-start">
                <h2 className="text-2xl font-bold text-slate-900">Detalhes do Evangelismo</h2>
                <button 
                  onClick={() => !isEditing && setShowDetails(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {isEditing ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">{t('evangelismo_title_label' as TranslationKey)} *</label>
                      <input
                        type="text"
                        value={editData.title}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">{t('evangelismo_date_label' as TranslationKey)} *</label>
                        <input
                          type="date"
                          value={editData.evangelismoDate}
                          onChange={(e) => setEditData({ ...editData, evangelismoDate: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">{t('evangelismo_time_start_label' as TranslationKey)}</label>
                        <input
                          type="time"
                          value={editData.evangelismoTimeStart || ''}
                          onChange={(e) => setEditData({ ...editData, evangelismoTimeStart: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">{t('evangelismo_time_end_label' as TranslationKey)}</label>
                        <input
                          type="time"
                          value={editData.evangelismoTimeEnd || ''}
                          onChange={(e) => setEditData({ ...editData, evangelismoTimeEnd: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">{t('evangelismo_location_label' as TranslationKey)} *</label>
                      <input
                        type="text"
                        value={editData.location}
                        onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">{t('evangelismo_description_label' as TranslationKey)}</label>
                      <textarea
                        value={editData.description || ''}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px] resize-none"
                      />
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-500 uppercase">{t('evangelismo_title_label' as TranslationKey)}</label>
                      <p className="text-lg font-bold text-slate-900">{editData.title}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-slate-500 uppercase">{t('evangelismo_date_label' as TranslationKey)}</label>
                        <p className="text-base font-medium text-slate-900">
                          {new Date(editData.evangelismoDate + 'T00:00:00Z').toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-500 uppercase">{t('evangelismo_time_start_label' as TranslationKey)}</label>
                        <p className="text-base font-medium text-slate-900">
                          {editData.evangelismoTimeStart} {editData.evangelismoTimeEnd ? `- ${editData.evangelismoTimeEnd}` : ''}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-500 uppercase">{t('evangelismo_location_label' as TranslationKey)}</label>
                      <p className="text-base font-medium text-slate-900">{editData.location}</p>
                    </div>

                    {editData.description && (
                      <div>
                        <label className="text-sm font-semibold text-slate-500 uppercase">{t('evangelismo_description_label' as TranslationKey)}</label>
                        <p className="text-base text-slate-700">{editData.description}</p>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-semibold text-slate-500 uppercase">Status</label>
                      <p className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        editData.status === 'aberto' ? 'bg-indigo-100 text-indigo-700' :
                        editData.status === 'em_andamento' ? 'bg-green-100 text-green-700' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {editData.status === 'aberto' ? t('event_open') :
                         editData.status === 'em_andamento' ? t('tab_ongoing') :
                         t('event_closed')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer - Action Buttons */}
              <div className="sticky bottom-0 bg-slate-50 border-t border-slate-100 p-6 flex gap-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      disabled={formLoading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
                    >
                      {formLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Salvar
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 px-4 py-2.5 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-all"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    {user?.role === 'admin' && (
                      <>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all"
                        >
                          <Edit2 size={16} />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteEvangelismo(selectedEvangelismo.id)}
                          disabled={formLoading}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all disabled:opacity-50"
                        >
                          {formLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                          Excluir
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setShowDetails(false)}
                      className="flex-1 px-4 py-2.5 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-all"
                    >
                      Fechar
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
