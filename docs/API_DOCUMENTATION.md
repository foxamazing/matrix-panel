# Matrix Panel API Documentation

**基础URL**: `http://localhost:8080/api`  
**版本**: v1

> 注意：除特别标注为【公开】的 API 外，其余 API 均需在 Header 中携带 `token` 进行访问。部分管理接口需要管理员权限。

---

## 1. 系统基础 (System)

| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| POST | `/login` | 用户登录，获取 Token | 公开 |
| POST | `/logout` | 退出登录 | 需登录 |
| POST | `/about` | 获取系统版本信息 | 公开 |
| POST | `/notice/getListByDisplayType` | 获取系统公告列表 | 公开 |

### 用户相关 (User)
| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| POST | `/user/getInfo` | 获取当前登录用户信息 | 需登录 |
| POST | `/user/updatePassword` | 修改密码 | 需登录 |
| POST | `/user/updateInfo` | 修改用户基础信息（头像、昵称） | 需登录 |
| POST | `/user/getReferralCode` | 获取邀请码 | 需登录 |
| POST | `/user/getAuthInfo` | 获取用户授权信息（用于前端判断展示模式） | 公开 |

### 文件管理 (File)
| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| POST | `/file/uploadImg` | 上传单张图片 | 需登录 |
| POST | `/file/uploadFiles` | 批量上传文件 | 需登录 |
| POST | `/file/getList` | 获取已上传文件列表 | 需登录 |
| POST | `/file/deletes` | 删除文件 | 需登录 |

### 系统监控 (Monitor)
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

### 配置相关
| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| POST | `/system/moduleConfig/save` | 保存模块配置 | 需登录 |
| POST | `/system/moduleConfig/getByName` | 根据名称获取模块配置 | 公开 |

---

## 2. 面板管理 (Panel)

### 图标管理 (ItemIcon)
| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| POST | `/panel/itemIcon/edit` | 编辑/添加图标项 | 需登录 |
| POST | `/panel/itemIcon/deletes` | 删除图标项 | 需登录 |
| POST | `/panel/itemIcon/saveSort` | 保存图标排序 | 需登录 |
| POST | `/panel/itemIcon/addMultiple` | 批量添加图标 | 需登录 |
| POST | `/panel/itemIcon/getSiteFavicon` | 获取并下载站点图标到服务器 | 需登录 |
| POST | `/panel/itemIcon/getListByGroupId` | 获取指定分组下的图标列表 | 公开 |

### 分组管理 (ItemIconGroup)
| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| POST | `/panel/itemIconGroup/edit` | 编辑/添加分组 | 需登录 |
| POST | `/panel/itemIconGroup/deletes` | 删除分组 | 需登录 |
| POST | `/panel/itemIconGroup/saveSort` | 保存分组排序 | 需登录 |
| POST | `/panel/itemIconGroup/getList` | 获取分组列表 | 公开 |

### 用户配置 (UserConfig)
| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| POST | `/panel/userConfig/set` | 设置用户面板配置（如布局、搜索引擎） | 需登录 |
| POST | `/panel/userConfig/get` | 获取用户面板配置 | 公开 |

### 用户管理 (Admin Users)
| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| POST | `/panel/users/create` | 创建新用户 | **管理员** |
| POST | `/panel/users/update` | 更新用户信息（含角色） | **管理员** |
| POST | `/panel/users/getList` | 获取用户列表 | **管理员** |
| POST | `/panel/users/deletes` | 删除用户 | **管理员** |
| POST | `/panel/users/setPublicVisitUser` | 设置公开访问所使用的账号 | **管理员** |
| POST | `/panel/users/getPublicVisitUser` | 获取公开访问账号信息 | **管理员** |

---

## 3. 开放接口 (Openness)

| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| GET | `/loginConfig` | 获取登录配置（如验证码开关、注册开关） | 公开 |
| GET | `/getDisclaimer` | 获取免责声明内容 | 公开 |
| GET | `/getAboutDescription` | 获取关于页描述信息 | 公开 |

---

## 4. 集成服务 (Integration) - V1

> 路径前缀：`/api/integrations`

### 通用管理
| 方法 | 路径 | 描述 |
| :--- | :--- | :--- |
| GET | `/` | 获取所有配置的集成服务列表 |
| POST | `/` | 创建新的集成服务 |
| GET | `/:id` | 获取指定集成详情 |
| PUT | `/:id` | 更新集成服务配置 |
| DELETE | `/:id` | 删除集成服务 |
| POST | `/test` | 测试集成连接配置有效性 |

### 特定服务 API
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

---

## 5. Widget 服务 (Widget) - V1

> 路径前缀：`/api/v1`

### 看板与 Widget 管理
| 方法 | 路径 | 描述 |
| :--- | :--- | :--- |
| GET | `/boards/default` | 获取默认看板信息 |
| GET | `/boards/:boardId/widgets` | 获取指定看板的所有 Widget |
| POST | `/widgets` | 创建 Widget 实例 |
| PUT | `/widgets/:id` | 更新 Widget 配置（位置、大小、选项） |
| DELETE | `/widgets/:id` | 删除 Widget 实例 |

### Widget 数据源 API (Integrations Proxy)
| 服务 | 路径 | 描述 |
| :--- | :--- | :--- |
| **Media Server** | `/integrations/media-server/sessions` | 获取媒体服务器（Plex/Jellyfin）当前播放会话 |
| **Sonarr** | `/integrations/sonarr/calendar` | 获取 Sonarr 剧集日历 |
| **Download** | `/integrations/download-client/queue` | 获取下载客户端（qBittorrent）队列 |
| **Docker** | `/integrations/docker/containers` | 获取 Docker 容器列表（Portainer/Docker） |
| **Health** | `/integrations/health/status` | 获取系统健康状态概览 |

