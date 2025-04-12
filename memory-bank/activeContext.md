# Active Context

Tracks the current work focus, recent changes, next steps, and active decisions for the project.

---

## Current Focus

- Refactoring frontend authentication state management from React Context to Zustand.
## Recent Changes

- Implemented frontend authentication:
    - Created API client for authentication endpoints (`authClient.ts`).
    - Refactored global state management from `AuthContext` to Zustand (`useAuthStore`).
    - Updated `AuthGuard` component to use `useAuthStore`.
    - Updated the Login page (`login/page.tsx`) to use `useAuthStore`.
    - Updated the main application layout (`layout.tsx`) to remove `AuthProvider` and initialize the store.
    - Removed unused `AuthContext.tsx` file.
- Refactored `layout.tsx` (Server Component) to use a new `ClientAuthWrapper.tsx` (Client Component). This resolves conflicts between server-side `metadata` export and client-side hooks/state initialization (e.g., `useEffect`, Zustand store hydration) needed for authentication checks within the layout.
- Completed UI component refactoring (PlayButton, NewReleaseCard, BookCard).
## Next Steps

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