import { LucideIcon } from 'lucide-react';

export type UserRole = 'guest' | 'admin' | 'leader' | 'evangelist' | 'intercessor';
export type Language = 'pt-BR' | 'en' | 'de';

export interface User {
  uid: string;
  email: string;
  full_name: string;
  role: UserRole;
  teamId?: string; // For leaders/evangelists
}

export interface EvangelismEvent {
  id: string;
  title: string;
  description: string;
  date: string; // ISO String
  time: string;
  location: string;
  leadersNeeded: number;
  evangelistsPerTeam: number;
  registeredCount?: number; // Track current signups
  status: 'open' | 'closed' | 'completed' | 'ongoing';
  notes?: string;
}

export interface GlobalEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: 'Conference' | 'Workshop' | 'Worship' | 'Retreat';
  imageUrl?: string;
  registrationLink?: string;
}

export interface TestimonyProfile {
  type: string; // 'Homem', 'Mulher', etc.
  nationality?: string;
}

export interface Testimony {
  id: string;
  title?: string;
  personName?: string; // For form
  author: string; // For feed
  summary: string; // content
  date: string;
  submittedBy?: string;
  decisions: string[]; // Array of decision labels
  teamId?: string; // For filtering
  profiles?: TestimonyProfile[]; // For stats
  highlight?: boolean; // For featured section
}

export interface NewConvert {
  id: string;
  name: string;
  date: string;
  originTestimonyId: string;
  notes?: string;
}

export interface PrayerRequest {
  id: string;
  userName: string;
  userRole: UserRole;
  requestText: string;
  created_date: string;
  status: 'active' | 'answered';
  isAnonymous?: boolean;
  replies?: {
    id: string;
    author: string;
    text: string;
    date: string;
  }[];
}

export interface PrayerAgenda {
  id: string;
  title: string;
  content: string;
  week: string; // e.g., "12-18 Março"
  created_date: string;
  author: string;
  status?: 'active' | 'archived';
}

export interface PrayerFeedback {
  id: string;
  agendaId: string;
  type: 'sugestao' | 'feedback';
  content: string;
  author: string;
  date: string;
}

export interface Registration {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  church?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_date: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'evangelist';
  status: 'active' | 'pending_approval';
}

export interface NavigationItem {
  name: string; // This will now be a translation key
  page: string;
  icon: LucideIcon;
  roles: UserRole[];
}