import { UserRole } from '../types';

export type PermissionKey = 
  | 'schedule_evangelism'
  | 'create_training'
  | 'upload_files'
  | 'upload_recordings'
  | 'approve_applications'
  | 'apply_evangelism'
  | 'view_dashboard'
  | 'manage_team'
  | 'create_prayer_agenda'
  | 'submit_testimony'
  | 'view_statistics';

export const rolePermissions: Record<UserRole, PermissionKey[]> = {
  // ADM: Full access to scheduling, training, file management, recordings
  admin: [
    'schedule_evangelism',
    'create_training',
    'upload_files',
    'upload_recordings',
    'approve_applications',
    'apply_evangelism',
    'view_dashboard',
    'manage_team',
    'create_prayer_agenda',
    'submit_testimony',
    'view_statistics'
  ],
  // Líder de Equipe: Can approve applications and apply for events
  leader: [
    'approve_applications',
    'apply_evangelism',
    'view_dashboard',
    'manage_team',
    'create_prayer_agenda',
    'submit_testimony',
    'view_statistics'
  ],
  // Evangelista: Can apply and await approval
  evangelist: [
    'apply_evangelism',
    'view_dashboard',
    'create_prayer_agenda',
    'submit_testimony',
    'view_statistics'
  ],
  // Intercessor: Can apply and await approval
  intercessor: [
    'view_dashboard',
    'create_prayer_agenda',
    'submit_testimony',
    'view_statistics'
  ],
  // Guest: Read-only access
  guest: [
    'view_dashboard'
  ]
};

export const getPermissionDescription = (permission: PermissionKey): Record<string, string> => {
  const descriptions: Record<PermissionKey, Record<string, string>> = {
    schedule_evangelism: {
      'pt-BR': 'Agendar eventos de evangelismo',
      'pt-PT': 'Agendar eventos de evangelismo',
      'en': 'Schedule evangelism events',
      'de': 'Evangelismusveranstaltungen planen'
    },
    create_training: {
      'pt-BR': 'Criar treinamentos para a equipe',
      'pt-PT': 'Criar formações para a equipa',
      'en': 'Create training for the team',
      'de': 'Schulungen für das Team erstellen'
    },
    upload_files: {
      'pt-BR': 'Carregar arquivos e documentos',
      'pt-PT': 'Carregar ficheiros e documentos',
      'en': 'Upload files and documents',
      'de': 'Dateien und Dokumente hochladen'
    },
    upload_recordings: {
      'pt-BR': 'Carregar gravações de eventos',
      'pt-PT': 'Carregar gravações de eventos',
      'en': 'Upload event recordings',
      'de': 'Ereignisaufzeichnungen hochladen'
    },
    approve_applications: {
      'pt-BR': 'Aprovar aplicações de usuários',
      'pt-PT': 'Aprovar aplicações de utilizadores',
      'en': 'Approve user applications',
      'de': 'Benutzeranwendungen genehmigen'
    },
    apply_evangelism: {
      'pt-BR': 'Se candidatar para eventos',
      'pt-PT': 'Se candidatar para eventos',
      'en': 'Apply for events',
      'de': 'Sich für Veranstaltungen bewerben'
    },
    view_dashboard: {
      'pt-BR': 'Visualizar painel de controle',
      'pt-PT': 'Visualizar painel de controle',
      'en': 'View dashboard',
      'de': 'Dashboard anzeigen'
    },
    manage_team: {
      'pt-BR': 'Gerenciar equipe e membros',
      'pt-PT': 'Gerir equipa e membros',
      'en': 'Manage team and members',
      'de': 'Team und Mitglieder verwalten'
    },
    create_prayer_agenda: {
      'pt-BR': 'Criar agendas de oração',
      'pt-PT': 'Criar pautas de oração',
      'en': 'Create prayer agendas',
      'de': 'Gebetsprogramme erstellen'
    },
    submit_testimony: {
      'pt-BR': 'Enviar testemunhos',
      'pt-PT': 'Enviar testemunhos',
      'en': 'Submit testimonies',
      'de': 'Zeugnisse einreichen'
    },
    view_statistics: {
      'pt-BR': 'Visualizar estatísticas',
      'pt-PT': 'Visualizar estatísticas',
      'en': 'View statistics',
      'de': 'Statistiken anzeigen'
    }
  };
  return descriptions[permission];
};

export const hasPermission = (role: UserRole, permission: PermissionKey): boolean => {
  return rolePermissions[role]?.includes(permission) ?? false;
};

export const getRolePermissions = (role: UserRole, language: 'pt-BR' | 'pt-PT' | 'en' | 'de' = 'en') => {
  const permissions = rolePermissions[role] || [];
  return permissions.map(perm => ({
    key: perm,
    description: getPermissionDescription(perm)[language]
  }));
};
