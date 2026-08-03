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
    
    # Pilih Bahasa / Select Language
    Write-Host "  Select Language / Pilih Bahasa:" -ForegroundColor White
    Write-Host "  1. English" -ForegroundColor Gray
    Write-Host "  2. Bahasa Indonesia" -ForegroundColor Gray
    $LangChoice = Read-Host "  [1/2]"
    $IsEn = ($LangChoice -eq "1")

    # Pastikan PowerShell menggunakan TLS 1.2 (wajib untuk GitHub)
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

    # Set User-Agent agar tidak diblokir GitHub API (menghindari error 403)
    $headers = @{
        "User-Agent" = "JCKW-AGENT-Installer"
    }

    if ($IsEn) { Write-Host "  -> Fetching latest release from GitHub..." -ForegroundColor Cyan }
    else { Write-Host "  -> Mencari rilis versi terbaru di GitHub..." -ForegroundColor Cyan }
    
    $apiUrl = "https://api.github.com/repos/$Repo/releases/latest"
    $response = Invoke-RestMethod -Uri $apiUrl -Headers $headers -UseBasicParsing
    $Version = $response.tag_name

    # Direct Link ke versi rilis terbaru
    $BinaryUrl = "https://github.com/$Repo/releases/latest/download/jckw-win-x64.exe"
    $TmpPath   = [System.IO.Path]::GetTempFileName() + ".exe"

    if ($IsEn) { Write-Host "  -> Downloading jckw $Version for Windows..." -ForegroundColor Cyan }
    else { Write-Host "  -> Mengunduh jckw $Version untuk Windows..." -ForegroundColor Cyan }
    
    Invoke-WebRequest -Uri $BinaryUrl -OutFile $TmpPath -Headers $headers -UseBasicParsing

    # Proses Instalasi Biner
    if (-not (Test-Path $InstallDir)) {
        New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
    }

    $DestPath = Join-Path $InstallDir $BinName
    Move-Item -Path $TmpPath -Destination $DestPath -Force

    # Tambahkan ke Environment PATH
    $CurrentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    if ($CurrentPath -notlike "*$InstallDir*") {
        if ($IsEn) { Write-Host "  -> Adding $InstallDir to Environment PATH..." -ForegroundColor Cyan }
        else { Write-Host "  -> Menambahkan $InstallDir ke Environment PATH..." -ForegroundColor Cyan }
        [Environment]::SetEnvironmentVariable("PATH", "$CurrentPath;$InstallDir", "User")
        if ($IsEn) { Write-Host "  v PATH updated successfully." -ForegroundColor Green }
        else { Write-Host "  v PATH berhasil diupdate." -ForegroundColor Green }
    }

    # Menambahkan opsi Context Menu (Run JCKW Here)
    if ($IsEn) { Write-Host "  -> Adding 'Run JCKW Here' to folder context menu..." -ForegroundColor Cyan }
    else { Write-Host "  -> Menambahkan opsi 'Run JCKW Here' ke klik-kanan folder..." -ForegroundColor Cyan }
    
    # Download icon for Context Menu
    $IconUrl = "https://raw.githubusercontent.com/$Repo/main/jckw.ico"
    $IconPath = Join-Path $InstallDir "jckw.ico"
    try {
        Invoke-WebRequest -Uri $IconUrl -OutFile $IconPath -Headers $headers -UseBasicParsing
    } catch {
        $IconPath = $DestPath
    }

    # Buat launcher script agar wt.exe (Windows Terminal) diprioritaskan
    $LauncherPath = Join-Path $InstallDir "jckw-here.cmd"
    Set-Content -Path $LauncherPath -Value "@echo off`nwt.exe -d `"%~1`" cmd.exe /k jckw 2>nul || start /d `"%~1`" cmd.exe /k jckw"

    # 1. Background File Explorer (Klik kanan di ruang kosong explorer)
    $RegBgShell = "HKCU:\Software\Classes\Directory\Background\shell\JCKW"
    New-Item -Path $RegBgShell -Force | Out-Null
    Set-ItemProperty -Path $RegBgShell -Name "(Default)" -Value "Run JCKW Here" -Force
    Set-ItemProperty -Path $RegBgShell -Name "Icon" -Value "`"$IconPath`"" -Force
    New-Item -Path "$RegBgShell\command" -Force | Out-Null
    Set-ItemProperty -Path "$RegBgShell\command" -Name "(Default)" -Value "`"$LauncherPath`" `"%V`"" -Force

    # 2. Directory (Klik kanan pada sebuah folder)
    $RegDirShell = "HKCU:\Software\Classes\Directory\shell\JCKW"
    New-Item -Path $RegDirShell -Force | Out-Null
    Set-ItemProperty -Path $RegDirShell -Name "(Default)" -Value "Run JCKW Here" -Force
    Set-ItemProperty -Path $RegDirShell -Name "Icon" -Value "`"$IconPath`"" -Force
    New-Item -Path "$RegDirShell\command" -Force | Out-Null
    Set-ItemProperty -Path "$RegDirShell\command" -Name "(Default)" -Value "`"$LauncherPath`" `"%1`"" -Force

    if ($IsEn) { Write-Host "  v Context Menu added successfully." -ForegroundColor Green }
    else { Write-Host "  v Context Menu berhasil ditambahkan." -ForegroundColor Green }

    if ($IsEn) { Write-Host "  v jckw installed successfully to $DestPath" -ForegroundColor Green }
    else { Write-Host "  v jckw berhasil diinstal ke $DestPath" -ForegroundColor Green }
    
    Write-Host ""
    if ($IsEn) {
        Write-Host "  🎉 INSTALLATION COMPLETE!" -ForegroundColor Green
        Write-Host "  Installation complete, please close this tab and try 'jckw' in your terminal." -ForegroundColor White
    } else {
        Write-Host "  🎉 INSTALASI SELESAI!" -ForegroundColor Green
        Write-Host "  Instalasi selesai silahkan close tab ini dan coba di terminal anda jckw" -ForegroundColor White
    }
    Write-Host ""

} catch {
    Write-Host ""
    if ($IsEn) { Write-Host "  ❌ ERROR DURING INSTALLATION:" -ForegroundColor Red }
    else { Write-Host "  ❌ TERJADI ERROR SAAT INSTALASI:" -ForegroundColor Red }
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
} finally {
    Write-Host "========================================" -ForegroundColor DarkGray
    if ($IsEn) { Read-Host "Press [ENTER] to close this window" }
    else { Read-Host "Tekan [ENTER] untuk menutup jendela ini" }
}
