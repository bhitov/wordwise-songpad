# Phase 2: MVP - Core Writing Assistant

**Goal:** To build a functional and usable product that delivers the project's primary value: a real-time writing assistant with document management. This phase corresponds to the "Core Clone" described in the `project-overview.md`.

**Outcome:** A logged-in user can create, view, and edit documents. While typing, they receive real-time, non-AI grammar and spelling suggestions in a sidebar and can apply those corrections to their text. All work is saved automatically.

---

### **Features & Tasks**

#### 1. User & Document Data Model
*   **Description:** Finalize the database schema for core user data and implement the sync with our authentication provider.
*   **Steps:**
    1.  Confirm the `users` and `documents` schemas in `src/lib/db/schema.ts` are complete for the MVP.
    2.  Implement a Clerk webhook handler that creates a new user record in our Supabase database upon successful sign-up.
    3.  Run the database migration to apply the schema.

#### 2. Document Management (Dashboard)
*   **Description:** Build the UI and backend logic for users to manage their documents.
*   **Steps:**
    1.  Develop the dashboard UI at `/dashboard` using a card-based layout to list the user's documents.
    2.  Create a Server Action to fetch all documents belonging to the currently authenticated user.
    3.  Implement the "New Document" feature: a button that triggers a Server Action to create a new document in the database and then redirects the user to the new editor page (`/editor/[documentId]`).

#### 3. Core Editor & Suggestions Engine
*   **Description:** Build the main editor interface and the non-AI suggestion functionality.
*   **Steps:**
    1.  Construct the two-column editor UI according to `ui-rules.md`, including the main text canvas and the right sidebar for suggestions.
    2.  Implement the back-end corrections service at `/api/corrections/route.ts`, which uses a library like `languagetool-api` to check text.
    3.  Build the `SuggestionsSidebar` component, which fetches corrections from our API as the user types (using debouncing to prevent excessive requests).
    4.  Create the `SuggestionCard` component to clearly display each correction and a button to apply it.
    5.  Implement the client-side logic to apply a correction to the text in the editor.

#### 4. Real-time Document Saving
*   **Description:** Ensure user work is never lost by implementing an auto-save feature.
*   **Steps:**
    1.  Set up a Zustand store (`editor-store.ts`) to manage the state of the document being edited, including its text content.
    2.  As the user types, update the content in the Zustand store.
    3.  Create a debounced Server Action that observes the store and saves the latest document content to the Supabase database a few seconds after the user stops typing. 