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
## Component Relationships

- **Authentication Flow:**
    - `Login Page` uses `authClient` to request tokens from the backend.
    - `useAuthStore` stores user state and loading status, making them available globally. (Tokens are managed within `authClient` and `localStorage`).
    - `AuthGuard` checks `useAuthStore` state (`isAuthenticated`, `isLoading`) to allow/deny access to protected routes/components.
    - `authClient` handles communication with backend authentication endpoints.
- [Describe other major component interactions.]
## Critical Implementation Paths

- [Highlight critical flows or dependencies in the system.]