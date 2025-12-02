import { EvangelismEvent, Testimony, PrayerRequest, Registration, PrayerAgenda, NewConvert, GlobalEvent } from './types';

// Helper to get future date
const getFutureDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

export const MOCK_EVENTS: EvangelismEvent[] = [
  {
    id: '1',
    title: 'Evangelismo no Centro',
    description: 'Evangelismo de rua no centro da cidade. Foco em oração e compartilhamento do evangelho com pedestres.',
    date: getFutureDate(2),
    time: '19:00',
    location: 'Praça Central',
    leadersNeeded: 2,
    evangelistsPerTeam: 4,
    registeredCount: 3,
    status: 'open',
    notes: 'Traga sapatos confortáveis.'
  },
  {
    id: '2',
    title: 'Caminhada Universitária',
    description: 'Engajamento com estudantes durante o horário de almoço. Distribuição de folhetos e oferta de oração.',
    date: getFutureDate(5),
    time: '12:00',
    location: 'Cantina da Universidade',
    leadersNeeded: 3,
    evangelistsPerTeam: 2,
    registeredCount: 1,
    status: 'open'
  },
  {
    id: '3',
    title: 'Vigília e Intercessão',
    description: 'Oração de preparação para a próxima cruzada.',
    date: getFutureDate(10),
    time: '22:00',
    location: 'Salão Principal da Igreja',
    leadersNeeded: 1,
    evangelistsPerTeam: 10,
    registeredCount: 8,
    status: 'closed'
  },
  {
    id: '4',
    title: 'Evangelismo Agora',
    description: 'Acontecendo neste momento. Junte-se a nós no parque!',
    date: new Date().toISOString(),
    time: '14:00',
    location: 'Parque da Cidade',
    leadersNeeded: 0,
    evangelistsPerTeam: 5,
    registeredCount: 5,
    status: 'ongoing'
  }
];

export const MOCK_GLOBAL_EVENTS: GlobalEvent[] = [
  {
    id: 'ge1',
    title: 'Conferência Fire 2024',
    description: 'Um encontro de 3 dias focado em avivamento e capacitação ministerial. Preletores internacionais.',
    date: getFutureDate(30),
    time: '19:00',
    location: 'Arena Sede',
    category: 'Conference',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'ge2',
    title: 'Workshop de Evangelismo Criativo',
    description: 'Aprenda novas formas de abordar pessoas e usar as artes para o Reino.',
    date: getFutureDate(15),
    time: '09:00',
    location: 'Sala 3B',
    category: 'Workshop',
    imageUrl: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'ge3',
    title: 'Noite de Adoração Profética',
    description: 'Uma noite inteira dedicada a buscar a face de Deus sem hora para acabar.',
    date: getFutureDate(7),
    time: '20:00',
    location: 'Auditório Principal',
    category: 'Worship',
    imageUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&q=80&w=1000'
  }
];

export const MOCK_TESTIMONIES: Testimony[] = [
  {
    id: 't1',
    title: "Cura na Praça Central",
    author: "Carlos (Evangelista)",
    summary: 'Oramos por um homem mancando na praça, e ele saiu pulando! Deus é bom.',
    date: new Date().toISOString(),
    decisions: ['Cura física', 'Aceitou uma Bíblia'],
    teamId: '1',
    profiles: [{ type: 'Homem', nationality: 'Brasil' }],
    highlight: true
  },
  {
    id: 't2',
    title: "Reconciliação",
    author: "Ana (Líder)",
    summary: 'Tive uma conversa de 30 minutos com um ateu que aceitou uma Bíblia no final.',
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    decisions: ['Se reconciliou com Deus', 'Cura emocional', 'Aceitou Jesus'],
    teamId: '2',
    profiles: [{ type: 'Homem', nationality: 'Portugal' }]
  },
  {
    id: 't3',
    title: "Família Restaurada",
    author: "Pedro (Evangelista)",
    summary: 'Encontramos uma família inteira sentada no parque. Oramos por restauração.',
    date: new Date(Date.now() - 172800000).toISOString(),
    decisions: ['Milagre', 'Quis visitar a igreja', 'Pediu discipulado'],
    teamId: '1',
    profiles: [{ type: 'Família', nationality: 'Angola' }],
    highlight: true
  },
  {
    id: 't4',
    title: "Jovem em Depressão",
    author: "Mariana (Evangelista)",
    summary: 'Oramos por uma jovem que chorava. O Espírito Santo a tocou profundamente.',
    date: new Date(Date.now() - 250000000).toISOString(),
    decisions: ['Cura emocional', 'Recebeu o Espírito Santo', 'Pediu uma ligação depois'],
    teamId: '3',
    profiles: [{ type: 'Mulher', nationality: 'Brasil' }]
  },
  {
    id: 't5',
    title: "Batismo no Chafariz",
    author: "João (Líder)",
    summary: 'A pessoa sentiu tanta convicção que pediu para ser batizada ali mesmo.',
    date: new Date(Date.now() - 300000000).toISOString(),
    decisions: ['Aceitou Jesus', 'Foi batizado'],
    teamId: '2',
    profiles: [{ type: 'Homem', nationality: 'Espanha' }],
    highlight: true
  },
  {
    id: 't6',
    title: "Entrega de Bíblias",
    author: "Equipe Alpha",
    summary: 'Distribuímos 50 bíblias hoje para estudantes.',
    date: new Date(Date.now() - 400000000).toISOString(),
    decisions: ['Aceitou uma Bíblia', 'Se comprometeu a mudar algo'],
    teamId: '1',
    profiles: [{ type: 'Jovem', nationality: 'Brasil' }, { type: 'Jovem', nationality: 'Moçambique' }]
  }
];

export const MOCK_NEW_CONVERTS: NewConvert[] = [
  { id: 'nc1', name: 'Ricardo Mendes', date: new Date().toISOString(), originTestimonyId: 't1', notes: 'Curado de dor nas costas' },
  { id: 'nc2', name: 'Juliana Paes', date: new Date(Date.now() - 86400000).toISOString(), originTestimonyId: 't2', notes: 'Reconciliação' },
  { id: 'nc3', name: 'Marcos Silva', date: new Date(Date.now() - 172800000).toISOString(), originTestimonyId: 't3', notes: 'Aceitou Jesus na praça' }
];

export const MOCK_PRAYERS: PrayerRequest[] = [
  {
    id: 'p1',
    userName: 'João Silva',
    userRole: 'leader',
    requestText: 'Orem por ousadia para os novos evangelistas que se juntarão neste sábado.',
    created_date: new Date().toISOString(),
    status: 'active',
    isAnonymous: false,
    replies: []
  },
  {
    id: 'p2',
    userName: 'Maria Santos',
    userRole: 'evangelist',
    requestText: 'Intercedam pelo evento de jovens na próxima semana, para que os corações estejam abertos.',
    created_date: new Date().toISOString(),
    status: 'active',
    isAnonymous: false,
    replies: [
      {
        id: 'r1',
        author: 'Intercessor Chefe',
        text: 'Estamos cobrindo este evento em oração, Maria! Creia no mover.',
        date: new Date().toISOString()
      }
    ]
  },
  {
    id: 'p3',
    userName: 'Anônimo',
    userRole: 'evangelist',
    requestText: 'Estou passando por uma luta pessoal difícil em casa. Preciso de força.',
    created_date: new Date(Date.now() - 100000).toISOString(),
    status: 'active',
    isAnonymous: true,
    replies: []
  }
];

export const MOCK_AGENDAS: PrayerAgenda[] = [
  {
    id: 'a1',
    title: 'Pauta Semanal: Foco em Universidades',
    week: '10-17 Março',
    content: '1. Orar pela abertura dos corações dos estudantes.\n2. Orar por proteção espiritual das equipes.\n3. Clamar por cura física durante as abordagens.',
    created_date: new Date().toISOString(),
    author: 'Admin'
  }
];

export const MOCK_REGISTRATIONS: Registration[] = [
  {
    id: 'r1',
    nome: 'Alice Oliveira',
    email: 'alice@exemplo.com',
    role: 'evangelist',
    status: 'pending',
    created_date: new Date().toISOString()
  },
  {
    id: 'r2',
    nome: 'Roberto Costa',
    email: 'bob@exemplo.com',
    role: 'leader',
    status: 'approved',
    created_date: new Date().toISOString()
  }
];