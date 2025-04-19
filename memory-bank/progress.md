[2025-04-12 19:23:59] - Completed full alignment and synchronization of backend entities with frontend models.  
- Created unified TypeScript interfaces for Book, Audio, Chapter, User, Role, and Status in the frontend.
- Updated API config to use these models.
- Updated Memory Bank (activeContext.md, decisionLog.md) to reflect architectural and implementation changes.
[2025-04-12 19:39:28] - Removed create, update, and delete mutations from `bookClient.ts` so that only read endpoints (paginated list and single book fetch) are exposed in the frontend, per project requirements. Memory Bank updated accordingly.
[2025-04-12 19:36:25] - Refactored `authClient.ts` to use TanStack Query hooks and removed local User interface in favor of model import. Created `bookClient.ts` with TanStack Query hooks for paginated, CRUD, and single book operations using nestjs-paginate structure. Updated endpoints to use string literals for compatibility. Memory Bank updated accordingly.
[2025-04-12 20:31:40] - Completed refactor of authentication/session management:
- Enforced React Query + Zustand pattern for all authentication and session logic.
- Removed all direct calls to authStore stubs (`login`, `checkSession`), which now throw errors if called.
- Refactored login page to use `useLoginUser` mutation and update Zustand store on success/error.
- Refactored ClientAuthWrapper to use `useCurrentUser` and update store state.
- Split Next.js layout: kept metadata export in server component, moved QueryClientProvider and all client logic to `ClientLayout` client component.
- Authentication/session flow is now robust, modular, and fully Next.js-compliant.
- Memory Bank updated accordingly.
[2025-04-19 12:34:08] - Created Zustand store for audio player state management (`frontend/src/lib/store/audioStore.ts`).
[2025-04-19 12:34:08] - Created `AudioPlayer` component (`frontend/src/components/AudioPlayer.tsx`) to house the `<audio>` element and connect to the Zustand store.
[2025-04-19 12:34:08] - Moved `AudioPlayer` component to the root layout (`frontend/src/app/layout.tsx`).
[2025-04-19 12:34:08] - Updated player page (`frontend/src/app/player/page.tsx`) to connect existing UI controls (play/pause button, progress bar) to the Zustand store.
[2025-04-19 12:34:08] - Removed duplicate basic controls from `AudioPlayer.tsx`.
[2025-04-19 13:14:30] - Completed implementation of the mini-player component, including state management for visibility, basic controls, and integration into the main layout.
[2025-04-19 13:49:47] - Updated backend CORS configuration in `backend/src/main.ts` to allow origin `http://localhost:3000` for frontend development.
[2025-04-19 17:29:00] - Implemented core audio playback functionality:
  - Updated `NewReleaseCard` to fetch stream URL (`/api/v1/books/:id/stream`) on play click.
  - Updated `useAudioStore` to store `currentTrack` (including stream URL).
  - Updated `PlayerPage` to display track info from `useAudioStore`.
  - Removed placeholder audio logic from `AudioPlayer`.
  - Corrected image URL handling in `MiniPlayer`.
[2025-04-19 17:29:00] - Implemented persistence for `currentTrack` in `useAudioStore` using Zustand `persist` middleware and `localStorage`.
[2025-04-19 17:29:00] - Added rehydration logic in `ClientLayout` to restore audio source and mini-player visibility from persisted state on page load.
[2025-04-19 18:49:26] - Created frontend API client `frontend/src/lib/api/progressClient.ts` with `useFetchProgress` hook using TanStack Query to fetch user-specific book progress from `GET /api/v1/progress/:userId/:bookId`.
[2025-04-19 19:33:53] - Implemented backend WebSocket gateway (`progress.gateway.ts`) to receive `updateProgress` and save to Redis.
[2025-04-19 19:33:53] - Implemented backend service (`progress.service.ts`) and controller (`progress.controller.ts`) for `GET /api/v1/progress/:bookId` endpoint to retrieve progress from Redis.
[2025-04-19 19:33:53] - Implemented frontend WebSocket hook (`useWebSocket.ts`).
[2025-04-19 19:33:53] - Implemented frontend API client (`progressClient.ts`) with `useFetchProgress` hook.
[2025-04-19 19:33:53] - Implemented throttled progress updates during playback in `AudioPlayer.tsx`.
[2025-04-19 19:33:53] - Implemented immediate final progress saving on `pause` event in `AudioPlayer.tsx`.
[2025-04-19 19:33:53] - Implemented resume playback logic in `AudioPlayer.tsx` using `useFetchProgress` and `useRef` flags.
[2025-04-19 19:33:53] - Fixed resume playback bugs related to page refresh and track switching.
[2025-04-19 19:33:53] - Optimized related code (removed logs, comments, redundant handlers, corrected endpoint signature).
[2025-04-19 19:33:53] - Moved `@types/lodash.throttle` to `devDependencies`.