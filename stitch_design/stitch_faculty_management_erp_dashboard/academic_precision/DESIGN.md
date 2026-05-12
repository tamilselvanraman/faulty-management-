---
name: Academic Precision
colors:
  surface: '#fcf8ff'
  surface-dim: '#dcd8e5'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f2ff'
  surface-container: '#f0ecf9'
  surface-container-high: '#eae6f4'
  surface-container-highest: '#e4e1ee'
  on-surface: '#1b1b24'
  on-surface-variant: '#464555'
  inverse-surface: '#302f39'
  inverse-on-surface: '#f3effc'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#575e70'
  on-secondary: '#ffffff'
  secondary-container: '#d9dff5'
  on-secondary-container: '#5c6274'
  tertiary: '#7e3000'
  on-tertiary: '#ffffff'
  tertiary-container: '#a44100'
  on-tertiary-container: '#ffd2be'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#dce2f7'
  secondary-fixed-dim: '#c0c6db'
  on-secondary-fixed: '#141b2b'
  on-secondary-fixed-variant: '#404758'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb695'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#fcf8ff'
  on-background: '#1b1b24'
  surface-variant: '#e4e1ee'
typography:
  h1:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: -0.01em
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  gutter: 24px
  container-max: 1440px
---

## Brand & Style

This design system is built on the principles of **Modern Minimalism** with a focus on institutional reliability. It moves away from the cluttered, legacy aesthetic of traditional ERPs toward a high-performance, SaaS-oriented interface inspired by industry leaders like Stripe and Linear. 

The brand personality is professional, efficient, and sophisticated. It aims to evoke a sense of calm and clarity for administrators, faculty, and students alike. The visual language relies on significant whitespace, a disciplined color palette, and high-quality typography to organize complex data into digestible, card-based layouts.

## Colors

The palette is anchored by a deep **Indigo** primary, symbolizing intelligence and stability. The background uses a subtle off-white to reduce eye strain during long periods of administrative work, while the text employs a high-contrast Dark Gray for maximum legibility.

- **Primary:** Used for main actions, active states, and critical branding elements.
- **Surface:** Pure white (#FFFFFF) is reserved for cards and modals to create a distinct lift from the soft gray background.
- **Borders:** Low-contrast Soft Gray is used to define structure without adding visual noise.
- **States:** Semantic colors (Success, Warning, Error) follow standard SaaS conventions but are desaturated slightly to remain cohesive with the premium aesthetic.

## Typography

This design system utilizes **Inter** for its neutral, highly legible characteristics. The typographic scale is optimized for information density, ensuring that even data-heavy tables remain readable.

- **Headlines:** Use tighter letter-spacing and heavier weights to establish clear hierarchy.
- **Body:** Standardized at 16px for general content, with a 14px variant for denser dashboard widgets.
- **Labels:** Uppercase labels with slight tracking (letter-spacing) should be used for table headers and small categorizations.

## Layout & Spacing

The design system employs a **Fluid Grid** model with fixed-width maximums for large screens. A 12-column system is used for dashboard layouts, allowing for flexible card widths (e.g., 4 columns for small metrics, 8 columns for primary charts).

- **Margins:** Page margins are set to 32px on desktop to provide breathing room.
- **Rhythm:** An 8px linear scale (built on a 4px base unit) governs all padding and margins to ensure mathematical harmony between elements.
- **Stacking:** Elements within cards should use the `sm` (8px) or `md` (16px) units to maintain a compact, "pro" feel.

## Elevation & Depth

Hierarchy is achieved through **Tonal Layers** and **Ambient Shadows**. Instead of heavy borders, the system uses subtle depth cues to separate the background from the interactive layers.

- **Level 0 (Base):** The Background (#F9FAFB).
- **Level 1 (Surface):** White cards with a 1px border (#E5E7EB) and no shadow.
- **Level 2 (Hover/Active):** White cards with a soft, diffused shadow (0px 4px 12px rgba(0, 0, 0, 0.05)) to indicate interactivity.
- **Level 3 (Overlay):** Modals and dropdowns with a more pronounced shadow (0px 10px 25px rgba(0, 0, 0, 0.1)) and a subtle 1px border.

## Shapes

The shape language is consistently **Rounded**, reflecting a modern and accessible interface. 

- **Cards & Large Containers:** Use a 12px or 16px radius (`rounded-xl`) to soften the large surface areas.
- **Buttons & Inputs:** Use a 8px radius (`rounded-lg`) to maintain a professional, clickable appearance.
- **Tags & Badges:** Can utilize full pill-shaped rounding for distinct categorization.

## Components

### Buttons
- **Primary:** Solid Indigo background with white text. High-contrast, 8px radius.
- **Secondary:** White background with a Soft Gray border and Dark Gray text.
- **Tertiary:** Ghost style; no background or border until hover.

### Tables
- **Styling:** Clean, borderless rows with 1px bottom dividers.
- **Interactivity:** Subtle hover state (Background: #F3F4F6) for row highlighting.
- **Typography:** 14px text for data; 12px uppercase for headers.

### Input Fields
- **Default:** White background, 1px border (#E5E7EB), 8px radius. 
- **Focus:** Border changes to Indigo with a subtle 2px outer glow (ring).

### Cards
- **Structure:** White background, 12px radius, 1px border. 
- **Header:** Optional 1px bottom border to separate card titles from content.

### Icons
- **Style:** Lucide-style icons with a 2px stroke width. Icons should be consistently sized at 20px for buttons and 24px for navigation.

### Specialized ERP Components
- **Status Pills:** Small, high-radius badges with low-opacity background colors (e.g., light green background with dark green text for "Enrolled").
- **Date Pickers:** Minimalist calendar view with the primary Indigo used for the selected range.