# Audiobook3 - Documentazione Progetto

## Architettura del Sistema

Questo è un progetto di piattaforma audiobook con architettura a microservizi:

### Stack Tecnologico
- **Backend**: NestJS, TypeScript, PostgreSQL, Redis, Socket.IO
- **Frontend**: Next.js 14, React, TypeScript, Zustand, TanStack Query, Tailwind CSS  
- **Dashboard**: Next.js 14, Shadcn/UI
- **Database**: PostgreSQL con TypeORM
- **Cache**: Redis per progress tracking
- **Storage**: AWS S3 per file audio e immagini
- **WebSocket**: Per aggiornamenti progress in tempo reale

### Struttura Progetto
```
audiobook3/
├── backend/          # API NestJS
├── frontend/         # App utenti Next.js  
├── dashboard/        # Admin dashboard Next.js
└── memory-bank/      # Documentazione architetturale
```

## Patterns Architetturali Chiave

### Autenticazione
- JWT tokens con refresh token
- Zustand store globale per stato auth (`useAuthStore`)
- Route protection con `AuthGuard` component
- Client-side token management in `localStorage`

### Audio Player
- Zustand store per stato audio globale (`useAudioStore`)
- WebSocket per progress tracking in tempo reale
- Mini-player e full-player con state management
- Resume playback da last position salvata in Redis

### State Management
- **Zustand** per stato globale (auth, audio player)
- **TanStack Query** per API calls e caching
- Persist middleware per localStorage persistence

### API Communication
- REST endpoints per CRUD operations
- WebSocket per real-time features (progress updates)
- Paginated responses usando nestjs-paginate
- Error handling centralizzato

## Comandi Utili

### Backend
```bash
cd backend
npm run start:dev    # Development server
npm run build        # Production build
npm run test         # Run tests
npm run migration:generate -- src/database/migrations/migration-name
npm run migration:run
```

### Frontend
```bash
cd frontend  
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint check
npm run type-check   # TypeScript check
```

### Dashboard
```bash
cd dashboard
npm run dev          # Development server
npm run build        # Production build
```

## Database
- Migrations in `backend/src/database/migrations/`
- Entities in `backend/src/*/entities/`
- Seed data in `backend/src/database/seeds/`

## Environment Variables
- Backend: `.env` file con DB, Redis, S3, JWT configs
- Frontend: `.env.local` per API endpoints
- Esempi in `backend/env-example`

## Deployment
- Docker support con `Dockerfile` per ogni servizio
- `docker-compose.yml` per development
- `docker-compose.swarm.yml` per production

## Note Implementazione
- Authentication flow completo implementato
- Audio streaming da S3 con progress tracking
- Mini-player con state persistence
- Real-time progress sync via WebSocket
- Responsive design con Tailwind CSS

## Testing
- Unit tests con Jest
- E2E tests in `backend/test/`
- Separate test configs per admin e user flows

## Sicurezza
- JWT authentication
- CORS configurato per development
- Input validation con class-validator
- Rate limiting implementato
- Secure headers configurati