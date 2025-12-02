import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Send, User, MessageCircle, 
  Calendar, CheckCircle, PlusCircle, Shield, Users, Bell, EyeOff, BookOpen, Edit3, Save, ArrowLeft, FileText, Target, ChevronDown, ChevronUp, Trash2, Archive,
  Sparkles, Loader2
} from 'lucide-react';
import { useAuth } from '../App';
import { MOCK_PRAYERS, MOCK_AGENDAS, MOCK_NEW_CONVERTS } from '../mockData';
import { useLanguage } from '../contexts/LanguageContext';
import { SmartInput } from '../components/SmartInput';
import { useGemini } from '../hooks/useGemini';
import { TranslatableText } from '../components/TranslatableText';

// --- Main Prayer Room ---
export const PrayerRoom = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { generatePrayerAgenda, isProcessing } = useGemini();
  
  // Navigation States
  const [mainTab, setMainTab] = useState<'new_request' | 'wall' | 'create_agenda' | 'view_agenda'>('wall');
  const [wallTab, setWallTab] = useState<'my_requests' | 'team' | 'new_converts'>('team');
  
  // Data States
  const [prayers, setPrayers] = useState(MOCK_PRAYERS);
  const [agendas, setAgendas] = useState(MOCK_AGENDAS);
  
  // Interaction States
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [feedbackType, setFeedbackType] = useState<'suggestion' | 'feedback'>('feedback');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Agenda View State
  const [expandedAgendaId, setExpandedAgendaId] = useState<string | null>(null);

  // Agenda Form State (New Structure)
  const [agendaMode, setAgendaMode] = useState<'edit' | 'preview'>('edit');
  const [generatedContent, setGeneratedContent] = useState('');
  const [agendaTopic, setAgendaTopic] = useState(''); // New topic input
  
  const [agendaForm, setAgendaForm] = useState({
    title: '',
    week: '',
    vision: '',
    objective: '',
    days: [
      { id: 'mon', label: 'SEGUNDA', theme: '', prayer: '', declaration: '' },
      { id: 'tue', label: 'TERÇA', theme: '', prayer: '', declaration: '' },
      { id: 'wed', label: 'QUARTA', theme: '', prayer: '', declaration: '' },
      { id: 'thu', label: 'QUINTA', theme: '', prayer: '', declaration: '' },
      { id: 'fri', label: 'SEXTA', theme: '', prayer: '', declaration: '' },
      { id: 'weekend', label: 'FIM-DE-SEMANA', theme: '', prayer: '', declaration: '' },
    ]
  });

  // Permissions Logic
  const role = user?.role || 'guest';
  const canReply = role === 'admin' || role === 'intercessor';
  const canCreateAgenda = role === 'admin';
  const canSeeAnonymous = role === 'admin' || role === 'intercessor';
  const canManageAgenda = role === 'admin';

  // --- Handlers ---

  const handleCreateRequest = () => {
    if (!responseText.trim()) return;
    const newRequest = {
      id: Date.now().toString(),
      userName: isAnonymous ? 'Anônimo' : (user?.full_name || 'Usuário'),
      userRole: role,
      requestText: responseText,
      created_date: new Date().toISOString(),
      status: 'active' as const,
      isAnonymous: isAnonymous,
      replies: []
    };
    setPrayers([newRequest, ...prayers]);
    setResponseText('');
    setMainTab('wall');
    setWallTab('my_requests'); // Redirect to see their new request
    setIsAnonymous(false);
  };

  const handleReply = (id: string, type: 'prayer' | 'new_convert') => {
    if (type === 'prayer') {
        const updatedPrayers = prayers.map(p => {
            if (p.id === id) {
                return {
                    ...p,
                    replies: [...(p.replies || []), { id: Date.now().toString(), author: user?.full_name || 'Staff', text: responseText, date: new Date().toISOString() }]
                }
            }
            return p;
        });
        setPrayers(updatedPrayers);
    }
    setReplyingTo(null);
    setResponseText('');
  };

  // --- AGENDA LOGIC ---

  const handleGenerateSmartAgenda = async () => {
    if (!agendaTopic.trim()) return;
    
    const result = await generatePrayerAgenda(agendaTopic);
    
    if (result) {
        setAgendaForm(prev => ({
            ...prev,
            title: result.title || prev.title,
            vision: result.vision || prev.vision,
            objective: result.objective || prev.objective,
            days: prev.days.map(day => {
                const generatedDay = result.days?.find((d: any) => d.id === day.id || d.label === day.label);
                return generatedDay ? { ...day, ...generatedDay } : day;
            })
        }));
    }
  };

  const handleUpdateDay = (index: number, field: string, value: string) => {
    const newDays = [...agendaForm.days];
    newDays[index] = { ...newDays[index], [field]: value };
    setAgendaForm({ ...agendaForm, days: newDays });
  };

  const showPreview = () => {
    const daysContent = agendaForm.days.map(day => 
      `📅 **${day.label}** | *${day.theme}*\n🙏 ${day.prayer}\n🗣️ ${day.declaration}`
    ).join('\n\n----------------------------------------\n\n');

    const formatted = `
📜 **${agendaForm.title}**
🗓️ **Semana:** ${agendaForm.week}

🎯 **${t('agenda_section_1')}**
👁️ *${t('agenda_vision')}:* ${agendaForm.vision}
🚀 *${t('agenda_objective')}:* ${agendaForm.objective}

========================================

${daysContent}
    `.trim();
    
    setGeneratedContent(formatted);
    setAgendaMode('preview');
  };

  const handlePublishAgenda = () => {
      const newAgenda = {
          id: Date.now().toString(),
          title: agendaForm.title,
          week: agendaForm.week,
          content: generatedContent,
          created_date: new Date().toISOString(),
          author: user?.full_name || 'Admin',
          status: 'active' as const
      };
      setAgendas([newAgenda, ...agendas]);
      setAgendaMode('edit');
      setMainTab('view_agenda');
  };

  const handleFeedback = (agendaId: string) => {
      console.log(`Sending ${feedbackType} to agenda ${agendaId}: ${responseText}`);
      setReplyingTo(null);
      setResponseText('');
  };

  const toggleAgendaDetails = (id: string) => {
    if (expandedAgendaId === id) {
      setExpandedAgendaId(null);
    } else {
      setExpandedAgendaId(id);
    }
  };

  const handleDeleteAgenda = (id: string) => {
    if (confirm('Are you sure?')) {
      setAgendas(agendas.filter(a => a.id !== id));
    }
  };

  const handleArchiveAgenda = (id: string) => {
    if (confirm('Archive?')) {
      setAgendas(agendas.map(a => a.id === id ? { ...a, status: 'archived' } : a));
    }
  };


  // --- Render Sections ---

  const renderNewRequestTab = () => (
    <div className="max-w-2xl mx-auto animate-fadeIn">
       <div className="bg-white p-8 rounded-2xl shadow-lg border border-pink-100">
           <div className="text-center mb-8">
             <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 text-pink-500">
               <Heart className="w-8 h-8" />
             </div>
             <h2 className="text-2xl font-bold text-slate-900">{t('prayer_how_to_pray')}</h2>
             <p className="text-slate-500">{t('prayer_desc')}</p>
           </div>
           
           <SmartInput 
             value={responseText} 
             onChange={setResponseText} 
             placeholder={t('prayer_placeholder')}
             className="mb-4"
           />

           <div className="flex items-center justify-between mb-6 bg-slate-50 p-3 rounded-xl">
             <label className="flex items-center gap-3 cursor-pointer">
               <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isAnonymous ? 'bg-slate-800 border-slate-800' : 'border-slate-300 bg-white'}`}>
                 {isAnonymous && <CheckCircle className="w-3 h-3 text-white" />}
               </div>
               <input type="checkbox" className="hidden" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} />
               <span className="text-sm font-medium text-slate-700">{t('prayer_anonymous')}</span>
             </label>
             {isAnonymous && <EyeOff className="w-4 h-4 text-slate-400" />}
           </div>

           <button 
             onClick={handleCreateRequest}
             disabled={!responseText.trim()}
             className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-pink-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
           >
             <Send className="w-5 h-5" />
             {t('prayer_btn_send')}
           </button>
       </div>
    </div>
  );

  const renderWallTab = () => {
    // Sub-tab logic
    const renderSubTab = () => {
      switch (wallTab) {
        case 'my_requests': {
          const myRequests = prayers.filter(p => p.userName === user?.full_name);

          return (
            <div className="space-y-4 animate-fadeIn">
              {myRequests.length === 0 ? (
                <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Empty.
                </div>
              ) : (
                myRequests.map(prayer => {
                   const hasReply = prayer.replies && prayer.replies.length > 0;
                   return (
                    <motion.div layout key={prayer.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
                      {hasReply && (
                        <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10 flex items-center gap-1">
                          <Bell className="w-3 h-3" /> Reply
                        </div>
                      )}
                      
                      <div className="mb-3">
                        <div className="text-slate-800 text-lg leading-relaxed">
                          <TranslatableText text={`"${prayer.requestText}"`} />
                        </div>
                        <p className="text-xs text-slate-400 mt-2">{new Date(prayer.created_date).toLocaleDateString()}</p>
                      </div>

                      {hasReply && (
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100 mt-4 animate-slideUp">
                           <h5 className="text-xs font-bold text-green-700 uppercase mb-2 flex items-center gap-1">
                             <MessageCircle className="w-3 h-3" /> Reply
                           </h5>
                           {prayer.replies?.map(r => (
                             <div key={r.id} className="text-sm text-slate-700">
                               <span className="font-semibold">{r.author}:</span> 
                               <TranslatableText text={r.text} className="inline ml-1" />
                             </div>
                           ))}
                        </div>
                      )}
                    </motion.div>
                   );
                })
              )}
            </div>
          );
        }
        case 'team': {
           const teamRequests = prayers.filter(p => {
             const isMe = p.userName === user?.full_name;
             if (isMe) return false;
             if (p.isAnonymous && !canSeeAnonymous) return false;
             return true;
           });

           return (
             <div className="space-y-4 animate-fadeIn">
               {teamRequests.length === 0 ? (
                 <div className="text-center py-12 text-slate-400">Empty.</div>
               ) : (
                 teamRequests.map(prayer => (
                  <div key={prayer.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${prayer.isAnonymous ? 'bg-slate-100 text-slate-500' : 'bg-pink-100 text-pink-500'}`}>
                        {prayer.isAnonymous ? <EyeOff className="w-5 h-5"/> : <User className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                         <div className="flex justify-between items-center">
                            <h4 className="font-bold text-slate-900">{prayer.userName}</h4>
                            <span className="text-xs text-slate-400">{new Date(prayer.created_date).toLocaleDateString()}</span>
                         </div>
                         <p className="text-xs text-slate-500 capitalize mb-2">{prayer.userRole}</p>
                         <div className="text-slate-700 leading-relaxed">
                           <TranslatableText text={prayer.requestText} />
                         </div>
                      </div>
                    </div>

                    {/* Reply Logic */}
                    {canReply ? (
                        replyingTo === prayer.id ? (
                          <div className="ml-0 md:ml-14 mt-4 animate-fadeIn">
                              <SmartInput value={responseText} onChange={setResponseText} placeholder={t('prayer_reply_placeholder')} />
                              <div className="flex gap-2 mt-2 justify-end">
                                  <button onClick={() => setReplyingTo(null)} className="text-sm text-slate-500 px-3 py-1">{t('btn_cancel')}</button>
                                  <button onClick={() => handleReply(prayer.id, 'prayer')} className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium">{t('prayer_reply_btn')}</button>
                              </div>
                          </div>
                        ) : (
                          <button onClick={() => { setReplyingTo(prayer.id); setResponseText(user?.role === 'intercessor' ? 'Estamos orando por você 🙏' : ''); }} className="ml-14 text-sm text-pink-600 font-bold hover:underline flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" /> {t('prayer_reply_btn')}
                          </button>
                        )
                    ) : (
                      <div className="ml-14 flex items-center gap-2">
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">{t('btn_view')}</span>
                      </div>
                    )}
                  </div>
                 ))
               )}
             </div>
           );
        }
        case 'new_converts': {
          return (
            <div className="space-y-4 animate-fadeIn">
               {MOCK_NEW_CONVERTS.map(nc => (
                 <div key={nc.id} className="bg-white p-6 rounded-2xl shadow-sm border border-green-100 flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-lg text-slate-900">{nc.name}</h4>
                            <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">{t('prayer_new_convert_label')}</span>
                        </div>
                        <p className="text-sm text-slate-500 mb-3">{t('testimony_label_date')}: {new Date(nc.date).toLocaleDateString()}</p>
                        {nc.notes && (
                          <div className="text-slate-700 italic">
                            "<TranslatableText text={nc.notes} className="inline" />"
                          </div>
                        )}
                    </div>

                    <div className="md:w-1/3 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                        {canReply ? (
                            replyingTo === nc.id ? (
                              <div className="animate-fadeIn">
                                  <SmartInput value={responseText} onChange={setResponseText} placeholder="Registrar contato/oração..." />
                                  <div className="flex gap-2 mt-2 justify-end">
                                      <button onClick={() => setReplyingTo(null)} className="text-sm text-slate-500 px-3 py-1">{t('btn_cancel')}</button>
                                      <button onClick={() => handleReply(nc.id, 'new_convert')} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium">{t('btn_save')}</button>
                                  </div>
                              </div>
                            ) : (
                                <button onClick={() => { setReplyingTo(nc.id); setResponseText(''); }} className="w-full py-2 bg-green-50 text-green-700 font-bold rounded-lg hover:bg-green-100 flex items-center justify-center gap-2 transition-colors">
                                    <MessageCircle className="w-4 h-4" /> {t('prayer_btn_intercede')}
                                </button>
                            )
                        ) : (
                            <div className="text-center text-slate-400 text-sm py-2 bg-slate-50 rounded-lg">{t('btn_view')}</div>
                        )}
                    </div>
                </div>
               ))}
            </div>
          );
        }
      }
    };

    return (
      <div>
        {/* Wall Sub Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
           <button 
             onClick={() => setWallTab('my_requests')}
             className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${wallTab === 'my_requests' ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
           >
             {t('prayer_subtab_my')}
           </button>
           <button 
             onClick={() => setWallTab('team')}
             className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${wallTab === 'team' ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
           >
             {t('prayer_subtab_team')}
           </button>
           <button 
             onClick={() => setWallTab('new_converts')}
             className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${wallTab === 'new_converts' ? 'bg-green-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
           >
             <Users className="w-4 h-4" /> {t('prayer_subtab_new')}
           </button>
        </div>
        {renderSubTab()}
      </div>
    );
  };

  const renderCreateAgendaTab = () => (
    <div className="space-y-6 animate-fadeIn">
       {/* Admin Create Agenda - New Structure */}
       {canCreateAgenda ? (
         <div className="mb-8">
           <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 overflow-hidden">
             
             {/* Header Section */}
             <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex justify-between items-center">
               <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                 <Target className="w-5 h-5" /> 
                 {t('agenda_new_title')}
               </h3>
               {agendaMode === 'preview' && (
                 <button onClick={() => setAgendaMode('edit')} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                   <ArrowLeft className="w-3 h-3"/> {t('btn_back')}
                 </button>
               )}
             </div>

             {agendaMode === 'edit' ? (
                <div className="p-6 space-y-8">
                   
                   {/* AI Generation Input */}
                   <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-xl text-white shadow-md">
                      <h4 className="font-bold text-sm uppercase mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-yellow-300"/> Gerar com IA</h4>
                      <div className="flex gap-3">
                          <input 
                            type="text" 
                            value={agendaTopic}
                            onChange={(e) => setAgendaTopic(e.target.value)}
                            placeholder={t('agenda_topic_placeholder')}
                            className="flex-1 bg-white/20 border border-white/30 text-white placeholder:text-indigo-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
                          />
                          <button 
                            onClick={handleGenerateSmartAgenda}
                            disabled={isProcessing || !agendaTopic.trim()}
                            className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                          >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            {t('btn_generate_ai')}
                          </button>
                      </div>
                   </div>

                   {/* SECTION 1: Focus & Vision */}
                   <div className="space-y-4">
                     <div className="flex items-center gap-2 mb-2 text-indigo-700 font-bold border-b border-indigo-100 pb-2">
                       <Target className="w-5 h-5" />
                       <span>{t('agenda_section_1')}</span>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">{t('agenda_campaign')}</label>
                          <input 
                            type="text" 
                            value={agendaForm.title} 
                            onChange={e => setAgendaForm({...agendaForm, title: e.target.value})}
                            className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            placeholder="Ex: Janeiro de 2026 - Mês da Colheita"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">{t('agenda_week')}</label>
                          <input 
                            type="text" 
                            value={agendaForm.week} 
                            onChange={e => setAgendaForm({...agendaForm, week: e.target.value})}
                            className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            placeholder="Ex: 10-17 Março"
                          />
                        </div>
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">{t('agenda_vision')}</label>
                        <input 
                          type="text" 
                          value={agendaForm.vision} 
                          onChange={e => setAgendaForm({...agendaForm, vision: e.target.value})}
                          className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                          placeholder="Ex: 1 Milhão de Almas Serão Alcançadas"
                        />
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">{t('agenda_objective')}</label>
                        <input 
                          type="text" 
                          value={agendaForm.objective} 
                          onChange={e => setAgendaForm({...agendaForm, objective: e.target.value})}
                          className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                          placeholder="Ex: Orar por 5.000 Evangelistas"
                        />
                     </div>
                   </div>

                   {/* SECTION 2: Daily Themes */}
                   <div className="space-y-6">
                     <div className="flex items-center gap-2 mb-2 text-indigo-700 font-bold border-b border-indigo-100 pb-2">
                       <Calendar className="w-5 h-5" />
                       <span>{t('agenda_section_2')}</span>
                     </div>
                     
                     {agendaForm.days.map((day, index) => (
                       <div key={day.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-bold bg-slate-900 text-white px-2 py-1 rounded">{day.label}</span>
                          </div>
                          <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1">{t('agenda_theme')}</label>
                                <input 
                                  value={day.theme}
                                  onChange={(e) => handleUpdateDay(index, 'theme', e.target.value)}
                                  className="w-full p-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <SmartInput 
                                label={t('agenda_key_prayer')}
                                value={day.prayer} 
                                onChange={(val) => handleUpdateDay(index, 'prayer', val)} 
                                minHeight="80px"
                              />
                              <SmartInput 
                                label={t('agenda_key_declaration')}
                                value={day.declaration} 
                                onChange={(val) => handleUpdateDay(index, 'declaration', val)} 
                                minHeight="80px"
                              />
                            </div>
                          </div>
                       </div>
                     ))}
                   </div>

                   <div className="flex justify-end pt-4 gap-3">
                     <button onClick={() => setMainTab('view_agenda')} className="px-6 py-3 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50">
                        {t('btn_cancel')}
                     </button>
                     <button onClick={showPreview} className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg hover:shadow-indigo-200 transition-all flex items-center gap-2">
                        <EyeOff className="w-4 h-4"/> {t('agenda_preview')}
                     </button>
                   </div>
                </div>
             ) : (
               // Preview Mode
               <div className="p-6 space-y-4 animate-fadeIn">
                 <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-green-800 text-sm mb-4 flex items-center gap-2">
                   <CheckCircle className="w-5 h-5"/>
                   <span>{t('agenda_review')}</span>
                 </div>
                 
                 <div className="w-full h-[600px] p-8 border border-slate-200 rounded-xl font-medium text-slate-700 leading-relaxed bg-white overflow-y-auto whitespace-pre-wrap shadow-inner font-serif">
                    <TranslatableText text={generatedContent} />
                 </div>
                 
                 <div className="flex justify-end pt-4 gap-3">
                   <button onClick={() => setAgendaMode('edit')} className="px-6 py-3 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50">
                     <Edit3 className="w-4 h-4 inline mr-2"/> {t('btn_edit')}
                   </button>
                   <button onClick={handlePublishAgenda} className="px-6 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-md flex items-center gap-2">
                     <Save className="w-5 h-5" /> {t('btn_publish')}
                   </button>
                 </div>
               </div>
             )}
           </div>
         </div>
       ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900">{t('admin_access_denied')}</h3>
            <p className="text-slate-500">Only admins can create agendas.</p>
          </div>
       )}
    </div>
  );

  const renderViewAgendaTab = () => (
     <div className="space-y-6 animate-fadeIn">
        {agendas.filter(a => a.status !== 'archived').length === 0 ? (
          <div className="text-center py-12 text-slate-500">Empty.</div>
        ) : (
          agendas.filter(a => a.status !== 'archived').map(agenda => {
            const isExpanded = expandedAgendaId === agenda.id;
            
            return (
              <motion.div 
                layout
                key={agenda.id} 
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all ${isExpanded ? 'border-indigo-200 ring-4 ring-indigo-50' : 'border-slate-100'}`}
              >
                  {/* Agenda Header (Always Visible) */}
                  <div 
                    onClick={() => toggleAgendaDetails(agenda.id)}
                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                      <div>
                          <h3 className="font-bold text-lg text-slate-900">{agenda.title}</h3>
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold flex items-center gap-1 mt-1 w-fit">
                            <Calendar className="w-3 h-3"/> {agenda.week}
                          </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-xs opacity-50 hidden sm:flex items-center gap-1">
                          <User className="w-3 h-3"/> {agenda.author}
                        </div>
                        <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                          {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                        </button>
                      </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-100"
                      >
                         <div className="p-8 whitespace-pre-line text-slate-700 leading-relaxed text-lg font-serif bg-slate-50/50">
                             <TranslatableText text={agenda.content} />
                         </div>
                         
                         {/* Action Buttons Footer */}
                         <div className="bg-slate-50 p-4 border-t border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            
                            {/* Feedback Section */}
                            <div className="w-full md:w-2/3">
                                {replyingTo === agenda.id ? (
                                    <div className="animate-fadeIn">
                                        <div className="flex gap-4 mb-3">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" checked={feedbackType === 'suggestion'} onChange={() => setFeedbackType('suggestion')} className="text-indigo-600"/>
                                                <span className="text-sm font-medium">Sugestão</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" checked={feedbackType === 'feedback'} onChange={() => setFeedbackType('feedback')} className="text-indigo-600"/>
                                                <span className="text-sm font-medium">Feedback</span>
                                            </label>
                                        </div>
                                        <SmartInput value={responseText} onChange={setResponseText} placeholder="Digite seu feedback..." className="mb-3" />
                                        <div className="flex gap-2 justify-end">
                                            <button onClick={() => setReplyingTo(null)} className="text-sm text-slate-500 px-3 py-1">{t('btn_cancel')}</button>
                                            <button onClick={() => handleFeedback(agenda.id)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">{t('prayer_btn_send')}</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={() => { setReplyingTo(agenda.id); setResponseText(''); }} className="text-sm text-indigo-600 font-bold hover:underline flex items-center gap-2">
                                        <MessageCircle className="w-4 h-4" /> {t('agenda_btn_feedback')}
                                    </button>
                                )}
                            </div>

                            {/* Admin Actions */}
                            {canManageAgenda && (
                              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleArchiveAgenda(agenda.id); }}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded-lg transition-colors"
                                >
                                  <Archive className="w-3 h-3" /> {t('btn_archive')}
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDeleteAgenda(agenda.id); }}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" /> {t('btn_delete')}
                                </button>
                              </div>
                            )}
                         </div>

                         {/* Close Button at bottom for convenience */}
                         <div className="p-2 bg-white flex justify-center border-t border-slate-100">
                            <button 
                              onClick={() => toggleAgendaDetails(agenda.id)}
                              className="text-xs font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-wide py-2"
                            >
                              {t('btn_close')}
                            </button>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Simple Expand Button if not expanded (Secondary trigger) */}
                  {!isExpanded && (
                    <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex justify-center">
                       <button 
                          onClick={() => toggleAgendaDetails(agenda.id)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wide flex items-center gap-1"
                       >
                         {t('btn_details')} <ChevronDown className="w-3 h-3" />
                       </button>
                    </div>
                  )}
              </motion.div>
            );
          })
        )}
     </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('prayer_title')}</h1>
        <p className="text-slate-500">{t('prayer_subtitle')}</p>
      </div>

      {/* Main Tabs Header */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button 
          onClick={() => setMainTab('new_request')}
          className={`flex-1 min-w-[150px] p-4 rounded-xl font-bold transition-all text-center flex flex-col items-center justify-center gap-2 border-2 ${
            mainTab === 'new_request' 
              ? 'border-pink-500 bg-pink-50 text-pink-600' 
              : 'border-white bg-white text-slate-500 hover:border-pink-100 hover:text-pink-400 shadow-sm'
          }`}
        >
          <PlusCircle className="w-6 h-6" /> 
          <span>{t('prayer_tab_request')}</span>
        </button>

        <button 
          onClick={() => setMainTab('wall')}
          className={`flex-1 min-w-[150px] p-4 rounded-xl font-bold transition-all text-center flex flex-col items-center justify-center gap-2 border-2 ${
            mainTab === 'wall' 
              ? 'border-slate-800 bg-slate-50 text-slate-900' 
              : 'border-white bg-white text-slate-500 hover:border-slate-200 hover:text-slate-700 shadow-sm'
          }`}
        >
          <Shield className="w-6 h-6" /> 
          <span>{t('prayer_tab_wall')}</span>
        </button>

        {/* Admin Only: Create Agenda */}
        {canCreateAgenda && (
          <button 
            onClick={() => setMainTab('create_agenda')}
            className={`flex-1 min-w-[150px] p-4 rounded-xl font-bold transition-all text-center flex flex-col items-center justify-center gap-2 border-2 ${
              mainTab === 'create_agenda' 
                ? 'border-indigo-500 bg-indigo-50 text-indigo-600' 
                : 'border-white bg-white text-slate-500 hover:border-indigo-100 hover:text-indigo-400 shadow-sm'
            }`}
          >
            <Edit3 className="w-6 h-6" /> 
            <span>{t('prayer_tab_create_agenda')}</span>
          </button>
        )}

        <button 
          onClick={() => setMainTab('view_agenda')}
          className={`flex-1 min-w-[150px] p-4 rounded-xl font-bold transition-all text-center flex flex-col items-center justify-center gap-2 border-2 ${
            mainTab === 'view_agenda' 
              ? 'border-purple-500 bg-purple-50 text-purple-600' 
              : 'border-white bg-white text-slate-500 hover:border-purple-100 hover:text-purple-400 shadow-sm'
          }`}
        >
          <FileText className="w-6 h-6" /> 
          <span>{t('prayer_tab_view_agenda')}</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {mainTab === 'new_request' && renderNewRequestTab()}
        {mainTab === 'wall' && renderWallTab()}
        {mainTab === 'create_agenda' && renderCreateAgendaTab()}
        {mainTab === 'view_agenda' && renderViewAgendaTab()}
      </div>
    </div>
  );
};