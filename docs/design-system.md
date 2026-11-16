# JCB Rental Service — Design System v0.1

## Brand direction
Professional, dependable equipment-rental service. Corporate blue is the primary brand colour; surfaces remain neutral and legible. Use restrained shadows, clear hierarchy, generous spacing, and consistent rounded corners.

## Colour tokens
| Token | Value | Usage |
|---|---|---|
| brand-900 | #12345A | Deep brand / strong text on light surfaces |
| brand-800 | #174A78 | Primary navigation and emphasis |
| brand-700 | #1D5F96 | Primary actions |
| brand-600 | #2878B8 | Links and interactive accents |
| brand-100 | #E8F2FA | Soft brand surfaces |
| brand-50 | #F4F8FC | App background tint |
| neutral-950 | #17212B | Primary text |
| neutral-700 | #475569 | Secondary text |
| neutral-500 | #718096 | Muted text |
| neutral-300 | #D7DEE7 | Borders |
| neutral-100 | #F1F5F9 | Subtle surfaces |
| white | #FFFFFF | Cards and main surfaces |
| success | #16845B | Confirmed / completed |
| warning | #B7791F | Pending / attention |
| danger | #C2413B | Errors / destructive actions |

## Typography
- Typeface: platform-native sans-serif for the Android demo.
- Screen title: 24–28sp, semibold.
- Section heading: 18–20sp, semibold.
- Body: 14–16sp, regular.
- Supporting/meta: 12–13sp, regular.
- Buttons and key labels: 14–16sp, semibold.
- Avoid long all-caps labels.

## Layout and components
- 8dp spacing scale: 4, 8, 12, 16, 24, 32.
- Standard page gutter: 20dp; compact gutter: 16dp.
- Cards: 16dp radius, subtle border, restrained elevation.
- Buttons: 12dp radius, minimum 48dp height, clear pressed/disabled states.
- Inputs: minimum 52dp height, persistent labels, visible validation.
- Status chips: compact, text-labelled; never rely on colour alone.
- Touch targets: at least 48dp.
- Use icons consistently and pair unfamiliar icons with labels.

## Interaction principles
- One clear primary action per screen.
- Destructive actions require confirmation.
- Show loading, empty, error, success, and offline states.
- Use plain language and explicit status labels.
- Preserve entered form data when validation fails.

## Accessibility
- Maintain strong text/background contrast.
- Do not encode meaning by colour alone.
- Support larger system font settings without clipping.
- Provide meaningful labels for screen-reader controls.
- Keep controls reachable and comfortably sized.

## Currency and formatting
- Currency: INR (₹).
- Display examples with Indian digit grouping, e.g. ₹1,25,000.
- Dates and times will use India-local conventions in the app.
