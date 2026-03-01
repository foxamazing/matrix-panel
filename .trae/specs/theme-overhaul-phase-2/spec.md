# Theme System Overhaul Phase 2: Deep Component Integration

## Why
Phase 1 成功建立了主题系统的骨架，但核心小组件 (`Clock`, `WeatherWidget`, `MusicWidget`, `SearchBar`, `StatsCards`) 仍包含大量硬编码的样式（如固定的 `rounded-3xl`, `backdrop-blur-2xl`），导致它们在切换主题时无法完全融入新的视觉语言。例如，在 Cyberpunk 主题下，天气组件仍是圆角半透明，而不是直角霓虹框；在 Minimal 主题下，时钟仍有复杂的阴影。

## What Changes
将主要桌面组件重构为“主题感知 (Theme-Aware)”组件，使其外观严格遵循 `ThemeConfig`。

### 1. 组件重构策略
- **去硬编码**: 移除 Tailwind 中的 `rounded-*`, `backdrop-*`, `bg-black/*` 等固定样式。
- **动态注入**: 使用 `style={{ borderRadius: themeConfig.effects.radius, ... }}` 或依赖 `glass-panel` 类自动适配。
- **变体支持**: 组件应根据 `themeName` 渲染不同的子结构（例如 Cyberpunk 下显示扫描线装饰，Minimal 下隐藏图标）。

### 2. 目标组件

#### A. Clock (时钟)
- **Glass/Neumorphic**: 保持现有的优雅字体和阴影。
- **Minimal**: 使用细字体 (Thin)，无阴影，纯色。
- **Brutal**: 使用粗体 (Black)，硬阴影，可能的背景框。
- **Cyberpunk**: 强制使用 Pixel 字体，霓虹色 (Neon)，故障效果。

#### B. WeatherWidget (天气胶囊)
- **Glass/Neumorphic**: 保持胶囊形状，磨砂质感。
- **Minimal**: 纯文本或极简图标，无背景或纯白背景。
- **Brutal**: 直角矩形，黑框白底，硬阴影。
- **Cyberpunk**: 科技感边框，数据化显示。

#### C. SearchBar (搜索栏)
- **样式适配**: 输入框的高度、圆角、背景色需跟随主题。
- **交互**: 聚焦时的动效（Brutal 为硬边框变色，Neumorphic 为内阴影加深）。

#### D. StatsCards (系统状态)
- **布局适配**: 调整卡片间距和排列方式。
- **视觉适配**: 进度条样式（Brutal 为方块进度条，Cyberpunk 为分段进度条）。

#### E. MusicWidget (音乐播放器)
- **封面样式**: 唱片旋转 (Glass) vs 方形封面 (Brutal/Minimal)。
- **控制按钮**: 跟随 `Button` 组件的变体。

## Impact
- **Affected Files**:
    - `src/components/Clock.tsx`
    - `src/components/WeatherWidget.tsx`
    - `src/components/SearchBar.tsx`
    - `src/components/StatsCards.tsx`
    - `src/components/MusicWidget.tsx`
    - `src/components/desktop/Dock.tsx` (如果存在，或 `App.tsx` 中的底部栏)

## ADDED Requirements
### Requirement: Theme-Aware Widgets
所有桌面小组件必须响应 `ThemeConfig` 的 `effects.radius` 和 `colors` 配置，禁止使用硬编码的圆角和颜色。

### Requirement: Font Adaptation
时钟和天气组件必须根据主题切换字体族（Sans vs Mono vs Pixel）。

## MODIFIED Requirements
### Requirement: Weather Modal Style
天气详情弹窗必须使用 `SettingsModal` 相同的动态容器样式逻辑，确保与全局弹窗风格一致。
