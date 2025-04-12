# Technical Documentation - RedPanda Audio Dashboard

## Panoramica del Progetto

Dashboard di analytics per piattaforma di audiobook con:

- Monitoraggio ascolti e utenti
- Metriche di engagement
- Visualizzazioni dati interattive
- Autenticazione integrata

## Diagramma Architetturale

```
Client (Next.js) → API Backend (NestJS)
       ↓
   Database
       ↓
Servizi esterni (S3, Redis)
```

Flusso principale:
1. Utente accede → Login → Dashboard
2. Dati fetchati da API → Visualizzati in charts
3. Aggiornamenti in tempo reale

## Tech Stack Dettagliato

### Frontend
- Next.js 15.1.0 (App Router)
- React 19
- TypeScript 5
- TailwindCSS 3.4.17 + tailwindcss-animate
- Radix UI (30+ componenti) + shadcn/ui
- Recharts 2.15 (visualizzazioni)
- React Hook Form + Zod (form manager)

### Styling
- Sistema di design basato su:
  - HSL color system
  - Custom palette RedPanda
  - Dark Mode support
- Utility-first con Tailwind
- Animazione componenti Radix

## Moduli Principali

### 1. Authentication Module
- Login/Logout flow
- Protected routes
- Form validation client-side
- Integrazione con backend auth

File chiave:
- `app/login/page.tsx`
- `hooks/use-auth.ts`

### 2. Dashboard Module
- 4 metriche principali
- 4 tipi di visualizzazioni
- Filtro temporale
- Dati mockati (da sostituire con API)

File chiave:
- `app/dashboard/page.tsx`
- `components/ui/chart/*`

### 3. UI Components
- 50+ componenti personalizzati
- Varianti multiple
- Accessibilità integrata
- Theme support

File chiave:
- `components/ui/*`
- `components/theme-provider.tsx`

## Core Business Logic

### Funzioni Critiche

1. `validateForm()` (login)
- Input: email, password
- Output: error object
- Gestione errori: email format, password length

2. Chart Data Processing
- Trasformazione dati API → formato Recharts
- Responsive sizing
- Theme-aware colors

## Utilities & Helpers

### Servizi Condivisi
- `lib/utils.ts`: funzioni di formattazione
- `hooks/use-toast.ts`: notifiche UI

### Sicurezza
- Tutte le chiamate API autenticate
- Variabili sensibili solo lato server

## Convenzioni & Best Practices

### Code Style
- TypeScript strict
- ESLint + Prettier
- Componenti UI isolati
- Custom hooks per logica complessa

### Testing
- Jest + React Testing Library
- E2E: Cypress (da implementare)
- Coverage: 20% (base UI components)

## Deployment

### Requisiti
- Node.js 20+
- Docker (opzionale)

### Variabili d'Ambiente
- `NEXT_PUBLIC_API_URL`: endpoint backend

### Build
```bash
npm run build
npm start
```

## Known Issues & Tech Debt

1. Dati mockati in dashboard
   - Priorità: Alta
   - Soluzione: Integrare API reale

2. Mancanza test E2E
   - Priorità: Media

3. Ottimizzazione immagini
   - Priorità: Bassa

## Estensioni Future

1. Aggiungere moduli:
   - Creare nuova cartella in `app/`
   - Registrare route in `components/nav.tsx`

2. Punti di estensione:
   - `lib/api.ts`: aggiungere chiamate
   - `types/`: estendere interfacce

3. Miglioramenti suggeriti:
   - SSR per dati dashboard
   - Ottimizzazione bundle
   - Analytics real-time
