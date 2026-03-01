# Theme System Overhaul Phase 3: Visual Polish & Micro-Interactions

## Why
前两个阶段建立了坚实的主题架构和组件适配。当前的 UI 虽然功能上支持切换，但在“氛围感”和“微交互”上仍有欠缺。例如，Cyberpunk 主题缺乏动态的故障效果，Brutal 主题的交互缺乏力量感，Glass 主题的质感还不够细腻。Phase 3 旨在通过高级视觉效果和细腻的动画，将 UI 体验提升到“精致”的层级。

## What Changes
本阶段将专注于 **视觉深度 (Visual Depth)**、**动态纹理 (Dynamic Textures)** 和 **微交互 (Micro-interactions)**。

### 1. 主题特异性增强 (Theme-Specific Enhancements)

#### A. Glass (拟态玻璃) - "Flow & Depth"
- **纹理**: 引入细微的噪点叠加 (Noise Overlay)，增加磨砂真实感。
- **光效**: 鼠标悬停时，面板边缘出现流动的光泽 (Shimmer Border)。
- **动画**: 使用高阻尼的弹性动画 (Spring)，模拟物体在水中的阻力。

#### B. Minimal (极简主义) - "Structure & Space"
- **排版**: 强制所有文本使用更宽松的字间距。
- **交互**: 移除所有位移动画，仅保留透明度 (Opacity) 和颜色变化，强调“瞬时性”。
- **装饰**: 移除所有阴影，仅依靠 1px 的高对比度边框区分层级。

#### C. Brutal (新粗野) - "Impact & Raw"
- **阴影**: 交互时阴影位置发生剧烈位移 (e.g., box-shadow offset changes from 4px to 0px)。
- **动画**: 禁用平滑过渡，使用 Step 动画或极快 (Linear) 的过渡。
- **装饰**: 增加半调网格 (Halftone) 背景图案。

#### D. Neumorphic (软塑) - "Tactile & Soft"
- **光影**: 动态光源，根据鼠标位置微调高光和阴影的角度（可选，或保持静态的高质量光影）。
- **状态**: 按压 (Active) 状态下，元素真实地“凹陷”下去，而不是简单的缩放。
- **颜色**: 强制低饱和度，确保光影效果不脏。

#### E. Cyberpunk (赛博朋克) - "Glitch & Neon"
- **特效**: 随机的文本故障 (Text Glitch) 效果，特别是标题和时钟。
- **边框**: 呼吸灯效果的霓虹边框。
- **背景**: 动态扫描线 (Scanline) 和网格 (Grid) 覆盖。

### 2. 全局组件升级

#### Window (窗口)
- **标题栏**:
    - **Glass**: Mac 风格红黄绿圆点。
    - **Brutal**: Windows 95 风格或纯黑方块。
    - **Cyberpunk**: 像素化图标或 ASCII 字符 `[x]`, `[-]`。
- **打开动画**: 窗口打开时，根据主题播放不同的入场动画（缩放 vs 展开 vs 故障出现）。

#### Context Menu (右键菜单)
- 适配 `glass-panel`，确保右键菜单也遵循当前主题的圆角和特效。

## Impact
- **Affected Files**:
    - `src/style/index.css`: 添加新的动画关键帧和纹理类。
    - `src/components/desktop/Window.tsx`: 重构标题栏。
    - `src/theme/presets.ts`: 增加 `animation` 和 `texture` 配置字段。
    - `src/components/ContextMenu.tsx` (如果存在，需新建或修改)。
    - `src/components/Background.tsx`: 增强纹理层。

## ADDED Requirements
### Requirement: Theme Textures
系统必须支持在背景层之上、应用层之下叠加主题纹理（如 Scanlines, Noise, Dots）。

### Requirement: Advanced Animations
系统必须定义一组动画 Token（`--anim-enter`, `--anim-hover`），并在不同主题下映射到不同的贝塞尔曲线。
