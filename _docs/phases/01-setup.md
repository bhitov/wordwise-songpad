# Phase 1: Initial Project Setup

**Goal:** To initialize the project with our chosen technology stack, establish the complete directory structure, set up all required third-party services, and create a functional but empty application shell that is ready for feature development.

**Outcome:** A developer can pull the repository, install dependencies, provide their own `.env.local` file, and run a working Next.js application that is connected to Clerk for authentication and a Supabase database.

---

### **Features & Tasks**

#### 1. Project Initialization
*   **Description:** Bootstrap the Next.js application and configure the foundational tooling.
*   **Steps:**
    1.  Initialize a new Next.js project using `create-next-app` with TypeScript and Tailwind CSS.
    2.  Install all primary dependencies: `drizzle-orm`, `@clerk/nextjs`, `shadcn-ui`, `openai`, `zustand`, `zod`, and `languagetool-api`.
    3.  Initialize `shadcn-ui` and configure `globals.css` with the color and theme variables defined in `theme-rules.md`.
    4.  Set up Prettier with the `prettier-plugin-tailwindcss` to enforce consistent code formatting.
    5.  Initialize a Git repository and perform the initial commit.

#### 2. Service & Environment Setup
*   **Description:** Configure all external services and local environment variables.
*   **Steps:**
    1.  Create a new project in Supabase and retrieve the database connection string.
    2.  Create a new application in Clerk and retrieve the necessary API keys.
    3.  Create an OpenAI API key.
    4.  Create a Mureka AI API key.
    5.  Create the `.env.local` file from `.env.example` and populate it with all required keys and secrets.

#### 3. Application & Database Structure
*   **Description:** Build out the skeleton of our application according to our architectural rules.
*   **Steps:**
    1.  Implement the complete, empty directory structure defined in `project-rules.md`.
    2.  Define the initial Drizzle schema in `src/lib/db/schema.ts` for `users` and `documents`.
    3.  Configure Drizzle Kit and generate the initial SQL migration file.
    4.  Set up the Clerk middleware in `middleware.ts` to protect all routes under the `(main)` group.
    5.  Create placeholder pages for the landing page (`/`), dashboard (`/dashboard`), and the editor (`/editor/[documentId]`). 