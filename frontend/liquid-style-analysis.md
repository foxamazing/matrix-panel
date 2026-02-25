# Liquid Glass Studio 技术架构与渲染分析

通过对源码 (`iyinchao/liquid-glass-studio`) 的深度逆向分析，我们梳理出了实现顶级 Liquid Glass 效果的核心技术架构。

## 1. 渲染架构 (Rendering Pipeline)

该项目采用 **Multi-Pass (多通道)** 渲染管线，而非单一的 Shader。这种设计对于实现高质量的磨砂玻璃 (Frosted Glass) 至关重要，因为实时的高斯模糊通过单次 Pass 极其昂贵。

### 管线流程
1.  **Background Pass (`bgPass`)**
    *   **输入**: 背景图片/视频/图案。
    *   **功能**: 渲染纯净的背景，并计算物体投射在背景上的**阴影 (Soft Shadows)**。
    *   **输出**: 纹理 `u_bg`。

2.  **Vertical Blur Pass (`vBlurPass`)**
    *   **输入**: `u_bg`。
    *   **功能**: 对背景进行纵向高斯模糊。利用 GPU 的线性插值特性优化性能。

3.  **Horizontal Blur Pass (`hBlurPass`)**
    *   **输入**: `vBlurPass` 的结果。
    *   **功能**: 对上一步结果进行横向高斯模糊。
    *   **输出**: 纹理 `u_blurredBg`。
    *   *注: 这种两步模糊 (Two-pass Gaussian Blur) 将复杂度从 O(N^2) 降低到 O(N)，极大提升了性能。*

4.  **Main Composition Pass (`mainPass`)**
    *   **输入**: `u_bg` (原始背景), `u_blurredBg` (模糊背景)。
    *   **核心逻辑**:
        *   计算 **SDF (Signed Distance Field)** 确定物体形状和液体融合。
        *   计算 **SDF 法线 (Normals)** 用于光照和折射。
        *   根据法线扭曲 UV，采样 `u_bg` 或 `u_blurredBg`。
        *   叠加 **Fresnel (菲涅尔)** 和 **Specular (高光)**。
    *   **输出**: 最终屏幕图像。

---

## 2. 核心算法 (Core Algorithms)

### A. 液体融合 (Liquid Morphing)
使用带平滑参数的最小值函数 (`smin`) 来混合不同形状的 SDF 距离场。
```glsl
// k = u_mergeRate (融合度)
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}
```

### B. 物理折射 (Physical Refraction)
模拟光线进入介质的弯曲。项目实际上使用了**视差映射 (Parallax Mapping)** 的变体来模拟厚度：
1.  根据 SDF 对边缘进行深度估算 (`depth ≈ sdf / thickness`)。
2.  利用 **Snell's Law (斯涅尔定律)** 简化公式计算偏移量。
3.  对 R/G/B 三通道分别施加不同的偏移量 (`u_refDispersion`) 产生**色散**。

### C. LCH 色彩空间光照
在计算高光和菲涅尔反射时，项目将 RGB 转换到 **LCH (Lightness, Chroma, Hue)** 空间进行混合，避免了 RGB 混合常见的“发灰”或过度饱和问题，使光感更加通透自然。

---

## 3. 调节选项 (Configuration Options)

我们可以将这些参数直接映射到前端 Dashboard 的“样式编辑器”中：

### 💎 折射与材质 (Refraction)
| 参数名 | 代码变量 | 说明 | 推荐值 |
| :--- | :--- | :--- | :--- |
| **厚度** | `refThickness` | 玻璃的模拟物理厚度，影响边缘扭曲范围。 | `20-40` |
| **折射率** | `refFactor` | 介质密度。值越高，扭曲越剧烈 (如水 vs 钻石)。 | `1.1-1.4` |
| **色散** | `refDispersion` | 边缘彩虹效果的强度 (Chromatic Aberration)。 | `0.02` |

### ✨ 光泽与反射 (Lighting)
| 参数名 | 代码变量 | 说明 | 推荐值 |
| :--- | :--- | :--- | :--- |
| **菲涅尔强度** | `refFresnelFactor` | 边缘轮廓光的强度，增强立体感。 | `20` |
| **菲涅尔硬度** | `refFresnelHardness` | 轮廓光的锐利程度。 | `20` |
| **高光强度** | `glareFactor` | 表面镜面反射的亮度 (Specular)。 | `90` |
| **高光角度** | `glareAngle` | 模拟光源的照射方向。 | `-45°` |

### 💧 形状与融合 (Shape)
| 参数名 | 代码变量 | 说明 | 推荐值 |
| :--- | :--- | :--- | :--- |
| **融合度** | `mergeRate` | 液体粘滞程度。0=刚性碰撞, 0.3=水银般融合。 | `0.05` |
| **圆角半径** | `shapeRadius` | 基础形状的圆角大小。 | `40-80` |
| **平滑度** | `shapeRoundness` | 超椭圆的指数 (Superellipse)，控制是方还是圆。 | `4-5` |

### 🌫️ 模糊与背景 (Blur)
| 参数名 | 代码变量 | 说明 | 推荐值 |
| :--- | :--- | :--- | :--- |
| **模糊半径** | `blurRadius` | 背景磨砂的浑浊度 (Gaussian Blur Sigma)。 | `20` |
| **边缘遮罩** | `blurEdge` | 是否仅在玻璃内部应用模糊 (Masking)。 | `True` |

---

## 4. 结论与应用
`iyinchao/liquid-glass-studio` 代表了目前 WebGL UI 的最高水准。其核心在于：
1.  **不妥协的物理模拟**：虽然计算量大，但通过 SDF 和 LCH 换取了极佳的质感。
2.  **高性能管线**：通过分离模糊通道，保证了在 60FPS 下运行。

**建议方案**：我们将采用简化版的 **Pro Shader** (已制作于 `liquid-glass-pro.html`)，保留其视觉核心 (SDF融合+色散折射)，裁剪掉过于复杂的 UI 逻辑，直接集成到 React Dashboard 的组件背景中。
