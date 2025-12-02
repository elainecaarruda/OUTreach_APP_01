
import React, { useState, useEffect } from 'react';
import { 
  User, Heart, MessageSquare, Sparkles, 
  FileText, Upload, Save, Loader2, CheckCircle,
  Mic, Wand2, AlertCircle, X, ChevronRight, Plus, Filter, Calendar, ArrowLeft, Users, Globe, Phone,
  ChevronLeft, BarChart3, LayoutGrid, Star, StopCircle
} from 'lucide-react';
import { useAuth } from '../App';
import { MOCK_TESTIMONIES } from '../mockData';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useOpenAI } from '../hooks/useOpenAI';
import { useGemini } from '../hooks/useGemini';
import { useTestimonyGenerator, TestimonyOutput } from '../hooks/useTestimonyGenerator';
import { PersonDetailsForm } from '../components/PersonDetailsForm';
import { TranslatableText } from '../components/TranslatableText';
import { ImproveWithAI } from '../components/ImproveWithAI';
import { MediaUpload } from '../components/MediaUpload';
import { TranslationKey } from '../i18n';

// --- Constants ---

// Note: Evangelismos are now loaded from API in the useEffect below

const PROFILE_OPTIONS = [
  'testimony_profile_man',
  'testimony_profile_woman',
  'testimony_profile_family',
  'testimony_profile_youth',
  'testimony_profile_elderly',
  'testimony_profile_child'
];

const RELIGION_OPTIONS = [
  'testimony_religion_catholicism',
  'testimony_religion_protestantism',
  'testimony_religion_islam',
  'testimony_religion_judaism',
  'testimony_religion_hinduism',
  'testimony_religion_atheism',
  'testimony_religion_other'
];

const EMOTIONAL_STATES = [
  'testimony_emotion_alone',
  'testimony_emotion_crying',
  'testimony_emotion_drugs',
  'testimony_emotion_prostitution',
  'testimony_emotion_homocouple',
  'testimony_emotion_family_conflict',
  'testimony_emotion_sick',
  'testimony_emotion_unemployed',
  'testimony_emotion_anxious',
  'testimony_emotion_sad',
  'testimony_emotion_seeking_help',
  'testimony_emotion_waiting'
];

const INITIAL_ACTIONS = [
  'testimony_action_god_highlighted',
  'testimony_action_came_to_me',
  'testimony_action_seemed_sad',
  'testimony_action_seemed_lost',
  'testimony_action_treasure_hunt',
  'testimony_action_open_to_talk',
  'testimony_action_attracted',
  'testimony_action_confused',
  'testimony_action_visible_need',
  'testimony_action_spirit_direction',
  'testimony_action_public_preaching'
];

const EVENT_OPTIONS = [
  'testimony_event_cried',
  'testimony_event_smiled',
  'testimony_event_peace',
  'testimony_event_lightness',
  'testimony_event_gods_presence',
  'testimony_event_physical_healing',
  'testimony_event_emotional_healing',
  'testimony_event_deliverance',
  'testimony_event_demonstration',
  'testimony_event_moved',
  'testimony_event_trembled',
  'testimony_event_sighed',
  'testimony_event_expression_changed',
  'testimony_event_thanked',
  'testimony_event_quiet_touched',
  'testimony_event_asked_hug',
  'testimony_event_hugged',
  'testimony_event_asked_bible',
  'testimony_event_asked_extra_prayer',
  'testimony_event_continue_talking'
];

const DECISION_OPTIONS = [
  { label: 'testimony_decision_accepted_jesus', emoji: '❤️' },
  { label: 'testimony_decision_miracle', emoji: '✨' },
  { label: 'testimony_decision_physical_healing', emoji: '💚' },
  { label: 'testimony_decision_baptized', emoji: '💧' },
  { label: 'testimony_decision_visit_church', emoji: '⛪' },
  { label: 'testimony_decision_reconciled', emoji: '🙏' },
  { label: 'testimony_decision_holy_spirit', emoji: '🕊️' },
  { label: 'testimony_decision_emotional_healing', emoji: '💙' },
  { label: 'testimony_decision_accepted_bible', emoji: '📖' },
  { label: 'testimony_decision_call_later', emoji: '📞' },
  { label: 'testimony_decision_discipleship', emoji: '📚' },
  { label: 'testimony_decision_forgive', emoji: '🤝' },
  { label: 'testimony_decision_commit_change', emoji: '🌟' },
  { label: 'testimony_decision_join_group', emoji: '👥' }
];

// Helper for feed icons
const DECISION_ICONS: Record<string, string> = DECISION_OPTIONS.reduce((acc, curr) => ({...acc, [curr.label]: curr.emoji}), {});

// --- Generic Components ---
const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = "button" }: any) => {
  const baseStyle = "px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border active:scale-95 duration-200";
  const variants: any = {
    primary: "bg-slate-900 text-white border-transparent hover:bg-slate-800 shadow-lg shadow-slate-200 disabled:opacity-50 disabled:shadow-none",
    outline: "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50",
    ghost: "border-transparent text-slate-600 hover:bg-slate-100 disabled:opacity-50",
    secondary: "bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100 disabled:opacity-50"
  };
  return <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>{children}</button>;
};
const Card = ({ children, className = '' }: any) => <div className={`bg-white shadow-sm rounded-2xl border border-slate-100 ${className}`}>{children}</div>;
const Label = ({ children, required, className = '' }: any) => <label className={`block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ${className}`}>{children} {required && <span className="text-red-500">*</span>}</label>;
const Input = (props: any) => <input {...props} className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 focus:bg-white transition-all text-sm font-medium ${props.className}`} />;
const Textarea = (props: any) => <textarea {...props} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 focus:bg-white min-h-[120px] transition-all resize-y text-sm font-medium" />;


interface TestimonyProps {
  setPage?: (page: string) => void;
}

const TestimonyComponent: React.FC<TestimonyProps> = ({ setPage }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  
  // New Transcription Hooks
  const { isListening, startListening, stopListening, resetTranscript } = useSpeechRecognition({ language });
  const { isProcessing: openaiProcessing, improveTestimonyText } = useOpenAI();
  const { isProcessing, generateTestimonySummary, generateBilingualSummary } = useGemini();
  const { isProcessing: generatorProcessing, generateTestimonyOutput } = useTestimonyGenerator();
  // State to track which field is currently recording
  const [activeRecordingField, setActiveRecordingField] = useState<string | null>(null);
  const [testimonyOutput, setTestimonyOutput] = useState<TestimonyOutput | null>(null);
  const [isEditingTestimony, setIsEditingTestimony] = useState(false);
  const [editedNarrativa, setEditedNarrativa] = useState('');

  const [activeTab, setActiveTab] = useState('info');
  const [viewMode, setViewMode] = useState<'form' | 'feed'>('feed');
  const [feedTab, setFeedTab] = useState<'highlights' | 'wall' | 'stats'>('highlights');
  
  const [loading, setLoading] = useState(false);
  const [aiProcessing, setAiProcessing] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [evangelismos, setEvangelismos] = useState<any[]>([]);
  
  // Filters State
  const [filters, setFilters] = useState({
    team: '',
    decision: '',
    sort: 'newest'
  });

  // Form State
  const [formData, setFormData] = useState({
    evangelismoId: '', 
    team_id: '', 
    testimony_title: '', 
    date: new Date().toISOString().split('T')[0],
    people_profiles: [] as any[], 
    emotional_states: [] as string[], 
    initial_actions: [] as string[],
    initial_context: '', 
    events_during: [] as string[], 
    during_approach: '',
    testimony_witnessed: '', 
    final_summary: '', 
    has_media: 'Sim',
    photos_urls: [],
    videos_urls: []
  });

  const [saveInEnglishToo, setSaveInEnglishToo] = useState(false);
  const [summaryNative, setSummaryNative] = useState('');
  const [summaryEnglish, setSummaryEnglish] = useState('');

  // Fetch evangelismos on mount and refresh every 5 seconds
  useEffect(() => {
    const fetchEvangelismos = async () => {
      try {
        const res = await fetch('/api/evangelismos');
        const data = await res.json();
        if (data.success) {
          setEvangelismos(data.evangelismos);
        }
      } catch (err) {
        console.error('Erro ao buscar evangelismos:', err);
      }
    };

    // Fetch immediately on mount
    fetchEvangelismos();

    // Set up auto-refresh every 5 seconds
    const interval = setInterval(fetchEvangelismos, 5000);

    return () => clearInterval(interval);
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // --- Helper functions ---
  
  const addPersonProfile = (type: string) => {
    const newPerson = { 
      id: Date.now(), 
      profile_type: type, 
      name: '', 
      nationality: '', 
      living_in_europe: false, 
      never_heard_jesus: false, 
      religion: '', 
      phone: '', 
      email: '', 
      instagram: '', 
      address: '',
      latitude: 0,
      longitude: 0,
      decisions: [] as string[] 
    };
    setFormData(prev => ({ ...prev, people_profiles: [...prev.people_profiles, newPerson] }));
  };

  const updatePerson = (id: number, field: string, value: any) => {
    setFormData(prev => ({ 
      ...prev, 
      people_profiles: prev.people_profiles.map(p => p.id === id ? { ...p, [field]: value } : p) 
    }));
  };

  const removePerson = (id: number) => {
    setFormData(prev => ({ ...prev, people_profiles: prev.people_profiles.filter(p => p.id !== id) }));
  };

  const toggleDecision = (personId: number, decision: string) => {
    setFormData(prev => ({ 
      ...prev, 
      people_profiles: prev.people_profiles.map(p => { 
        if (p.id === personId) { 
          const current = p.decisions || []; 
          const newDecisions = current.includes(decision) 
            ? current.filter((d: string) => d !== decision) 
            : [...current, decision]; 
          return { ...p, decisions: newDecisions }; 
        } 
        return p; 
      }) 
    }));
  };

  const toggleArrayItem = (field: 'emotional_states' | 'initial_actions' | 'events_during', item: string) => {
    setFormData(prev => {
      const current = prev[field] || [];
      const updated = current.includes(item)
        ? current.filter(i => i !== item)
        : [...current, item];
      return { ...prev, [field]: updated };
    });
  };
  
  const handleSaveProgress = () => { 
    setLoading(true); 
    setTimeout(() => { 
      setLoading(false); 
      showToast(t('testimony_progress_saved' as TranslationKey)); 
    }, 800); 
  };
  
  // Transcription Logic
  const handleTranscription = async (field: 'initial_context' | 'during_approach' | 'testimony_witnessed') => {
    if (isListening) {
      // Stop if listening on the same field
      if (activeRecordingField === field) {
        try {
          const text = await stopListening();
          setActiveRecordingField(null);
          
          if (text && text.trim()) {
            setFormData(prev => ({ 
              ...prev, 
              [field]: prev[field] ? prev[field] + ' ' + text : text 
            }));
            showToast(t('transcription_success' as TranslationKey));
          } else {
            showToast(t('transcription_empty' as TranslationKey));
          }
          resetTranscript();
        } catch (e) {
          console.error("Transcription error:", e);
          const errorMsg = e instanceof Error ? e.message : "Unknown error";
          showToast(`${t('transcription_error' as TranslationKey)}: ${errorMsg}`);
          setActiveRecordingField(null);
        }
      }
    } else {
      // Start listening
      try {
        await startListening();
        setActiveRecordingField(field);
        showToast(t('recording_started' as TranslationKey));
      } catch (e) {
        console.error("Listening start error:", e);
        showToast(t('microphone_error' as TranslationKey));
      }
    }
  };

  const handleAICorrection = async (field: 'initial_context' | 'during_approach' | 'testimony_witnessed') => { 
    const currentText = formData[field];
    if (!currentText) return;

    setAiProcessing(field); 
    try {
      const improved = await improveTestimonyText(currentText, language);
      setFormData(prev => ({ ...prev, [field]: improved }));
      showToast(t('ai_text_improved' as TranslationKey));
    } catch (e) {
      console.error('Erro ao melhorar texto:', e);
      showToast(`${t('ai_error' as TranslationKey)}: ${e instanceof Error ? e.message : 'Erro desconhecido'}`);
    } finally {
      setAiProcessing('');
    }
  };

  const handleImproveWithAI = (field: 'initial_context' | 'during_approach' | 'testimony_witnessed', improvedText: string) => {
    setFormData(prev => ({ ...prev, [field]: improvedText }));
    showToast(t('testimony_text_accepted' as TranslationKey));
  };

  const handleGenerateSummary = async () => { 
    setAiProcessing('final_summary');
    try {
      // Consolidate ALL data for testimony generation
      const testimonyData = {
        data: formData.date,
        nome: formData.people_profiles.length > 0 
          ? formData.people_profiles.map(p => p.name || p.profile_type).join(', ')
          : 'Pessoa(s) abordada(s)',
        nacionalidade: formData.people_profiles.length > 0 
          ? formData.people_profiles.map(p => p.nationality || 'Não informada').join(', ')
          : '',
        decisao: formData.people_profiles.length > 0
          ? formData.people_profiles.flatMap(p => p.decisions || []).join(', ') || 'Encontro significativo'
          : 'Encontro significativo',
        contexto: formData.initial_context || '',
        emocional: formData.emotional_states.join(', ') || '',
        acoes: formData.initial_actions.join(', ') || '',
        durante: formData.during_approach || '',
        eventos: formData.events_during.join(', ') || '',
        relato: formData.testimony_witnessed || '',
        perfis: formData.people_profiles.map(p => p.profile_type).join(', ') || '',
        religioes: formData.people_profiles.map(p => p.religion).filter(r => r).join(', ') || ''
      };

      const selectedEvangelismo = evangelismos.find(e => e.id === parseInt(formData.evangelismoId));
      const teamName = selectedEvangelismo?.nome || '';

      if (saveInEnglishToo && language !== 'en') {
        // Generate bilingual summaries
        const { native, english } = await generateBilingualSummary(testimonyData, teamName, language);
        setSummaryNative(native);
        setSummaryEnglish(english);
        setFormData(prev => ({ ...prev, final_summary: native }));
        setTestimonyOutput({
          titulo: formData.testimony_title,
          data: formData.date,
          nome: testimonyData.nome,
          nacionalidade: testimonyData.nacionalidade,
          decisao: testimonyData.decisao,
          narrativa: native
        });
        showToast("✅ Resumos gerados (nativo + inglês)!");
      } else {
        // Generate summary in current language only
        const summary = await generateTestimonySummary(testimonyData, teamName, language);
        setSummaryNative(summary);
        setSummaryEnglish('');
        setFormData(prev => ({ ...prev, final_summary: summary }));
        setTestimonyOutput({
          titulo: formData.testimony_title,
          data: formData.date,
          nome: testimonyData.nome,
          nacionalidade: testimonyData.nacionalidade,
          decisao: testimonyData.decisao,
          narrativa: summary
        });
        showToast("✅ Resumo gerado com sucesso!");
      }
    } catch (e) {
      console.error('Erro ao gerar testemunho:', e);
      showToast(`❌ Erro: ${e instanceof Error ? e.message : 'Tente novamente'}`);
    } finally {
      setAiProcessing('');
    }
  };

  const handleFinalSave = async () => { 
    if (!formData.evangelismoId || !formData.testimony_title) {
      showToast(t('testimony_form_fill_required' as TranslationKey) || "Preencha Evangelismo e Título antes de salvar.");
      return;
    }
    setLoading(true); 
    try {
      const payload: any = {
        evangelismoId: formData.evangelismoId,
        title: formData.testimony_title,
        date: formData.date,
        personalInfo: formData.initial_context,
        profileInfo: formData.people_profiles.map(p => `${p.profile_type}: ${p.name}`).join('; '),
        eventInfo: formData.events_during.join('; '),
        decisionInfo: formData.people_profiles.flatMap(p => p.decisions || []).join('; '),
        summaryText: formData.final_summary,
        nativeLanguage: language,
        photosUrls: formData.photos_urls,
        videosUrls: formData.videos_urls
      };

      // Add bilingual summaries if generated
      if (summaryNative) {
        payload.summaryNative = summaryNative;
      }
      if (summaryEnglish) {
        payload.summaryEnglish = summaryEnglish;
      }

      const res = await fetch('/api/testemunhos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setLoading(false);
        setShowSuccess(true);
        showToast("✅ Testemunho salvo com sucesso! Pastas e arquivos criados no Drive.");
      } else {
        showToast(`❌ Erro: ${data.error}`);
        setLoading(false);
      }
    } catch (error) {
      showToast(`❌ Erro ao salvar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      setLoading(false);
    }
  };

  // --- Statistics Calculation ---
  const stats = {
    gender: {
      Homem: 0,
      Mulher: 0,
      Família: 0,
      Jovem: 0,
      Idoso: 0,
      Criança: 0
    },
    nationalities: new Map<string, number>(),
    impact: {
      salvations: 0,
      physicalHealings: 0,
      emotionalHealings: 0,
      bibles: 0,
      baptisms: 0,
      discipleship: 0,
      calls: 0
    }
  };

  MOCK_TESTIMONIES.forEach(t => {
    t.profiles?.forEach(p => {
      if (stats.gender[p.type as keyof typeof stats.gender] !== undefined) {
        stats.gender[p.type as keyof typeof stats.gender]++;
      }
      if (p.nationality) {
        stats.nationalities.set(p.nationality, (stats.nationalities.get(p.nationality) || 0) + 1);
      }
    });

    t.decisions.forEach(d => {
      if (d === 'Aceitou Jesus' || d === 'Se reconciliou com Deus') stats.impact.salvations++;
      if (d === 'Cura física' || d === 'Milagre') stats.impact.physicalHealings++;
      if (d === 'Cura emocional') stats.impact.emotionalHealings++;
      if (d === 'Aceitou uma Bíblia') stats.impact.bibles++;
      if (d === 'Foi batizado' || d === 'Recebeu o Espírito Santo') stats.impact.baptisms++;
      if (d === 'Pediu discipulado' || d === 'Quis participar de célula / grupo' || d === 'Quis visitar a igreja') stats.impact.discipleship++;
      if (d === 'Pediu uma ligação depois') stats.impact.calls++;
    });
  });

  // Reset form when entering form mode
  useEffect(() => {
    if (viewMode === 'form') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [viewMode]);

  if (showSuccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4 bg-slate-50/50">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center space-y-8 border border-slate-100"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">{t('save_success_title' as TranslationKey)}</h2>
            <p className="text-slate-500">{t('save_success_message' as TranslationKey)}</p>
          </div>
          <Button onClick={() => { setShowSuccess(false); setFormData({ team_id: '', testimony_title: '', date: new Date().toISOString().split('T')[0], people_profiles: [], emotional_states: [], initial_actions: [], initial_context: '', events_during: [], during_approach: '', testimony_witnessed: '', final_summary: '', has_media: 'Sim', photos_urls: [], videos_urls: [] }); setActiveTab('info'); setViewMode('feed'); }} className="w-full py-4 text-lg">
            {t('btn_back')}
          </Button>
        </motion.div>
      </div>
    );
  }

  // --- Render Feed View (Mural) ---
  const renderFeedView = () => {
    // Data processing
    const featuredTestimonies = MOCK_TESTIMONIES.filter(t => t.highlight || t.decisions.includes('Milagre'));
    
    const filteredFeed = MOCK_TESTIMONIES.filter(post => {
      if (filters.team && post.teamId !== filters.team) return false;
      if (filters.decision && !post.decisions.includes(filters.decision)) return false;
      return true;
    }).sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return filters.sort === 'newest' ? dateB - dateA : dateA - dateB;
    });

    const feedTabs = [
      { id: 'highlights', labelKey: 'feed_tab_highlights', icon: Star },
      { id: 'wall', labelKey: 'feed_tab_wall', icon: LayoutGrid },
      { id: 'stats', labelKey: 'feed_tab_stats', icon: BarChart3 },
    ];

    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200">
          <div>
             <h1 className="text-lg font-bold text-slate-900">{t('testimony_recent_title' as TranslationKey)}</h1>
             <p className="text-xs text-slate-500 mt-0.5">{t('testimony_recent_subtitle' as TranslationKey)}</p>
          </div>
          
          {(user?.role === 'admin' || user?.role === 'leader' || user?.role === 'evangelist') && (
            <button onClick={() => setViewMode('form')} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors">
              <Plus size={18} /> {t('testimony_btn_new_short' as TranslationKey)}
            </button>
          )}
        </div>

        {/* Feed Tabs Navigation */}
        <div className="flex gap-2 border-b border-slate-200">
           {feedTabs.map((tab) => (
             <button
               key={tab.id}
               onClick={() => setFeedTab(tab.id as any)}
               className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 ${
                 feedTab === tab.id 
                   ? 'text-indigo-600 border-b-indigo-600' 
                   : 'text-slate-500 border-b-transparent hover:text-slate-700'
               }`}
             >
               <tab.icon size={16} />
               <span className="hidden sm:inline">{t(tab.labelKey as TranslationKey)}</span>
             </button>
           ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            
            {/* HIGHLIGHTS TAB */}
            {feedTab === 'highlights' && (
              <motion.div 
                key="highlights"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredTestimonies.map((post, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      key={post.id} 
                      className="bg-gradient-to-br from-amber-50 via-white to-orange-50 p-8 rounded-[2rem] border border-amber-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all cursor-pointer"
                    >
                      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-200 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
                      
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                           <span className="bg-white/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-amber-700 border border-amber-200 shadow-sm flex items-center gap-1">
                             <Star size={12} className="fill-amber-500 text-amber-500"/> {t('feed_highlight_tag' as TranslationKey)}
                           </span>
                           <span className="text-xs font-bold text-amber-900/40">{new Date(post.date).toLocaleDateString()}</span>
                        </div>
                        
                        <h3 className="text-3xl font-black text-slate-900 mb-4 leading-tight tracking-tight group-hover:text-amber-800 transition-colors">
                          <TranslatableText text={post.title || t('testimony_no_title' as TranslationKey)} />
                        </h3>
                        
                        <div className="text-slate-600 text-lg font-medium leading-relaxed mb-8 line-clamp-4">
                          <TranslatableText text={`"${post.summary}"`} />
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-8">
                           {post.decisions.map(d => (
                             <span key={d} className="text-xs font-bold px-3 py-1.5 bg-white rounded-lg border border-amber-100 text-amber-900 flex items-center gap-1.5 shadow-sm">
                               {DECISION_ICONS[d]} {d}
                             </span>
                           ))}
                        </div>

                        <div className="flex items-center gap-3 pt-6 border-t border-amber-200/30">
                           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                             {post.author.charAt(0)}
                           </div>
                           <div>
                              <p className="text-sm font-bold text-slate-900">{post.author}</p>
                              <p className="text--[10px] uppercase font-bold text-amber-700/60">{t('feed_label_author' as TranslationKey)}</p>
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STATS TAB */}
            {feedTab === 'stats' && (
              <motion.div 
                key="stats"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                <Card className="p-8 border-l-4 border-l-blue-500">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-8 flex items-center gap-2">
                    <Users className="w-4 h-4" /> {t('stats_reached_people' as TranslationKey)}
                  </h3>
                  <div className="grid grid-cols-2 gap-y-8 gap-x-4 text-center">
                    {Object.entries(stats.gender).map(([key, value]) => (
                      value > 0 && (
                        <div key={key} className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl">
                          <span className="text-3xl font-black text-slate-800">{value}</span>
                          <span className="text-[10px] uppercase font-bold text-slate-400 mt-2">{key}s</span>
                        </div>
                      )
                    ))}
                  </div>
                </Card>

                <Card className="p-8 border-l-4 border-l-purple-500">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-8 flex items-center gap-2">
                    <Globe className="w-4 h-4" /> {t('stats_nationalities' as TranslationKey)} ({stats.nationalities.size})
                  </h3>
                  <div className="flex flex-wrap gap-3 content-start">
                    {Array.from(stats.nationalities).map(([nat, count]) => (
                      <span key={nat} className="px-4 py-2 bg-white text-slate-700 rounded-xl text-sm font-bold border border-slate-200 flex items-center gap-2 shadow-sm">
                        {nat} <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md text-xs">{count}</span>
                      </span>
                    ))}
                    {stats.nationalities.size === 0 && <span className="text-sm text-slate-400 italic">{t('stats_no_data' as TranslationKey)}</span>}
                  </div>
                </Card>

                <Card className="p-8 border-l-4 border-l-green-500 bg-gradient-to-br from-white to-green-50/30">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-8 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> {t('stats_kingdom_impact_label' as TranslationKey)}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
                      <span className="text-sm font-medium text-slate-600 flex items-center gap-2">❤️ {t('stats_salvations_label' as TranslationKey)}</span> 
                      <span className="font-black text-xl text-slate-900">{stats.impact.salvations}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
                      <span className="text-sm font-medium text-slate-600 flex items-center gap-2">💚 {t('stats_physical_healings_label' as TranslationKey)}</span> 
                      <span className="font-black text-xl text-slate-900">{stats.impact.physicalHealings}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
                      <span className="text-sm font-medium text-slate-600 flex items-center gap-2">💙 {t('stats_emotional_healings_label' as TranslationKey)}</span> 
                      <span className="font-black text-xl text-slate-900">{stats.impact.emotionalHealings}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
                      <span className="text-sm font-medium text-slate-600 flex items-center gap-2">💧 {t('stats_baptisms_label' as TranslationKey)}</span> 
                      <span className="font-black text-xl text-slate-900">{stats.impact.baptisms}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* WALL (FEED) TAB */}
            {feedTab === 'wall' && (
              <motion.div 
                key="wall"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Filter Toolbar */}
                <div className="bg-white p-2 pr-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-2 items-center sticky top-20 z-20">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider px-4 py-2">
                    <Filter className="w-4 h-4" />
                  </div>
                  
                  <select 
                    value={filters.team} 
                    onChange={(e) => setFilters(prev => ({ ...prev, team: e.target.value }))}
                    className="px-4 py-2.5 rounded-xl border-none bg-slate-50 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-100 hover:bg-slate-100 transition-colors w-full md:w-auto cursor-pointer outline-none"
                  >
                    <option value="">{t('testimony_filter_team')}</option>
                    {evangelismos.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                  </select>
        
                  <select 
                    value={filters.decision} 
                    onChange={(e) => setFilters(prev => ({ ...prev, decision: e.target.value }))}
                    className="px-4 py-2.5 rounded-xl border-none bg-slate-50 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-100 hover:bg-slate-100 transition-colors w-full md:w-auto cursor-pointer outline-none"
                  >
                    <option value="">{t('testimony_filter_decision')}</option>
                    {Object.keys(DECISION_ICONS).map(d => <option key={d} value={d}>{DECISION_ICONS[d]} {d}</option>)}
                  </select>
        
                  <div className="flex-1"></div>
        
                  <div className="flex items-center gap-2 w-full md:w-auto border-l border-slate-100 pl-2">
                     <select 
                      value={filters.sort} 
                      onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
                      className="px-4 py-2.5 rounded-xl border-none bg-transparent text-sm font-bold text-slate-600 hover:text-indigo-600 cursor-pointer outline-none text-right"
                    >
                      <option value="newest">{t('testimony_sort_newest')}</option>
                      <option value="oldest">{t('testimony_sort_oldest')}</option>
                    </select>
                  </div>
                </div>

                {/* List */}
                <div className="grid gap-6">
                  {filteredFeed.length === 0 ? (
                    <div className="text-center py-24 text-slate-400 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                      <Sparkles className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                      <p className="font-medium">{t('testimony_no_found_filters' as TranslationKey)}</p>
                    </div>
                  ) : (
                    filteredFeed.map((post, index) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={post.id} 
                        className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 hover:shadow-lg transition-all duration-300 group"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-lg shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                              {post.author.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-700 transition-colors">
                                <TranslatableText text={post.title || t('testimony_no_title' as TranslationKey)} />
                              </h3>
                              <p className="text-sm text-slate-500 flex items-center gap-2 mt-0.5">
                                <span className="font-semibold text-slate-700">{post.author}</span> 
                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span> 
                                {new Date(post.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs">
                             {post.profiles?.map((p, idx) => (
                               <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-600 font-semibold rounded-lg border border-slate-200">{p.type}</span>
                             ))}
                             {post.profiles?.some(p => p.nationality) && (
                               <span className="px-2.5 py-1 bg-white text-slate-600 font-semibold rounded-lg border border-slate-200 flex items-center gap-1 shadow-sm">
                                 <Globe className="w-3 h-3" /> {post.profiles[0].nationality}
                               </span>
                             )}
                          </div>
                        </div>
                        
                        <div className="pl-0 sm:pl-16">
                          <div className="text-slate-700 mb-6 whitespace-pre-line leading-relaxed">
                            <TranslatableText text={post.summary} />
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {post.decisions.map(d => (
                              <span key={d} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors cursor-default group-hover:border-indigo-100">
                                <span>{DECISION_ICONS[d] || '✨'}</span>
                                {d}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    );
  };

  // --- Render Form View ---
  
  const renderTabContent = () => {
     switch(activeTab) {
       case 'info': return (
         <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 pb-20">
           {/* Quick Grid Layout */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {/* Date Card */}
             <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100 hover:shadow-md transition-all">
               <div className="text-2xl mb-3">📅</div>
               <p className="text-xs font-bold text-slate-500 uppercase mb-2">{t('testimony_date' as TranslationKey)}</p>
               <Input 
                 type="date" 
                 value={formData.date} 
                 onChange={(e: any) => setFormData({...formData, date: e.target.value})}
                 className="rounded-lg border-0 bg-white text-sm py-2 w-full"
               />
             </div>

             {/* Title Card */}
             <div className="md:col-span-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 hover:shadow-md transition-all">
               <div className="text-2xl mb-3">📝</div>
               <p className="text-xs font-bold text-slate-500 uppercase mb-2">{t('testimony_title' as TranslationKey)}</p>
               <Input 
                 placeholder={t('testimony_placeholder_title' as TranslationKey)} 
                 value={formData.testimony_title} 
                 onChange={(e: any) => setFormData({...formData, testimony_title: e.target.value})}
                 className="rounded-lg border-0 bg-white text-sm py-2 w-full"
               />
             </div>
           </div>

           {/* Evangelismos Grid */}
           <div>
             <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
               {t('select_evangelismo' as TranslationKey)}
             </p>
             
             {evangelismos.length === 0 ? (
               <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                 <p className="font-bold">{t('testimony_empty_evangelismo')}</p>
                 <p className="text-xs text-yellow-700">{t('testimony_form_ask_admin_create_evangelism' as TranslationKey)}</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                 {evangelismos.map(ev => (
                   <button
                     key={ev.id}
                     onClick={() => setFormData({...formData, evangelismoId: ev.id})}
                     className={`text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                       formData.evangelismoId === ev.id
                         ? 'bg-indigo-100 border-indigo-500 shadow-md transform scale-105'
                         : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                     }`}
                   >
                     <div className="font-bold text-sm text-slate-900">{ev.title}</div>
                     <div className="text-xs text-slate-500">📅 {ev.evangelismoDate}</div>
                     {ev.location && <div className="text-xs text-slate-500">📍 {ev.location}</div>}
                   </button>
                 ))}
               </div>
             )}
           </div>

           {/* Summary Card */}
           {formData.evangelismoId && formData.date && formData.testimony_title && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200 flex items-center gap-3"
             >
               <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
               <div className="text-sm">
                 <p className="font-bold text-green-900">✓ {t('testimony_form_all_filled' as TranslationKey)}</p>
                 <p className="text-xs text-green-700">{evangelismos.find(e => e.id === formData.evangelismoId)?.title} • {new Date(formData.date).toLocaleDateString()}</p>
               </div>
             </motion.div>
           )}
         </motion.div>
       );
       case 'personal': return (
         <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 pb-20">
           {/* Header Section */}
           <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-3xl p-8 shadow-sm">
             <div className="flex items-start justify-between gap-4">
               <div>
                 <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                   <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl">📋</div>
                   {t('testimony_form_basic_info' as TranslationKey)}
                 </h2>
                 <p className="text-slate-600 text-sm">{t('testimony_form_basic_desc' as TranslationKey)}</p>
               </div>
               <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-indigo-200 shadow-sm">
                 <CheckCircle size={16} className="text-green-600" />
                 <span className="text-xs font-bold text-slate-600">{t('testimony_form_step_1_of_5' as TranslationKey)}</span>
               </div>
             </div>
           </div>

           <div className="grid grid-cols-1 gap-8">
             {/* Full Width: People */}
             <div className="space-y-6">
               {/* Header */}
               <div className="flex justify-between items-center px-1">
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                      <span className="text-lg">👤</span>
                      {t('testimony_who_impacted')}
                    </h3>
                    <p className="text-xs text-slate-500">{t('testimony_form_add_impacted_people' as TranslationKey)}</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-100 rounded-xl border border-indigo-200">
                    <span className="text-xs font-bold text-indigo-700">{formData.people_profiles.length}</span>
                    <span className="text-xs font-bold text-indigo-600">{t('testimony_form_persons' as TranslationKey)}</span>
                  </div>
               </div>
               
               {/* Profile Types Grid */}
               <div className="bg-white rounded-2xl p-6 border border-slate-200">
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">{t('testimony_form_click_add_person' as TranslationKey)}</p>
                 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {PROFILE_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => addPersonProfile(opt)}
                      className="flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-2xl border-2 border-slate-200 text-slate-600 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 transition-all bg-white shadow-sm active:scale-95 group hover:shadow-md"
                    >
                      <Plus size={22} className="text-slate-300 group-hover:text-indigo-600" /> 
                      <span className="font-bold text-xs uppercase tracking-wide leading-tight text-center">{t(opt as TranslationKey)}</span>
                    </button>
                  ))}
                </div>
               </div>

                {/* People List */}
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {formData.people_profiles.map((person, idx) => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        key={person.id} 
                        className="bg-gradient-to-br from-white to-slate-50 p-7 rounded-3xl border-2 border-slate-200 shadow-sm relative group hover:shadow-md hover:border-indigo-300 transition-all"
                      >
                        {/* Header com tipo de pessoa e botão remover */}
                        <div className="absolute top-4 right-4 flex gap-2 items-center">
                           <span className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider">{t(person.profile_type as TranslationKey)}</span>
                           <button 
                             onClick={() => removePerson(person.id)} 
                             className="p-1.5 rounded-full hover:bg-red-100 text-slate-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                             title={t('testimony_btn_remove' as TranslationKey)}
                           >
                             <X size={18}/>
                           </button>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-7 pb-4 border-b-2 border-slate-100">
                            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-md">{idx + 1}</div>
                            <h4 className="font-bold text-slate-900">{t('testimony_form_detailed_personal_data' as TranslationKey)}</h4>
                        </div>
                        
                        {/* Novo formulário detalhado */}
                        <PersonDetailsForm
                          personData={person}
                          onUpdate={(field: string, value: any) => updatePerson(person.id, field, value)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {formData.people_profiles.length === 0 && (
                    <div className="text-center py-20 bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl border-2 border-dashed border-slate-300">
                      <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                      <p className="font-bold text-slate-600 text-lg mb-2">{t('testimony_form_no_person_added' as TranslationKey)}</p>
                      <p className="text-sm text-slate-500">{t('testimony_select_profile_hint')}</p>
                    </div>
                  )}
                </div>
             </div>
           </div>
           <div className="flex justify-end pt-6 border-t border-slate-200">
              <Button onClick={handleSaveProgress} variant="ghost" className="text-slate-400 hover:text-indigo-600"><Save size={16} /> {t('btn_save')} {t('testimony_btn_draft' as TranslationKey)}</Button>
           </div>
         </motion.div>
       );

       case 'profile': return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 pb-20 max-w-4xl mx-auto">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-6">
                  <Label className="text-sm">{t('testimony_emotional_state')}</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {EMOTIONAL_STATES.map(state => (
                      <label key={state} className={`flex flex-col items-center justify-center p-4 rounded-2xl border cursor-pointer transition-all text-center h-24 relative overflow-hidden ${formData.emotional_states.includes(state) ? 'bg-slate-800 border-slate-800 text-white shadow-lg transform scale-[1.02]' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300 hover:shadow-md'}`}>
                        <input type="checkbox" className="hidden" checked={formData.emotional_states.includes(state)} onChange={() => toggleArrayItem('emotional_states', state)} />
                        {formData.emotional_states.includes(state) && <div className="absolute top-2 right-2"><CheckCircle size={16} className="text-green-400" /></div>}
                        <span className="text-xs font-bold leading-tight">{t(state as TranslationKey)}</span>
                      </label>
                    ))}
                  </div>
               </div>

               <div className="space-y-6">
                  <Label className="text-sm">{t('testimony_initial_action')}</Label>
                  <div className="space-y-3">
                    {INITIAL_ACTIONS.map(action => (
                      <div key={action} onClick={() => toggleArrayItem('initial_actions', action)} className={`px-5 py-4 rounded-2xl text-sm cursor-pointer transition-all border flex items-center justify-between group ${formData.initial_actions.includes(action) ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-md transform scale-[1.02]' : 'bg-white text-slate-600 border-slate-100 hover:border-indigo-300 hover:shadow-sm'}`}>
                        {t(action as TranslationKey)}
                        {formData.initial_actions.includes(action) ? <CheckCircle size={18} className="text-white" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-200 group-hover:border-indigo-300"/>}
                      </div>
                    ))}
                  </div>
               </div>
             </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mt-8">
              <Label className="mb-3 block text-sm">{t('testimony_context')}</Label>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed font-medium">{t('testimony_context_hint')}</p>
              <div className="relative">
                <Textarea 
                  value={formData.initial_context} 
                  onChange={(e: any) => setFormData({...formData, initial_context: e.target.value})} 
                  placeholder={activeRecordingField === 'initial_context' ? t('testimony_recording') : t('testimony_placeholder_describe_here' as TranslationKey)}
                  className="bg-slate-50 border-slate-200 focus:bg-white min-h-[150px] pr-16" 
                  disabled={isListening && activeRecordingField !== 'initial_context'}
                />
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <button 
                    onClick={() => handleTranscription('initial_context')}
                    disabled={isListening && activeRecordingField !== 'initial_context'}
                    className={`p-1.5 rounded-full border transition-colors shadow-sm flex items-center justify-center ${activeRecordingField === 'initial_context' ? 'bg-red-100 border-red-200 text-red-600 animate-pulse' : 'bg-white border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300'}`}
                    title={activeRecordingField === 'initial_context' ? t('testimony_tooltip_stop_listening' as TranslationKey) : t('testimony_tooltip_start_dictation' as TranslationKey)}
                  >
                    {activeRecordingField === 'initial_context' ? <StopCircle className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                  </button>
                  <button 
                    onClick={() => handleAICorrection('initial_context')}
                    disabled={aiProcessing === 'initial_context' || !formData.initial_context}
                    className="p-1.5 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-purple-600 hover:border-purple-300 transition-colors shadow-sm"
                    title={t('testimony_tooltip_improve_ai' as TranslationKey)}
                  >
                    {aiProcessing === 'initial_context' ? <Loader2 className="w-3 h-3 animate-spin"/> : <Wand2 className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
       );

       case 'events': return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 pb-20 max-w-4xl mx-auto">
            <Card className="p-8">
              <Label className="mb-6 block text-sm">{t('testimony_events_during')}</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {EVENT_OPTIONS.map(evt => (
                  <label key={evt} className={`relative p-4 rounded-2xl border cursor-pointer transition-all flex flex-col items-center text-center justify-center h-28 group ${formData.events_during.includes(evt) ? 'bg-green-50 border-green-500 ring-1 ring-green-500' : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-md'}`}>
                    <input type="checkbox" className="hidden" checked={formData.events_during.includes(evt)} onChange={() => toggleArrayItem('events_during', evt)} />
                    <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center mb-2 transition-colors ${formData.events_during.includes(evt) ? 'bg-green-500 border-green-500' : 'border-slate-300 group-hover:border-green-400'}`}>
                       {formData.events_during.includes(evt) && <CheckCircle size={14} className="text-white" />}
                    </div>
                    <span className={`text-sm font-bold leading-tight ${formData.events_during.includes(evt) ? 'text-green-800' : 'text-slate-600'}`}>{t(evt as TranslationKey)}</span>
                  </label>
                ))}
              </div>
            </Card>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <Label className="mb-3 block text-sm">{t('testimony_approach_details')}</Label>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed font-medium">{t('testimony_approach_hint')}</p>
              <div className="relative">
                <Textarea 
                  value={formData.during_approach} 
                  onChange={(e: any) => setFormData({...formData, during_approach: e.target.value})} 
                  placeholder={activeRecordingField === 'during_approach' ? t('testimony_recording') : t('testimony_placeholder_details_here' as TranslationKey)}
                  className="bg-slate-50 border-slate-200 focus:bg-white min-h-[150px] pr-16" 
                  disabled={isListening && activeRecordingField !== 'during_approach'}
                />
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <button 
                    onClick={() => handleTranscription('during_approach')}
                    disabled={isListening && activeRecordingField !== 'during_approach'}
                    className={`p-1.5 rounded-full border transition-colors shadow-sm flex items-center justify-center ${activeRecordingField === 'during_approach' ? 'bg-red-100 border-red-200 text-red-600 animate-pulse' : 'bg-white border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300'}`}
                    title={activeRecordingField === 'during_approach' ? t('testimony_tooltip_stop_listening' as TranslationKey) : t('testimony_tooltip_start_dictation' as TranslationKey)}
                  >
                    {activeRecordingField === 'during_approach' ? <StopCircle className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                  </button>
                  <button 
                    onClick={() => handleAICorrection('during_approach')}
                    disabled={aiProcessing === 'during_approach' || !formData.during_approach}
                    className="p-1.5 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-purple-600 hover:border-purple-300 transition-colors shadow-sm"
                    title={t('testimony_tooltip_improve_ai' as TranslationKey)}
                  >
                    {aiProcessing === 'during_approach' ? <Loader2 className="w-3 h-3 animate-spin"/> : <Wand2 className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
       );

       case 'decisions': return (
         <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 pb-20 max-w-4xl mx-auto">
           {formData.people_profiles.length === 0 ? (
              <div className="text-center p-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <Users className="mx-auto text-slate-300 mb-4 h-12 w-12" />
                <h3 className="text-xl font-bold text-slate-700">{t('testimony_no_person')}</h3>
                <p className="text-slate-500 mb-8 text-sm mt-2">{t('testimony_add_person_hint')}</p>
                <Button variant="outline" onClick={() => setActiveTab('personal')}>{t('testimony_go_personal')}</Button>
              </div>
           ) : (
             formData.people_profiles.map((person, idx) => (
               <motion.div layout key={person.id} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                 <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                    <span className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-lg font-bold shadow-lg shadow-slate-200">{idx + 1}</span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-xl">{person.name || t(person.profile_type as TranslationKey)}</h3>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">{t('testimony_select_decisions')}</p>
                    </div>
                  </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {DECISION_OPTIONS.map(d => {
                     const isSelected = person.decisions?.includes(d.label);
                     return (
                     <div 
                        key={d.label} 
                        onClick={() => toggleDecision(person.id, d.label)} 
                        className={`p-4 rounded-2xl cursor-pointer flex items-center justify-between transition-all border ${
                            isSelected
                            ? 'bg-green-50 border-green-200 shadow-inner' 
                            : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                     >
                       <div className="flex items-center gap-3">
                           <span className="text-2xl filter drop-shadow-sm">{d.emoji}</span>
                           <span className={`text-sm font-bold ${isSelected ? 'text-green-900' : 'text-slate-700'}`}>{t(d.label as TranslationKey)}</span>
                       </div>
                       {isSelected ? <CheckCircle size={20} className="text-green-600"/> : <div className="w-5 h-5 rounded-full border-2 border-slate-200" />}
                     </div>
                   )})}
                 </div>
               </motion.div>
             ))
           )}
           
           <div className="bg-gradient-to-br from-slate-800 to-slate-950 p-8 rounded-3xl text-white shadow-xl shadow-slate-200">
              <h3 className="font-bold text-xl mb-2 flex items-center gap-2"><Sparkles className="text-yellow-400 fill-yellow-400"/> {t('testimony_personal_account')}</h3>
              <p className="text-xs text-slate-400 mb-6 uppercase tracking-wider font-bold">{t('testimony_personal_hint')}</p>
              <div className="relative">
                <textarea 
                  value={formData.testimony_witnessed} 
                  onChange={(e: any) => setFormData({...formData, testimony_witnessed: e.target.value})} 
                  placeholder={activeRecordingField === 'testimony_witnessed' ? t('testimony_recording') : t('testimony_placeholder_write_personal_account' as TranslationKey)} 
                  className="w-full bg-white/10 border border-white/10 rounded-2xl p-5 pr-16 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-white/20 min-h-[180px] leading-relaxed"
                  disabled={isListening && activeRecordingField !== 'testimony_witnessed'}
                />
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <button 
                      onClick={() => handleTranscription('testimony_witnessed')} 
                      disabled={isListening && activeRecordingField !== 'testimony_witnessed'}
                      className={`p-1.5 rounded-full border transition-colors shadow-sm flex items-center justify-center ${activeRecordingField === 'testimony_witnessed' ? 'bg-red-100 border-red-200 text-red-600 animate-pulse' : 'bg-white border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300'}`}
                      title={activeRecordingField === 'testimony_witnessed' ? t('testimony_tooltip_stop_listening' as TranslationKey) : t('testimony_tooltip_start_dictation' as TranslationKey)}
                  >
                    {activeRecordingField === 'testimony_witnessed' ? <StopCircle className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                  </button>
                  <button 
                      onClick={() => handleAICorrection('testimony_witnessed')} 
                      disabled={aiProcessing === 'testimony_witnessed' || !formData.testimony_witnessed}
                      className="p-1.5 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-purple-600 hover:border-purple-300 transition-colors shadow-sm"
                      title={t('testimony_tooltip_improve_ai' as TranslationKey)}
                  >
                    {aiProcessing === 'testimony_witnessed' ? <Loader2 className="w-3 h-3 animate-spin"/> : <Wand2 className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
         </motion.div>
       );

       case 'summary': return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 pb-20 animate-fadeIn max-w-4xl mx-auto">
            <div className="text-center py-12">
               <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-500 shadow-sm">
                 <Wand2 size={40} />
               </div>
               
               {/* Checkbox for bilingual save */}
               {language !== 'en' && (
                 <div className="flex items-center justify-center gap-3 mb-6">
                   <input
                     type="checkbox"
                     id="save-english"
                     checked={saveInEnglishToo}
                     onChange={(e) => setSaveInEnglishToo(e.target.checked)}
                     className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                   />
                   <label htmlFor="save-english" className="text-sm font-medium text-slate-700 cursor-pointer">
                     {t('testimony_save_english_too' as TranslationKey) || 'Salvar também em inglês'}
                   </label>
                 </div>
               )}
               
               <Button onClick={handleGenerateSummary} className="w-full max-w-xs mx-auto py-4 text-lg shadow-xl shadow-indigo-200 hover:shadow-indigo-300 bg-indigo-600 hover:bg-indigo-700" disabled={aiProcessing === 'final_summary'}>
                 {aiProcessing === 'final_summary' ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 fill-yellow-400 text-yellow-400" />} {t('testimony_generate_summary')}
               </Button>
             </div>

            {testimonyOutput && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-white via-slate-50 to-white border-2 border-indigo-200 rounded-3xl p-12 shadow-xl space-y-8"
              >
                {/* Header com Título */}
                <div className="border-b-2 border-indigo-100 pb-6">
                  <h2 className="text-4xl font-extrabold text-slate-900 mb-6">
                    📝 {testimonyOutput.titulo}
                  </h2>
                  
                  {/* Informações Estruturadas */}
                  <div className="space-y-4 text-sm">
                    <div className="flex items-start gap-4">
                      <span className="font-bold text-slate-600 min-w-fit">📅 Data:</span>
                      <span className="text-slate-800">{testimonyOutput.data}</span>
                    </div>
                    <div className="flex items-start gap-4">
                      <span className="font-bold text-slate-600 min-w-fit">👤 Nome:</span>
                      <span className="text-slate-800">{testimonyOutput.nome}</span>
                    </div>
                    <div className="flex items-start gap-4">
                      <span className="font-bold text-slate-600 min-w-fit">🌍 Nacionalidade:</span>
                      <span className="text-slate-800">{testimonyOutput.nacionalidade}</span>
                    </div>
                    <div className="flex items-start gap-4">
                      <span className="font-bold text-slate-600 min-w-fit">✅ Decisão(ões):</span>
                      <div className="flex flex-wrap gap-2">
                        {testimonyOutput.decisao.split(',').map((d, idx) => (
                          <span key={idx} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                            {DECISION_ICONS[d.trim()] || '•'} {d.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Narrativa */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-slate-900">📖 Testemunho Narrativo:</h3>
                    {!isEditingTestimony && (
                      <button 
                        onClick={() => {
                          setIsEditingTestimony(true);
                          setEditedNarrativa(testimonyOutput.narrativa);
                        }}
                        className="text-sm font-bold text-indigo-600 hover:text-indigo-700 px-3 py-1 rounded-lg hover:bg-indigo-50 transition-all"
                      >
                        ✏️ Editar
                      </button>
                    )}
                  </div>
                  
                  {isEditingTestimony ? (
                    <div className="space-y-4">
                      <textarea 
                        value={editedNarrativa}
                        onChange={(e) => setEditedNarrativa(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-indigo-50 min-h-[300px] text-slate-800 leading-8 resize-y text-justify"
                        placeholder="Edite o texto narrativo aqui..."
                      />
                      <div className="flex gap-3">
                        <Button 
                          onClick={() => {
                            setTestimonyOutput(prev => prev ? {...prev, narrativa: editedNarrativa} : null);
                            setFormData(prev => ({...prev, final_summary: editedNarrativa}));
                            setIsEditingTestimony(false);
                            showToast("✅ Texto atualizado com sucesso!");
                          }}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                        >
                          <CheckCircle className="mr-2" size={18} />
                          {t('btn_confirm_edit')}
                        </Button>
                        <Button 
                          onClick={() => setIsEditingTestimony(false)}
                          variant="outline"
                          className="flex-1"
                        >
                          <X className="mr-2" size={18} />
                          {t('btn_cancel' as TranslationKey)}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-lg text-slate-800 leading-8 font-normal text-justify">
                      {testimonyOutput.narrativa}
                    </p>
                  )}
                </div>

                {/* Botões de Ação */}
                {!isEditingTestimony && (
                  <div className="flex gap-4 pt-6 border-t-2 border-indigo-100">
                    <Button onClick={handleFinalSave} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200">
                      {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                      {t('testimony_save') || 'Salvar Testemunho'}
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

             <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <Label className="mb-6 block text-sm">📸 Mídia do Evento (Google Drive)</Label>
                <div className="mb-6">
                  <div className="grid grid-cols-3 gap-4">
                    {['Sim', 'Não', 'Enviar Depois'].map(opt => (
                      <button key={opt} onClick={() => setFormData({...formData, has_media: opt})} className={`py-4 rounded-2xl text-sm font-bold border transition-all ${formData.has_media === opt ? 'bg-slate-900 text-white border-slate-900 shadow-lg transform scale-105' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                {formData.has_media === 'Sim' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <MediaUpload 
                      onPhotosUpload={(photos) => {
                        setFormData(prev => ({
                          ...prev, 
                          photos_urls: photos.map(p => p.webViewLink || '')
                        }));
                      }}
                      onVideosUpload={(videos) => {
                        setFormData(prev => ({
                          ...prev, 
                          videos_urls: videos.map(v => v.webViewLink || '')
                        }));
                      }}
                      maxFiles={5}
                    />
                  </motion.div>
                )}
             </div>
          </motion.div>
       );
       default: return null;
     }
  };

  const tabs = [
    { id: 'info', icon: Users, label: 'Equipe & Detalhes' },
    { id: 'personal', icon: User, label: t('testimony_tab_personal') },
    { id: 'profile', icon: Heart, label: 'Perfil' },
    { id: 'events', icon: MessageSquare, label: 'Eventos' },
    { id: 'decisions', icon: Sparkles, label: t('testimony_tab_decisions') },
    { id: 'summary', icon: FileText, label: t('testimony_tab_summary') },
  ];

  return (
    <div className="bg-slate-50/50 text-slate-800 font-sans min-h-[calc(100vh-100px)]">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: '-50%' }} 
            animate={{ opacity: 1, y: 0, x: '-50%' }} 
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-6 left-1/2 bg-slate-900/90 backdrop-blur text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-3"
          >
            <CheckCircle size={18} className="text-green-400" />
            <span className="font-medium text-sm">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
                {viewMode === 'form' && (
                  <button onClick={() => setViewMode('feed')} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                    <ChevronLeft className="w-5 h-5 text-slate-600"/>
                  </button>
                )}
                <h1 className="text-base font-bold text-slate-900">
                {viewMode === 'form' ? t('label_new_testimony') : t('label_testimonies')}
                </h1>
            </div>
            
            {viewMode === 'form' && (
                <div className="text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg">
                    {tabs.findIndex(t => t.id === activeTab) + 1}/{tabs.length}
                </div>
            )}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-6">
        
        {/* Stepper for Form Mode */}
        {viewMode === 'form' && (
            <div className="flex justify-center mb-6 overflow-x-auto">
                <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
                    {tabs.map((t, idx) => {
                        const isActive = activeTab === t.id;
                        const isCompleted = tabs.findIndex(tab => tab.id === activeTab) > idx;
                        
                        return (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                            isActive 
                                ? 'bg-indigo-600 text-white shadow-sm' 
                                : isCompleted 
                                ? 'text-indigo-600 bg-indigo-50'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <t.icon size={14} />
                            <span className="hidden sm:inline">{t.label}</span>
                        </button>
                        )
                    })}
                </div>
            </div>
        )}

        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {viewMode === 'feed' ? renderFeedView() : renderTabContent()}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Actions for Form */}
      {viewMode === 'form' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 z-40">
            <div className="max-w-6xl mx-auto flex gap-3 justify-between">
            <button onClick={() => setViewMode('feed')} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                {t('btn_cancel' as TranslationKey)}
            </button>
            
            {activeTab === 'summary' ? (
                <button 
                onClick={handleFinalSave}
                disabled={loading}
                className="px-6 py-2.5 text-sm font-bold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />} 
                {t('btn_save' as TranslationKey)}
                </button>
            ) : (
                <button 
                onClick={() => {
                    const idx = tabs.findIndex(t => t.id === activeTab);
                    if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1].id);
                }}
                className="px-6 py-2.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                {t('btn_next')} <ChevronRight size={16} />
                </button>
            )}
            </div>
        </div>
      )}
    </div>
  );
};

export const Testimony = React.memo(TestimonyComponent);
