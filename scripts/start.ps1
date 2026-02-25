<#
.SYNOPSIS
Matrix Panel 一键启动脚本
#>
$ErrorActionPreference = "Stop"
$FRONTEND_PORT = 3000
$BACKEND_PORT = 3002
$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$BackendDir = Join-Path $ProjectRoot "backend"
function Write-Info ($msg) { Write-Host "[信息] $msg" -ForegroundColor Cyan }
function Write-Success ($msg) { Write-Host "[成功] $msg" -ForegroundColor Green }
function Write-Warn ($msg) { Write-Host "[警告] $msg" -ForegroundColor Yellow }
function Stop-PortProcess ($port) {
    Write-Info "检查端口 ${port}..."
    # 使用 netstat 快速查找 PID，比 Get-NetTCPConnection 快得多
    $connections = netstat -ano | Select-String ":$port\s+"
    if ($connections) {
        foreach ($line in $connections) {
            $foundPid = ($line.ToString().Trim() -split "\s+")[-1]
            if ($foundPid -gt 0) {
                Stop-Process -Id $foundPid -Force -ErrorAction SilentlyContinue
                Write-Warn "已终止占用端口 ${port} 的进程 (PID: ${foundPid})"
            }
        }
    }
}

Write-Info "清理端口..."
Stop-PortProcess $FRONTEND_PORT
Stop-PortProcess $BACKEND_PORT

if (-not (Test-Path "$BackendDir/go.mod")) { Write-Error "未找到后端代码"; exit 1 }
if (-not (Test-Path "$ProjectRoot/node_modules")) { Write-Warn "安装依赖..."; Push-Location $ProjectRoot; npm install; Pop-Location }

Write-Info "启动后端..."
Start-Process "cmd" -ArgumentList "/k go run main.go" -WorkingDirectory $BackendDir
Start-Sleep -m 500

Write-Info "启动前端..."
Start-Process "cmd" -ArgumentList "/k npm run dev" -WorkingDirectory $ProjectRoot

Write-Success "启动成功！"
Write-Success "前端: http://localhost:${FRONTEND_PORT}"
Write-Success "后端: http://localhost:${BACKEND_PORT}"
