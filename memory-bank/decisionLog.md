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