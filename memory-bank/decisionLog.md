# Decision Log

[2025-04-12 19:23:21] - Aligned and synchronized all backend entities (Book, Audio, Chapter, User, etc.) with new TypeScript interfaces in the frontend for full structural and type consistency.  
- Created: `frontend/src/lib/models/Book.ts`, `Audio.ts`, `Chapter.ts`, `User.ts`
- Updated API config to import and use these models.
- Deprecated legacy frontend models in favor of unified interfaces.
- Ensured all fields, types, and relationships match backend entities.

[2025-04-12 19:35:50] - Refactored `frontend/src/lib/api/authClient.ts` to use TanStack Query (react-query) hooks for all authentication actions, ensuring modularity and testability.
- Removed local User interface in favor of importing from `frontend/src/lib/models/User.ts`.
- Created `frontend/src/lib/api/bookClient.ts` with TanStack Query hooks for paginated book listing and single book fetch, using nestjs-paginate response structure. Removed create, update, and delete mutations as these are managed by the dashboard.
- Resolved endpoint config issues by using string literals for book endpoints.

[2025-04-12 20:30:51] - Enforced React Query + Zustand pattern for authentication and session management.
- Removed all direct calls to authStore stubs (`login`, `checkSession`), which now throw errors if called.
- Refactored login page to use `useLoginUser` mutation and update Zustand store on success/error.
- Refactored ClientAuthWrapper to use `useCurrentUser` and update store state.
- Split Next.js layout: kept metadata export in server component, moved QueryClientProvider and all client logic to `ClientLayout` client component.
- Authentication/session flow is now robust, modular, and fully Next.js-compliant.
[2025-04-19 12:34:00] - Decided to use Zustand for central audio player state management. This allows multiple components to interact with the audio state without prop drilling.
[2025-04-19 12:34:00] - Placed the core `AudioPlayer` component containing the `<audio>` element in the root layout (`frontend/src/app/layout.tsx`). This ensures the audio playback persists across different pages and is managed centrally. UI controls on specific pages (like the player page) will interact with the audio state via the Zustand store.
[2025-04-19 13:16:14] - Implemented state management for player visibility (full and mini) using Zustand (`isFullPlayerVisible`, `isMiniPlayerActive`) within the `useAudioStore`. This centralizes control over which player UI is displayed. Added `currentTrack` to the store to provide track information to the mini-player. Integrated the `MiniPlayer` component into `ClientLayout.tsx` with conditional rendering based on `isMiniPlayerActive`. Implemented logic in `player/page.tsx` and `MiniPlayer.tsx` to toggle these states and handle navigation/audio playback on open/close actions. Adjusted mini-player positioning (`bottom-16`) and z-index (`zIndex: 1000`) for correct display above the bottom navigation bar. Added event propagation stop to mini-player controls.
[2025-04-19 13:49:47] - Modified backend CORS settings in `main.ts` to explicitly allow `http://localhost:3000` (frontend dev server) instead of the previous `http://localhost:3001`. This resolves potential CORB errors during frontend development.
[2025-04-19 17:31:00] - Implemented Zustand `persist` middleware for `useAudioStore` to save `currentTrack` to `localStorage`. Rationale: Persist the currently playing track across page refreshes for better UX, excluding playback time as per requirements. Rehydration logic added to `ClientLayout.tsx`.
[2025-04-19 18:49:19] - Created frontend API client for fetching audio progress (`frontend/src/lib/api/progressClient.ts`).
- Uses shared `apiClient` and TanStack Query (`useFetchProgress` hook).
- Targets existing backend endpoint: `GET /api/v1/progress/:userId/:bookId`.
- Aligned with patterns in `authClient.ts` and `bookClient.ts`.
[2025-04-19 19:33:39] - Decided to use WebSocket (socket.io) for real-time progress updates (`updateProgress` event) stored in Redis.
[2025-04-19 19:33:39] - Decided to create a backend REST endpoint (`GET /api/v1/progress/:bookId`) protected by JWT to fetch saved progress from Redis for resume functionality.
[2025-04-19 19:33:39] - Decided to handle final progress saving on the frontend `pause` event (triggered by pause/close) rather than a separate backend WebSocket event.
[2025-04-19 19:33:39] - Decided to use `useRef` flags in `AudioPlayer.tsx` to manage the timing of fetching progress and loading metadata for reliable resume playback, especially on refresh/track switch.
[2025-04-19 19:33:39] - Decided to refactor the backend progress controller endpoint to get `userId` from JWT instead of URL param.