# Theme System Overhaul Spec

## Why
目前的主题系统仅停留在简单的 CSS 变量替换层面（如颜色、模糊度），导致 5 种预设主题（Glass, Minimal, Brutal, Neumorphic, Cyberpunk）在视觉和交互体验上趋同，缺乏鲜明的个性和深度。用户期望从 **UI 布局**、**交互逻辑**、**整体排版** 和 **视觉风格** 四个维度进行彻底的重构，使每种主题都具有独特的“性格”和使用体验。

## What Changes
将现有的单一布局 + CSS 变量模式，重构为 **策略模式 (Strategy Pattern)** 驱动的主题系统。每种主题不仅定义颜色，还定义布局结构、动画曲线、组件形态和交互反馈。

### 1. 核心架构重构
- **ThemeProvider 升级**: 从单纯的 CSS 变量注入，升级为提供 `currentTheme` 对象，包含 `layout`, `animation`, `componentStyle` 等配置。
- **布局引擎 (Layout Engine)**: `AppGrid` 和 `Window` 组件将根据当前主题的布局配置（Grid, List, Masonry, Free-form）动态渲染。
- **交互引擎 (Interaction Engine)**: 统一管理 hover, active, drag 等状态的动画效果。

### 2. 五大主题定义 (The 5 Themes)

#### A. Glass (默认 / 拟态玻璃)
- **视觉**: 经典的 iOS/macOS 风格，深度模糊，高透光感，圆角大。
- **布局**: 标准网格布局 (Grid)，图标悬浮。
- **交互**: 弹性物理动画 (Spring)，平滑缩放，模糊渐变。
- **关键词**: `Blur`, `Translucency`, `Depth`, `Round`.

#### B. Minimal (极简 / 瑞士平面)
- **视觉**: 极致的扁平化，无阴影，无模糊，高对比度黑白灰，细线条。
- **布局**: 列表或紧凑网格 (Compact Grid)，强调文字排版。
- **交互**: 瞬时响应 (Instant)，无多余过渡，高效率。
- **关键词**: `Flat`, `Typography`, `Whitespace`, `Structure`.

#### C. Brutal (新粗野主义 / 波普)
- **视觉**: 粗黑边框 (3-4px)，高饱和度撞色，硬投影 (Hard Shadow)，直角。
- **布局**: 不对称布局，重叠元素，打破常规网格。
- **交互**: 硬切 (Hard Cut)，位移而非缩放，按键下沉感强。
- **关键词**: `Bold`, `Raw`, `Contrast`, `Asymmetry`.

#### D. Neumorphic (新拟态 / 软塑)
- **视觉**: 元素与背景同色，通过高光和阴影模拟物理凸起/凹陷，极度柔和。
- **布局**: 宽松网格，强调元素的“实体感”。
- **交互**: 按钮按压时的凹陷效果 (Inset Shadow)，慢速平滑过渡。
- **关键词**: `Soft`, `Tactile`, `Extruded`, `Inset`.

#### E. Cyberpunk (赛博朋克 / 终端)
- **视觉**: 纯黑背景，霓虹色 (Cyan/Magenta) 边框，像素字体，扫描线，故障效果 (Glitch)。
- **布局**: HUD (Heads-Up Display) 风格，密集信息展示。
- **交互**: 科技感音效（可选），打字机效果，故障闪烁。
- **关键词**: `Neon`, `Dark`, `Glitch`, `Data-dense`.

## Impact
- **Affected Specs**: UI Design System, Layout System.
- **Affected Code**:
    - `src/providers/ThemeProvider.tsx`: 核心逻辑修改。
    - `src/style/index.css`: 重写为分层变量系统。
    - `src/components/AppGrid.tsx`: 支持多种布局模式。
    - `src/components/desktop/Window.tsx`: 支持多种窗口边框/标题栏样式。
    - `src/components/settings/BasicTab.tsx`: 新的主题选择器。
    - `src/components/ui/*`: 通用组件需适配 5 种风格。

## ADDED Requirements
### Requirement: Theme-Specific Layouts
系统必须支持根据主题切换应用列表的排列方式（如 Minimal 使用列表模式，Glass 使用网格模式）。

#### Scenario: Switching to 除了glass其他4种Minimal
- **WHEN** user selects "Minimal" theme
- **THEN** the app grid transforms into a structured list or compact grid with emphasis on text labels.
- **THEN** all blur effects are removed.

### Requirement: Theme-Specific Interactions
系统必须支持根据主题切换交互动画（如 Brutal 的硬阴影位移，Neumorphic 的凹凸变换）。

## MODIFIED Requirements
### Requirement: CSS Variable Architecture
**Reason**: 现有的 CSS 变量系统不足以支撑如此巨大的风格差异。
**Migration**: 引入 `--layout-gap`, `--anim-duration`, `--border-style` 等语义化变量。
