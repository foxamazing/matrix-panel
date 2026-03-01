# 前端 API 对接说明文档

## 概述

前端使用 React + Vite 构建，通过 fetch API 与后端进行通信。所有 API 请求都通过 `/api` 前缀代理到后端服务器。

## API 基础配置

### 开发环境代理配置 (`vite.config.ts`)

```typescript
export default defineConfig({
  server: {
    port: 3002,
    host: '0.0.0.0',
    proxy: {
      '/api': {
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

### API 客户端 (`src/services/client.ts`)

```typescript
interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

export const apiClient = {
  async get<T>(url: string, headers: Record<string, string> = {}, signal?: AbortSignal): Promise<ApiResponse<T>>
  async post<T>(url: string, body: any, headers: Record<string, string> = {}, signal?: AbortSignal): Promise<ApiResponse<T>>
  async postForm<T>(url: string, formData: FormData, headers: Record<string, string> = {}, signal?: AbortSignal): Promise<ApiResponse<T>>
}
```

## 认证相关 API

### 1. 用户登录

**接口**: `POST /api/login`

**请求参数**:
```typescript
{
  username: string;  // 用户名
  password: string;  // 密码
  vcode?: string;    // 验证码（可选）
}
```

**响应数据**:
```typescript
{
  id: number;
  username: string;
  name: string;
  headImage: string;
  role: number;      // 1: 管理员, 2: 普通用户
  token: string;     // 认证 token
}
```

**使用示例**:
```typescript
const res = await apiClient.post<any>('/login', { 
  username: 'admin', 
  password: 'admin' 
});
localStorage.setItem('token', res.data.token);
```

### 2. 用户登出

**接口**: `POST /api/logout`

**请求头**:
```
token: <your_token>
```

**使用示例**:
```typescript
await apiClient.post('/logout', {});
localStorage.removeItem('token');
```

### 3. 获取用户信息

**接口**: `POST /api/user/getInfo`

**响应数据**:
```typescript
{
  id: number;
  username: string;
  name: string;
  headImage: string;
  role: number;
}
```

### 4. 修改密码

**接口**: `POST /api/user/updatePassword`

**请求参数**:
```typescript
{
  oldPassword: string;
  newPassword: string;
}
```

## 文件管理 API

### 1. 上传图片

**接口**: `POST /api/file/uploadImg`

**请求类型**: `multipart/form-data`

**请求参数**:
```typescript
FormData {
  imgfile: File;  // 图片文件
}
```

**响应数据**:
```typescript
{
  imageUrl: string;  // 图片 URL 路径
}
```

**使用示例**:
```typescript
const formData = new FormData();
formData.append('imgfile', file);
const res = await apiClient.postForm<{ imageUrl: string }>('/file/uploadImg', formData);
```

**支持的文件格式**: PNG, JPG, GIF, JPEG, WEBP, SVG, ICO
**文件大小限制**: 最大 32MB

### 2. 上传文件（视频等）

**接口**: `POST /api/file/uploadFiles`

**请求类型**: `multipart/form-data`

**请求参数**:
```typescript
FormData {
  'files[]': File[];  // 文件数组
}
```

**响应数据**:
```typescript
{
  succMap: Record<string, string>;  // 成功上传的文件映射
  errFiles: string[];             // 上传失败的文件列表
}
```

### 3. 获取文件列表

**接口**: `POST /api/file/getList`

**响应数据**:
```typescript
{
  list: Array<{
    id: number;
    fileName: string;
    fileExt: string;
    filePath: string;
    createdAt: string;
  }>;
  count: number;
}
```

### 4. 删除文件

**接口**: `POST /api/file/deletes`

**请求参数**:
```typescript
{
  ids: number[];  // 文件 ID 数组
}
```

## 系统配置 API

### 1. 保存配置

**接口**: `POST /api/system/moduleConfig/save`

**请求参数**:
```typescript
{
  name: string;   // 配置名称
  value: any;     // 配置值（JSON 对象）
}
```

### 2. 获取配置

**接口**: `POST /api/system/moduleConfig/getByName`

**请求参数**:
```typescript
{
  name: string;  // 配置名称
}
```

**响应数据**:
```typescript
any;  // 配置值
```

## 系统监控 API

### 1. CPU 状态

**接口**: `POST /api/system/monitor/getCpuState`

**响应数据**:
```typescript
{
  usages: number[];      // CPU 核心使用率数组
  temperature: number;    // CPU 温度
}
```

### 2. 内存状态

**接口**: `POST /api/system/monitor/getMemonyState`

**响应数据**:
```typescript
{
  total: number;      // 总内存（字节）
  used: number;       // 已用内存（字节）
  usedPercent: number; // 使用百分比
}
```

### 3. 磁盘状态

**接口**: `POST /api/system/monitor/getDiskStateAll`

**响应数据**:
```typescript
Array<{
  mountpoint: string;  // 挂载点
  total: number;       // 总空间（字节）
  used: number;        // 已用空间（字节）
  free: number;        // 可用空间（字节）
  usedPercent: number;  // 使用百分比
}>
```

### 4. 网络状态

**接口**: `POST /api/system/monitor/getNetIOState`

**响应数据**:
```typescript
Array<{
  name: string;      // 网卡名称
  bytesSent: number;  // 发送字节数
  bytesRecv: number;  // 接收字节数
}>
```

### 5. GPU 状态

**接口**: `POST /api/system/monitor/getGpuState`

**响应数据**:
```typescript
Array<{
  name: string;         // GPU 名称
  utilization: number;   // 使用率
  temperature: number;   // 温度
}>
```

### 6. Docker 状态

**接口**: `POST /api/system/monitor/getDockerState`

**响应数据**:
```typescript
Array<{
  id: string;
  name: string;
  state: string;       // running, exited, paused
  status: string;      // up, down, restarting
}>
```

## 面板管理 API

### 1. 图标管理

**创建/编辑图标**: `POST /api/panel/itemIcon/edit`
**删除图标**: `POST /api/panel/itemIcon/deletes`
**保存排序**: `POST /api/panel/itemIcon/saveSort`
**批量添加**: `POST /api/panel/itemIcon/addMultiple`
**获取列表**: `POST /api/panel/itemIcon/getListByGroupId`

### 2. 图标分组

**创建/编辑分组**: `POST /api/panel/itemIconGroup/edit`
**删除分组**: `POST /api/panel/itemIconGroup/deletes`
**保存排序**: `POST /api/panel/itemIconGroup/saveSort`
**获取列表**: `POST /api/panel/itemIconGroup/getList`

### 3. 用户管理

**创建用户**: `POST /api/panel/users/create`
**更新用户**: `POST /api/panel/users/update`
**获取列表**: `POST /api/panel/users/getList`
**删除用户**: `POST /api/panel/users/deletes`

## 错误处理

### API 响应格式

所有 API 响应都遵循统一格式：

```typescript
{
  code: number;  // 0: 成功, 其他: 错误
  msg: string;   // 消息描述
  data: T;       // 返回的数据（可选）
}
```

### 常见错误码

- `0` - 成功
- `1000` - 未登录
- `1001` - 登录已过期
- `1003` - 用户名或密码错误
- `1004` - 账号已停用或未激活
- `1005` - 无访问权限
- `1101` - 验证码必填
- `1102` - 验证码验证失败
- `1200` - 数据库错误
- `1202` - 数据记录未找到
- `1300` - 文件上传失败
- `1301` - 不支持的文件格式

### 错误处理示例

```typescript
try {
  const res = await apiClient.post<any>('/api/login', { 
    username: 'admin', 
    password: 'admin' 
  });
  if (res.data && res.data.token) {
    localStorage.setItem('token', res.data.token);
  }
} catch (error) {
  console.error('登录失败:', error.message);
}
```

## 认证机制

### Token 认证

所有需要认证的 API 请求都需要在请求头中包含 token：

```typescript
const token = localStorage.getItem('token');
const res = await fetch('/api/user/getInfo', {
  headers: {
    'token': token
  }
});
```

### Token 自动刷新

当 API 返回错误码 `1000` 或 `1001` 时，会自动清除本地 token 并触发 `auth-changed` 事件：

```typescript
window.addEventListener('auth-changed', () => {
  // 处理登出逻辑
  localStorage.removeItem('token');
  window.location.href = '/login';
});
```

## 请求取消机制

为了防止组件卸载时的请求错误，所有 API 请求都支持 AbortSignal：

```typescript
const abortController = new AbortController();
const signal = abortController.signal;

try {
  const res = await apiClient.post<any>('/api/system/monitor/getCpuState', {}, {}, signal);
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('请求被取消');
  }
}

// 组件卸载时取消请求
abortController.abort();
```

## 图片压缩

前端在上传图片前会自动进行压缩以减少文件大小：

```typescript
import { compressImage } from '../utils/image';

const compressedDataUrl = await compressImage(file, 'bg');
// 背景图片最大 1.2MB
// Logo 最大 150KB
// Favicon 最大 150KB
```

## 系统监控轮询

系统监控数据每 3 秒自动刷新一次：

```typescript
useEffect(() => {
  const fetchStats = async () => {
    const results = await Promise.allSettled([
      apiClient.post<any>('/system/monitor/getCpuState', {}),
      apiClient.post<any>('/system/monitor/getMemonyState', {}),
      // ... 其他监控接口
    ]);
    // 处理数据
  };

  fetchStats();
  const interval = setInterval(fetchStats, 3000);
  return () => clearInterval(interval);
}, []);
```

## 配置同步

用户配置会自动同步到后端：

```typescript
useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) return;

  const payload = buildRemoteValue(config);
  const serialized = JSON.stringify(payload);
  
  // 防抖 800ms 后保存
  const timer = setTimeout(() => {
    apiClient.post('/system/moduleConfig/save', { 
      name: 'nas_nav_config', 
      value: payload 
    });
  }, 800);

  return () => clearTimeout(timer);
}, [config]);
```

## 常见问题

### 1. API 请求被中止 (ERR_ABORTED)

**原因**: 组件卸载时未取消正在进行的请求

**解决**: 使用 AbortSignal 取消请求

```typescript
const abortController = new AbortController();
useEffect(() => {
  return () => abortController.abort();
}, []);
```

### 2. 文件上传失败

**原因**: 文件大小超过限制或格式不支持

**检查**:
- 文件大小是否超过 32MB
- 文件格式是否在支持列表中
- 后端日志中的具体错误信息

### 3. 登录失败

**原因**: 用户名或密码错误，或用户状态异常

**检查**:
- 确认用户名和密码正确
- 检查用户状态是否为启用
- 查看后端日志获取详细错误

### 4. 跨域问题

**原因**: 前端和后端端口不匹配

**解决**: 确保 vite.config.ts 中的代理配置正确

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:3001',  // 确保端口正确
    changeOrigin: true,
  }
}
```

## 调试技巧

### 1. 启用详细日志

前端 API 客户端已添加详细日志：

```typescript
console.log('Response status:', res.status, 'ok:', res.ok);
console.log('Response data:', data);
```

### 2. 检查网络请求

打开浏览器开发者工具 → Network 标签：
- 查看请求 URL 是否正确
- 检查请求头是否包含 token
- 查看请求体格式是否正确
- 查看响应状态码和数据

### 3. 查看后端日志

后端会输出详细的请求日志：

```
[GIN] 2026/02/15 - 11:07:35 | 200 | 710.2µs | ::1 | POST "/api/system/monitor/getCpuState"
```

## 性能优化

### 1. 请求防抖

配置保存使用 800ms 防抖：

```typescript
const timer = setTimeout(() => {
  apiClient.post('/system/moduleConfig/save', payload);
}, 800);
```

### 2. 请求取消

组件卸载时自动取消所有进行中的请求，避免内存泄漏：

```typescript
useEffect(() => {
  const abortController = new AbortController();
  
  // 发起请求...
  
  return () => abortController.abort();
}, []);
```

### 3. 数据缓存

系统监控数据使用 3 秒缓存，避免频繁请求：

```typescript
// 后端缓存 3 秒
const cacheSecond = 3
global.SystemMonitor.Set(global.SystemMonitor_CPU_INFO, cpuInfo, cacheSecond*time.Second)
```

## 部署配置

### 开发环境

- 前端: `http://localhost:3002`
- 后端: `http://localhost:3001`
- API: 通过 Vite 代理到后端

### 生产环境

1. **构建前端**:
```bash
npm run build
```

2. **配置 Nginx**:
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
    }
    
    location /Pixel/ {
        proxy_pass http://localhost:3001;
    }
}
```

## 安全建议

1. **HTTPS**: 生产环境必须使用 HTTPS
2. **Token 存储**: Token 存储在 localStorage 中，可考虑使用 httpOnly cookie
3. **CSRF 保护**: 建议添加 CSRF token 机制
4. **XSS 防护**: 对所有用户输入进行转义和验证
5. **文件上传**: 验证文件类型和大小，防止恶意文件上传

---

**文档版本**: 1.0  
**最后更新**: 2026-02-15  
**前端版本**: React + Vite  
**后端版本**: Go 1.3.0