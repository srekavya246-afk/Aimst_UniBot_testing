# =============================================================
# AIMST UniBot - Server Launcher
# Run this script to start the UniBot server on port 8080
# =============================================================

# Kill any existing process on port 8080
$procs = netstat -ano | Select-String ':8080' | ForEach-Object { ($_ -split '\s+')[-1] } | Sort-Object -Unique | Where-Object { $_ -match '^\d+$' }
if ($procs) {
    Write-Host "Killing existing process(es) on port 8080: $procs" -ForegroundColor Yellow
    $procs | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 1
}

# Search common Node.js install paths
$nodePaths = @(
    "C:\Program Files\nodejs\node.exe",
    "C:\Program Files (x86)\nodejs\node.exe",
    "$env:APPDATA\nvm\current\node.exe",
    "$env:ProgramFiles\nvm\current\node.exe"
)
$nodeExe = $null
foreach ($p in $nodePaths) { if (Test-Path $p) { $nodeExe = $p; break } }
if (-not $nodeExe) { try { $nodeExe = (Get-Command node -ErrorAction Stop).Source } catch { } }

if (-not $nodeExe) {
    Write-Host ""
    Write-Host "ERROR: Node.js not found!" -ForegroundColor Red
    Write-Host "Download and install it from: https://nodejs.org/en/download" -ForegroundColor Yellow
    Write-Host "Then re-run this script." -ForegroundColor Yellow
    pause; exit 1
}

Write-Host "Node.js: $nodeExe" -ForegroundColor Green
Write-Host "Starting AIMST UniBot at http://localhost:8080 ..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop." -ForegroundColor Gray
Write-Host ""

& $nodeExe (Join-Path $PSScriptRoot "backend\server.js")
