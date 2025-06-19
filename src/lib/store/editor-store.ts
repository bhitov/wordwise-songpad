/**
 * @file Zustand store for managing editor state and corrections.
 * Handles document content, grammar/spelling corrections, and auto-save functionality
 * with proper race condition prevention.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { SimplifiedCorrection } from '@/lib/core/checker';

/**
 * Document state interface
 */
export interface Document {
  id: string;
  title: string;
  content: string;
  updatedAt: Date;
  createdAt: Date;
}

/**
 * Editor state interface
 */
interface EditorState {
  // Document data
  document: Document | null;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;

  // Corrections data
  corrections: SimplifiedCorrection[];
  isCheckingGrammar: boolean;
  lastCheckedContent: string;
  checkRequestId: string | null; // For preventing race conditions
  hasPerformedInitialCheck: boolean; // Track if initial grammar check is complete

  // UI state
  selectedCorrectionId: string | null;
  sidebarOpen: boolean;

  // Actions
  setDocument: (document: Document) => void;
  updateContent: (content: string) => void;
  updateTitle: (title: string) => void;
  setCorrections: (corrections: SimplifiedCorrection[], requestId: string) => void;
  setIsCheckingGrammar: (isChecking: boolean) => void;
  setCheckRequestId: (requestId: string | null) => void;
  selectCorrection: (correctionId: string | null) => void;
  applyCorrectionById: (correctionId: string, newText: string) => void;
  dismissCorrectionById: (correctionId: string) => void;
  setSaving: (isSaving: boolean) => void;
  setLastSaved: (date: Date) => void;
  toggleSidebar: () => void;
  clearCorrections: () => void;
  reset: () => void;
}

/**
 * Initial state
 */
const initialState = {
  document: null,
  isLoading: false,
  isSaving: false,
  lastSaved: null,
  hasUnsavedChanges: false,
  corrections: [],
  isCheckingGrammar: false,
  lastCheckedContent: '',
  checkRequestId: null,
  hasPerformedInitialCheck: false,
  selectedCorrectionId: null,
  sidebarOpen: true,
};

/**
 * Editor store with devtools for debugging
 */
export const useEditorStore = create<EditorState>()(
  devtools(
    (set, get) => ({
      ...initialState,

             /**
        * Set the current document
        */
       setDocument: (document: Document) => {
         set(
           {
             document,
             isLoading: false,
             hasUnsavedChanges: false,
             lastCheckedContent: '',
             corrections: [],
             hasPerformedInitialCheck: false,
           },
           false,
           'setDocument'
         );
       },

      /**
       * Update document content and mark as having unsaved changes
       */
      updateContent: (content: string) => {
        const { document } = get();
        if (!document) return;

        set(
          {
            document: {
              ...document,
              content,
            },
            hasUnsavedChanges: true,
          },
          false,
          'updateContent'
        );
      },

      /**
       * Update document title and mark as having unsaved changes
       */
      updateTitle: (title: string) => {
        const { document } = get();
        if (!document) return;

        set(
          {
            document: {
              ...document,
              title,
            },
            hasUnsavedChanges: true,
          },
          false,
          'updateTitle'
        );
      },

             /**
        * Set corrections with race condition prevention
        */
       setCorrections: (corrections: SimplifiedCorrection[], requestId: string) => {
         const { checkRequestId } = get();
         
         // Only update if this is the most recent request
         if (checkRequestId === requestId) {
           set(
             {
               corrections,
               isCheckingGrammar: false,
               lastCheckedContent: get().document?.content || '',
               hasPerformedInitialCheck: true,
             },
             false,
             'setCorrections'
           );
         }
       },

      /**
       * Set grammar checking state
       */
      setIsCheckingGrammar: (isChecking: boolean) => {
        set({ isCheckingGrammar: isChecking }, false, 'setIsCheckingGrammar');
      },

      /**
       * Set the current check request ID for race condition prevention
       */
      setCheckRequestId: (requestId: string | null) => {
        set({ checkRequestId: requestId }, false, 'setCheckRequestId');
      },

      /**
       * Select a correction for highlighting
       */
      selectCorrection: (correctionId: string | null) => {
        set({ selectedCorrectionId: correctionId }, false, 'selectCorrection');
      },

      /**
       * Apply a correction by replacing text and removing it from corrections
       */
      applyCorrectionById: (correctionId: string, newText: string) => {
        const { corrections, document } = get();
        if (!document) return;

        const correction = corrections.find(c => c.id === correctionId);
        if (!correction) return;

        // Replace the text in the document content
        const content = document.content;
        const before = content.substring(0, correction.offset);
        const after = content.substring(correction.offset + correction.length);
        const newContent = before + newText + after;

        // Calculate offset adjustment for remaining corrections
        const offsetDiff = newText.length - correction.length;

        // Update remaining corrections' offsets
        const updatedCorrections = corrections
          .filter(c => c.id !== correctionId)
          .map(c => ({
            ...c,
            offset: c.offset > correction.offset ? c.offset + offsetDiff : c.offset,
          }));

        set(
          {
            document: {
              ...document,
              content: newContent,
            },
            corrections: updatedCorrections,
            hasUnsavedChanges: true,
            selectedCorrectionId: null,
          },
          false,
          'applyCorrectionById'
        );
      },

      /**
       * Dismiss a correction without applying it
       */
      dismissCorrectionById: (correctionId: string) => {
        const { corrections } = get();
        const updatedCorrections = corrections.filter(c => c.id !== correctionId);

        set(
          {
            corrections: updatedCorrections,
            selectedCorrectionId: null,
          },
          false,
          'dismissCorrectionById'
        );
      },

      /**
       * Set saving state
       */
      setSaving: (isSaving: boolean) => {
        set({ isSaving }, false, 'setSaving');
      },

      /**
       * Set last saved timestamp and clear unsaved changes
       */
      setLastSaved: (date: Date) => {
        set(
          {
            lastSaved: date,
            hasUnsavedChanges: false,
          },
          false,
          'setLastSaved'
        );
      },

      /**
       * Toggle sidebar visibility
       */
      toggleSidebar: () => {
        set(
          (state) => ({ sidebarOpen: !state.sidebarOpen }),
          false,
          'toggleSidebar'
        );
      },

             /**
        * Clear all corrections
        */
       clearCorrections: () => {
         set(
           {
             corrections: [],
             selectedCorrectionId: null,
             isCheckingGrammar: false,
             checkRequestId: null,
             hasPerformedInitialCheck: false,
           },
           false,
           'clearCorrections'
         );
       },

      /**
       * Reset store to initial state
       */
      reset: () => {
        set(initialState, false, 'reset');
      },
    }),
    {
      name: 'editor-store',
    }
  )
); 