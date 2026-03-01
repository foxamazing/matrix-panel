# Matrix Panel 项目说明文档

## 项目概述

Matrix Panel 是一个自托管的桌面式主页面板，提供应用入口分组、搜索、天气/音乐小组件、站点锁定与登录、系统监控与 Docker 容器控制等功能。

### 项目特点

- **现代化设计**: 采用 React + Tailwind CSS 构建的现代化界面
- **响应式布局**: 支持桌面、平板、移动端多设备
- **功能完整**: 包含用户认证、文件管理、系统监控、Docker控制等核心功能
- **高性能**: 前后端都有良好的性能优化
- **安全可靠**: 完善的认证机制和安全措施
- **易于部署**: 支持 Docker 部署，配置简单

## 技术栈

### 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.2.1 | UI 框架 |
| React DOM | 19.2.1 | DOM 操作 |
| Vite | 6.2.0 | 构建工具 |
| TypeScript | 5.8.2 | 类型检查 |
| Tailwind CSS | 4.1.18 | CSS 框架 |
| React Grid Layout | 2.2.2 | 网格布局 |
| Lucide React | 0.555.0 | 图标库 |

### 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Go | 1.20 | 编程语言 |
| Gin | 1.9.0 | Web 框架 |
| GORM | 1.25.7 | ORM 框架 |
| SQLite | - | 默认数据库 |
| MySQL | - | 可选数据库 |
| PostgreSQL | - | 可选数据库 |
| Redis | - | 可选缓存 |
| bcrypt | - | 密码加密 |

### 系统监控技术栈

| 技术 | 用途 |
|------|------|
| gopsutil | CPU/内存/磁盘/网络监控 |
| gonvml | GPU 监控 |
| Docker API | Docker 容器控制 |

## 项目架构

### 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                     Matrix Panel 系统                      │
├─────────────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐         ┌──────────────┐          │
│  │   前端      │         │   后端      │          │
│  │  (React)    │◄──────►│  (Go + Gin)  │          │
│  └──────────────┘         └──────────────┘          │
│         │                     │                     │
│         │                     ▼                     │
│         │            ┌──────────────┐              │
│         │            │   数据库     │              │
│         │            │  (SQLite)    │              │
│         │            └──────────────┘              │
│         │                     │                     │
│         │            ┌──────────────┐              │
│         │            │   缓存       │              │
│         │            │  (Memory)    │              │
│         │            └──────────────┘              │
│         │                     │                     │
│         │            ┌──────────────┐              │
│         │            │  文件存储     │              │
│         │            │  (uploads)    │              │
│         │            └──────────────┘              │
│                                                           │
└─────────────────────────────────────────────────────────────────┘
```

### 前端架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    前端架构                              │
├─────────────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐         ┌──────────────┐          │
│  │   组件层     │         │   状态管理   │          │
│  │  (Components) │         │  (Hooks)     │          │
│  └──────────────┘         └──────────────┘          │
│         │                     │                     │
│         │                     ▼                     │
│         │            ┌──────────────┐              │
│         │            │   服务层     │              │
│         │            │  (Services)   │              │
│         │            └──────────────┘              │
│         │                     │                     │
│         │                     ▼                     │
│         │            ┌──────────────┐              │
│         │            │   API 客户端  │              │
│         │            │  (Client)     │              │
│         │            └──────────────┘              │
│         │                     │                     │
│         ▼                     ▼                     │
│  ┌──────────────────────────────────────────────┐          │
│  │           Vite 开发服务器              │          │
│  └──────────────────────────────────────────────┘          │
│         │                     │                     │
│         ▼                     ▼                     │
│  ┌──────────────┐         ┌──────────────┐          │
│  │   后端 API   │◄──────►│   代理配置   │          │
│  └──────────────┘         └──────────────┘          │
│                                                           │
└─────────────────────────────────────────────────────────────────┘
```

### 后端架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    后端架构                              │
├─────────────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐         ┌──────────────┐          │
│  │   路由层     │         │   中间件层   │          │
│  │  (Router)    │         │ (Middleware)  │          │
│  └──────────────┘         └──────────────┘          │
│         │                     │                     │
│         │                     ▼                     │
│         │            ┌──────────────┐              │
│         │            │   API 层     │              │
│         │            │  (API)       │              │
│         │            └──────────────┘              │
│         │                     │                     │
│         │                     ▼                     │
│         │            ┌──────────────┐              │
│         │            │   服务层     │              │
│         │            │  (Service)    │              │
│         │            └──────────────┘              │
│         │                     │                     │
│         │                     ▼                     │
│         │            ┌──────────────┐              │
│         │            │   数据层     │              │
│         │            │  (Models)     │              │
│         │            └──────────────┘              │
│         │                     │                     │
│         ▼                     ▼                     │
│  ┌──────────────┐         ┌──────────────┐          │
│  │   数据库     │         │   缓存       │          │
│  │  (SQLite)    │         │  (Memory)     │          │
│  └──────────────┘         └──────────────┘          │
│                                                           │
└─────────────────────────────────────────────────────────────────┘
```

## 目录结构

### 根目录结构

```
matrix-panel/
├── backend/                    # 后端代码
│   ├── api/                   # API 接口层
│   │   └── api_v1/          # API v1 版本
│   │       ├── common/        # 公共模块
│   │       ├── integration/   # 第三方服务集成
│   │       ├── openness/      # 开放接口
│   │       ├── panel/         # 面板管理接口
│   │       ├── system/        # 系统功能接口
│   │       └── widget/        # 小组件接口
│   ├── assets/               # 静态资源
│   ├── cache/                # 缓存模块
│   ├── conf/                 # 配置文件
│   ├── database/             # 数据库连接
│   ├── docs/                 # API 文档
│   ├── global/               # 全局变量
│   ├── initialize/           # 初始化模块
│   ├── lang/                 # 语言文件
│   ├── lib/                  # 工具库
│   ├── models/               # 数据模型
│   ├── router/               # 路由配置
│   ├── runtime/              # 运行时文件
│   ├── service/              # 业务逻辑层
│   ├── structs/              # 数据结构
│   ├── uploads/              # 上传文件存储
│   ├── web/                  # 前端构建文件
│   ├── websocket/            # WebSocket 处理
│   ├── utils/                # 工具函数
│   ├── main.go               # 程序入口
│   ├── go.mod                # Go 模块依赖
│   └── go.sum                # 依赖锁定文件
├── src/                     # 前端代码
│   ├── components/           # React 组件
│   │   ├── Background.tsx    # 背景组件
│   │   ├── AppGrid.tsx       # 应用网格
│   │   ├── LockScreen.tsx    # 锁屏组件
│   │   ├── MusicWidget.tsx    # 音乐小组件
│   │   ├── SettingsModal.tsx # 设置模态框
│   │   ├── WeatherWidget.tsx  # 天气小组件
│   │   └── settings/        # 设置页面
│   │       ├── BasicTab.tsx    # 基本设置
│   │       ├── DesktopTab.tsx  # 桌面端设置
│   │       └── SecurityTab.tsx # 安全设置
│   ├── hooks/               # React Hooks
│   │   ├── useAppConfig.ts   # 应用配置 Hook
│   │   ├── useAuth.ts       # 认证 Hook
│   │   └── useSystemStats.ts # 系统监控 Hook
│   ├── services/            # API 服务
│   │   └── client.ts       # API 客户端
│   ├── types.ts             # TypeScript 类型定义
│   ├── utils/               # 工具函数
│   │   └── image.ts        # 图片处理工具
│   ├── constants.ts         # 常量定义
│   ├── App.tsx             # 主应用组件
│   └── main.tsx            # 入口文件
├── public/                  # 公共静态资源
├── index.html              # HTML 入口文件
├── vite.config.ts          # Vite 配置
├── tailwind.config.js      # Tailwind 配置
├── tsconfig.json          # TypeScript 配置
├── package.json           # 项目依赖
└── postcss.config.js       # PostCSS 配置
```

### 后端目录详解

```
backend/
├── api/                    # API 接口层
│   └── api_v1/          # API v1 版本
│       ├── common/        # 公共模块
│       │   ├── apiData/  # API 数据结构
│       │   ├── apiReturn/ # API 返回处理
│       │   ├── base/      # 基础功能
│       │   └── middleware/ # 中间件
│       ├── integration/   # 第三方服务集成
│       │   ├── dashdot.go
│       │   ├── dockerhub.go
│       │   ├── emby.go
│       │   ├── gitlab.go
│       │   ├── gotify.go
│       │   ├── grafana.go
│       │   ├── homeassistant.go
│       │   ├── ical.go
│       │   ├── jellyfin.go
│       │   ├── lidarr.go
│       │   ├── nextcloud.go
│       │   ├── ntfy.go
│       │   ├── pihole.go
│       │   ├── plex.go
│       │   ├── portainer.go
│       │   ├── prowlarr.go
│       │   ├── qbittorrent.go
│       │   ├── radarr.go
│       │   ├── readarr.go
│       │   ├── sabnzbd.go
│       │   ├── sonarr.go
│       │   ├── tautulli.go
│       │   ├── tdarr.go
│       │   ├── transmission.go
│       │   ├── truenas.go
│       │   └── unraid.go
│       ├── openness/      # 开放接口（无需认证）
│       │   ├── enter.go
│       │   └── openness.go
│       ├── panel/         # 面板管理接口
│       │   ├── A_ENTER.go
│       │   ├── itemIcon.go
│       │   ├── itemIconGroup.go
│       │   ├── userConfig.go
│       │   └── users.go
│       ├── system/        # 系统功能接口
│       │   ├── A_ENTER.go
│       │   ├── about.go
│       │   ├── file.go
│       │   ├── login.go
│       │   ├── moduleConfig.go
│       │   ├── monitor.go
│       │   ├── notice.go
│       │   ├── rateLimit/
│       │   └── user.go
│       ├── widget/        # 小组件接口
│       │   ├── calendar.go
│       │   ├── media_server.go
│       │   ├── system.go
│       │   └── widget.go
│       └── A_ENTER.go     # API 入口文件
├── assets/               # 静态资源
│   ├── Pixel/           # 像素字体文件
│   ├── lang/            # 语言文件
│   ├── conf.example.ini  # 配置示例
│   ├── readme.md        # 资源说明
│   └── assets.go        # 资源管理
├── cache/                # 缓存模块
│   ├── cache.go         # 缓存接口
│   ├── factory.go       # 缓存工厂
│   ├── memory.go        # 内存缓存
│   └── redis.go         # Redis 缓存
├── conf/                 # 配置文件
│   ├── conf.example.ini  # 配置示例
│   └── conf.ini         # 当前配置
├── database/             # 数据库连接
│   ├── database.go      # 数据库接口
│   ├── factory.go       # 数据库工厂
│   ├── interface.go     # 数据库接口定义
│   ├── postgres.go     # PostgreSQL 驱动
│   └── sqlite.go        # SQLite 驱动
├── docs/                 # API 文档
│   ├── docs.go         # 文档处理
│   ├── swagger.json     # Swagger 配置
│   └── swagger.yaml     # Swagger 配置
├── global/               # 全局变量
│   ├── cache.go        # 全局缓存
│   ├── global.go        # 全局配置
│   ├── monitor.go      # 全局监控
│   ├── queue.go         # 全局队列
│   └── rateLimit.go     # 全局限流
├── initialize/           # 初始化模块
│   ├── A_ENTER.go      # 初始化入口
│   ├── config/         # 配置初始化
│   ├── cUserToken/     # 用户 Token 初始化
│   ├── database/       # 数据库初始化
│   ├── lang/           # 语言初始化
│   ├── other/          # 其他初始化
│   ├── rateLimitCache/  # 限流缓存初始化
│   ├── redis/          # Redis 初始化
│   ├── runlog/         # 运行日志初始化
│   ├── systemMonitor/   # 系统监控初始化
│   ├── systemSettingCache/ # 系统设置缓存初始化
│   └── userToken/      # 用户 Token 初始化
├── lang/                 # 语言文件
│   ├── en-us.ini      # 英文语言
│   └── zh-cn.ini      # 中文语言
├── lib/                  # 工具库
│   ├── cache/          # 缓存工具
│   ├── captcha/        # 验证码
│   ├── cmn/            # 公共工具
│   ├── computerInfo/   # 系统信息
│   ├── crypto/         # 加密工具
│   ├── iniConfig/      # 配置管理
│   ├── integration/    # 第三方集成
│   ├── jsonConfig/     # JSON 配置
│   ├── language/       # 语言处理
│   ├── mail/           # 邮件发送
│   ├── monitor/        # 系统监控
│   ├── queue/          # 队列工具
│   ├── siteFavicon/    # 网站图标
│   └── user/           # 用户工具
├── models/               # 数据模型
│   ├── datatype.go     # 数据类型
│   ├── itemIcon.go     # 图标模型
│   ├── itemIconGroup.go # 图标分组模型
│   ├── moduleConfig.go  # 模块配置模型
│   ├── notice.go       # 通知模型
│   ├── SystemSetting.go # 系统设置模型
│   ├── User.go         # 用户模型
│   ├── userConfig.go   # 用户配置模型
│   ├── widget_instance.go # 小组件实例模型
│   └── base.go         # 基础模型
├── router/               # 路由配置
│   ├── A_ENTER.go      # 路由入口
│   ├── integration/    # 集成路由
│   ├── openness/       # 开放路由
│   ├── panel/          # 面板路由
│   ├── system/         # 系统路由
│   └── widget/         # 小组件路由
├── runtime/              # 运行时文件
│   └── runlog/        # 运行日志
│       └── running.log # 运行日志文件
├── service/              # 业务逻辑层
│   └── system/
│       └── auth_service.go # 认证服务
├── structs/              # 数据结构
│   └── iniConfig.go    # 配置结构
├── utils/                # 工具函数
│   └── browser.go      # 浏览器工具
├── websocket/            # WebSocket 处理
│   ├── client.go       # WebSocket 客户端
│   ├── handler.go      # WebSocket 处理器
│   └── hub.go          # WebSocket 集线器
├── main.go               # 程序入口
├── go.mod                # Go 模块依赖
├── go.sum                # 依赖锁定文件
└── README_API.md         # API 文档
```

### 前端目录详解

```
src/
├── components/           # React 组件
│   ├── Background.tsx    # 背景组件（支持图片/视频/自适应）
│   ├── AppGrid.tsx       # 应用网格组件（拖拽排序）
│   ├── LockScreen.tsx    # 锁屏组件（密码解锁）
│   ├── MusicWidget.tsx    # 音乐小组件（播放/歌词）
│   ├── SettingsModal.tsx # 设置模态框（多标签）
│   ├── WeatherWidget.tsx  # 天气小组件（温度/图标）
│   └── settings/        # 设置页面
│       ├── BasicTab.tsx    # 基本设置（主题/语言）
│       ├── DesktopTab.tsx  # 桌面端设置（背景/布局）
│       └── SecurityTab.tsx # 安全设置（密码/锁定）
├── hooks/               # React Hooks
│   ├── useAppConfig.ts   # 应用配置 Hook（状态管理）
│   ├── useAuth.ts       # 认证 Hook（登录/登出）
│   └── useSystemStats.ts # 系统监控 Hook（CPU/内存/磁盘等）
├── services/            # API 服务
│   └── client.ts       # API 客户端（fetch 封装）
├── types.ts             # TypeScript 类型定义
│   ├── AppConfig       # 应用配置类型
│   ├── SystemStats     # 系统监控类型
│   ├── User            # 用户类型
│   └── 其他类型定义
├── utils/               # 工具函数
│   └── image.ts        # 图片处理工具（压缩/裁剪）
├── constants.ts         # 常量定义
│   ├── API 常量
│   ├── 配置常量
│   └── 其他常量
├── App.tsx             # 主应用组件
│   ├── 路由管理
│   ├── 状态管理
│   ├── 全局样式
│   └── 错误处理
└── main.tsx            # 入口文件
    ├── React 应用挂载
    ├── 样式导入
    └── 服务启动
```

## 核心功能

### 1. 用户认证系统

#### 登录功能
- **接口**: `POST /api/login`
- **功能**:
  - 用户名密码验证
  - Token 生成和返回
  - 登录状态管理
  - 验证码支持（可选）

#### 登出功能
- **接口**: `POST /api/logout`
- **功能**:
  - Token 清除
  - 登录状态更新
  - 页面跳转

#### 用户信息管理
- **接口**: 
  - `POST /api/user/getInfo` - 获取用户信息
  - `POST /api/user/updatePassword` - 修改密码
  - `POST /api/user/updateInfo` - 修改用户信息
  - `POST /api/user/getReferralCode` - 获取推荐码
- **功能**:
  - 用户信息查询
  - 密码修改（bcrypt 加密）
  - 用户信息更新
  - 头像上传

### 2. 文件管理系统

#### 图片上传
- **接口**: `POST /api/file/uploadImg`
- **支持格式**: PNG, JPG, GIF, JPEG, WEBP, SVG, ICO
- **文件大小限制**: 32MB
- **功能**:
  - 文件格式验证
  - 文件大小限制
  - 自动压缩
  - 路径返回

#### 文件上传
- **接口**: `POST /api/file/uploadFiles`
- **支持格式**: MP4, WEBM, M3U8, MOV, AVI
- **文件大小限制**: 32MB
- **功能**:
  - 批量上传
  - 文件格式验证
  - 文件大小限制
  - 路径返回

#### 文件管理
- **接口**:
  - `POST /api/file/getList` - 获取文件列表
  - `POST /api/file/deletes` - 删除文件
- **功能**:
  - 文件列表查询
  - 分页支持
  - 批量删除
  - 文件清理

### 3. 系统配置管理

#### 配置管理
- **接口**:
  - `POST /api/system/moduleConfig/save` - 保存配置
  - `POST /api/system/moduleConfig/getByName` - 获取配置
  - `POST /api/system/resetAll` - 重置所有设置
- **功能**:
  - 配置保存
  - 配置查询
  - 配置更新
  - 系统重置

### 4. 系统监控功能

#### CPU 监控
- **接口**: `POST /api/system/monitor/getCpuState`
- **返回数据**:
  - CPU 使用率（每个核心）
  - CPU 温度
- **缓存**: 3 秒

#### 内存监控
- **接口**: `POST /api/system/monitor/getMemonyState`
- **返回数据**:
  - 总内存
  - 已用内存
  - 使用百分比
- **缓存**: 3 秒

#### 磁盘监控
- **接口**: `POST /api/system/monitor/getDiskStateAll`
- **返回数据**:
  - 挂载点
  - 总空间
  - 已用空间
  - 可用空间
  - 使用百分比
- **缓存**: 3 秒

#### 网络监控
- **接口**: `POST /api/system/monitor/getNetIOState`
- **返回数据**:
  - 网卡名称
  - 发送字节数
  - 接收字节数
- **缓存**: 3 秒

#### GPU 监控
- **接口**: `POST /api/system/monitor/getGpuState`
- **返回数据**:
  - GPU 名称
  - 使用率
  - 温度
- **缓存**: 3 秒

#### 电源监控
- **接口**: `POST /api/system/monitor/getPowerState`
- **返回数据**:
  - 总功耗
- **缓存**: 3 秒

#### Docker 监控
- **接口**:
  - `POST /api/system/monitor/getDockerState` - 获取容器状态
  - `POST /api/system/monitor/docker/start` - 启动容器
  - `POST /api/system/monitor/docker/stop` - 停止容器
  - `POST /api/system/monitor/docker/restart` - 重启容器
- **功能**:
  - 容器列表展示
  - 容器状态监控
  - 容器控制操作

### 5. 面板管理功能

#### 图标管理
- **接口**:
  - `POST /api/panel/itemIcon/edit` - 创建/编辑图标
  - `POST /api/panel/itemIcon/deletes` - 删除图标
  - `POST /api/panel/itemIcon/saveSort` - 保存排序
  - `POST /api/panel/itemIcon/addMultiple` - 批量添加
  - `POST /api/panel/itemIcon/getSiteFavicon` - 获取网站图标
  - `POST /api/panel/itemIcon/getListByGroupId` - 获取分组列表
- **功能**:
  - 图标创建和编辑
  - 图标删除
  - 图标排序
  - 批量添加
  - 网站图标自动获取
  - 分组管理

#### 图标分组管理
- **接口**:
  - `POST /api/panel/itemIconGroup/edit` - 创建/编辑分组
  - `POST /api/panel/itemIconGroup/deletes` - 删除分组
  - `POST /api/panel/itemIconGroup/saveSort` - 保存排序
  - `POST /api/panel/itemIconGroup/getList` - 获取分组列表
- **功能**:
  - 分组创建和编辑
  - 分组删除
  - 分组排序

#### 用户管理
- **接口**:
  - `POST /api/panel/users/create` - 创建用户
  - `POST /api/panel/users/update` - 更新用户
  - `POST /api/panel/users/getList` - 获取用户列表
  - `POST /api/panel/users/deletes` - 删除用户
  - `POST /api/panel/users/getPublicVisitUser` - 获取公开访问用户
  - `POST /api/panel/users/setPublicVisitUser` - 设置公开访问用户
- **功能**:
  - 用户创建
  - 用户更新
  - 用户删除
  - 权限管理
  - 公开访问设置

### 6. 开放接口

- **接口**:
  - `GET /api/openness/loginConfig` - 获取登录配置
  - `GET /api/openness/getDisclaimer` - 获取免责声明
  - `GET /api/openness/getAboutDescription` - 获取关于描述
- **功能**:
  - 登录配置获取
  - 免责声明获取
  - 关于信息获取

### 7. 通知管理

- **接口**: `POST /api/notice/getListByDisplayType`
- **功能**:
  - 通知列表获取
  - 显示类型过滤

### 8. 关于信息

- **接口**: `POST /api/about`
- **功能**:
  - 版本信息获取
  - 系统信息获取

## 配置说明

### 后端配置

#### 基础配置
```ini
[base]
http_port=3001              # Web 服务端口
database_drive=sqlite         # 数据库驱动
cache_drive=memory           # 缓存驱动
queue_drive=memory           # 队列驱动
source_path=./uploads        # 文件上传路径
source_temp_path=./runtime/temp # 临时文件路径
```

#### 数据库配置
```ini
[sqlite]
file_path=./database/database.db  # SQLite 数据库文件路径

[mysql]
host=127.0.0.1
port=3306
username=root
password=root
db_name=matrix_panel
wait_timeout=100

[postgres]
host=127.0.0.1
port=5432
username=postgres
password=postgres
db_name=matrix_panel
sslmode=disable
```

#### Redis 配置
```ini
[redis]
address=127.0.0.1:6379
password=
prefix=matrix_panel:
db=0
```

### 前端配置

#### Vite 配置
```typescript
export default defineConfig({
  server: {
    port: 3004,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/Pixel': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
});
```

#### Tailwind 配置
```javascript
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        pixel: ['"Ark Pixel 12px Monospaced ZhCn"', 'monospace'],
      },
    }
  }
};
```

## 部署说明

### 开发环境部署

#### 前端部署
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问应用
# http://localhost:3004
```

#### 后端部署
```bash
# 进入后端目录
cd backend

# 安装依赖
go mod download

# 启动后端服务
go run main.go

# 访问 API
# http://localhost:3001/api
```

### 生产环境部署

#### Docker 部署
```bash
# 构建镜像
docker build -t matrix-panel .

# 运行容器
docker run -d --name matrix-panel \
  --privileged \
  -p 8999:8899 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v matrix-panel-conf:/app/conf \
  -v matrix-panel-db:/app/database \
  -v matrix-panel-uploads:/app/uploads \
  -v matrix-panel-runtime:/app/runtime \
  matrix-panel:1.0.0
```

#### Nginx 部署
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端静态文件
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API 代理
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # 静态资源代理
    location /uploads/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /Pixel/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 默认账号

### 管理员账号
- **用户名**: `admin`
- **密码**: `admin`
- **邮箱**: `admin@sun.cc`
- **角色**: 管理员 (role=1)
- **状态**: 启用 (status=1)

### 首次登录
1. 访问：http://localhost:3004
2. 输入用户名：`admin`
3. 输入密码：`admin`
4. 点击登录按钮
5. 建议首次登录后立即修改密码

## API 文档

### API 基础信息

- **基础地址**: `http://localhost:3001/api`
- **认证方式**: Token 认证
- **请求格式**: JSON
- **响应格式**: JSON

### API 响应格式

```json
{
  "code": 0,           // 0 表示成功，其他表示错误
  "msg": "OK",         // 消息描述
  "data": {}            // 返回的数据（可选）
}
```

### 错误码说明

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 1000 | 未登录 |
| 1001 | 登录已过期 |
| 1003 | 用户名或密码错误 |
| 1004 | 账号已停用或未激活 |
| 1005 | 无访问权限 |
| 1101 | 验证码必填 |
| 1102 | 验证码验证失败 |
| 1200 | 数据库错误 |
| 1202 | 数据记录未找到 |
| 1300 | 文件上传失败 |
| 1301 | 不支持的文件格式 |

### 完整 API 文档

详细的 API 文档请参考：
- [backend/README_API.md](file:///c:\Users\16504\Downloads\generated (22) (2)\backend\README_API.md) - 后端 API 文档
- [FRONTEND_API_GUIDE.md](file:///c:\Users\16504\Downloads\generated (22) (2)\FRONTEND_API_GUIDE.md) - 前端 API 对接指南
- [API_CHECKLIST.md](file:///c:\Users\16504\Downloads\generated (22) (2)\API_CHECKLIST.md) - API 检查清单

## 性能优化

### 前端优化

#### 组件优化
- **React.memo**: 避免不必要的重新渲染
- **useCallback**: 优化函数引用
- **useMemo**: 优化计算结果
- **虚拟滚动**: 处理大量数据列表

#### 资源优化
- **图片懒加载**: 减少初始加载时间
- **代码分割**: 按需加载模块
- **Tree Shaking**: 移除未使用的代码
- **Gzip 压缩**: 减少传输大小

### 后端优化

#### 数据库优化
- **连接池**: 复用数据库连接
- **索引优化**: 加快查询速度
- **查询优化**: 优化 SQL 查询
- **事务处理**: 批量操作优化

#### 缓存优化
- **内存缓存**: 快速访问热点数据
- **Redis 缓存**: 分布式缓存支持
- **API 缓存**: 3 秒缓存系统监控数据
- **配置缓存**: 系统设置缓存

## 安全措施

### 认证安全
- **Token 认证**: 所有 API 请求都需要 Token
- **密码加密**: 使用 bcrypt 加密密码
- **登录拦截器**: 验证用户登录状态
- **管理员权限**: 管理员权限拦截器
- **公开模式**: 公开模式拦截器

### 文件上传安全
- **文件格式验证**: 只允许指定格式
- **文件大小限制**: 最大 32MB
- **文件路径验证**: 防止路径遍历攻击
- **文件名处理**: 防止文件名注入

### API 安全
- **请求验证**: 验证所有请求参数
- **错误处理**: 完善的错误处理机制
- **日志记录**: 记录所有 API 请求
- **速率限制**: 可选的速率限制功能

## 故障排查

### 常见问题

#### 1. 登录失败
**可能原因**:
- 用户名或密码错误
- 用户状态异常
- Token 过期

**解决方法**:
1. 确认用户名和密码正确
2. 检查用户状态是否为启用
3. 清除浏览器缓存
4. 查看后端日志

#### 2. 文件上传失败
**可能原因**:
- 文件大小超过限制
- 文件格式不支持
- 网络连接问题

**解决方法**:
1. 检查文件大小是否超过 32MB
2. 检查文件格式是否支持
3. 检查网络连接
4. 查看后端日志

#### 3. 系统监控数据不显示
**可能原因**:
- API 请求失败
- 权限不足
- 系统监控服务未启动

**解决方法**:
1. 检查用户权限
2. 查看后端日志
3. 检查系统监控服务状态
4. 刷新页面

#### 4. Docker 容器控制失败
**可能原因**:
- Docker API 未连接
- 权限不足
- 容器不存在

**解决方法**:
1. 检查 Docker API 连接
2. 检查用户权限
3. 确认容器是否存在
4. 查看后端日志

## 开发指南

### 前端开发

#### 添加新组件
1. 在 `src/components/` 目录下创建组件文件
2. 使用 TypeScript 编写组件
3. 导出组件供其他模块使用
4. 在 `App.tsx` 中引入组件

#### 添加新页面
1. 创建新的路由配置
2. 创建对应的组件文件
3. 在 `App.tsx` 中添加路由
4. 测试路由功能

#### 添加新 API
1. 在 `src/services/client.ts` 中添加 API 调用
2. 创建对应的 Hook 封装 API 调用
3. 在组件中使用 Hook
4. 测试 API 功能

### 后端开发

#### 添加新 API 接口
1. 在 `api/api_v1/` 对应模块中创建处理函数
2. 在 `router/` 对应模块中注册路由
3. 添加中间件（如需要认证）
4. 更新 API 文档

#### 添加新数据模型
1. 在 `models/` 目录下创建模型文件
2. 定义数据结构
3. 添加 GORM 标签
4. 创建数据库迁移

#### 添加新集成服务
1. 在 `lib/integration/` 目录下创建集成文件
2. 实现 `interfaces.go` 中定义的接口
3. 在 `api/api_v1/widget/` 中添加 API 接口
4. 在前端添加对应的 UI 组件

## 维护指南

### 日常维护

#### 日志检查
- 定期检查后端日志
- 检查前端控制台错误
- 监控系统性能指标

#### 数据备份
- 定期备份数据库
- 备份上传文件
- 备份配置文件

#### 安全更新
- 定期更新依赖包
- 检查安全漏洞
- 应用安全补丁

### 性能监控

#### 系统监控
- 监控 CPU 使用率
- 监控内存使用情况
- 监控磁盘空间
- 监控网络流量

#### 应用监控
- 监控 API 响应时间
- 监控错误率
- 监控用户活跃度

## 扩展开发

### 添加新功能

#### 1. 确定功能需求
- 明确功能目标
- 确定技术方案
- 设计用户界面
- 规划 API 接口

#### 2. 开发后端功能
- 创建数据模型
- 实现 API 接口
- 添加路由配置
- 编写单元测试

#### 3. 开发前端功能
- 创建 UI 组件
- 实现 API 调用
- 添加状态管理
- 编写单元测试

#### 4. 测试和优化
- 功能测试
- 性能测试
- 安全测试
- 用户体验优化

### 集成第三方服务

#### 支持的服务类型
- **媒体管理**: Emby, Jellyfin, Plex
- **下载工具**: qBittorrent, Transmission, Sabnzbd, Deluge
- **媒体整理**: Sonarr, Radarr, Lidarr, Readarr
- **监控工具**: Uptime Kuma, Grafana
- **容器管理**: Docker, Portainer
- **云存储**: Nextcloud
- **通知服务**: Ntfy, Gotify
- **其他**: Home Assistant, Pihole, AdGuard, Tautulli, Unraid

#### 集成步骤
1. 在 `lib/integration/` 中创建集成文件
2. 实现必要的接口方法
3. 在 `api/api_v1/widget/` 中添加 API 接口
4. 在前端添加对应的 UI 组件
5. 测试集成功能

## 相关文档

### 项目文档
- [README.md](file:///c:\Users\16504\Downloads\generated (22) (2)\README.md) - 项目说明
- [backend/README_API.md](file:///c:\Users\16504\Downloads\generated (22) (2)\backend\README_API.md) - 后端 API 文档
- [FRONTEND_API_GUIDE.md](file:///c:\Users\16504\Downloads\generated (22) (2)\FRONTEND_API_GUIDE.md) - 前端 API 对接指南
- [API_CHECKLIST.md](file:///c:\Users\16504\Downloads\generated (22) (2)\API_CHECKLIST.md) - API 检查清单

### 修复文档
- [API_ERROR_FIX.md](file:///c:\Users\16504\Downloads\generated (22) (2)\API_ERROR_FIX.md) - API 错误修复
- [BACKGROUND_FIX.md](file:///c:\Users\16504\Downloads\generated (22) (2)\BACKGROUND_FIX.md) - 背景修复说明
- [REACT_HOOKS_FIX.md](file:///c:\Users\16504\Downloads\generated (22) (2)\REACT_HOOKS_FIX.md) - React Hooks 修复
- [BACKGROUND_OPTIMIZATION.md](file:///c:\Users\16504\Downloads\generated (22) (2)\BACKGROUND_OPTIMIZATION.md) - 背景优化说明

### 重命名文档
- [RENAME_TO_MATRIX_PANEL.md](file:///c:\Users\16504\Downloads\generated (22) (2)\RENAME_TO_MATRIX_PANEL.md) - 重命名说明

### 检查文档
- [FUNCTIONALITY_CHECK.md](file:///c:\Users\16504\Downloads\generated (22) (2)\FUNCTIONALITY_CHECK.md) - 功能性检查
- [RUNTIME_ERROR_CHECK.md](file:///c:\Users\16504\Downloads\generated (22) (2)\RUNTIME_ERROR_CHECK.md) - 运行错误检查

## 总结

Matrix Panel 是一个功能完整、性能优秀、安全可靠的个人导航面板系统。系统采用现代化的技术栈，具有良好的架构设计和完善的文档支持。

### 系统特点
- ✅ 功能完整：所有核心功能都已实现
- ✅ 性能优秀：前后端都有良好的性能优化
- ✅ 安全可靠：完善的认证机制和安全措施
- ✅ 兼容性强：支持多种浏览器、设备和操作系统
- ✅ 易于部署：支持 Docker 部署，配置简单
- ✅ 文档完善：详细的 API 文档和使用说明

### 适用场景
- 个人导航面板
- 家庭服务器管理
- 开发环境管理
- 企业内网门户
- 多用户协作平台

---

**文档版本**: 1.0  
**最后更新**: 2026-02-15  
**系统版本**: Matrix Panel 1.3.0