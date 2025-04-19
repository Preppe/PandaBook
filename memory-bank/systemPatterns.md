# System Patterns

Documents the system architecture, key technical decisions, design patterns, and component relationships.

---

## Architecture Overview

[Describe the overall system architecture.]

## Key Technical Decisions

- **Frontend Authentication:**
    - Client-side token-based authentication (e.g., JWT).
    - Tokens stored in `localStorage`.
    - Global authentication state managed via Zustand (`useAuthStore`).
    - Route protection implemented using a wrapper component (`AuthGuard`).
- [List other important technical decisions and their rationale.]
## Design Patterns in Use

- **Client Component Wrapper for Server Layouts:** Utilizes a dedicated client component (`ClientAuthWrapper.tsx`) nested within the main server component layout (`layout.tsx`). This pattern allows client-side logic (e.g., `useEffect` hooks for Zustand store initialization, authentication checks) to run within the layout context without preventing the server component layout from exporting `metadata` or performing other server-side tasks. It effectively isolates client-side dependencies.
- [List and describe other design patterns applied in the project.]
- **Player Visibility Management:** Uses Zustand store (`useAudioStore`) states (`isFullPlayerVisible`, `isMiniPlayerActive`) to control the rendering of the full player page and the `MiniPlayer` component within the main application layout (`ClientLayout.tsx`). Navigation to the player page sets `isFullPlayerVisible` to true and `isMiniPlayerActive` to false. Closing the full player sets `isFullPlayerVisible` to false and `isMiniPlayerActive` to true, navigating back. Closing the mini-player sets `isMiniPlayerActive` to false and pauses audio.
## Component Relationships

- **Authentication Flow:**
    - `Login Page` uses `authClient` to request tokens from the backend.
    - `useAuthStore` stores user state and loading status, making them available globally. (Tokens are managed within `authClient` and `localStorage`).
    - `AuthGuard` checks `useAuthStore` state (`isAuthenticated`, `isLoading`) to allow/deny access to protected routes/components.
    - `authClient` handles communication with backend authentication endpoints.
- [Describe other major component interactions.]
- **Audio Player Flow:**
    - `AudioPlayer.tsx` component manages the HTML `<audio>` element and synchronizes its state (currentTime, duration) with `useAudioStore`.
    - `useAudioStore` holds the global audio state (isPlaying, volume, src, currentTrack) and actions (play, pause, setSrc, etc.), including player visibility states (`isFullPlayerVisible`, `isMiniPlayerActive`).
    - `frontend/src/app/player/page.tsx` (Full Player) reads audio state and controls, updates `isFullPlayerVisible` on mount/unmount, and sets `isMiniPlayerActive` on close, navigating back.
    - `MiniPlayer.tsx` reads audio state and controls, is rendered conditionally in `ClientLayout.tsx` based on `isMiniPlayerActive`, opens the full player on click, and sets `isMiniPlayerActive` to false and pauses audio on its close button click.
    - `ClientLayout.tsx` renders the `MiniPlayer` component based on the `isMiniPlayerActive` state from `useAudioStore`.
## Critical Implementation Paths

- [Highlight critical flows or dependencies in the system.]