# Matrix Panel 环境变量配置

## 必需的环境变量

### ENCRYPTION_KEY
**用途**: AES-256加密密钥,用于加密集成的敏感信息(API密钥、Token等)

**要求**:
- 长度至少32字节
- 生产环境必须设置唯一密钥
- 开发环境可使用默认值

**Linux/Mac设置**:
```bash
export ENCRYPTION_KEY="your-32-byte-encryption-key-here-xxxxx"
```

**Windows设置**:
```powershell
$env:ENCRYPTION_KEY="your-32-byte-encryption-key-here-xxxxx"
```

**Docker设置**:
```yaml
environment:
  - ENCRYPTION_KEY=your-32-byte-encryption-key-here-xxxxx
```

### DB_PATH (可选)
**用途**: 数据库文件路径

**默认值**: `./data/matrix-panel.db`

**设置示例**:
```bash
export DB_PATH="/var/lib/matrix-panel/data.db"
```

## 生成安全的加密密钥

### 方法1: 使用OpenSSL
```bash
openssl rand -base64 32
```

### 方法2: 使用Python
```python
import secrets
print(secrets.token_urlsafe(32))
```

### 方法3: 使用Go
```go
package main

import (
    "crypto/rand"
    "encoding/base64"
    "fmt"
)

func main() {
    key := make([]byte, 32)
    rand.Read(key)
    fmt.Println(base64.StdEncoding.EncodeToString(key))
}
```

## 安全建议

1. **生产环境**: 必须使用强随机密钥
2. **密钥管理**: 不要将密钥提交到Git
3. **密钥轮换**: 定期更换加密密钥
4. **备份**: 密钥丢失将无法解密现有数据

## .env文件示例

创建 `.env` 文件:
```bash
ENCRYPTION_KEY=your-generated-key-here
DB_PATH=./data/matrix-panel.db
```

**注意**: 将`.env`添加到`.gitignore`!
