# Homarr 项目学习笔记

这份笔记基于对 `reference/homarr` 源码的深度分析，旨在帮助开发者快速理解这个现代全栈 Monorepo 项目的架构与核心实现。

## 1. 项目概览

Homarr 是一个高度可定制的家庭服务器仪表盘，用于聚合和管理各种自托管服务（如 Plex, Sonarr, Docker 等）。

- **核心价值**: 提供统一的界面来监控和控制分散的家庭服务。
- **关键特性**: 拖拽布局、丰富的组件库、实时状态监控、多用户与权限管理。
- **架构模式**: Monorepo (Turborepo) + Fullstack (Next.js + tRPC)。

## 2. 技术栈全景图

| 层级 | 技术选型 | 关键作用 |
| :--- | :--- | :--- |
| **语言** | TypeScript | 全栈类型安全 (Strict Mode) |
| **包管理** | pnpm + Workspaces | 高效的依赖管理与幽灵依赖避免 |
| **构建系统** | Turborepo | 任务编排与远程缓存 |
| **前端框架** | Next.js (App Router) | 服务端渲染 (SSR) 与 API 路由 |
| **API 层** | tRPC v11 | 端到端类型安全 API，无 Schema 同步烦恼 |
| **数据库** | Drizzle ORM | SQLite/MySQL/PG 多适配，轻量级 ORM |
| **UI 库** | Mantine v7 | 核心组件与 Hooks |
| **状态管理** | Jotai | 原子化状态管理 |
| **拖拽布局** | @dnd-kit | 仪表盘核心交互 |
| **认证** | NextAuth.js (Auth.js) | Session 管理与 OAuth 集成 |
| **实时通信** | WebSocket (`ws`) | 实时数据推送 (Ping, 进度条) |

## 3. 核心架构解析

### 3.1 目录结构 (Monorepo)

```text
homarr/
├── apps/                   # 🚀 应用程序入口
│   ├── nextjs/             # 主 Web 应用 (Next.js App Router)
│   ├── tasks/              # 后台任务服务 (Cron Jobs, 数据同步)
│   └── websocket/          # 实时通信服务 (WS Server)
├── packages/               # 📦 共享逻辑库
│   ├── api/                # 后端业务逻辑 (tRPC Routers)
│   ├── db/                 # 数据层 (Schema, Migrations)
│   ├── widgets/            # 仪表盘小组件定义系统
│   ├── integrations/       # 第三方服务适配器 (Plex, Sonarr...)
│   ├── auth/               # 认证逻辑封装
│   └── ...                 # 其他工具库 (common, definitions 等)
```

### 3.2 关键模块设计

#### A. Widget 系统 (`packages/widgets`)
Homarr 的小组件系统设计非常优雅，实现了**配置与实现分离**及**按需加载**。

*   **定义 (`index.ts`)**: 使用 `createWidgetDefinition` 工厂函数。
    *   **动态导入**: 使用 `withDynamicImport(() => import("./component"))` 实现组件懒加载，减小首屏体积。
    *   **配置构建**: 使用 `optionsBuilder` (类似 Zod) 定义组件的配置项（如开关、输入框），系统会自动生成对应的设置表单。
    *   **代码示例**:
        ```typescript
        // packages/widgets/src/clock/index.ts
        export const { definition, componentLoader } = createWidgetDefinition("clock", {
          icon: IconClock,
          createOptions() {
            return optionsBuilder.from((factory) => ({
              showSeconds: factory.switch({ defaultValue: false }),
              // ...
            }));
          },
        }).withDynamicImport(() => import("./component"));
        ```
*   **实现 (`component.tsx`)**: 标准的 React 组件，接收类型安全的 `options` props。

#### B. API 路由系统 (`packages/api`)
使用了 tRPC 的 **Lazy Loading** 特性，这对大型 Monorepo 至关重要。

*   **路由懒加载**: 在 `root.ts` 中，使用 `lazy(() => import(...))` 加载子路由。
*   **优势**: 避免在 Serverless 环境或冷启动时一次性加载所有业务逻辑，显著降低内存占用和启动时间。
*   **代码示例**:
    ```typescript
    // packages/api/src/root.ts
    export const appRouter = createTRPCRouter({
      user: lazy(() => import("./router/user").then((mod) => mod.userRouter)),
      // ...
    });
    ```

#### C. 集成系统 (`packages/integrations`)
采用**适配器模式 (Adapter Pattern)** 解耦具体服务。

*   每个服务（如 Sonarr, PiHole）都实现统一的接口。
*   业务逻辑只需调用通用接口，无需关心底层 API 差异。

## 4. 数据链路追踪

以“用户查看仪表盘”为例：

1.  **Client**: `apps/nextjs` 页面加载，Grid 组件渲染。
2.  **Widget**: 每个 Widget 组件调用 `trpc.widget.getData.useQuery()`。
3.  **tRPC Layer**: 请求打到 `apps/nextjs/src/app/api/trpc/[trpc]/route.ts`。
4.  **Router**: 转发给 `packages/api` 中的对应 Router。
5.  **Service/DB**:
    *   读取配置 -> `packages/db` (Drizzle 查询 SQLite)。
    *   读取外部数据 -> `packages/integrations` (调用第三方 API)。
6.  **Response**: 数据原路返回，前端自动获得类型提示。

## 5. 开发调试指南

1.  **环境准备**:
    *   Node.js >= 20
    *   pnpm (包管理)
    *   Docker (可选，用于数据库)

2.  **启动命令**:
    *   `pnpm install`: 安装依赖。
    *   `pnpm dev`: 启动开发服务器 (Turbo 会并行启动 Next.js, WebSocket 等服务)。
    *   `pnpm db:push`: 同步数据库 Schema。

3.  **最佳实践**:
    *   **新增 Widget**: 在 `packages/widgets/src` 下新建目录，仿照 `clock` 实现。
    *   **修改 API**: 在 `packages/api` 修改 Router，前端类型会自动更新。

## 6. 学习建议

*   **初学者**: 从 `apps/nextjs/src/app` 入手，修改简单的 UI。
*   **进阶**: 研究 `packages/widgets` 的工厂模式设计，学习如何构建可扩展的插件系统。
*   **高阶**: 深入 `packages/api` 和 `packages/db`，学习 tRPC + Drizzle 的全栈类型安全实践。
