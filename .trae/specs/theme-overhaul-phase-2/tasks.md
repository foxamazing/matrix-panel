# Tasks

- [x] Task 1: Refactor Clock Component
    - [x] SubTask 1.1: Remove `text-adaptive` and hardcoded font sizes.
    - [x] SubTask 1.2: Use `themeConfig` to switch between `font-sans`, `font-mono`, and `font-pixel`.
    - [x] SubTask 1.3: Apply theme-specific shadows and gradients (or remove them for Minimal/Brutal).

- [x] Task 2: Refactor WeatherWidget
    - [x] SubTask 2.1: Replace `CapsuleView` hardcoded `bg-black/10` and `rounded-full` with `glass-panel` and `themeConfig.effects`.
    - [x] SubTask 2.2: Refactor `WeatherDetailModal` to use the same dynamic container styles as `SettingsModal`.
    - [x] SubTask 2.3: Ensure icons and text colors adapt to light/dark themes via CSS variables.

- [x] Task 3: Refactor SearchBar & StatsCards
    - [x] SubTask 3.1: Update `SearchBar` container to use `glass-panel` and dynamic radius.
    - [x] SubTask 3.2: Update `StatsCards` layout to support Masonry-like stacking for Brutal theme if possible, or just standard Grid.
    - [x] SubTask 3.3: Style progress bars according to theme (rounded vs square vs segmented).

- [x] Task 4: Refactor MusicWidget
    - [x] SubTask 4.1: Update cover art style (Circle vs Square vs Pixelated).
    - [x] SubTask 4.2: Update control buttons to use the new `Button` component or match its style.

# Task Dependencies
- Task 1-4 are independent but rely on `ThemeConfig` from Phase 1.
