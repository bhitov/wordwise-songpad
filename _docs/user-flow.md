# User Flow

This document outlines the user journey through the WordWise application, from initial landing to using advanced AI features.

---

## 1. Unauthenticated User Journey

This flow describes the experience of a user who has not yet signed up or logged in.

### 1.1. Landing Page
- **Entry Point:** The user arrives at the main landing page.
- **Content:** The page showcases the app's core features (grammar checking, AI lyric writing), includes a call-to-action (CTA) to sign up, and provides navigation to other parts of the site like "Features" and "Login."
- **Action:** The user can explore the page or click on the "Sign Up" or "Login" buttons.

### 1.2. Authentication (Clerk)
- **Entry Point:** The user clicks the "Sign Up" or "Login" button.
- **Process:** This action triggers the Clerk authentication flow. The user interacts with a Clerk-provided interface (modal or redirect) to sign up or log in using various methods (e.g., email/password, social logins).
- **Outcome:** Upon successful authentication, Clerk redirects the user back to the application, specifically to their dashboard.

---

## 2. Authenticated User Journey

This flow describes the experience of a logged-in user.

### 2.1. Dashboard / Document Management
- **Entry Point:** The user lands on their dashboard after logging in or signing up.
- **Content:** The dashboard displays a list of the user's existing documents and a prominent button to create a new one.
- **Actions:**
    - Click on an existing document to open it in the editor.
    - Create a new document.
    - Delete existing documents.

### 2.2. Creating a New Document
- **Entry Point:** The user clicks the "New Document" button on the dashboard.
- **Process:** A new, blank document is created and opened in the text editor interface. The document is automatically saved.

---

## 3. The Editor Experience

This is the core interface where users write and edit their text.

### 3.1. Basic Writing
- **Interface:** A clean, distraction-free text editor.
- **Functionality:** Users can type, edit, and format text. Changes are saved automatically in real-time.

### 3.2. Core Writing Assistance (Grammarly Clone)
- **Real-time Feedback:** As the user types, the system underlines potential grammar, spelling, and style issues.
- **Suggestions:** Clicking on an underlined word or phrase reveals a card with an explanation of the issue and one or more suggestions for correction.
- **Actions:**
    - The user can click a suggestion to apply it directly to the text.
    - The user can dismiss the suggestion.

---

## 4. AI-Powered Rap Lyric Writing

This flow details how users interact with the specialized AI features for writing rap lyrics.

### 4.1. Activating AI Features
- **Trigger:** The user highlights a selection of text within the editor.
- **Interface:** A contextual menu appears near the highlighted text, displaying the available AI actions.

### 4.2. AI Actions

#### 4.2.1. Make it Rhyme
- **Action:** User selects the "Make it Rhyme" option from the context menu.
- **Process:** The AI analyzes the highlighted text and suggests alternative phrasings that maintain the original meaning but improve the rhyme and flow.
- **Outcome:** The user can accept the suggestion to replace the highlighted text.

#### 4.2.2. Build Lyrics from Description
- **Action:** User highlights a descriptive prompt (e.g., "a song about winning") and selects "Build Lyrics".
- **Process:** The AI generates a set of rap lyrics based on the description provided.
- **Outcome:** The generated lyrics are presented to the user, who can then insert them into the document.

#### 4.2.3. Rhyme with Previous Sentence
- **Action:** The user writes a line, highlights it, and selects "Rhyme with Previous".
- **Process:** The AI analyzes the preceding sentence and rewrites the highlighted sentence to create a rhyme.
- **Outcome:** The user can accept the rhyming suggestion.

---

## 5. Song Generation Flow

This flow covers turning the written lyrics into an actual song.

### 5.1. Initiating Song Generation
- **Trigger:** From the document editor page (perhaps a "Generate Song" button), the user initiates song creation.
- **Process:** The lyrics from the current document are sent to the Mureka API for processing.

### 5.2. Viewing and Managing Generated Songs
- **Interface:** The document editing page includes a section to display all songs generated from that document's lyrics.
- **Content:** Each generated song is listed, possibly with a player to listen to it.
- **Storage:** The song files are stored on Mureka's servers, and a reference to them is stored in the application's database, linked to the user and the document. 