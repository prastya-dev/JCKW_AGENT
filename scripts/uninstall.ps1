# ============================================================
# JCKW-AGENT Uninstall Script (Windows - PowerShell)
# ============================================================

try {
    $BinName = "jckw"
    $InstallDir = "$env:LOCALAPPDATA\jckw"

    Write-Host ""
    Write-Host "  JCKW-AGENT Uninstaller" -ForegroundColor Red
    Write-Host "  by prastya-dev" -ForegroundColor DarkGray
    Write-Host ""

    # 1. Hentikan aplikasi jika sedang berjalan di latar belakang
    $RunningProcess = Get-Process -Name $BinName -ErrorAction SilentlyContinue
    if ($RunningProcess) {
        Write-Host "  -> Menghentikan proses $BinName yang sedang berjalan..." -ForegroundColor Yellow
        Stop-Process -Name $BinName -Force -ErrorAction SilentlyContinue
    }

    # 2. Hapus folder instalasi dan biner jckw.exe
    if (Test-Path $InstallDir) {
        Write-Host "  -> Menghapus folder $InstallDir..." -ForegroundColor Cyan
        Remove-Item -Path $InstallDir -Recurse -Force -ErrorAction Stop
        Write-Host "  v Folder instalasi berhasil dihapus." -ForegroundColor Green
    } else {
        Write-Host "  i Folder $InstallDir tidak ditemukan (mungkin sudah dihapus)." -ForegroundColor Yellow
    }

    # 3. Bersihkan Environment PATH
    $CurrentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    if ($CurrentPath -like "*$InstallDir*") {
        Write-Host "  -> Menghapus $InstallDir dari Environment PATH..." -ForegroundColor Cyan
        
        # Pisahkan list PATH, buang path JCKW, lalu gabungkan kembali
        $PathList = $CurrentPath -split ';' | Where-Object { $_ -and $_ -ne $InstallDir }
        $NewPath = $PathList -join ';'
        
        [Environment]::SetEnvironmentVariable("PATH", $NewPath, "User")
        Write-Host "  v PATH berhasil dibersihkan." -ForegroundColor Green
    }

    # 4. Hapus opsi Context Menu
    Write-Host "  -> Menghapus opsi 'Run JCKW Here' dari klik-kanan..." -ForegroundColor Cyan
    $RegBgShell = "HKCU:\Software\Classes\Directory\Background\shell\JCKW"
    $RegDirShell = "HKCU:\Software\Classes\Directory\shell\JCKW"
    if (Test-Path $RegBgShell) { Remove-Item -Path $RegBgShell -Recurse -Force -ErrorAction SilentlyContinue }
    if (Test-Path $RegDirShell) { Remove-Item -Path $RegDirShell -Recurse -Force -ErrorAction SilentlyContinue }
    Write-Host "  v Context Menu berhasil dihapus." -ForegroundColor Green

    Write-Host ""
    Write-Host "  🗑️ UNINSTALL SELESAI!" -ForegroundColor Green
    Write-Host "  JCKW-AGENT telah berhasil dihapus dari sistem Anda." -ForegroundColor White
    Write-Host ""

} catch {
    Write-Host ""
    Write-Host "  ❌ TERJADI ERROR SAAT UNINSTALL:" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
} finally {
    Write-Host "========================================" -ForegroundColor DarkGray
    Read-Host "Tekan [ENTER] untuk menutup jendela ini"
}
