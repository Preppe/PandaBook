# Active Context

Tracks the current work focus, recent changes, next steps, and active decisions for the project.

---

## Current Focus

- Aligned and synchronized all backend entities (Book, Audio, Chapter, User, etc.) with new TypeScript interfaces in the frontend for full structural and type consistency.
- Refactored `frontend/src/lib/api/authClient.ts` to use TanStack Query (react-query) hooks for authentication (login, logout, current user, refresh token), removing local User interface in favor of the model.
- Created `frontend/src/lib/api/bookClient.ts` with TanStack Query hooks for paginated book listing, single book fetch, create, update, and delete, using nestjs-paginate response structure.
- Refactoring frontend authentication state management from React Context to Zustand.
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