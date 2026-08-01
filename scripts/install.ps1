# ============================================================
# JCKW-AGENT Install Script (Windows — PowerShell)
# Usage: irm https://raw.githubusercontent.com/prastya-dev/jckw-agent/main/scripts/install.ps1 | iex
# ============================================================

$ErrorActionPreference = "Stop"

$Repo    = "prastya-dev/jckw-agent"
$BinName = "jckw.exe"
$InstallDir = "$env:LOCALAPPDATA\jckw"

function Write-Banner {
  Write-Host ""
  Write-Host "  JCKW-AGENT Installer" -ForegroundColor Cyan
  Write-Host "  by prastya-dev" -ForegroundColor DarkGray
  Write-Host ""
}

function Write-Info { param($Msg) Write-Host "  -> $Msg" -ForegroundColor Cyan }
function Write-Success { param($Msg) Write-Host "  v $Msg" -ForegroundColor Green }
function Write-Err { param($Msg) Write-Host "  X Error: $Msg" -ForegroundColor Red; exit 1 }

# ── Try npm first ──────────────────────────────────────────────

function Try-NpmInstall {
  if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Info "npm detected. Installing via npm..."
    try {
      & npm install -g "@prastya-dev/jckw-agent"
      Write-Success "Installed via npm!"
      return $true
    } catch {
      Write-Host "  npm install failed, falling back to binary download..." -ForegroundColor DarkYellow
      return $false
    }
  }
  return $false
}

# ── Get Latest Version ─────────────────────────────────────────

function Get-LatestVersion {
  $apiUrl = "https://api.github.com/repos/$Repo/releases/latest"
  try {
    $response = Invoke-RestMethod -Uri $apiUrl -Headers @{ "User-Agent" = "jckw-installer" }
    return $response.tag_name
  } catch {
    Write-Err "Could not fetch latest release info. Check your internet connection."
  }
}

# ── Download Binary ────────────────────────────────────────────

function Download-Binary {
  param($Version)

  $BinaryUrl = "https://github.com/$Repo/releases/download/$Version/jckw-windows-x64.exe"
  $TmpPath   = [System.IO.Path]::GetTempFileName() + ".exe"

  Write-Info "Downloading jckw $Version for Windows/x64..."

  try {
    Invoke-WebRequest -Uri $BinaryUrl -OutFile $TmpPath -UseBasicParsing
  } catch {
    Write-Err "Download failed. URL: $BinaryUrl`nError: $_"
  }

  return $TmpPath
}

# ── Install Binary ─────────────────────────────────────────────

function Install-Binary {
  param($TmpPath)

  if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
  }

  $DestPath = Join-Path $InstallDir $BinName
  Move-Item -Path $TmpPath -Destination $DestPath -Force

  # Add to PATH if not already present
  $CurrentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
  if ($CurrentPath -notlike "*$InstallDir*") {
    Write-Info "Adding $InstallDir to User PATH..."
    [Environment]::SetEnvironmentVariable("PATH", "$CurrentPath;$InstallDir", "User")
    Write-Success "PATH updated. Restart your terminal to use jckw."
  }

  return $DestPath
}

# ── Main ───────────────────────────────────────────────────────

Write-Banner

if (Try-NpmInstall) {
  Write-Host ""
  Write-Host "  Run 'jckw' to get started!" -ForegroundColor Cyan
  Write-Host "  First run will launch the setup wizard." -ForegroundColor DarkGray
  Write-Host ""
  exit 0
}

$Version = Get-LatestVersion
Write-Info "Latest version: $Version"

$TmpPath = Download-Binary -Version $Version
$DestPath = Install-Binary -TmpPath $TmpPath

Write-Success "jckw $Version installed to $DestPath"
Write-Host ""
Write-Host "  Run 'jckw' in a new terminal to get started!" -ForegroundColor Cyan
Write-Host "  First run will launch the setup wizard." -ForegroundColor DarkGray
Write-Host ""
