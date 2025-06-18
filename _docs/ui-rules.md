# UI Rules

This document defines the core design principles and user interface (UI) guidelines for the WordWise application. Our goal is to create an interface that is clean, intuitive, and professional, blending a modern aesthetic with a highly functional, focused user experience.

Our design system is a **Modern / Flat 2.0** style, characterized by clean layouts, subtle shadows for depth, and a strong emphasis on typography and white space.

---

## 1. Core Design Principles

These principles are the foundation of our design decisions and must be applied to all UI development.

*   **Clarity & Focus:** The UI must prioritize the user's primary task. In the dashboard, this means easy document access. In the editor, it means making writing and reviewing suggestions effortless. Visual clutter will be aggressively minimized.

*   **Visual Hierarchy:** Elements will be arranged to guide the user's attention. Size, color, and placement will be used to signify importance. Call-to-action buttons will be prominent, while secondary actions will be less emphasized.

*   **Consistent & Predictable:** The UI will be consistent across the application. Buttons, icons, and interactive elements will look and behave the same way everywhere. This is primarily enforced by our use of `Shadcn/UI` and our defined theme.

*   **Feedback & Communication:** The system must clearly communicate its status. Actions like saving, generating songs, or applying suggestions must provide immediate visual feedback (e.g., loading spinners, toasts, or status indicators).

*   **Accessibility (A11y):** The application must be usable by everyone. We will adhere to WCAG standards by ensuring sufficient color contrast, full keyboard navigability, and screen-reader compatibility for all components.

---

## 2. Application Layouts

This section defines the high-level structure of our main application views.

### 2.1. The Dashboard
*   **Purpose:** To provide a clear overview of the user's documents and easy access to create new ones.
*   **Layout:** A modern, card-based layout. Each document will be represented by a card displaying its title, a snippet of content, and the last modified date.
*   **Primary Action:** A prominent "New Document" button will be the main focal point of this page.

### 2.2. The Editor
*   **Purpose:** To provide a focused environment for writing, reviewing suggestions, and generating songs.
*   **Layout:** A two-column layout is mandatory.
    *   **Main Column (Editor Canvas):** This area will be minimalist, prioritizing the text itself. It will have generous padding and a comfortable line length to enhance readability.
    *   **Right Column (Suggestions Sidebar):** This column will display a list of real-time grammar, style, and AI-powered lyric suggestions.
        *   Each suggestion will be presented in a clean, actionable card format.
        *   The design of this sidebar must be clean and scannable, using clear typography and iconography to differentiate between suggestion types (e.g., grammar vs. AI rhyme).

---

## 3. Component Styling

Our component library (`Shadcn/UI`) and styling framework (`Tailwind CSS`) will be used to implement these rules.

*   **Buttons:** Primary action buttons will have a solid background color. Secondary buttons will have a more subtle style (e.g., outline or ghost). All buttons will have a clear hover and active state.
*   **Cards:** Used for documents on the dashboard and suggestions in the editor sidebar. They will have a defined background color, soft shadows to create depth, and a consistent border-radius.
*   **Forms & Inputs:** Inputs will be clean and simple, with clear labels and visible focus states.
*   **Modals:** Used for confirmation dialogs or other focused tasks. They will appear with an overlay to dim the background content, focusing the user's attention. 