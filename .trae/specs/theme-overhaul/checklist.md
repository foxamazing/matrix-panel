# Theme System Verification Checklist

- [x] Theme Switching
    - [x] Switching from "Glass" to "Minimal" removes all blur and rounded corners immediately.
    - [x] Switching to "Brutal" adds thick black borders and hard shadows.
    - [x] Switching to "Neumorphic" adds soft, extruded shadows.
    - [x] Switching to "Cyberpunk" enforces dark mode and adds neon borders.

- [x] Layout Adaptation
    - [x] "Glass" theme uses the standard grid layout with floating icons.
    - [x] "Minimal" theme uses a compact list or clean grid layout.
    - [x] "Brutal" theme allows for asymmetrical or offset placement.
    - [x] "Neumorphic" theme uses spacious padding and soft transitions.
    - [x] "Cyberpunk" theme uses a dense, data-heavy HUD layout.

- [x] Component Styling
    - [x] Windows have correct header styles (Mac dots vs Windows vs Text).
    - [x] Buttons have correct hover states (Lift vs Inset vs Glow vs Hard Shift).
    - [x] Inputs have correct focus states (Glow vs Border vs Underline).
    - [x] Typography changes according to theme (Pixel vs Sans vs Monospace).

- [x] Performance
    - [x] Theme switching is smooth (< 300ms).
    - [x] No layout shifts or flashes during theme transition.
