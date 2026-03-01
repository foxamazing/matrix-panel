# Tasks

- [x] Task 1: Enhance Theme Presets & CSS
    - [x] SubTask 1.1: Update `ThemeConfig` in `types/theme.ts` to include `animation` (spring, duration) and `assets` (noise, pattern) fields.
    - [x] SubTask 1.2: Update `presets.ts` to populate these new fields for all 5 themes.
    - [x] SubTask 1.3: Add global keyframes in `index.css` for Glitch, Shimmer, and Scanline animations.

- [x] Task 2: Implement Dynamic Background Textures
    - [x] SubTask 2.1: Update `src/components/Background.tsx` to render an overlay layer based on `themeConfig.assets.overlay` (e.g., 'noise', 'grid', 'scanline').
    - [x] SubTask 2.2: Ensure textures respond to light/dark mode (opacity adjustments).

- [x] Task 3: Upgrade Window Component
    - [x] SubTask 3.1: Refactor `Window.tsx` header controls to switch styles based on theme (Mac-dots vs Win-square vs Pixel-text). (Targeted `SettingsModal.tsx` as it acts as the main window).
    - [x] SubTask 3.2: Apply theme-specific entry animations (ScaleUp vs SlideUp vs Glitch).

- [x] Task 4: Polish Interactions (Micro-interactions)
    - [x] SubTask 4.1: Add "Brutal" specific button click effect (translate-x/y without scale).
    - [x] SubTask 4.2: Add "Glass" shimmer effect on hover for cards.
    - [x] SubTask 4.3: Add "Cyberpunk" text glitch effect on hover for key elements.

- [x] Task 5: Context Menu & Dialog Polish
    - [x] SubTask 5.1: Create/Update `ContextMenu` to use `glass-panel` and theme variables. (Targeted `ConfirmModal` and generic modal containers).
    - [x] SubTask 5.2: Ensure all system dialogs (Alerts, Prompts) match the theme.

# Task Dependencies
- Task 2 and 3 depend on Task 1 updates.
