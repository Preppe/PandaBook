[2025-04-12 19:23:59] - Completed full alignment and synchronization of backend entities with frontend models.  
- Created unified TypeScript interfaces for Book, Audio, Chapter, User, Role, and Status in the frontend.
- Updated API config to use these models.
- Updated Memory Bank (activeContext.md, decisionLog.md) to reflect architectural and implementation changes.
[2025-04-12 19:39:28] - Removed create, update, and delete mutations from `bookClient.ts` so that only read endpoints (paginated list and single book fetch) are exposed in the frontend, per project requirements. Memory Bank updated accordingly.
[2025-04-12 19:36:25] - Refactored `authClient.ts` to use TanStack Query hooks and removed local User interface in favor of model import. Created `bookClient.ts` with TanStack Query hooks for paginated, CRUD, and single book operations using nestjs-paginate structure. Updated endpoints to use string literals for compatibility. Memory Bank updated accordingly.