# ============================================================
# JCKW-AGENT Install Script (Windows - PowerShell - Binary Only)
# ============================================================

try {
    $Repo = "prastya-dev/JCKW_AGENT"
    $BinName = "jckw.exe"
    $InstallDir = "$env:LOCALAPPDATA\jckw"

    Write-Host ""
    Write-Host "  JCKW-AGENT Installer" -ForegroundColor Cyan
    Write-Host "  by prastya-dev" -ForegroundColor DarkGray
    Write-Host ""

    Write-Host "  -> Mencari rilis versi terbaru di GitHub..." -ForegroundColor Cyan
    $apiUrl = "https://api.github.com/repos/$Repo/releases/latest"
    $response = Invoke-RestMethod -Uri $apiUrl -UseBasicParsing
    $Version = $response.tag_name

    if (-not $Version) {
        throw "Gagal mendapatkan informasi rilis terbaru dari GitHub."
    }

    Write-Host "  -> Versi terbaru: $Version" -ForegroundColor Cyan

    # PASTIKAN FILE jckw-win-x64.exe SUDAH ADA DI MENU RELEASES GITHUB
    $BinaryUrl = "https://github.com/$Repo/releases/download/$Version/jckw-win-x64.exe"
    $TmpPath   = [System.IO.Path]::GetTempFileName() + ".exe"

    Write-Host "  -> Mengunduh jckw $Version untuk Windows..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $BinaryUrl -OutFile $TmpPath -UseBasicParsing

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

    Write-Host "  v jckw $Version berhasil diinstal ke $DestPath" -ForegroundColor Green
    Write-Host ""
    Write-Host "  🎉 INSTALASI SELESAI!" -ForegroundColor Green
    Write-Host "  Silakan buka terminal PowerShell BARU, lalu ketik:" -ForegroundColor White
    Write-Host "  jckw" -ForegroundColor Cyan
    Write-Host ""

} catch {
    # TANGKAP SEMUA ERROR AGAR TERMINAL BISA DIBACA
    Write-Host ""
    Write-Host "  ❌ TERJADI ERROR SAAT INSTALASI:" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
} finally {
    # TAHAN TERMINAL AGAR TIDAK LANGSUNG CLOSE
    Write-Host "========================================" -ForegroundColor DarkGray
    Read-Host "Tekan [ENTER] untuk menutup jendela ini"
}
