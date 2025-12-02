import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { MOCK_REGISTRATIONS } from '../mockData';
import { AlertCircle, CheckCircle, XCircle, Search, Plus, Edit2, Trash2, Calendar, MapPin, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslationKey } from '../i18n';

interface Evangelismo {
  id: number;
  title: string;
  evangelismoDate: string;
  evangelismoTimeStart: string;
  evangelismoTimeEnd: string;
  location: string;
  status: string;
  leadersNeeded?: number;
  evangelists?: number;
  driveFolderId: string;
  createdAt: string;
  coordinatorName?: string;
  coordinatorPhone?: string;
  leadersNeededText?: string;
  evangelistsList?: string;
  intercessorTeam?: string;
  evangelismoType?: string;
  materials?: string;
  emergencyResponsibles?: string;
  specialCares?: string;
  followUpNotes?: string;
  description?: string;
  additionalNotes?: string;
}

export const Admin = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'approvals' | 'evangelismos'>('approvals');
  const [evangelismos, setEvangelismos] = useState<Evangelismo[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    evangelismoDate: new Date().toISOString().split('T')[0],
    evangelismoTimeStart: '',
    evangelismoTimeEnd: '',
    location: ''
  });
  const [toast, setToast] = useState<string | null>(null);

  // Role mapping for translations
  const roleMap: Record<string, TranslationKey> = {
    'admin': 'role_admin' as TranslationKey,
    'leader': 'role_leader' as TranslationKey,
    'evangelist': 'role_evangelist' as TranslationKey,
    'intercessor': 'role_intercessor' as TranslationKey,
  };

  // Fetch evangelismos
  useEffect(() => {
    if (activeTab === 'evangelismos') {
      fetchEvangelismos();
    }
  }, [activeTab]);

  const fetchEvangelismos = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/evangelismos');
      const data = await res.json();
      if (data.success) {
        setEvangelismos(data.evangelismos || []);
      }
    } catch (err) {
      console.error('Error fetching evangelismos:', err);
      showToast(t('admin_toast_error_load' as TranslationKey));
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveEvangelismo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.evangelismoDate || !formData.location) {
      showToast(t('admin_toast_error_fields' as TranslationKey));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/evangelismos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success || res.ok) {
        showToast(t('admin_toast_created' as TranslationKey));
        setFormData({ 
          title: '', 
          evangelismoDate: new Date().toISOString().split('T')[0], 
          evangelismoTimeStart: '', 
          evangelismoTimeEnd: '', 
          location: '', 
          leadersNeeded: 1, 
          evangelists: 3, 
          coordinatorName: '',
          coordinatorPhone: '',
          leadersNeededText: '',
          evangelistsList: '',
          intercessorTeam: '',
          evangelismoType: '',
          materials: '',
          emergencyResponsibles: '',
          specialCares: '',
          followUpNotes: '',
          description: '', 
          additionalNotes: '' 
        });
        setShowForm(false);
        fetchEvangelismos();
      } else {
        showToast(t('admin_toast_error' as TranslationKey).replace('{error}', data.error));
      }
    } catch (err) {
      showToast(t('admin_toast_error_save' as TranslationKey));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvangelismo = async (id: number) => {
    if (!window.confirm(t('admin_confirm_delete' as TranslationKey))) return;
    
    try {
      setLoading(true);
      const res = await fetch(`/api/evangelismos/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success || res.ok) {
        showToast(t('admin_toast_deleted' as TranslationKey));
        fetchEvangelismos();
      } else {
        showToast(t('admin_toast_error' as TranslationKey).replace('{error}', data.error));
      }
    } catch (err) {
      showToast(t('admin_toast_error_delete' as TranslationKey));
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="p-4 bg-red-100 rounded-full text-red-500 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">{t('admin_access_denied' as TranslationKey)}</h2>
        <p className="text-slate-500 mt-2">{t('admin_access_denied_subtitle' as TranslationKey)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-900">{t('admin_page_title' as TranslationKey)}</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'approvals'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          {t('admin_tab_approvals' as TranslationKey)} ({MOCK_REGISTRATIONS.length})
        </button>
        <button
          onClick={() => setActiveTab('evangelismos')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'evangelismos'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          {t('admin_tab_evangelismos' as TranslationKey)} ({evangelismos.length})
        </button>
      </div>

      {/* Approvals Tab */}
      {activeTab === 'approvals' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {MOCK_REGISTRATIONS.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              {t('admin_no_requests' as TranslationKey)}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {MOCK_REGISTRATIONS.map((reg) => (
                <motion.div 
                  key={reg.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900">{reg.nome}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                        reg.role === 'leader' ? 'bg-purple-100 text-purple-700' :
                        reg.role === 'evangelist' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {t(roleMap[reg.role] || 'role_guest' as TranslationKey)}
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 mt-1">{reg.email}</div>
                    <div className="text-xs text-slate-400 mt-1">{t('admin_label_reg_date' as TranslationKey)} {new Date(reg.created_date).toLocaleDateString()}</div>
                  </div>

                  {reg.status === 'pending' && (
                    <div className="flex gap-3">
                      <button className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 font-medium rounded-lg hover:bg-green-100 transition-colors border border-green-200">
                        <CheckCircle className="w-4 h-4" />
                        {t('admin_btn_approve' as TranslationKey)}
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition-colors border border-red-200">
                        <XCircle className="w-4 h-4" />
                        {t('admin_btn_reject' as TranslationKey)}
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Evangelismos Tab */}
      {activeTab === 'evangelismos' && (
        <div className="space-y-4">
          {/* Create Button */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
            >
              {t('admin_btn_evangelismo' as TranslationKey)}
            </button>
          )}

          {/* Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4 max-w-2xl"
              >
                <h3 className="text-lg font-bold text-slate-900">{t('admin_new_evangelismo' as TranslationKey)}</h3>
                <form onSubmit={handleSaveEvangelismo} className="space-y-5 max-w-4xl">
                  
                  {/* SEÇÃO 1: INFORMAÇÕES DO EVENTO */}
                  <div className="border-b-2 border-indigo-100 pb-4">
                    <h4 className="text-sm font-bold text-indigo-600 uppercase mb-3">{t('admin_event_info' as TranslationKey)}</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">{t('admin_label_title' as TranslationKey)}</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder={t('admin_title_placeholder' as TranslationKey)}
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">{t('admin_label_date' as TranslationKey)}</label>
                          <input
                            type="text"
                            placeholder={t('admin_date_placeholder' as TranslationKey)}
                            value={formData.evangelismoDate ? new Date(formData.evangelismoDate).toLocaleDateString('pt-BR') : ''}
                            onChange={(e) => {
                              const [d, m, y] = e.target.value.split('/');
                              if (d && m && y && d.length === 2 && m.length === 2 && y.length === 4) {
                                setFormData({ ...formData, evangelismoDate: `${y}-${m}-${d}` });
                              }
                            }}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">{t('admin_label_time_start' as TranslationKey)}</label>
                          <input
                            type="time"
                            value={formData.evangelismoTimeStart}
                            onChange={(e) => setFormData({ ...formData, evangelismoTimeStart: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">{t('admin_label_time_end' as TranslationKey)}</label>
                          <input
                            type="time"
                            value={formData.evangelismoTimeEnd}
                            onChange={(e) => setFormData({ ...formData, evangelismoTimeEnd: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">{t('admin_label_location' as TranslationKey)}</label>
                        <textarea
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder={t('admin_location_placeholder' as TranslationKey)}
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-h-[60px] resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">{t('admin_label_status' as TranslationKey)}</label>
                        <div className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 font-medium flex items-center">
                          <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                          {t('admin_status_open' as TranslationKey)}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{t('admin_status_helper' as TranslationKey)}</p>
                      </div>
                    </div>
                  </div>


                  {/* Buttons */}
                  <div className="flex gap-2 pt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                      {t('admin_btn_create' as TranslationKey)}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setFormData({
                          title: '',
                          evangelismoDate: new Date().toISOString().split('T')[0],
                          evangelismoTimeStart: '',
                          evangelismoTimeEnd: '',
                          location: ''
                        });
                      }}
                      className="px-4 py-2 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition-colors"
                    >
                      {t('admin_btn_cancel' as TranslationKey)}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* List */}
          {loading && !showForm ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : evangelismos.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-100">
              {t('admin_no_evangelismos' as TranslationKey)}
            </div>
          ) : (
            <div className="grid gap-4">
              {evangelismos.map((ev) => (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900">{ev.title}</h3>
                      {ev.description && <p className="text-sm text-slate-600 mt-2">{ev.description}</p>}
                      <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-indigo-600" />
                          {new Date(ev.evangelismoDate).toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en')}
                        </div>
                        {ev.location && (
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-indigo-600" />
                            {ev.location}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={`https://drive.google.com/drive/folders/${ev.driveFolderId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors text-sm"
                      >
                        {t('admin_btn_drive' as TranslationKey)}
                      </a>
                      <button
                        onClick={() => handleDeleteEvangelismo(ev.id)}
                        disabled={loading}
                        className="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                        title={t('admin_btn_delete_tooltip' as TranslationKey)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
