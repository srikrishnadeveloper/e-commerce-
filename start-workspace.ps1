# start-workspace.ps1

$services = @(
    @{ Name="Backend API";       Path="backend";       Port=5001; Command="npm run dev" },
    @{ Name="Frontend Store";    Path="frontend";      Port=5177; Command="npm run dev" },
    @{ Name="Admin Dashboard";   Path="adminfrontend"; Port=8091; Command="npm run dev" }
)

Write-Host "🚀 Starting E-commerce Workspace..." -ForegroundColor Cyan

foreach ($s in $services) {
    $port = $s.Port
    $isRunning = $false
    
    # Check if port is in use
    if (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue) {
        $isRunning = $true
    }

    if ($isRunning) {
        Write-Host "  ⚠️  $($s.Name) is already running on port $port. Skipping." -ForegroundColor Yellow
    } else {
        Write-Host "  ✅ Starting $($s.Name) on port $port..." -ForegroundColor Green
        $path = Join-Path $PSScriptRoot $s.Path
        
        # Start in a new PowerShell window
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {cd '$path'; $($s.Command)}"
    }
}

Write-Host "`n✨ Workspace check complete." -ForegroundColor Cyan
