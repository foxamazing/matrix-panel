## Design System: Matrix Panel

### Pattern
- **Name:** Immersive/Interactive Experience
- **Conversion Focus:** 40% higher engagement. Performance trade-off. Provide skip option. Mobile fallback essential.
- **CTA Placement:** After interaction complete + Skip option for impatient users
- **Color Strategy:** Immersive experience colors. Dark background for focus. Highlight interactive elements.
- **Sections:** 1. Full-screen interactive element, 2. Guided product tour, 3. Key benefits revealed, 4. CTA after completion

### Style
- **Name:** Liquid Glass
- **Keywords:** Flowing glass, morphing, smooth transitions, fluid effects, translucent, animated blur, iridescent, chromatic aberration
- **Best For:** Premium SaaS, high-end e-commerce, creative platforms, branding experiences, luxury portfolios
- **Performance:** 鈿?Moderate-Poor | **Accessibility:** 鈿?Text contrast

### Colors
| Role | Hex |
|------|-----|
| Primary | #FFFFFF |
| Secondary | #E5E5E5 |
| CTA | #007AFF |
| Background | #888888 |
| Text | #000000 |

*Notes: Glass white + system blue*

### Typography
- **Heading:** Inter
- **Body:** Inter
- **Mood:** spatial, legible, glass, system, clean, neutral
- **Best For:** Spatial computing, AR/VR, glassmorphism interfaces
- **Google Fonts:** https://fonts.google.com/share?selection.family=Inter:wght@300;400;500;600
- **CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
```

### Key Effects
Morphing elements (SVG/CSS), fluid animations (400-600ms curves), dynamic blur (backdrop-filter), color transitions

### Avoid (Anti-patterns)
- Poor photos
- Complex booking

### Pre-Delivery Checklist
- [ ] No emojis as icons (use SVG: Heroicons/Lucide)
- [ ] cursor-pointer on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard nav
- [ ] prefers-reduced-motion respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px

