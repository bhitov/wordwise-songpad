# Project Rules

This document outlines the architectural and organizational rules for the WordWise project. Adherence to these guidelines is essential for building a clean, scalable, and maintainable AI-first codebase.

---

## 1. Core Philosophy

*   **AI-First & Modular:** Our codebase is designed to be easily understood and navigated by both human developers and modern AI tools. This means prioritizing clarity, modularity, and explicit code over clever or overly complex abstractions.
*   **Scalability:** The architecture must support our phased development plan, from MVP to a feature-rich application, without requiring major refactoring.
*   **Clarity over Conciseness:** Code should be self-documenting whenever possible. Use descriptive variable and function names.

---

## 2. Directory Structure

We will use a feature-centric organization within the Next.js App Router framework.

```
/
├── _docs/                # Project documentation (overview, rules, etc.)
├── public/               # Static assets (images, fonts, favicons)
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── (auth)/       # Clerk-related pages and routing
│   │   │   ├── sign-in/
│   │   │   └── sign-up/
│   │   ├── (main)/       # Core application routes (protected by auth middleware)
│   │   │   ├── dashboard/  # User's main document view
│   │   │   └── editor/[documentId]/ # The main editor interface
│   │   ├── api/          # Server-side API routes
│   │   │   ├── ai/         # Handlers for OpenAI text generation (e.g., lyric writing)
│   │   │   ├── corrections/  # Handlers for non-AI grammar/spelling checks
│   │   │   └── song/       # Handlers for Mureka song generation
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Public landing page
│   │
│   ├── components/       # Reusable React components
│   │   ├── ui/           # Unmodified Shadcn/UI components
│   │   ├── icons/        # Custom icon components
│   │   └── shared/       # Custom, composite components built for this app
│   │
│   ├── lib/              # Core logic, utilities, and external service clients
│   │   ├── core/         # Core non-AI business logic
│   │   │   └── checker.ts  # Logic for grammar/spell checking library
│   │   ├── db/           # Drizzle ORM configuration and schema
│   │   │   ├── index.ts
│   │   │   └── schema.ts
│   │   ├── ai/           # Clients for interacting with AI services
│   │   │   ├── openai.ts
│   │   │   └── mureka.ts
│   │   ├── store/        # Zustand state management stores
│   │   ├── utils.ts      # General utility functions
│   │   └── validators.ts # Zod schemas for runtime validation
│   │
│   ├── styles/           # Global styles
│   │   └── globals.css
│   │
│   └── types/            # Global TypeScript type definitions
│       └── index.ts
│
├── .env.local            # Local environment variables (DO NOT COMMIT)
├── next.config.mjs       # Next.js configuration
└── tsconfig.json         # TypeScript configuration
```

---

## 3. File Naming Conventions

*   **Components:** `PascalCase.tsx`. (e.g., `DocumentCard.tsx`, `SuggestionsSidebar.tsx`)
*   **Pages & Layouts:** Next.js requires specific names (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`). Folders containing these files should be `kebab-case`. (e.g., `/editor/[document-id]/page.tsx`)
*   **All Other Files:** `kebab-case.ts`. (e.g., `theme-rules.md`, `db-helpers.ts`)

---

## 4. Coding & Style Conventions

### General
*   **Formatting:** All code will be formatted automatically using **Prettier** with the `prettier-plugin-tailwindcss` for class sorting.
*   **File Size:** No file should exceed 500 lines. If a file grows too large, it must be refactored into smaller, more focused modules.

### TypeScript
*   **Strict Mode:** `strict: true` is enabled in `tsconfig.json` and must be adhered to.
*   **No `any`:** The `any` type is forbidden. Use specific types, generics, or `unknown` for type-safe handling of dynamic data.
*   **JSDoc/TSDoc:** All functions, types, and non-trivial code blocks must be documented with descriptive TSDoc comments explaining their purpose, parameters, and return values.

### React & Next.js
*   **Functional Components:** Exclusively use functional components with hooks.
*   **Server First:** Default to **Server Components**. Only use a `'use client'` directive for components that require interactivity (hooks like `useState`, `useEffect`) or browser-only APIs.
*   **Data Fetching:**
    *   **From Client to Server:** Client Components (e.g., `SuggestionsSidebar`) will fetch data from our own internal API routes (`/api/...`).
    *   **Server to External API:** Our internal API routes are responsible for making any calls to external services (OpenAI, Supabase, etc.).
    *   **Mutations:** Use **Server Actions** for all data mutations.
*   **State Management:**
    *   Use React's built-in hooks (`useState`, `useReducer`) for local component state.
    *   Use **Zustand** for complex, client-side state that needs to be shared across multiple components (e.g., state of the editor UI).

### Database & ORM
*   **Single Schema:** The entire database schema is defined in `src/lib/db/schema.ts`.
*   **Migrations:** All schema changes must be managed via Drizzle Kit migrations. Do not make changes directly in the Supabase dashboard.

### API Usage
*   **Server-Side Only:** All calls to external APIs (OpenAI, Mureka, Supabase, grammar checkers) must be made from the server (API Routes, Server Actions, or Server Components) to protect API keys and other secrets.
*   **API Route Specialization:**
    *   `/api/corrections`: For fast, rule-based grammar and spelling checks (non-AI).
    *   `/api/ai`: For creative, generative AI features from OpenAI (e.g., lyric writing).
    *   `/api/song`: For asynchronous song generation via Mureka.
*   **Environment Variables:** All secrets must be stored in environment variables and accessed via `process.env`. 