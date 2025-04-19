# Active Context

Tracks the current work focus, recent changes, next steps, and active decisions for the project.

---

## Current Focus

- Completed implementation and optimization of the audio progress tracking and resume playback feature.
## Recent Changes

- Created and integrated unified frontend models for Book, Audio, Chapter, User, Role, and Status to match backend entities.
- Updated API config to import and use these models, ensuring type safety and consistency.
- Deprecated legacy frontend models in favor of unified interfaces.
- Refactored API clients to use TanStack Query for both authentication and book operations.
- Ensured all endpoints are compatible with backend nestjs-paginate structure and resolved config issues by using string literals for book endpoints.
- Removed create, update, and delete mutations from `bookClient.ts` as these are managed by the dashboard; frontend now only exposes read endpoints.
- Implemented frontend authentication:
    - Created API client for authentication endpoints (`authClient.ts`).
    - Refactored global state management from `AuthContext` to Zustand (`useAuthStore`).
    - Updated `AuthGuard` component to use `useAuthStore`.
    - Updated the Login page (`login/page.tsx`) to use `useAuthStore`.
    - Updated the main application layout (`layout.tsx`) to remove `AuthProvider` and initialize the store.
    - Removed unused `AuthContext.tsx` file.
- Refactored `layout.tsx` (Server Component) to use a new `ClientAuthWrapper.tsx` (Client Component). This resolves conflicts between server-side `metadata` export and client-side hooks/state initialization (e.g., `useEffect`, Zustand store hydration) needed for authentication checks within the layout.
- Completed UI component refactoring (PlayButton, NewReleaseCard, BookCard).
- [2025-04-12 20:31:17] Enforced React Query + Zustand pattern for authentication/session management:
    - Removed all direct calls to authStore stubs (`login`, `checkSession`), which now throw errors if called.
    - Refactored login page to use `useLoginUser` mutation and update Zustand store on success/error.
    - Refactored ClientAuthWrapper to use `useCurrentUser` and update store state.
    - Split Next.js layout: kept metadata export in server component, moved QueryClientProvider and all client logic to `ClientLayout` client component.
    - Authentication/session flow is now robust, modular, and fully Next.js-compliant.
- [2025-04-19 13:14:40] Implemented the mini-player component:
    - Created `MiniPlayer.tsx` for the fixed mini-player UI.
    - Updated `useAudioStore` with `currentTrack`, `isFullPlayerVisible`, and `isMiniPlayerActive` states and actions.
    - Integrated `MiniPlayer` into `ClientLayout.tsx` with conditional rendering based on `isMiniPlayerActive`.
    - Added logic to `frontend/src/app/player/page.tsx` to control `isFullPlayerVisible` and `isMiniPlayerActive` on mount/unmount and close button click.
    - Implemented click handling on `MiniPlayer` to open the full player and stop propagation on controls.
    - Added logic to pause audio when the mini-player close button is clicked.
    - Adjusted mini-player vertical position (`bottom-16`) and z-index (`zIndex: 1000`).
    - Added robust placeholder image handling for MiniPlayer cover art.
- [2025-04-19 17:31:00] Implemented core audio playback:
    - Updated `NewReleaseCard` to construct stream URL (`/api/v1/books/:id/stream`) and set track info in `useAudioStore` on play click.
    - Updated `PlayerPage` to display dynamic track info from store.
    - Removed placeholder audio logic from `AudioPlayer`.
- [2025-04-19 17:31:00] Implemented persistence for `currentTrack` in `useAudioStore` using Zustand `persist` middleware and `localStorage`.
- [2025-04-19 17:31:00] Added rehydration logic in `ClientLayout` to restore audio state from `localStorage` on load.
- [2025-04-19 17:52:21] Refactored audio track setting:
    - Modified `useAudioStore` (`setCurrentTrack`) to accept a `Book` object instead of `TrackInfo`.
    - Moved stream URL construction (`/api/v1/books/:id/stream`) logic into `useAudioStore`.
    - Updated `NewReleaseCard` to pass the `Book` object directly to `setCurrentTrack`.
- [2025-04-19 19:34:04] - Completed implementation and optimization of audio progress tracking and resume playback:
    - Implemented backend WebSocket gateway (`progress.gateway.ts`) and REST endpoint (`progress.controller.ts`, `progress.service.ts`) using Redis for storage.
    - Implemented frontend WebSocket hook (`useWebSocket.ts`), API client (`progressClient.ts`), and integrated into `AudioPlayer.tsx`.
    - Handled real-time updates via WebSocket (`updateProgress`) and fetching initial progress via REST (`GET /api/v1/progress/:bookId`).
    - Implemented throttled updates during playback and immediate saving on pause/close.
    - Used `useRef` flags in `AudioPlayer.tsx` to manage asynchronous loading and prevent race conditions for reliable resume playback.
    - Refactored backend to use JWT for user ID and frontend to use appropriate hooks and state management (`useAuthStore`, `useAudioStore`).
    - Optimized code and dependencies.
## Next Steps

- Refactor all frontend API and state logic to use the new unified models for all book, audio, chapter, and user operations.
- Implement refresh token handling for improved session persistence.
- Add user profile display/management page.
- Consider social login integration options (e.g., Google).
- Continue refactoring any remaining duplicated UI elements.
- Update technical and product documentation based on recent changes.

## Active Decisions & Considerations

- Refactored authentication state management to use Zustand (`useAuthStore`) instead of React Context API.
- Stored authentication tokens (e.g., JWT) in `localStorage`.
- Implemented `AuthGuard` component to protect authenticated routes, integrated into the main layout.
- All repeated UI elements should be componentized for maximum reusability.
- Maintain visual consistency and ease of use for components.
## Insights & Learnings

- Zustand (`useAuthStore`) provides a centralized and potentially more performant way to manage and access user authentication status compared to the previous Context implementation.
- `AuthGuard` simplifies route protection logic by wrapping protected content.
- Componentization of UI elements (cards, buttons) significantly reduced duplication and improved maintainability.
[2025-04-19 13:49:47] - Updated backend CORS configuration in `main.ts` to allow requests from the frontend development server origin (`http://localhost:3000`).