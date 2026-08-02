# ============================================================
# JCKW-AGENT Install Script (Windows - PowerShell - Direct Download)
# ============================================================

try {
    $Repo = "prastya-dev/JCKW_AGENT"
    $BinName = "jckw.exe"
    $InstallDir = "$env:LOCALAPPDATA\jckw"

    Write-Host ""
    Write-Host "  JCKW-AGENT Installer" -ForegroundColor Cyan
    Write-Host "  by prastya-dev" -ForegroundColor DarkGray
    Write-Host ""

    # Pastikan PowerShell menggunakan TLS 1.2
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

    # Direct Link ke versi rilis terbaru (Bypass API Rate Limit)
    $BinaryUrl = "https://github.com/$Repo/releases/latest/download/jckw-win-x64.exe"
    $TmpPath   = [System.IO.Path]::GetTempFileName() + ".exe"

    Write-Host "  -> Mengunduh jckw versi terbaru dari GitHub..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $BinaryUrl -OutFile $TmpPath -UseBasicParsing -MaximumRedirection 5

    # Proses Instalasi Biner
    if (-not (Test-Path $InstallDir)) {
        New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
    }

    $DestPath = Join-Path $InstallDir $BinName
    Move-Item -Path $TmpPath -Destination $DestPath -Force

    # Tambahkan ke Environment PATH
    $CurrentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    if ($CurrentPath -notlike "*$InstallDir*") {
        Write-Host "  -> Menambahkan $InstallDir ke Environment PATH..." -ForegroundColor Cyan
        [Environment]::SetEnvironmentVariable("PATH", "$CurrentPath;$InstallDir", "User")
        Write-Host "  v PATH berhasil diupdate." -ForegroundColor Green
    }

    Write-Host "  v jckw berhasil diinstal ke $DestPath" -ForegroundColor Green
    Write-Host ""
    Write-Host "  🎉 INSTALASI SELESAI!" -ForegroundColor Green
    Write-Host "  Silakan buka terminal PowerShell BARU, lalu ketik:" -ForegroundColor White
    Write-Host "  jckw" -ForegroundColor Cyan
    Write-Host ""

} catch {
    Write-Host ""
    Write-Host "  ❌ TERJADI ERROR SAAT INSTALASI:" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
} finally {
    Write-Host "========================================" -ForegroundColor DarkGray
    Read-Host "Tekan [ENTER] untuk menutup jendela ini"
}
