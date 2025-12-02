# OUTreach! - Christian Evangelism Platform

## Recent Work (Dec 2, 2025)

### 🎉 Admin.tsx & TeamManagement.tsx 100% Multilíngues - COMPLETADAS ✅

#### ✅ **COMPLETADO (Sessão Atual - Dec 2, 2025 tarde):**
1. **Admin.tsx Multilíngue Completo**:
   - ✅ Todos os 23 translation keys adicionados para os 7 idiomas (pt-BR, pt-PT, en, de, es, fr, it)
   - ✅ Keys incluem: tabs, labels, botões, placeholders, helper text, toast messages
   - ✅ Role mapping implementado (`roleMap`) para traduzir badges de role (admin, leader, evangelist, intercessor)
   - ✅ Interpolação de placeholders implementada (`admin_toast_error` com `{error}`)
   - ✅ Botões "Drive 📁" e "Deletar" traduzidos
   - ✅ ZERO textos hardcoded remanescentes
   - ✅ **APROVADO PELO ARCHITECT** - 100% pronto para produção

2. **TeamManagement.tsx Multilíngue Completo**:
   - ✅ Todos os translation keys adicionados para os 7 idiomas
   - ✅ Botões "Aprovar" e "Rejeitar" traduzidos
   - ✅ ZERO textos hardcoded remanescentes
   - ✅ **APROVADO PELO ARCHITECT** - 100% pronto para produção

3. **Padrões Estabelecidos**:
   - ✅ Interpolação com `.replace('{placeholder}', value)` para conteúdo dinâmico
   - ✅ Mapeamento de enums → translation keys para dados estruturados
   - ✅ Organização por prefixos (`admin_*`, `team_*`, `training_*`, `prayer_*`)

#### 📋 **PRÓXIMAS PÁGINAS PARA VERIFICAÇÃO**:
- Training.tsx - Verificar se há textos hardcoded
- PrayerRoom.tsx - Verificar se há textos hardcoded
- Registration.tsx - Verificar se há textos hardcoded

### ✨ UI Multilíngue Completa & Correções - COMPLETADAS ✅

#### ✅ **COMPLETADO (Sessões Anteriores):**
1. **Remoção de UI Duplicado**: Removido botão duplicado "+ Entry" da página de testemunhos
2. **Traduções Completas**: 
   - Adicionadas translation keys para TODOS os 7 idiomas (pt-BR, pt-PT, en, de, es, fr, it)
   - Novos keys: `btn_accept`, `btn_reject`, `ai_improved_version`, `select_evangelismo`, `testimony_date`, `testimony_title`
   - Todos os textos hardcoded substituídos por translation keys
3. **ImproveWithAI Multilíngue**: 
   - Botões "Accept/Reject" agora usam idioma atual do aplicativo
   - Label "✨ Improved Version" traduzida para todos os idiomas
4. **Correção Crítica do Microfone**: 
   - Hook `useSpeechRecognition` agora para TODOS os MediaStream tracks ao parar gravação
   - Microfone físico desliga corretamente após uso (não fica aceso permanentemente)
   - Previne vazamento de recursos ao iniciar/parar múltiplas vezes
5. **Google Drive - Confirmação de Estrutura Correta**:
   - ✅ Evangelismo cria pasta automaticamente: `{título} | {data}`
   - ✅ Testemunho cria SUBPASTA dentro da pasta do evangelismo: `{título testemunho} | {data}`
   - ✅ Photos e Videos são subpastas do testemunho
   - ✅ 2 arquivos Word bilíngues salvos na pasta do testemunho

#### ✅ **COMPLETADO (Sessões Anteriores):**
1. **Tab Inicial do Testemunho**: Agora abre em "Equipes e Detalhes" (tab 'info') ao clicar em "Novo Testemunho"
2. **Speech Recognition Multilíngue**: Hook `useSpeechRecognition` aceita parâmetro de idioma e atualiza `recognition.lang` dinamicamente com currentLanguage na dependency array
3. **Melhorar com AI**: Suporta gramática específica para 7 idiomas (pt-BR, pt-PT, en, de, es, fr, it) via Gemini usando langMap correto
4. **Geração de Resumo Bilíngue**: Função `generateBilingualSummary` cria resumos em língua nativa + inglês opcional
5. **UI Bilíngue Completa**: 
   - Checkbox "Salvar também em inglês" traduzido para todos os 7 idiomas (testimony_save_english_too)
   - Botão "Aplicar" traduzido para todos os 7 idiomas (btn_apply)
   - Aparece automaticamente quando idioma !== 'en'
6. **Estrutura Google Drive Completa**: 
   - Pasta testemunho: `{título} | {data}` dentro da pasta do evangelismo
   - Subpastas: `Photos` e `Videos` criadas automaticamente
   - 2 arquivos Word bilíngues: `{titulo}.docx` (nativo) e `{titulo} (English).docx`
7. **Backend Estendido**: 
   - Endpoint `/api/testemunhos` aceita e salva `summaryNative`, `summaryEnglish`, `nativeLanguage`, `resumoEnglishDocxId`
   - CREATE TABLE testemunhos inclui todas as colunas bilíngues com default 'pt-BR' para nativeLanguage
   - Migration aplicada para adicionar colunas em bancos existentes
8. **Modal de Detalhes Evangelismo**: Com opções Editar, Salvar e Excluir (admin only)

#### ⚠️ **LIMITAÇÕES CONHECIDAS:**
- **Speech Recognition**: Pode não reiniciar automaticamente se usuário trocar idioma durante gravação ativa (precisa parar e reiniciar manualmente)
- **Testes E2E**: Funcionalidades não foram validadas em todos os 7 idiomas end-to-end com Google Drive

#### 📋 **PRÓXIMOS PASSOS RECOMENDADOS:**
1. Testar fluxo completo de testemunho bilíngue em produção com Google Drive
2. Adicionar proteção contra troca de idioma durante gravação (bloquear seletor ou reiniciar automaticamente)
3. Implementar upload de fotos/vídeos nas pastas Photos/Videos do Google Drive
4. Adicionar endpoint GET para listar testemunhos salvos

## Overview
OUTreach! is a multi-language Christian evangelism and outreach management web application designed to help teams coordinate evangelism events, manage testimonies, prayer requests, and team operations. Built with React, Vite, and TypeScript, it features comprehensive role-based access control and AI integration for translation and text improvement. The platform aims to streamline outreach efforts and facilitate global evangelism, leveraging AI for dynamic translation, content generation, and enhanced user experience.

## User Preferences
- **Communication Style**: Clear, concise, and direct.
- **Coding Style**: Prefers TypeScript for type safety, React Hooks for state management, functional components, and custom hooks for reusable logic. Emphasizes translation keys over hardcoded text.
- **Workflow**: Iterative development with a focus on delivering working features quickly. Prefers real-time feedback and validation.
- **Interaction**: Prefers the use of interactive lists over dropdowns for better user experience. Values a language-first approach where all user-facing text uses translation keys and new features are automatically multilingual.
- **General Working Preferences**:
    - Prioritizes dark theme with accent colors (indigo/pink) for a modern look.
    - Favors glassmorphism effects for a layered, premium feel.
    - Likes motion and animations using Framer Motion for polish.
    - Expects responsive design with a mobile-first approach.
    - Prefers status filtering with emoji indicators.
    - Requires autocomplete components for data entry and field validation with real-time error feedback.

## System Architecture

### UI/UX Decisions
The application features a dark theme with indigo/pink accent colors, glassmorphism effects, and Framer Motion for animations, ensuring a modern and polished feel. It employs a responsive, mobile-first design, simplifying headers and navigation for better mobile usability. Interactive lists with status filtering and emoji indicators are preferred over traditional dropdowns for enhanced user experience. Autocomplete components and real-time field validation are used for data entry.

### Technical Implementations
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite 6.4.1.
- **State Management**: React Context API combined with React Query.
- **AI Integration**: Google Generative AI (Gemini 2.5-Flash) for audio transcription, text improvement, dynamic translation, testimony summarization, and prayer agenda generation.
- **Internationalization (i18n)**: Comprehensive multi-language support (pt-BR, pt-PT, en, de, es, fr, it) with dynamic UI translation and AI-powered user data translation. All user-facing text uses translation keys.
- **Role-Based Access Control**: Granular permissions (ADM, Leader, Evangelist, Intercessor) across features like event scheduling, training management, file uploads, and testimony submission.
- **Dynamic Translation Output**: Structured JSON output for translated user data, metadata, and permissions.
- **Google Drive Integration**: Automatic folder creation, file uploads, and media storage for evangelism events, training documents, and media.
- **Database Persistence**: SQLite (development) with a schema for evangelismos, testemunhos, and uploaded files, transitioning to PostgreSQL for production.

### Feature Specifications
- **Multi-Language Support**: Dynamic UI and AI-powered user data translation, persistent language state across 7 languages.
- **AI-Powered Features**: Gemini integration for transcription, text refinement, and narrative generation, maintaining context and spiritual meaning.
- **Role-Based Access Control**: Defined permissions matrix for all user roles.
- **Evangelismo Management**: Features for creating, managing, and displaying evangelism events with status tracking and Google Drive integration for event folders.
- **Testimony Submission**: Comprehensive form with optional audio recording, AI-driven text refinement, and narrative summary generation.
- **User Workflows**: Structured flows for new user registration, evangelism event management, and testimony submission.

## External Dependencies
- **Google Generative AI (Gemini 2.5-Flash)**: For AI capabilities including translation, text summarization, and content improvement.
- **Google Drive API**: For automatic folder creation, file uploads, and media storage.
- **SQLite**: For local database persistence during development.
- **PostgreSQL (Neon)**: For production database.
- **Lucide React**: Icon library for UI components.
- **Framer Motion**: Animation library for UI/UX enhancements.
- **`docx` library**: For generating Word documents.