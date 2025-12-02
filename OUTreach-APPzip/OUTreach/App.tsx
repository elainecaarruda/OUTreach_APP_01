import React, { useState, useEffect, createContext, useContext, Suspense, lazy } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { User, UserRole } from './types';
import { LanguageProvider } from './contexts/LanguageContext';
import { LanguageSelection } from './pages/LanguageSelection';

// Lazy loaded pages for better performance
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Events = lazy(() => import('./pages/Events').then(m => ({ default: m.Events })));
const Evangelismo = lazy(() => import('./pages/Evangelismo').then(m => ({ default: m.Evangelismo })));
const GlobalEvents = lazy(() => import('./pages/GlobalEvents').then(m => ({ default: m.GlobalEvents })));
const PrayerRoom = lazy(() => import('./pages/PrayerRoom').then(m => ({ default: m.PrayerRoom })));
const Admin = lazy(() => import('./pages/Admin').then(m => ({ default: m.Admin })));
const Testimony = lazy(() => import('./pages/Testimony').then(m => ({ default: m.Testimony })));
const Registration = lazy(() => import('./pages/Registration').then(m => ({ default: m.Registration })));
const TeamManagement = lazy(() => import('./pages/TeamManagement').then(m => ({ default: m.TeamManagement })));
const Training = lazy(() => import('./pages/Training').then(m => ({ default: m.Training })));

// --- MOCK AUTH CONTEXT ---
interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, login: () => {}, logout: () => {} });

export const useAuth = () => useContext(AuthContext);

const queryClient = new QueryClient();

// --- PLACEHOLDER COMPONENT ---
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-8 text-center bg-white rounded-2xl shadow-sm border border-slate-100 py-20">
    <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
    <p className="text-slate-500">Este módulo está em desenvolvimento.</p>
  </div>
);

// Loading fallback for lazy components
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8 min-h-96">
    <div className="text-center">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-slate-600 text-sm">Carregando...</p>
    </div>
  </div>
);

function AppContent() {
  const [currentPage, setCurrentPage] = useState('Home');
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(false);
  const { user, logout } = useAuth();

  // Route protection logic
  const renderPage = () => {
    // Public routes
    if (!user) {
      if (currentPage === 'Registration') return <Registration setPage={setCurrentPage} />;
      return <Home setPage={setCurrentPage} />;
    }

    // Authenticated routes
    switch (currentPage) {
      case 'Home': return <Home setPage={setCurrentPage} />;
      case 'Dashboard': return <Dashboard setPage={setCurrentPage} />;
      case 'Events': return <Events />;
      case 'Evangelismo': return <Evangelismo />;
      case 'GlobalEvents': return <GlobalEvents />;
      case 'PrayerRoom': return <PrayerRoom />;
      case 'Admin': return <Admin />;
      case 'TeamManagement': return <TeamManagement />;
      case 'Testimony': return <Testimony setPage={setCurrentPage} />;
      case 'Training': return <Training />;
      case 'MyAgenda': return <PlaceholderPage title="Minha Agenda" />;
      case 'Registration': return <Registration setPage={setCurrentPage} />;
      default: return <Home setPage={setCurrentPage} />;
    }
  };

  if (!hasSelectedLanguage) {
    return <LanguageSelection onSelect={() => setHasSelectedLanguage(true)} onBack={() => window.location.href = '/'} />;
  }

  return (
    <Layout currentPage={currentPage} setPage={setCurrentPage} user={user} logout={logout}>
      <Suspense fallback={<LoadingFallback />}>
        {renderPage()}
      </Suspense>
    </Layout>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: UserRole) => {
    let nameRole = role.charAt(0).toUpperCase() + role.slice(1);
    if (role === 'admin') nameRole = 'Administrador';
    if (role === 'leader') nameRole = 'Líder';
    if (role === 'evangelist') nameRole = 'Evangelista';
    if (role === 'intercessor') nameRole = 'Intercessor';

    setUser({
      uid: 'demo-user-123',
      email: `${role}@outreach.demo`,
      full_name: `Demo ${nameRole}`,
      role: role
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthContext.Provider value={{ user, login, logout }}>
          <AppContent />
        </AuthContext.Provider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}