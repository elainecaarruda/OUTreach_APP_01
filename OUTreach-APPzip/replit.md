# OUTreach! - Christian Evangelism Platform

## Overview

OUTreach! is a comprehensive web application designed to coordinate and manage Christian evangelism activities, prayer ministries, and team collaboration. The platform connects administrators, team leaders, evangelists, and intercessors to facilitate outreach events, testimony sharing, prayer requests, and team management. Built with React, TypeScript, and Express, it features multilingual support (7 languages), AI-powered content improvement, Google Drive integration for media storage, and role-based access control.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 19.2.0 with TypeScript for type safety and modern component architecture
- Vite 6.2.0 as the build tool for fast development and optimized production builds
- Lazy loading implemented for all major pages to improve initial load performance
- Code splitting configured with manual chunks for vendor libraries (React, Framer Motion, React Query, Lucide icons)

**State Management**
- React Context API for authentication and language management
- TanStack React Query (v5.90.10) for server state management and data fetching
- Local component state with useState for UI interactions
- Custom hooks pattern for reusable logic (speech recognition, AI integration, form validation)

**UI & Styling**
- Tailwind CSS loaded via CDN for rapid styling without build overhead
- Framer Motion (v12.23.24) for animations and transitions
- Lucide React for consistent iconography
- Custom scrollbar styling and Inter font family for typography
- Responsive design with mobile-first approach

**Internationalization (i18n)**
- Custom translation system supporting 7 languages: pt-BR, pt-PT, en, de, es, fr, it
- LanguageContext provides centralized translation function `t(key)`
- Translation keys organized by feature prefix (admin_*, team_*, prayer_*, etc.)
- Support for dynamic content interpolation using `.replace('{placeholder}', value)` pattern

**Routing & Navigation**
- Client-side page routing via state management (no router library)
- Role-based menu system that filters navigation options based on user permissions
- Lazy-loaded page components with suspense boundaries and loading states

### Backend Architecture

**Server Framework**
- Express 5.1.0 as the web server framework
- CORS configured for multiple origins (localhost, Replit domains)
- Body parsing with 50mb limit for media uploads
- RESTful API design pattern

**Database**
- Better-SQLite3 (v12.4.6) for local SQLite database
- WAL (Write-Ahead Logging) mode enabled for better concurrency
- Schema migration system built into db.js for version management
- Tables include: evangelismos, testimonies, prayer requests, user applications

**Authentication & Authorization**
- Mock authentication context in development (production requires real auth)
- Role-based access control (RBAC) with 5 roles: guest, admin, leader, evangelist, intercessor
- Permission system defined in lib/permissions.ts mapping roles to specific actions
- User context provider tracks current user state throughout application

**API Integrations**
- Google Gemini AI (via @google/genai) for:
  - Audio transcription (speech-to-text)
  - Text improvement and content enhancement
  - Translation services
  - Prayer agenda generation
- Google Drive API (googleapis v166.0.0) for:
  - Automatic folder creation for evangelism events
  - Subfolder structure for testimonies (photos, videos, documents)
  - File uploads with metadata
  - Drive connector integration via Replit environment

**File Processing**
- Multer 2.0.2 for multipart/form-data handling
- In-memory storage for file uploads before Drive transfer
- DOCX library (v9.5.1) for Word document generation
- Automatic Word document creation for testimony summaries

### Data Storage Solutions

**Local Database (SQLite)**
- Single data.db file in project root
- Evangelismos table: stores evangelism events with dates, locations, status, coordinator info
- Migration system handles schema updates (e.g., adding status column)
- Automatic timestamp tracking (createdAt, updatedAt)

**Google Drive Storage**
- Hierarchical folder structure:
  - Root folder (configurable via environment)
  - Evangelismo folders: `{título} | {data}`
  - Testimony subfolders within evangelismo folders: `{título testemunho} | {data}`
  - Media subfolders: photos, videos, recordings
- Service account authentication for admin-level access
- OAuth tokens managed via Replit connector system
- File metadata includes webViewLink for sharing

**Client-Side Storage**
- localStorage for API key caching (Gemini)
- Session state for user authentication in development

### External Dependencies

**Third-Party APIs**
- **Google Gemini AI**: Content generation, translation, audio transcription (requires GEMINI_API_KEY)
- **Google Drive API**: File storage and folder management (requires service account or OAuth)
- **Google Maps API**: Address geocoding and map display (requires GOOGLE_MAPS_API_KEY in VITE_GOOGLE_MAPS_API_KEY)

**Third-Party Libraries**
- **date-fns**: Date formatting and manipulation
- **better-sqlite3**: Synchronous SQLite database access
- **googleapis**: Google API client library
- **docx**: Microsoft Word document generation
- **framer-motion**: Animation library for React
- **lucide-react**: Icon component library
- **@tanstack/react-query**: Async state management
- **concurrently**: Run multiple npm scripts simultaneously (dev server + backend)

**Development Tools**
- **TypeScript**: Static type checking with ~5.8.2
- **Vite**: Development server and build tool
- **ts-node**: TypeScript execution for Node.js scripts
- **terser**: JavaScript minification for production builds

**Environment Variables Required**
- `GEMINI_API_KEY`: Google Gemini API access (set in .env.local)
- `REPLIT_CONNECTORS_HOSTNAME`: Replit connector service endpoint
- `REPL_IDENTITY` or `WEB_REPL_RENEWAL`: Replit authentication tokens
- `VITE_GOOGLE_MAPS_API_KEY`: Google Maps API key (optional for map features)
- `PORT`: Server port (defaults to 3001)

**Key Architectural Decisions**

1. **SQLite over Postgres**: Chosen for simplicity and zero-configuration setup; suitable for moderate scale deployments without need for separate database server

2. **Mock Authentication**: Development uses simulated auth to accelerate feature development; production requires integration with real auth provider (Firebase, Auth0, etc.)

3. **Google Drive as Media Store**: Leverages existing Google ecosystem, provides familiar sharing interface, and eliminates need for separate object storage service

4. **Custom i18n System**: Built-in translation system avoids dependency on heavy i18n libraries while maintaining full control over translation workflow and key organization

5. **Lazy Loading Strategy**: All major pages lazy-loaded to reduce initial bundle size, with code splitting separating vendor libraries from application code

6. **AI Integration via Gemini**: Single AI provider (Google Gemini) handles multiple use cases (transcription, translation, content improvement) for consistency and simplified API management

7. **Replit Connector Pattern**: Uses Replit's connector system for Google Drive OAuth, avoiding manual credential management and token refresh logic