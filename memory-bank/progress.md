# Progress

Tracks what works, what's left to build, current status, known issues, and the evolution of project decisions.

---

## What Works

- **Frontend Authentication System (Stable):**
    - Login page implemented (`login/page.tsx`).
    - API client for authentication (`authClient.ts`).
    - Global state management via Zustand (`useAuthStore`).
    - Route protection using `AuthGuard`.
    - Integration into main layout (`layout.tsx`) using `ClientAuthWrapper` pattern to handle client-side logic within a server component layout.
    - Tokens stored in `localStorage`.
- Login page migrated to Next.js with modular components.
- Home page migrated to Next.js with modular components and responsive layout.
- Global navigation and header via Next.js layout.
- Tailwind CSS configured with custom palette and Inter font.
- Font Awesome functional via global CDN.
- Reusable components created (PlayButton, NewReleaseCard, BookCard), reducing duplication.
## What's Left to Build

- **Authentication Enhancements:**
    - Implement refresh token handling.
    - Add user profile page/management.
    - Consider social login options (e.g., Google).
- Migrate any remaining HTML pages.
- Implement advanced state management (e.g., currently playing audiobook, favorites).
- Improve accessibility and implement end-to-end tests.
- Update and complete technical and product documentation.
## Current Status

La base frontend è ora moderna, modulare e pronta per l’integrazione di logica applicativa e backend. La UI è coerente, facilmente estendibile e manutenibile grazie alla componentizzazione.

## Known Issues

- Some components are static and lack full interactivity (beyond auth).
- Mobile compatibility needs thorough testing across devices.
- Refresh token handling is not yet implemented.
## Evolution of Project Decisions

- Scelta di modularizzare tutte le UI in componenti React.
- Uso di layout Next.js per navigazione e header globali.
- Gestione di font e icone via CDN/import globale per rapidità e compatibilità.
- Refactoring continuo per massimizzare la riusabilità dei componenti UI.