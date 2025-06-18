# Theme Rules

This document defines the foundational visual style of the WordWise application. These rules ensure a consistent, clean, and professional aesthetic that aligns with our **Modern / Flat 2.0** design system.

These definitions are intended to be implemented directly within our `tailwind.config.js` file.

---

## 1. Color Palette

The color palette is designed for clarity, readability, and a modern feel, and will be used to define our default (light) theme.

```
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;

--card: 0 0% 100%;
--card-foreground: 222.2 84% 4.9%;

--popover: 0 0% 100%;
--popover-foreground: 222.2 84% 4.9%;

--primary: 221.2 83.2% 53.3%;
--primary-foreground: 210 40% 98%;

--secondary: 210 40% 96.1%;
--secondary-foreground: 222.2 47.4% 11.2%;

--muted: 210 40% 96.1%;
--muted-foreground: 215.4 16.3% 46.9%;

--accent: 210 40% 96.1%;
--accent-foreground: 222.2 47.4% 11.2%;

--destructive: 0 84.2% 60.2%;
--destructive-foreground: 210 40% 98%;

--border: 214.3 31.8% 91.4%;
--input: 214.3 31.8% 91.4%;
--ring: 222.2 84% 4.9%;
```

---

## 2. Typography

*   **Font Family:** We will use the **Inter** typeface for all UI text. It's a highly readable, modern sans-serif font that works well for both headings and body copy. It should be imported from Google Fonts.

*   **Font Sizes & Weights:** We will establish a clear typographic scale.
    *   `h1`: 3rem (36px), font-bold
    *   `h2`: 2.25rem (30px), font-semibold
    *   `h3`: 1.875rem (24px), font-semibold
    *   `p` (body): 1rem (16px), font-normal
    *   `small`: 0.875rem (14px), font-medium

---

## 3. Spacing & Sizing

A consistent spacing scale is critical for a balanced layout. The scale will be based on `rem` units, where `1rem = 16px`. This will be configured in Tailwind CSS.

*   **Base Unit:** 0.25rem (4px)
*   **Common Values:**
    *   `p-1` (padding: 4px)
    *   `p-2` (padding: 8px)
    *   `p-4` (padding: 16px)
    *   `p-6` (padding: 24px)
    *   `p-8` (padding: 32px)

---

## 4. Border Radius

To maintain a consistent visual language for all elements, we will use a standardized set of border radii.

*   `sm`: 0.25rem (4px) - For small elements like badges or inputs.
*   `md`: 0.5rem (8px) - For standard components like buttons and cards.
*   `lg`: 1rem (16px) - For larger containers or modals. 