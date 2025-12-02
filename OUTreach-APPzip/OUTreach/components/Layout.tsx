import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, LogOut, Home, Layers, Calendar, 
  Heart, MessageSquare, Briefcase, GraduationCap, 
  PlusCircle, Sparkles, Users, UserPlus, Radio, Globe, BookOpen
} from 'lucide-react';
import { UserRole, NavigationItem, User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslationKey } from '../i18n';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  setPage: (page: string) => void;
  user: User | null;
  logout: () => void;
}

const getLinks = (role: UserRole): NavigationItem[] => {
  // Public (Guest) only sees Registration in the sidebar if they somehow bypass the landing
  if (role === 'guest') return [];

  const allLinks: NavigationItem[] = [
    // Common access
    { name: 'menu_home', page: 'Home', icon: Home, roles: ['admin', 'leader', 'evangelist', 'intercessor'] },
    
    // Dashboards
    { name: 'menu_dashboard', page: 'Dashboard', icon: Layers, roles: ['admin', 'leader', 'evangelist', 'intercessor'] },
    
    // Admin Specific
    { name: 'menu_admin', page: 'Admin', icon: Briefcase, roles: ['admin'] },
    
    // Leader Specific (Team Management)
    { name: 'menu_team', page: 'TeamManagement', icon: Users, roles: ['leader'] },
    
    // Operational (Agenda/Events)
    { name: 'menu_agenda', page: 'MyAgenda', icon: Calendar, roles: ['leader', 'evangelist', 'intercessor'] },
    { name: 'menu_events', page: 'Evangelismo', icon: Users, roles: ['admin', 'leader', 'evangelist', 'intercessor'] }, // Evangelismo
    { name: 'menu_global_events', page: 'GlobalEvents', icon: Calendar, roles: ['admin', 'leader', 'evangelist', 'intercessor'] }, // Global Events
    
    // Spiritual & Development
    { name: 'menu_prayer', page: 'PrayerRoom', icon: Heart, roles: ['admin', 'leader', 'evangelist', 'intercessor'] },
    { name: 'menu_testimony', page: 'Testimony', icon: MessageSquare, roles: ['admin', 'leader', 'evangelist', 'intercessor'] },
    { name: 'menu_training', page: 'Training', icon: BookOpen, roles: ['admin', 'leader', 'evangelist', 'intercessor'] },
  ];

  return allLinks.filter(link => link.roles.includes(role));
};

export const Layout: React.FC<LayoutProps> = React.memo(({ children, currentPage, setPage, user, logout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();
  const role = user?.role || 'guest';
  const links = getLinks(role);

  const handleNav = (page: string) => {
    setPage(page);
    setSidebarOpen(false);
  };

  const roleLabels: Record<string, string> = {
    guest: 'Visitante',
    admin: 'Administrador',
    leader: 'Líder',
    evangelist: 'Evangelista',
    intercessor: 'Intercessor'
  };

  const flagMap = {
    'pt-BR': '🇧🇷',
    'pt-PT': '🇵🇹',
    'en': '🇬🇧',
    'de': '🇩🇪',
    'es': '🇪🇸',
    'fr': '🇫🇷',
    'it': '🇮🇹',
  };

  const languages = [
    { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
    { code: 'pt-PT', name: 'Português (Portugal)', flag: '🇵🇹' },
    { code: 'en', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="hidden lg:flex flex-col w-72 bg-slate-900 text-white shadow-2xl z-30 fixed h-full"
      >
        <div className="p-6 border-b border-slate-700 flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">OUTREACH</h1>
            <div className="flex items-center gap-1 text-xs text-slate-400">
               <span>{flagMap[language]}</span>
               <span>Até que todos ouçam</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <button
              key={link.page}
              onClick={() => handleNav(link.page)}
              className={`w-full text-left flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                currentPage === link.page
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <link.icon className={`w-5 h-5 ${currentPage === link.page ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              <span className="font-medium text-sm">{t(link.name as TranslationKey)}</span>
            </button>
          ))}
          
          {/* Language Selector */}
          <div className="mt-8 pt-4 border-t border-slate-700">
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="w-full text-left flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
              >
                <Globe className="w-5 h-5" />
                <span className="font-medium text-sm">{t('menu_language' as TranslationKey)}</span>
                <span className="ml-auto text-lg">{flagMap[language as keyof typeof flagMap]}</span>
              </button>
              
              {langMenuOpen && (
                <div className="absolute left-0 right-0 mt-2 bg-slate-800 rounded-xl border border-slate-700 shadow-xl z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as any);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-slate-700 transition-all ${
                        language === lang.code ? 'bg-indigo-600/30 text-white' : 'text-slate-300'
                      } ${languages.indexOf(lang) !== languages.length - 1 ? 'border-b border-slate-700' : ''}`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-sm font-medium">{lang.name}</span>
                      {language === lang.code && <span className="ml-auto text-indigo-400">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Guest/Public Registration Link always visible if guest */}
          {role === 'guest' && (
             <button
             onClick={() => handleNav('Registration')}
             className={`w-full mt-6 text-left flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
               currentPage === 'Registration'
                 ? 'bg-pink-600 text-white shadow-lg'
                 : 'bg-slate-800 text-pink-200 hover:bg-pink-900/40'
             }`}
           >
             <UserPlus className="w-5 h-5" />
             <span className="font-medium text-sm">{t('menu_register')}</span>
           </button>
          )}
        </nav>

        <div className="p-4 border-t border-slate-700 bg-slate-950">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
              {user?.full_name?.charAt(0) || 'V'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.full_name || 'Visitante'}</p>
              <p className="text-xs text-slate-400 capitalize">{roleLabels[role] || role}</p>
            </div>
          </div>
          {user && (
            <button
              onClick={logout}
              className="flex items-center justify-center space-x-2 w-full px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200 text-sm font-medium border border-red-500/20"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('menu_logout')}</span>
            </button>
          )}
          {!user && (
            <button
              onClick={() => handleNav('Registration')}
              className="flex items-center justify-center space-x-2 w-full px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-200 text-sm font-medium"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t('menu_register')}</span>
            </button>
          )}
        </div>
      </motion.aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 shadow-sm p-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-2">
           <div className="p-1.5 bg-indigo-600 rounded-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900">OUTREACH {flagMap[language]}</span>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-600 rounded-lg hover:bg-slate-100">
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-72 bg-slate-900 text-white shadow-2xl z-50 flex flex-col"
            >
              <div className="p-5 flex items-center justify-between border-b border-slate-800">
                <span className="font-bold text-lg">Menu</span>
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {links.map((link) => (
                  <button
                    key={link.page}
                    onClick={() => handleNav(link.page)}
                    className={`w-full text-left flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                      currentPage === link.page
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <link.icon className="w-5 h-5" />
                    <span className="font-medium">{t(link.name as TranslationKey)}</span>
                  </button>
                ))}
                
                {/* Language Selector Mobile */}
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="relative">
                    <button
                      onClick={() => setLangMenuOpen(!langMenuOpen)}
                      className="w-full text-left flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 transition-all"
                    >
                      <Globe className="w-5 h-5" />
                      <span className="font-medium text-sm">{t('menu_language' as TranslationKey)}</span>
                      <span className="ml-auto text-lg">{flagMap[language as keyof typeof flagMap]}</span>
                    </button>
                    
                    {langMenuOpen && (
                      <div className="absolute left-0 right-0 mt-2 bg-slate-800 rounded-xl border border-slate-700 shadow-xl z-50">
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setLanguage(lang.code as any);
                              setLangMenuOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-slate-700 transition-all ${
                              language === lang.code ? 'bg-indigo-600/30 text-white' : 'text-slate-300'
                            } ${languages.indexOf(lang) !== languages.length - 1 ? 'border-b border-slate-700' : ''}`}
                          >
                            <span className="text-lg">{lang.flag}</span>
                            <span className="text-sm font-medium">{lang.name}</span>
                            {language === lang.code && <span className="ml-auto text-indigo-400">✓</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {role === 'guest' && (
                 <button
                    onClick={() => handleNav('Registration')}
                    className={`w-full mt-4 text-left flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      currentPage === 'Registration'
                        ? 'bg-pink-600 text-white'
                        : 'bg-slate-800 text-pink-200 hover:bg-pink-900/40'
                    }`}
                  >
                    <UserPlus className="w-5 h-5" />
                    <span className="font-medium">{t('menu_register')}</span>
                  </button>
                )}
              </nav>
               <div className="p-4 border-t border-slate-800">
                {user ? (
                   <button onClick={logout} className="flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-xl bg-red-600 text-white">
                    <LogOut className="w-5 h-5" />
                    <span>{t('menu_logout')}</span>
                  </button>
                ) : (
                   <div className="text-center text-sm text-slate-400">Modo Visitante</div>
                )}
               </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-72 p-4 pt-20 lg:pt-8 lg:p-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
});