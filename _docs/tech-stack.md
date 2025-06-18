# Tech Stack

This document outlines the primary technologies chosen for the WordWise project. Each component has been selected to create a modern, scalable, and maintainable AI-first application. It also includes best practices, conventions, and limitations for each technology.

---

### **Core Framework & Language**

*   **Framework: Next.js**
    *   **Description:** A production-grade React framework that provides a robust foundation for our full-stack application. We will leverage its App Router for building a clear, organized structure for UI pages, API routes, and server-side logic.
    *   **Best Practices & Conventions:**
        *   **App Router:** Utilize the App Router for all new development to leverage Server Components, layouts, and streamlined data fetching.
        *   **Component Types:** Default to Server Components for performance. Use Client Components (`'use client'`) only when interactivity or browser-only APIs are needed.
        *   **File Organization:** Structure the app using route groups `(groupName)` to organize features without affecting the URL structure.
        *   **Data Fetching:** Use Server Actions for data mutations (POST, PUT, DELETE) and fetch data directly in Server Components for read operations.
        *   **Optimizations:** Leverage built-in components like `next/image` and `next/font` to optimize assets automatically.
    *   **Limitations & Common Pitfalls:**
        *   **Complexity:** The App Router's caching and revalidation strategies can be complex. Careful attention must be paid to `cache`, `next: { revalidate: ... }`, and `revalidatePath`/`revalidateTag` to ensure data freshness.
        *   **'use client' Boundary:** Be mindful of the boundary between Server and Client Components. Data cannot be passed as props from Server to Client Components after the initial render.

*   **Language: TypeScript**
    *   **Description:** A superset of JavaScript that adds static typing. TypeScript will be used across the entire codebase to ensure type safety, improve developer experience, and catch potential errors early.
    *   **Best Practices & Conventions:**
        *   **Strict Mode:** Enable `strict: true` in `tsconfig.json` to enforce a high level of type safety.
        *   **Explicit Types:** Avoid using `any`. Define explicit types for function parameters, return values, and data structures.
        *   **Validation:** Use `zod` for runtime validation of API requests and environment variables to bridge the gap between runtime and compile-time type safety.
    *   **Limitations & Common Pitfalls:**
        *   **Compile-Time Only:** TypeScript does not provide runtime type checking. Data from external APIs or user input must be validated at runtime.

*   **UI Library: React**
    *   **Description:** The leading library for building dynamic, component-based user interfaces. React is the foundation of our Next.js application.
    *   **Best Practices & Conventions:**
        *   **Functional Components:** Exclusively use functional components with hooks.
        *   **Composition:** Favor composition over inheritance. Build complex components by combining smaller, single-responsibility components.
        *   **State Management:** Start with built-in hooks like `useState`, `useReducer`, and `useContext`. For complex, shared client-side state, we will use Zustand.
    *   **Limitations & Common Pitfalls:**
        *   **Performance:** Unnecessary re-renders can degrade performance. Use `React.memo`, `useCallback`, and `useMemo` judiciously to optimize, but only after profiling.

*   **State Management: Zustand**
    *   **Description:** A lightweight, hook-based state management solution for React. We will use it for managing complex client-side state that is shared across multiple components.
    *   **Best Practices & Conventions:**
        *   **Store Slicing:** Create separate stores (slices) for different domains of state to avoid a single monolithic store.
        *   **Selectors:** Always use selectors in components to subscribe only to the pieces of state they need, preventing unnecessary re-renders.
        *   **Immutability:** Treat state as immutable. When updating the store, always return a new object.
    *   **Limitations & Common Pitfalls:**
        *   **SSR Complexity:** Using Zustand in a Next.js application requires careful handling to avoid sharing state between different user requests on the server. State should typically be initialized on the client.
        *   **Unopinionated:** Its flexibility requires team discipline to create and maintain consistent patterns for store structure.

---

### **Styling & UI Components**

*   **Styling: Tailwind CSS**
    *   **Description:** A utility-first CSS framework that allows for rapid, responsive UI development directly within the markup.
    *   **Best Practices & Conventions:**
        *   **Utility-First:** Apply utilities directly in the HTML/JSX. Avoid using `@apply` to create custom component classes, as this undermines the utility-first approach.
        *   **Configuration:** Customize `tailwind.config.js` to define our project's design system (colors, spacing, typography).
        *   **Readability:** Use a Prettier plugin (`prettier-plugin-tailwindcss`) to automatically sort classes for consistency.
    *   **Limitations & Common Pitfalls:**
        *   **Verbose Markup:** Can lead to long strings of classes in the markup. This is a trade-off for not having to switch between files. Abstracting JSX into components is the preferred way to manage this.

*   **Component Library: Shadcn/UI**
    *   **Description:** A collection of beautifully designed, accessible, and unstyled components that we copy into our project.
    *   **Best Practices & Conventions:**
        *   **Local Components:** Use the `shadcn-ui` CLI to add components. They are added directly to our codebase, giving us full control to modify them.
        *   **Composition:** Build new UI elements by composing the primitive components provided by Shadcn/UI.
    *   **Limitations & Common Pitfalls:**
        *   **Not a Dependency:** It's not a package we update via `npm`. We are responsible for manually updating component code if we want to get new features from the source.

---

### **Backend, Database & Authentication**

*   **Authentication: Clerk**
    *   **Description:** A complete user management and authentication service. Clerk will handle all user-facing authentication flows.
    *   **Best Practices & Conventions:**
        *   **Middleware Protection:** Use Clerk's Next.js middleware to protect routes and manage authentication state.
        *   **Database Sync:** Use Clerk webhooks to create a corresponding user record in our Supabase database upon sign-up, keeping our internal data in sync.
        *   **Environment Variables:** Store all Clerk keys (`CLERK_SECRET_KEY`, etc.) securely in Vercel's environment variables.
    *   **Limitations & Common Pitfalls:**
        *   **Third-Party Dependency:** We are reliant on Clerk's service and uptime. Customization of the UI is powerful but limited to what their components expose.

*   **Backend & Database: Supabase**
    *   **Description:** An open-source platform providing a suite of backend tools built around a PostgreSQL database.
    *   **Best Practices & Conventions:**
        *   **Row-Level Security (RLS):** RLS must be enabled on all tables containing sensitive or user-specific data. Policies should be written to ensure users can only access their own data.
        *   **Migrations:** Use Drizzle's migration tooling to manage all database schema changes. Avoid making changes directly in the Supabase UI.
        *   **Connection Pooling:** Use Supabase's built-in connection pooling for serverless function efficiency.
    *   **Limitations & Common Pitfalls:**
        *   **RLS Complexity:** Incorrect RLS policies are a common source of security vulnerabilities. They must be tested thoroughly.

*   **ORM: Drizzle ORM**
    *   **Description:** A lightweight, "headless" TypeScript ORM that provides a type-safe interface for our PostgreSQL database.
    *   **Best Practices & Conventions:**
        *   **Schema Definition:** Define the database schema in one location (e.g., `/src/db/schema.ts`).
        *   **Migrations:** Use `drizzle-kit` to generate SQL migration files based on schema changes. Never run `push` in production.
        *   **Querying:** Embrace the SQL-like syntax. Use prepared statements for frequently executed queries to maximize performance.
    *   **Limitations & Common Pitfalls:**
        *   **Maturity:** Less mature than alternatives like Prisma, so some tooling or advanced features may be missing. Requires a stronger understanding of SQL.

---

### **AI & Deployment**

*   **Text Generation AI: OpenAI API**
    *   **Description:** Used for all text-based AI features, including grammar checks and lyric generation.
    *   **Best practices & Conventions:**
        *   **Server-Side Only:** All API calls must be made from the server (Next.js API Routes or Server Components) to protect the API key.
        *   **Streaming:** For chat-like features, use the streaming API to deliver responses to the user chunk by chunk, improving perceived performance.
        *   **Error Handling:** Implement robust error handling for API failures, rate limits, and content moderation flags.
    *   **Limitations & Common Pitfalls:**
        *   **Cost:** API usage is metered and can become expensive. Monitor usage closely.
        *   **Latency:** Responses are not instantaneous. Design the UI to handle loading states gracefully.

*   **Song Generation AI: Mureka AI**
    *   **Description:** Used for the specialized task of converting lyrics into generated songs.
    *   **Best practices & Conventions:**
        *   **Asynchronous Flow:** The `/v1/song/generate` endpoint is asynchronous. Our application must:
            1.  Make the initial POST request.
            2.  Store the returned `task_id` in our database.
            3.  Use a webhook or polling mechanism to get the status of the task.
            4.  When the task succeeds, save the final song URL to our database.
        *   **User Feedback:** The UI must clearly communicate that the song is being generated and notify the user upon completion or failure.
    *   **Limitations & Common Pitfalls:**
        *   **Complexity:** The asynchronous nature adds significant architectural complexity compared to a simple request-response API.
        *   **Polling vs. Webhooks:** The Mureka docs don't specify a "get task status" endpoint or webhook system. We must assume one exists and plan for its implementation. If not, a polling strategy will be required, which is less efficient.

*   **Deployment: Vercel**
    *   **Description:** The primary platform for deploying and hosting our Next.js application.
    *   **Best practices & Conventions:**
        *   **Git Integration:** Connect the Vercel project to our GitHub repository for CI/CD.
        *   **Environment Variables:** Manage all secrets (API keys, database URLs) using Vercel's environment variable settings. Use different environments for Production, Preview, and Development.
        *   **Preview Deployments:** Use Vercel's automatic preview deployments for every pull request to test changes in a production-like environment before merging.
    *   **Limitations & Common Pitfalls:**
        *   **Cold Starts:** Serverless functions can experience "cold starts," causing initial latency on first load. This can be mitigated with provisioning, if necessary.
        *   **Execution Limits:** Be mindful of Vercel's execution limits for serverless functions on the free/pro tiers. Long-running tasks may need to be offloaded to a different service. 