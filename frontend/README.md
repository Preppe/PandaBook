# Next.js State-of-the-Art Starter Kit

A robust, modern, and extensible Next.js starter project (April 2025 best practices) with TypeScript, App Router, Tailwind CSS, ESLint, import alias, and a curated set of essential libraries for rapid, scalable development.

---

## 📖 Overview

This project provides a production-ready foundation for building modern web applications using the latest Next.js features and the most effective tools in the React ecosystem. It is designed for scalability, maintainability, and developer productivity.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view your app.

---

## 🏗️ Project Structure

```
frontend/
├─ public/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  └─ about/
│  │     └─ page.tsx
│  ├─ components/
│  │  ├─ Counter.tsx
│  │  └─ ui/
│  │     └─ button.tsx
│  └─ lib/
│     └─ zustandStore.ts
├─ components.json
├─ package.json
├─ tsconfig.json
├─ tailwind.config.js
├─ postcss.config.mjs
├─ next.config.ts
└─ README.md
```

---

## 🛠️ Step-by-Step Setup

### 1. **Project Creation**

Created with:

```bash
npx create-next-app@latest frontend \
  --ts \
  --tailwind \
  --eslint \
  --src-dir \
  --app \
  --import-alias "@/*"
```

### 2. **Install Core Libraries**

```bash
npm install zustand @shadcn/ui @radix-ui/react-slot @radix-ui/react-icons \
  react-hook-form zod clsx tailwind-merge @tanstack/react-query framer-motion date-fns
```

### 3. **Initialize shadcn/ui**

```bash
npx shadcn@latest init
npx shadcn@latest add button
```

---

## 🧩 Key Features & Examples

### App Router & Layout

- Uses `src/app/` directory for routing and layouts.
- Example: `src/app/layout.tsx` sets up global styles and HTML structure.

### TypeScript & Import Alias

- All code is TypeScript-first.
- Use `@/` as the import alias for clean imports.

### Tailwind CSS

- Utility-first styling, configured out of the box.
- Use `clsx` and `tailwind-merge` for dynamic and safe className composition.

### State Management (Zustand)

**src/lib/zustandStore.ts**
```ts
import { create } from "zustand"

type State = { count: number }
type Actions = { increment: () => void }

export const useCounterStore = create<State & Actions>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}))
```

**src/components/Counter.tsx**
```tsx
'use client'
import { useCounterStore } from "@/lib/zustandStore"

export default function Counter() {
  const { count, increment } = useCounterStore()
  return (
    <div className="mt-4">
      <span className="mr-2">Count: {count}</span>
      <button onClick={increment} className="px-2 py-1 bg-blue-500 text-white rounded">Increment</button>
    </div>
  )
}
```

### UI Components (shadcn/ui & Radix UI)

- Example: `src/components/ui/button.tsx` (auto-generated)
- Use shadcn/ui CLI to add more components as needed.

### Routing Example

**src/app/about/page.tsx**
```tsx
export default function AboutPage() {
  return <div className="p-8">About this project...</div>
}
```

### Form Handling (React Hook Form + Zod)

**Example:**
```tsx
'use client'
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const schema = z.object({ email: z.string().email() })

export default function FormPage() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  })

  async function onSubmit(data: any) {
    alert(JSON.stringify(data))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input {...register("email")} placeholder="Email" className="border p-2" />
      {errors.email && <span className="text-red-500">{errors.email.message}</span>}
      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Submit</button>
    </form>
  )
}
```

---

## 💡 Best Practices

- **Use Server Components by default**; use `"use client"` only when necessary.
- **Organize code** under `src/` for clarity and scalability.
- **Leverage import alias** (`@/`) for maintainable imports.
- **Use shadcn/ui** for accessible, themeable UI primitives.
- **Validate forms** with Zod and React Hook Form for type safety.
- **Use Zustand** for simple, scalable state management.
- **Use TanStack Query** for client-side data fetching and caching.
- **Use clsx + tailwind-merge** for safe, dynamic className composition.
- **Keep dependencies up to date** for security and performance.

---

## ⚙️ Technical Requirements

- Node.js 18+ (recommended: latest LTS)
- npm 9+ (or yarn/pnpm)
- Modern browser for development

---

## ❓ FAQ

### Q: How do I add a new shadcn/ui component?
A: Run `npx shadcn@latest add <component>` (e.g., `button`, `input`, etc.).

### Q: How do I use the import alias?
A: Import modules using `@/` (e.g., `import X from "@/components/X"`).

### Q: How do I add a new page?
A: Create a new folder and `page.tsx` under `src/app/` (e.g., `src/app/about/page.tsx`).

### Q: How do I use Zustand for state?
A: See `src/lib/zustandStore.ts` and `src/components/Counter.tsx` for a working example.

### Q: How do I validate forms?
A: Use React Hook Form with Zod as shown in the example above.

### Q: How do I fetch data on the client?
A: Use TanStack Query (`@tanstack/react-query`) or SWR.

### Q: How do I animate components?
A: Use Framer Motion (`framer-motion`).

### Q: How do I handle dates?
A: Use date-fns (`date-fns`).

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Docs](https://ui.shadcn.com/docs)
- [Zustand Docs](https://docs.pmnd.rs/zustand)
- [React Hook Form Docs](https://react-hook-form.com/)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [date-fns Docs](https://date-fns.org/)

---

## 📝 License

MIT
