# Tech Context

Documents the technologies used, development setup, technical constraints, dependencies, and tool usage patterns.

---

## Technologies Used

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **State Management:** Zustand (specifically `useAuthStore` for authentication)
- **API Communication:** `fetch` API (or specific library like `axios` if used in `authClient.ts`)
- **Browser Storage:** `localStorage` (for storing authentication tokens)
- [List other major technologies, frameworks, and languages.]
## Development Setup

[Describe the setup process and environment requirements.]

## Technical Constraints

- [List any technical limitations or constraints.]

## Dependencies

- [List key dependencies and their roles.]

## Tool Usage Patterns
- **Authentication:** `useAuthStore` manages global auth state (`isAuthenticated`, `user`, `isLoading`), `authClient` interacts with the backend API and manages tokens in `localStorage`, `AuthGuard` protects routes based on store state. Client-side initialization (e.g., store hydration) within the server component layout (`layout.tsx`) is handled via a dedicated `ClientAuthWrapper` component.
- [Describe other tool usage patterns.]
- [Describe how tools are used in the workflow.]