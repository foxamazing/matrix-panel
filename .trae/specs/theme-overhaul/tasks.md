# Tasks

- [x] Task 1: Refactor Theme Architecture (JS + CSS)
    - [x] SubTask 1.1: Define `ThemeConfig` interface in `src/types/theme.ts` including layout, animation, and component style properties.
    - [x] SubTask 1.2: Create `src/theme/presets.ts` defining the 5 base themes (Glass, Minimal, Brutal, Neumorphic, Cyberpunk) with specific configurations.
    - [x] SubTask 1.3: Refactor `src/providers/ThemeProvider.tsx` to inject dynamic CSS variables based on the selected theme preset (e.g., `--radius-window`, `--shadow-card`).
    - [x] SubTask 1.4: Rewrite `src/style/index.css` to use a semantic variable system for all UI components, removing hardcoded Tailwind utility classes where necessary.

- [x] Task 2: Implement Layout Engine (`AppGrid`)
    - [x] SubTask 2.1: Modify `AppGrid.tsx` to accept a `layoutMode` prop ('grid', 'list', 'compact').
    - [x] SubTask 2.2: Implement the standard **Grid Layout** (for Glass/Neumorphic).
    - [x] SubTask 2.3: Implement the **List Layout** (for Minimal/Cyberpunk) with horizontal rows.
    - [x] SubTask 2.4: Implement the **Masonry/Free Layout** (for Brutal) with asymmetrical placement capability.

- [ ] Task 3: Implement Distinct Visual Styles (CSS)
    - [ ] SubTask 3.1: **Glass Style**: Implement deep blur, white translucency, and large border-radius.
    - [ ] SubTask 3.2: **Minimal Style**: Implement 0-blur, high contrast borders, and clean typography-focused design.
    - [ ] SubTask 3.3: **Brutal Style**: Implement thick black borders (3px+), hard shadows (no blur), and bold colors.
    - [ ] SubTask 3.4: **Neumorphic Style**: Implement soft shadows (light/dark pairs) and extruded/inset states for interactive elements.
    - [ ] SubTask 3.5: **Cyberpunk Style**: Implement dark mode enforcement, neon glow borders, and scanline overlay effects.

- [x] Task 4: Update Core Components
    - [x] SubTask 4.1: Update `src/components/desktop/Window.tsx` (Targeted `SettingsModal.tsx` instead as it's the main modal).
    - [x] SubTask 4.2: Create a reusable `Button` component that adapts to the 5 themes (Ghost, Solid, Outline variants).
    - [x] SubTask 4.3: Create a reusable `Input` component (Underline vs Box vs Inset styles).
    - [x] SubTask 4.4: Update `src/components/ActionModal.tsx` to use the new themed components and container styles.

- [x] Task 5: Enhance Settings UI (`BasicTab`)
    - [x] SubTask 5.1: Redesign the theme selector in `src/components/settings/BasicTab.tsx` to show rich previews of each theme.
    - [x] SubTask 5.2: Ensure theme switching persists and applies immediately without reload.

# Task Dependencies
- Task 2 depends on Task 1 (needs theme config).
- Task 3 depends on Task 1 (needs CSS variables).
- Task 4 depends on Task 3 (needs style definitions).
- Task 5 depends on Task 1.
