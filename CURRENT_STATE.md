# WordWise Project - Current State Documentation

## Project Overview

WordWise is an AI-powered writing assistant that serves as a Grammarly clone with enhanced AI features specifically designed for rap lyrics writing and song generation. The project is built with Next.js 15, TypeScript, and integrates multiple AI services for text enhancement and music generation.

## Technology Stack

### Core Framework
- **Next.js 15.3.4** with App Router
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **Turbopack** for development builds

### Backend & Database
- **Supabase/PostgreSQL** for data storage
- **Drizzle ORM** for database operations
- **Clerk** for authentication

### AI Services
- **OpenAI API** (GPT-4o) for text enhancement and lyric generation
- **Mureka AI** for song generation from lyrics
- **LanguageTool** for grammar and spell checking

### State Management & UI
- **Zustand** for client-side state management
- **TipTap** for rich text editing
- **Shadcn/UI** components with Radix UI primitives

---

## Project Structure

### Root Directory
```
/
├── _docs/                     # Project documentation
├── public/                    # Static assets
├── scripts/                   # Test and utility scripts
├── src/                       # Main source code
├── supabase/                  # Supabase configuration
├── package.json               # Dependencies and scripts
├── next.config.ts             # Next.js configuration
├── drizzle.config.ts          # Database ORM configuration
├── tsconfig.json              # TypeScript configuration
└── tailwind.config.js         # Tailwind CSS configuration
```

---

## Source Code Structure (`src/`)

### Authentication & Middleware
- **`middleware.ts`**: Clerk authentication middleware protecting `/dashboard` and `/editor` routes

### App Directory (`src/app/`)

#### Route Groups
- **`(auth)/`**: Authentication pages
  - `sign-in/page.tsx`: Sign-in page
  - `sign-up/page.tsx`: Sign-up page
- **`(main)/`**: Protected application routes
  - `dashboard/page.tsx`: User dashboard with document list
  - `editor/[documentId]/`: Document editor interface

#### API Routes (`src/app/api/`)
- **`ai/`**: AI-powered text processing
  - `suggestions/route.ts`: Handles "Make it Rhyme" and "Generate Verses" actions
  - `whole-text/route.ts`: Handles full-text AI operations like "Generate Chorus"
- **`corrections/route.ts`**: Grammar and spelling check endpoint
- **`documents/`**: Document CRUD operations
  - `[documentId]/route.ts`: GET/PUT document operations
  - `[documentId]/delete/route.ts`: Document deletion
- **`song/`**: Song generation and management
  - `generate/route.ts`: Initiate song generation with Mureka AI
  - `[documentId]/route.ts`: Fetch songs for a document
  - `status/[taskId]/route.ts`: Check song generation status
  - `webhook/route.ts`: Handle Mureka AI webhooks
- **`webhooks/clerk/route.ts`**: Clerk user management webhooks

#### Core Files
- **`layout.tsx`**: Root layout with Clerk provider and Inter font
- **`page.tsx`**: Landing page
- **`globals.css`**: Global styles and Tailwind base styles

---

## Components (`src/components/`)

### AI Components (`src/components/ai/`)
- **`contextual-menu.tsx`**: AI action menu that appears on text selection
- **`ai-contextual-wrapper.tsx`**: Wrapper component managing text selection and menu display
- **`index.ts`**: Barrel exports for AI components

### Shared Components (`src/components/shared/`)
- **`tiptap-editor.tsx`**: Main rich text editor component (707 lines)
  - TipTap editor configuration
  - Grammar checking integration
  - Auto-save functionality
  - Character count and placeholder
- **`suggestions-sidebar.tsx`**: Grammar/spelling corrections sidebar (341 lines)
  - Displays LanguageTool corrections
  - Correction application and dismissal
  - Categorized by grammar, spelling, style
- **`generated-songs-list.tsx`**: Song display and playback component (352 lines)
  - Lists generated songs for a document
  - Audio playback controls
  - Song status tracking
- **`document-card.tsx`**: Document card with delete functionality (194 lines)
  - Document preview and metadata
  - Delete confirmation dialog
  - Hover-based delete button
- **`ai-actions-dropdown.tsx`**: Dropdown for whole-text AI operations (108 lines)
  - Generate Chorus, Add Verse actions
  - Genre-aware action descriptions
- **`song-settings-panel.tsx`**: Song configuration panel (84 lines)
  - Genre selection dropdown
  - Song description textarea
  - Character limit counter

### UI Components (`src/components/ui/`)
Shadcn/UI components:
- `button.tsx`, `card.tsx`, `dropdown-menu.tsx`
- `label.tsx`, `scroll-area.tsx`, `select.tsx`
- `separator.tsx`, `textarea.tsx`, `badge.tsx`

---

## Library Code (`src/lib/`)

### Database (`src/lib/db/`)
- **`schema.ts`**: Drizzle schema definitions
  - `users` table: User accounts synced from Clerk
  - `documents` table: User documents with song settings
  - `songs` table: Generated songs with Mureka task tracking
- **`index.ts`**: Database connection setup with PostgreSQL
- **`migrations/`**: Drizzle migration files and metadata

### AI Services (`src/lib/ai/`)
- **`index.ts`**: Barrel exports for AI functionality
- **`actions-handler.ts`**: Logic for determining available AI actions (266 lines)
  - Text analysis (word count, sentence detection)
  - Action availability rules
  - Genre-specific action labels
- **`mureka.ts`**: Mureka AI client for song generation (151 lines)
  - Song generation API calls
  - Status checking and webhook handling
  - Genre-specific prompt generation
- **`openai.ts`**: Legacy compatibility exports

#### OpenAI Module (`src/lib/ai/openai/`)
- **`client.ts`**: Centralized OpenAI API client (135 lines)
  - Chat completion wrapper
  - Error handling and logging
  - Rate limit management
- **`make-it-rhyme.ts`**: "Make it Rhyme" functionality (117 lines)
  - Genre-specific rhyme transformation
  - Context-aware processing
- **`song-enhancement.ts`**: Song enhancement features (207 lines)
  - `generateChorus()`: Add chorus to existing lyrics
  - `addVerse()`: Add additional verses
  - `generateVersesFromDescription()`: Create verses from description
  - `hasSubstantialSongContent()`: Content analysis helper

### Core Business Logic (`src/lib/core/`)
- **`checker.ts`**: LanguageTool integration (169 lines)
  - Grammar and spell checking
  - API client with custom configuration
  - Disabled whitespace rules to reduce noise
  - Response transformation for UI consumption

### State Management (`src/lib/store/`)
- **`editor-store.ts`**: Zustand store for editor state (396 lines)
  - Document state management
  - Corrections handling with race condition prevention
  - Auto-save functionality
  - UI state (sidebar, selected corrections)
  - Actions for content updates and AI transformations

### Hooks (`src/lib/hooks/`)
- **`use-ai-contextual-menu.ts`**: Custom hook for AI contextual menu
  - Text selection detection
  - Menu positioning and lifecycle
  - 500ms delay before showing menu
- **`use-debounce.ts`**: Debouncing utility hook

### Actions (`src/lib/actions/`)
- **`documents.ts`**: Server actions for document operations
  - Document CRUD operations
  - User authentication checks
  - Database queries with Drizzle

### Utilities
- **`utils.ts`**: Tailwind class merging utility
- **`validators/`**: Zod schemas for API validation

---

## Types (`src/types/`)
- **`index.ts`**: Global TypeScript definitions
  - `Genre` type: 'rock' | 'rap' | 'country'
  - `GENRES` constant array

---

## Test Scripts (`scripts/`)
- **`test-openai.ts`**: OpenAI API connectivity testing
- **`test-ai-actions.ts`**: AI action logic validation (8 test cases)
- **`test-make-it-rhyme.ts`**: "Make it Rhyme" functionality testing
- **`test-generate-verses.ts`**: "Generate Verses" functionality testing
- **`test-integration.ts`**: End-to-end AI workflow testing
- **`test-languagetool.js`**: LanguageTool API testing
- **`test-editor.js`**: Editor functionality testing
- **`tsconfig.json`**: TypeScript configuration for scripts

---

## Key Features & Functionality

### 1. Document Management
- **CRUD Operations**: Create, read, update, delete documents
- **Auto-save**: Automatic saving with debouncing
- **Title Editing**: Inline title editing with auto-save
- **User Isolation**: Documents are user-specific via Clerk authentication

### 2. Text Editing & Grammar Checking
- **Rich Text Editor**: TipTap-based editor with extensions
- **Real-time Grammar Check**: LanguageTool integration with 200ms debouncing
- **Correction Suggestions**: Sidebar with categorized corrections
- **Whitespace Rules Disabled**: Reduced noise from spacing corrections
- **Character Count**: Live character counting display

### 3. AI Text Enhancement
- **Contextual AI Menu**: Appears on text selection with 500ms delay
- **Make it Rhyme**: Transform selected text to rhyme (2+ sentences, multiple words)
- **Generate Verses from Description**: Create verses from 8+ word descriptions
- **Genre Support**: Rock, rap, country with genre-specific prompts
- **Context-Aware**: Uses surrounding text for better AI results

### 4. Whole-Text AI Operations
- **Generate Chorus**: Add chorus to existing song lyrics
- **Add Verse**: Append additional verses to songs
- **No Label Output**: AI responses exclude structural markers like [Chorus]

### 5. Song Generation
- **Mureka AI Integration**: Convert lyrics to complete songs
- **Asynchronous Processing**: Task-based generation with status tracking
- **Webhook Support**: Real-time status updates
- **Audio Playback**: Built-in audio player for generated songs
- **Genre-Specific Generation**: Tailored prompts for different music styles

### 6. Song Settings
- **Genre Selection**: Dropdown with rock, rap, country options
- **Description Field**: 500-character song description with counter
- **Auto-save Integration**: Settings changes trigger document save

### 7. User Interface
- **Responsive Design**: Mobile-friendly layout
- **Sidebar Management**: Collapsible corrections sidebar
- **Loading States**: Comprehensive loading indicators
- **Toast Notifications**: User feedback for actions
- **Confirmation Dialogs**: Safe deletion with warnings

---

## Database Schema

### Users Table
```sql
users (
  id VARCHAR(255) PRIMARY KEY,     -- Clerk user ID
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### Documents Table
```sql
documents (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id),
  title TEXT NOT NULL,
  content TEXT,
  content_html TEXT,
  song_genre VARCHAR(50) DEFAULT 'rap',
  song_description TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### Songs Table
```sql
songs (
  id VARCHAR(255) PRIMARY KEY,
  document_id VARCHAR(255) REFERENCES documents(id) ON DELETE CASCADE,
  mureka_task_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'preparing',
  song_url TEXT,
  failed_reason TEXT,
  prompt TEXT,
  model VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

---

## API Endpoints

### Authentication
- Protected by Clerk middleware
- User context available in all API routes

### AI Services
- `POST /api/ai/suggestions`: Text selection AI actions
- `POST /api/ai/whole-text`: Full document AI operations
- `POST /api/corrections`: Grammar and spelling checks

### Document Management
- `GET/PUT /api/documents/[documentId]`: Document operations
- `DELETE /api/documents/[documentId]/delete`: Document deletion

### Song Generation
- `POST /api/song/generate`: Initiate song generation
- `GET /api/song/[documentId]`: Fetch document's songs
- `GET /api/song/status/[taskId]`: Check generation status
- `POST /api/song/webhook`: Handle Mureka webhooks

### Webhooks
- `POST /api/webhooks/clerk`: User management sync

---

## Development Scripts

### Package.json Scripts
- `dev`: Start development server with Turbopack
- `build`: Production build
- `db:generate`: Generate Drizzle migrations
- `db:migrate`: Run database migrations
- `db:push`: Push schema changes to database
- `test:*`: Various testing scripts for different components

---

## Environment Configuration

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `CLERK_SECRET_KEY`: Clerk authentication secret
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk public key
- `OPENAI_API_KEY`: OpenAI API access key
- `MUREKA_API_KEY`: Mureka AI API access key
- `MUREKA_API_URL`: Mureka AI base URL

---

## Current Development Status

### Completed Features ✅
- ✅ User authentication with Clerk
- ✅ Document CRUD operations
- ✅ Rich text editing with TipTap
- ✅ Real-time grammar checking with LanguageTool
- ✅ AI text enhancement (Make it Rhyme, Generate Verses)
- ✅ Whole-text AI operations (Generate Chorus, Add Verse)
- ✅ Song generation with Mureka AI
- ✅ Audio playback for generated songs
- ✅ Responsive UI with Tailwind CSS
- ✅ Auto-save functionality
- ✅ Genre support (rock, rap, country)
- ✅ Song settings panel
- ✅ Document deletion with confirmation
- ✅ Comprehensive test suite

### Architecture Strengths
- **Modular Design**: Clear separation of concerns
- **Type Safety**: Comprehensive TypeScript coverage
- **Scalable State Management**: Zustand with proper store organization
- **AI-First Architecture**: Designed for easy AI tool navigation
- **Race Condition Prevention**: Proper async handling in grammar checking
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Performance Optimized**: Debounced operations and efficient re-renders

### Technical Debt & Areas for Improvement
- **File Size Management**: Some files approaching 500-line limit
- **Test Coverage**: Integration tests could be expanded
- **Error Recovery**: Could improve handling of AI service failures
- **Caching**: Could implement better caching for AI responses
- **Offline Support**: No offline functionality currently

---

## Recent Changes & Updates

### Latest Implementation
- Added "Generate Verses from Description" AI action
- Enhanced OpenAI prompt engineering to exclude structural labels
- Improved contextual menu delay timing (500ms)
- Centralized AI functionality in modular OpenAI directory
- Added comprehensive genre support across all AI features
- Implemented song settings with auto-save integration

### Code Quality Improvements
- Modular AI service architecture
- Comprehensive JSDoc documentation
- Consistent error handling patterns
- Race condition prevention in async operations
- Proper TypeScript strict mode compliance

This documentation represents the current state as of the most recent development session and should be updated as the project evolves. 