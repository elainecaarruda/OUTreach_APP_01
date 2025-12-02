import React, { useState } from 'react';
import {
  Calendar, Users, Plus, Archive, Download, Link2, 
  Loader2, CheckCircle, X, Filter, Search, Clock,
  BookOpen, Award, Lightbulb, Heart
} from 'lucide-react';
import { useAuth } from '../App';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { TranslationKey } from '../i18n';

interface Training {
  id: string;
  title: string;
  category: 'admin' | 'leader' | 'evangelism' | 'intercession';
  dateTime: string;
  type: 'online' | 'presencial';
  description: string;
  instructor: string;
  capacity: number;
  registered: number;
  archived: boolean;
  files?: { name: string; url: string; type: 'file' | 'recording' }[];
}

// MOCK DATA
const MOCK_TRAININGS: Training[] = [
  {
    id: 't1',
    title: 'Liderança Efetiva em Equipes',
    category: 'admin',
    dateTime: '2025-12-15T10:00',
    type: 'online',
    description: 'Aprenda princípios de liderança espiritual e gestão de equipes no contexto evangelístico.',
    instructor: 'Pastor João Silva',
    capacity: 50,
    registered: 32,
    archived: false
  },
  {
    id: 't2',
    title: 'Treinamento de Evangelismo de Rua',
    category: 'evangelism',
    dateTime: '2025-12-08T14:00',
    type: 'presencial',
    description: 'Técnicas práticas para abordar pessoas nas ruas com respeito e compaixão.',
    instructor: 'Maria Santos',
    capacity: 30,
    registered: 28,
    archived: false
  },
  {
    id: 't3',
    title: 'Poder da Intercessão Estratégica',
    category: 'intercession',
    dateTime: '2025-12-20T19:00',
    type: 'online',
    description: 'Como orar estrategicamente pelos perdidos e pelos evangelistas em campo.',
    instructor: 'Profeta Pedro Costa',
    capacity: 100,
    registered: 67,
    archived: false
  },
  {
    id: 't4',
    title: 'Gestão e Delegação para Líderes',
    category: 'leader',
    dateTime: '2025-12-10T15:00',
    type: 'online',
    description: 'Como delegar tarefas, motivar equipes e resolver conflitos.',
    instructor: 'Líder Ana Oliveira',
    capacity: 40,
    registered: 25,
    archived: false
  },
  {
    id: 't5',
    title: 'Resgatando Testemunhos (Arquivado)',
    category: 'admin',
    dateTime: '2025-11-20T10:00',
    type: 'online',
    description: 'Como coletar e compartilhar testemunhos impactantes.',
    instructor: 'Admin Team',
    capacity: 30,
    registered: 30,
    archived: true,
    files: [
      { name: 'Slides_Resumo.pdf', url: '#', type: 'file' },
      { name: 'Gravação_Completa.mp4', url: '#', type: 'recording' }
    ]
  }
];

const CATEGORIES = [
  { id: 'admin', label: 'training_cat_admin', emoji: '👑', icon: Award },
  { id: 'leader', label: 'training_cat_leader', emoji: '🎯', icon: Users },
  { id: 'evangelism', label: 'training_cat_evangelism', emoji: '✝️', icon: Lightbulb },
  { id: 'intercession', label: 'training_cat_intercession', emoji: '🙏', icon: Heart }
];

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }: any) => {
  const baseStyle = "px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border active:scale-95 duration-200";
  const variants: any = {
    primary: "bg-indigo-600 text-white border-transparent hover:bg-indigo-700 shadow-lg disabled:opacity-50",
    secondary: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 disabled:opacity-50",
    outline: "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50",
    ghost: "border-transparent text-slate-600 hover:bg-slate-100 disabled:opacity-50"
  };
  return <button type="button" onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>{children}</button>;
};

const Card = ({ children, className = '' }: any) => <div className={`bg-white shadow-sm rounded-2xl border border-slate-100 ${className}`}>{children}</div>;

export const Training: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [trainings, setTrainings] = useState<Training[]>(MOCK_TRAININGS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    category: 'evangelism',
    dateTime: '',
    type: 'online' as 'online' | 'presencial',
    description: '',
    capacity: 30
  });

  const isAdmin = user?.role === 'admin';

  // Filter trainings
  const filteredTrainings = trainings.filter(t => {
    const matchesArchive = t.archived === showArchived;
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesArchive && matchesCategory && matchesSearch;
  });

  const handleCreateTraining = () => {
    if (!formData.title || !formData.dateTime) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const newTraining: Training = {
      id: `t${Date.now()}`,
      ...formData,
      instructor: user?.full_name || 'Unknown',
      registered: 0,
      archived: false
    };

    setTrainings([...trainings, newTraining]);
    setShowCreateForm(false);
    setFormData({
      title: '',
      category: 'evangelism',
      dateTime: '',
      type: 'online',
      description: '',
      capacity: 30
    });
  };

  const handleArchiveTraining = (id: string) => {
    setTrainings(trainings.map(t => t.id === id ? { ...t, archived: true } : t));
  };

  const handleRegisterTraining = (id: string) => {
    setTrainings(trainings.map(t => 
      t.id === id && t.registered < t.capacity 
        ? { ...t, registered: t.registered + 1 }
        : t
    ));
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl text-white shadow-lg">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{t('menu_training' as TranslationKey)}</h1>
            <p className="text-xs font-medium text-slate-500 mt-1">{t('training_subtitle' as TranslationKey)}</p>
          </div>
        </div>
        
        {isAdmin && (
          <Button onClick={() => setShowCreateForm(!showCreateForm)} className="w-full md:w-auto">
            <Plus className="w-5 h-5" /> {t('training_btn_create' as TranslationKey)}
          </Button>
        )}
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showCreateForm && isAdmin && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl border-2 border-blue-200 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">{t('training_new' as TranslationKey)}</h2>
              <button onClick={() => setShowCreateForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder={t('training_field_title' as TranslationKey)}
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{t(cat.label as TranslationKey)}</option>
                ))}
              </select>

              <input
                type="datetime-local"
                value={formData.dateTime}
                onChange={(e) => setFormData({...formData, dateTime: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="online">{t('training_type_online' as TranslationKey)}</option>
                <option value="presencial">{t('training_type_presencial' as TranslationKey)}</option>
              </select>

              <input
                type="number"
                placeholder={t('training_field_capacity' as TranslationKey)}
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <textarea
              placeholder={t('training_field_description' as TranslationKey)}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full mt-4 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            />

            <div className="flex gap-3 mt-6 justify-end">
              <Button variant="secondary" onClick={() => setShowCreateForm(false)}>
                {t('btn_cancel' as TranslationKey)}
              </Button>
              <Button onClick={handleCreateTraining}>
                <CheckCircle className="w-4 h-4" /> {t('btn_save' as TranslationKey)}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters & Search */}
      <div className="space-y-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder={t('training_search' as TranslationKey)}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button variant="secondary" onClick={() => setShowArchived(!showArchived)}>
            <Archive className="w-4 h-4" /> {showArchived ? t('training_show_active' as TranslationKey) : t('training_show_archived' as TranslationKey)}
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t('training_all_categories' as TranslationKey)}
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{cat.emoji}</span> {t(cat.label as TranslationKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Trainings Grid */}
      <div className="grid gap-6">
        {filteredTrainings.length === 0 ? (
          <div className="text-center py-24 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500 font-medium">{t('training_no_trainings' as TranslationKey)}</p>
          </div>
        ) : (
          filteredTrainings.map((training, index) => (
            <motion.div
              key={training.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-6 rounded-2xl border transition-all ${
                training.archived
                  ? 'bg-slate-50 border-slate-200 opacity-75'
                  : 'bg-white border-slate-100 hover:shadow-lg'
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-3xl">{CATEGORIES.find(c => c.id === training.category)?.emoji}</div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{training.title}</h3>
                      <p className="text-sm text-slate-600 font-medium">{t(CATEGORIES.find(c => c.id === training.category)?.label as TranslationKey)}</p>
                    </div>
                  </div>

                  <p className="text-slate-700 text-sm mb-4 leading-relaxed">{training.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      {new Date(training.dateTime).toLocaleDateString()} {new Date(training.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Users className="w-4 h-4 text-blue-600" />
                      {training.registered}/{training.capacity}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        training.type === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {t(training.type === 'online' ? 'training_type_online' : 'training_type_presencial' as TranslationKey)}
                      </span>
                    </div>
                    <div className="text-slate-600 font-medium">
                      {t('training_by' as TranslationKey)}: {training.instructor}
                    </div>
                  </div>

                  {/* Archived Files */}
                  {training.archived && training.files && training.files.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                      <p className="text-xs font-bold text-slate-700 uppercase">{t('training_archived_resources' as TranslationKey)}</p>
                      <div className="flex flex-wrap gap-2">
                        {training.files.map((file, i) => (
                          <a
                            key={i}
                            href={file.url}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-bold text-slate-700 transition-colors"
                          >
                            {file.type === 'recording' ? (
                              <>
                                <Download className="w-4 h-4" /> {file.name}
                              </>
                            ) : (
                              <>
                                <Link2 className="w-4 h-4" /> {file.name}
                              </>
                            )}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 w-full md:w-auto">
                  {!training.archived && (
                    <>
                      {user?.role === 'admin' && (
                        <Button
                          variant="secondary"
                          onClick={() => handleArchiveTraining(training.id)}
                          className="w-full md:w-auto text-xs"
                        >
                          <Archive className="w-4 h-4" /> {t('btn_archive' as TranslationKey)}
                        </Button>
                      )}
                      {training.registered < training.capacity && (
                        <Button
                          onClick={() => handleRegisterTraining(training.id)}
                          className="w-full md:w-auto text-xs"
                        >
                          <CheckCircle className="w-4 h-4" /> {t('training_btn_register' as TranslationKey)}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
