# Matrix Panel

> 一个现代化的、自托管的桌面式主页面板。集成应用分组、搜索、系统监控、Docker 管理及个性化定制功能。

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg) ![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ 功能特色

- **🖥️ 桌面级体验**：精美的玻璃拟态 UI，支持时钟、天气、音乐播放器及可拖拽的布局。
- **📂 应用管理**：支持应用分组、排序、快捷启动，以及内网/公网地址智能切换。
- **🔒 安全机制**：支持站点锁定、访客模式与管理员权限控制。
- **📊 系统监控**：实时监控 CPU、内存、磁盘、网络、GPU 及功耗（支持 Prometheus 集成）。
- **🐳 Docker 管理**：可视化管理 Docker 容器（启动/停止/重启），支持多主机连接。

## 🛠️ 技术栈

**Frontend**
- **Core**: React 19, TypeScript, Vite
- **UI**: Tailwind CSS, Framer Motion, Lucide React
- **Layout**: React Grid Layout

**Backend**
- **Core**: Go 1.20+
- **Web Framework**: Gin
- **Database**: GORM (SQLite/MySQL)

## 📂 目录结构

```
.
├── backend/            # 后端源码 (Go)
│   ├── api/            # API Handlers
│   ├── conf/           # 配置文件 (conf.ini)
│   ├── initialize/     # 初始化逻辑
│   ├── models/         # 数据模型
│   └── ...
├── src/                # 前端源码 (React)
│   ├── components/     # UI 组件
│   ├── hooks/          # Custom Hooks
│   └── ...
├── scripts/            # 维护与启动脚本
├── docs/               # 文档
├── frontend_backup/    # (Backup)
└── ...
```

## 🚀 快速开始 (本地开发)

### 前置要求
- Node.js (v18+)
- Go (v1.20+)
- GCC (Windows 下推荐 TDM-GCC，用于编译 SQLite 驱动)

### 启动步骤

1. **安装依赖**
   ```bash
   npm install
   ```

2. **一键启动 (推荐)**
   自动启动后端 API (Port 3002) 和 前端开发服务器 (Port 3000)。
   ```bash
   npm run dev:all
   # 或者直接运行脚本
   # powershell ./scripts/restart-dev.ps1
   ```

3. **访问**
   - 前端: http://localhost:3000
   - 后端: http://localhost:3002

### 手动启动
如果一键脚本无法使用，可分别启动：

**后端**
```bash
cd backend
go run main.go
```

**前端**
```bash
npm run dev
```

## 🐳 快速开始 (Docker)

使用 Docker 快速部署生产环境。

### Docker CLI
```bash
docker run -d --name matrix-panel \
  --privileged \
  -p 8999:8899 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v matrix-panel-conf:/app/conf \
  -v matrix-panel-db:/app/database \
  -v matrix-panel-uploads:/app/uploads \
  foxhock/matrix-panel:latest
```
访问：`http://<宿主机IP>:8999/`

### Docker Compose
见项目根目录下的 [docker-compose.yml](deployment/docker/docker-compose.yml)。

## ⚙️ 配置说明

后端配置文件位于 `backend/conf/conf.ini`。支持配置：
- 端口监听 (Default: 3002)
- 数据库连接 (SQLite/MySQL)
- 日志级别
- JWT 密钥

## 👤 默认账号

- 用户名：`admin`
- 密码：`admin`

*请首次登录后立即修改密码。*

## 💡 使用说明

- **登录**：右上角进入登录弹窗，使用默认账号登录。
- **编辑模式**：管理员登录后可切换编辑模式，进行应用/分组增删改与拖拽排序。
- **智能路由**：为应用配置 `内网地址` 后，在内网环境（IP/localhost）会自动优先使用内网地址。
- **容器控制**：关联 Docker 容器 ID/名称后的应用，可直接在卡片上进行启动/停止/重启操作。

## 📚 API 参考文档
**基础URL**: `http://localhost:3002` (Backend Direct) / `/api` (Frontend Proxy)
**版本**: v1

> 注意：除特别标注为【公开】的 API 外，其余 API 均需在 Header 中携带 `token` 进行访问。部分管理接口需要管理员权限。

### 1. 系统基础 (System)

| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| POST | `/login` | 用户登录，获取 Token | 公开 |
| POST | `/logout` | 退出登录 | 需登录 |
| POST | `/about` | 获取系统版本信息 | 公开 |
| POST | `/notice/getListByDisplayType` | 获取系统公告列表 | 公开 |

#### 用户相关 (User)
| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| POST | `/user/getInfo` | 获取当前登录用户信息 | 需登录 |
| POST | `/user/updatePassword` | 修改密码 | 需登录 |
| POST | `/user/updateInfo` | 修改用户基础信息（头像、昵称） | 需登录 |
| POST | `/user/getReferralCode` | 获取邀请码 | 需登录 |
| POST | `/user/getAuthInfo` | 获取用户授权信息（用于前端判断展示模式） | 公开 |

#### 文件管理 (File)
| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| POST | `/file/uploadImg` | 上传单张图片 | 需登录 |
| POST | `/file/uploadFiles` | 批量上传文件 | 需登录 |
| POST | `/file/getList` | 获取已上传文件列表 | 需登录 |
| POST | `/file/deletes` | 删除文件 | 需登录 |

#### 系统监控 (Monitor)
| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| POST | `/system/monitor/fetchFavicon` | 获取指定 URL 的 Favicon | 需登录 |
| POST | `/system/monitor/getCpuState` | 获取 CPU 状态 | 需登录 |
| POST | `/system/monitor/getMemonyState` | 获取内存状态 | 需登录 |
| POST | `/system/monitor/getDiskStateAll` | 获取所有磁盘状态 | 需登录 |
| POST | `/system/monitor/getNetIOState` | 获取网络 I/O 状态 | 需登录 |
| POST | `/system/monitor/getPowerState` | 获取电源状态 | 需登录 |
| POST | `/system/monitor/getDockerState` | 获取 Docker 整体状态 | **管理员** |
| POST | `/system/monitor/docker/start` | 启动 Docker 容器 | **管理员** |
| POST | `/system/monitor/docker/stop` | 停止 Docker 容器 | **管理员** |
| POST | `/system/monitor/docker/restart` | 重启 Docker 容器 | **管理员** |

#### 配置相关
| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| POST | `/system/moduleConfig/save` | 保存模块配置 | 需登录 |
| POST | `/system/moduleConfig/getByName` | 根据名称获取模块配置 | 公开 |

### 2. 面板管理 (Panel)

#### 图标管理 (ItemIcon)
| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| POST | `/panel/itemIcon/edit` | 编辑/添加图标项 | 需登录 |
| POST | `/panel/itemIcon/deletes` | 删除图标项 | 需登录 |
| POST | `/panel/itemIcon/saveSort` | 保存图标排序 | 需登录 |
| POST | `/panel/itemIcon/addMultiple` | 批量添加图标 | 需登录 |
| POST | `/panel/itemIcon/getSiteFavicon` | 获取并下载站点图标到服务器 | 需登录 |
| POST | `/panel/itemIcon/getListByGroupId` | 获取指定分组下的图标列表 | 公开 |

#### 分组管理 (ItemIconGroup)
| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| POST | `/panel/itemIconGroup/edit` | 编辑/添加分组 | 需登录 |
| POST | `/panel/itemIconGroup/deletes` | 删除分组 | 需登录 |
| POST | `/panel/itemIconGroup/saveSort` | 保存分组排序 | 需登录 |
| POST | `/panel/itemIconGroup/getList` | 获取分组列表 | 公开 |

#### 用户配置 (UserConfig)
| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| POST | `/panel/userConfig/set` | 设置用户面板配置（如布局、搜索引擎） | 需登录 |
| POST | `/panel/userConfig/get` | 获取用户面板配置 | 公开 |

#### 用户管理 (Admin Users)
| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| POST | `/panel/users/create` | 创建新用户 | **管理员** |
| POST | `/panel/users/update` | 更新用户信息（含角色） | **管理员** |
| POST | `/panel/users/getList` | 获取用户列表 | **管理员** |
| POST | `/panel/users/deletes` | 删除用户 | **管理员** |
| POST | `/panel/users/setPublicVisitUser` | 设置公开访问所使用的账号 | **管理员** |
| POST | `/panel/users/getPublicVisitUser` | 获取公开访问账号信息 | **管理员** |

### 3. 开放接口 (Openness)

| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| GET | `/loginConfig` | 获取登录配置（如验证码开关、注册开关） | 公开 |
| GET | `/getDisclaimer` | 获取免责声明内容 | 公开 |
| GET | `/getAboutDescription` | 获取关于页描述信息 | 公开 |

### 4. 集成服务 (Integration) - V1

> 路径前缀：`/api/integrations`

#### 通用管理
| 方法 | 路径 | 描述 |
| :--- | :--- | :--- |
| GET | `/` | 获取所有配置的集成服务列表 |
| POST | `/` | 创建新的集成服务 |
| GET | `/:id` | 获取指定集成详情 |
| PUT | `/:id` | 更新集成服务配置 |
| DELETE | `/:id` | 删除集成服务 |
| POST | `/test` | 测试集成连接配置有效性 |

#### 特定服务 API
| 服务 | 方法 | 路径 | 描述 |
| :--- | :--- | :--- | :--- |
| **Dashdot** | POST | `/dashdot/stats` | 获取 Dashdot 统计数据 |
| | POST | `/dashdot/test` | 测试 Dashdot 连接 |
| **iCalendar** | POST | `/ical/events` | 获取近期日历事件 |
| | GET | `/ical/test` | 测试 iCal 订阅 URL |
| **GitLab** | POST | `/gitlab/projects` | 获取项目列表 |
| | POST | `/gitlab/pipelines` | 获取流水线状态 |
| | GET | `/gitlab/test` | 测试 GitLab 连接 |
| **Docker Hub** | POST | `/dockerhub/repos` | 获取镜像仓库信息 |
| | GET | `/dockerhub/test` | 测试 Docker Hub 连接 |
| **Uptime Kuma** | POST | `/uptimekuma/monitors` | 获取监控项状态 |
| | GET | `/uptimekuma/test` | 测试 Uptime Kuma 连接 |

### 5. Widget 服务 (Widget) - V1

> 路径前缀：`/api/v1`

#### 看板与 Widget 管理
| 方法 | 路径 | 描述 |
| :--- | :--- | :--- |
| GET | `/boards/default` | 获取默认看板信息 |
| GET | `/boards/:boardId/widgets` | 获取指定看板的所有 Widget |
| POST | `/widgets` | 创建 Widget 实例 |
| PUT | `/widgets/:id` | 更新 Widget 配置（位置、大小、选项） |
| DELETE | `/widgets/:id` | 删除 Widget 实例 |

#### Widget 数据源 API (Integrations Proxy)
| 服务 | 路径 | 描述 |
| :--- | :--- | :--- |
| **Media Server** | `/integrations/media-server/sessions` | 获取媒体服务器（Plex/Jellyfin）当前播放会话 |
| **Sonarr** | `/integrations/sonarr/calendar` | 获取 Sonarr 剧集日历 |
| **Download** | `/integrations/download-client/queue` | 获取下载客户端（qBittorrent）队列 |
| **Docker** | `/integrations/docker/containers` | 获取 Docker 容器列表（Portainer/Docker） |
| **Health** | `/integrations/health/status` | 获取系统健康状态概览 |
