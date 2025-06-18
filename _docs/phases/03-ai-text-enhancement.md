# Phase 3: AI Text Enhancement

**Goal:** To elevate the application beyond a simple corrector by integrating advanced AI features for creative writing, specifically tailored to generating rap lyrics. This phase corresponds to the "AI Enhancement - Text" section of the `project-overview.md`.

**Outcome:** While editing a document, a user can highlight text to bring up a contextual menu with AI actions. They can use this menu to get AI-powered suggestions for rhyming, lyric generation, and more, which are then displayed in the sidebar alongside standard corrections.

---

### **Features & Tasks**

#### 1. AI Lyric Generation Service
*   **Description:** Build the server-side infrastructure to communicate with the OpenAI API for creative text generation.
*   **Steps:**
    1.  Create the API route handler at `/api/ai/suggestions/route.ts`.
    2.  Implement the core OpenAI service logic in `src/lib/ai/openai.ts`.
    3.  Create distinct, exported functions for each AI action: `makeItRhyme`, `buildLyricsFromDescription`, and `rhymeWithPreviousSentence`.
    4.  Develop specialized system prompts for each function to instruct the OpenAI model on its specific task.
    5.  Ensure robust error handling for API failures, rate limits, and content moderation.

#### 2. Editor Contextual Menu
*   **Description:** Implement the primary UI for accessing the new AI features.
*   **Steps:**
    1.  Create a `ContextualMenu` component that appears near the user's cursor when they select/highlight text in the editor.
    2.  Populate the menu with buttons that correspond to the three AI actions.
    3.  The menu should only be visible when text is selected.
    4.  Wire up the buttons to trigger API calls to our `/api/ai/suggestions` endpoint, passing the selected text and the desired action.

#### 3. Integration with Suggestions Sidebar
*   **Description:** Unify the display of AI suggestions with the existing corrections in the sidebar.
*   **Steps:**
    1.  Modify the `SuggestionsSidebar` to fetch data from both the `/api/corrections` and `/api/ai/suggestions` endpoints.
    2.  Update the Zustand store (`editor-store.ts`) to manage the state for both types of suggestions, including their loading states.
    3.  Create a visual distinction in the `SuggestionCard` component to clearly differentiate between a standard correction (e.g., spelling) and an AI suggestion (e.g., rhyme). This could be a different icon, color, or title.
    4.  Ensure the "Apply" functionality works correctly for AI suggestions, replacing the user's highlighted text with the AI-generated content. 