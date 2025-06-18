# Phase 4: AI Song Enhancement

**Goal:** To implement the ultimate feature of the application: transforming a user's written lyrics into a fully generated audio track using the Mureka AI API. This phase corresponds to the "AI Enhancement - Songs" section of the `project-overview.md`.

**Outcome:** A user can initiate a song generation task from the editor page. The UI will provide feedback on the task's progress and, upon completion, will display the generated song in an audio player, linked permanently to the source document.

---

### **Features & Tasks**

#### 1. Database Schema for Songs
*   **Description:** Extend our database schema to store information about generated songs and their asynchronous task status.
*   **Steps:**
    1.  Add a new `songs` table to the schema in `src/lib/db/schema.ts`.
    2.  Define the table columns, including a foreign key to the `documents` table, `mureka_task_id` (string), `status` (string), and a nullable `song_url` (string).
    3.  Generate and run the new database migration.

#### 2. Asynchronous Song Generation Service
*   **Description:** Build the complete, asynchronous workflow for interacting with the Mureka API.
*   **Steps:**
    1.  Implement the Mureka API client service in `src/lib/ai/mureka.ts`.
    2.  Create an API route at `/api/song/generate/route.ts`. This route takes a `documentId`, calls our Mureka service to start the generation task, and creates a new record in our `songs` table with the returned `task_id`.
    3.  Create an API route at `/api/song/webhook/route.ts` to serve as a webhook endpoint for Mureka.
    4.  This webhook must validate the incoming request and, upon receiving a `succeeded` status, update the corresponding `songs` record with the final `song_url`.
    5.  Ensure robust error handling for all API interactions and database operations.

#### 3. Editor UI for Song Generation
*   **Description:** Integrate the song generation and management features directly into the editor page.
*   **Steps:**
    1.  Add a prominent "Generate Song" button to the editor UI. This button will call our `/api/song/generate` endpoint.
    2.  Create a new component, `GeneratedSongsList`, to be displayed on the editor page.
    3.  This component will fetch and display all songs associated with the current document.
    4.  Each item in the list should display the song's status (`generating`, `complete`, `failed`).
    5.  For completed songs, the component must include an HTML5 audio player to play the track from the `song_url`. 