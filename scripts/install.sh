#!/usr/bin/env bash
# ============================================================
# JCKW-AGENT Install Script (Unix — Linux & macOS)
# Usage: curl -fsSL https://raw.githubusercontent.com/prastya-dev/jckw-agent/main/scripts/install.sh | bash
# ============================================================

set -e

REPO="prastya-dev/jckw-agent"
BIN_NAME="jckw"
INSTALL_DIR="/usr/local/bin"
CYAN="\033[96m"
RED="\033[91m"
GREEN="\033[32m"
GRAY="\033[90m"
RESET="\033[0m"

banner() {
  echo -e "${CYAN}"
  echo "  ░██  ░███████  ░██    ░██░██    ░██    ░██  "
  echo "  ░██ ░██    ░██ ░██   ░██ ░██    ░██    ░██  "
  echo "  ░██ ░██        ░███████   ░██  ░████  ░██   "
  echo "  ░██ ░██    ░██ ░██   ░██   ░██░██ ░██░██   "
  echo "  ░██  ░███████  ░██    ░██   ░███   ░███    "
  echo -e "${RESET}"
  echo -e "${GRAY}  JCKW-AGENT Installer — by prastya-dev${RESET}\n"
}

error() {
  echo -e "${RED}  ✗ Error: $1${RESET}" >&2
  exit 1
}

info() {
  echo -e "${CYAN}  ➜${RESET} $1"
}

success() {
  echo -e "${GREEN}  ✓ $1${RESET}"
}

# ── Detect Platform ──────────────────────────────────────────

detect_platform() {
  OS=$(uname -s | tr '[:upper:]' '[:lower:]')
  ARCH=$(uname -m)

  case "$OS" in
    linux)  PLATFORM="linux" ;;
    darwin) PLATFORM="macos" ;;
    *)      error "Unsupported OS: $OS. Please download manually from GitHub Releases." ;;
  esac

  case "$ARCH" in
    x86_64 | amd64) ARCH_TAG="x64" ;;
    aarch64 | arm64) ARCH_TAG="arm64" ;;
    *) error "Unsupported architecture: $ARCH" ;;
  esac
}

# ── Get Latest Release Tag ────────────────────────────────────

get_latest_version() {
  if command -v curl &>/dev/null; then
    VERSION=$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" | grep '"tag_name"' | sed -E 's/.*"([^"]+)".*/\1/')
  elif command -v wget &>/dev/null; then
    VERSION=$(wget -qO- "https://api.github.com/repos/${REPO}/releases/latest" | grep '"tag_name"' | sed -E 's/.*"([^"]+)".*/\1/')
  else
    error "Neither curl nor wget found. Please install one and retry."
  fi

  if [ -z "$VERSION" ]; then
    error "Could not fetch latest version. Check your internet connection."
  fi
}

# ── Download Binary ───────────────────────────────────────────

download_binary() {
  BINARY_URL="https://github.com/${REPO}/releases/download/${VERSION}/jckw-${PLATFORM}-${ARCH_TAG}"
  TMP_FILE=$(mktemp)

  info "Downloading jckw ${VERSION} for ${PLATFORM}/${ARCH_TAG}..."

  if command -v curl &>/dev/null; then
    curl -fsSL "$BINARY_URL" -o "$TMP_FILE" || error "Download failed. URL: $BINARY_URL"
  else
    wget -q "$BINARY_URL" -O "$TMP_FILE" || error "Download failed."
  fi

  chmod +x "$TMP_FILE"
  echo "$TMP_FILE"
}

# ── Install ────────────────────────────────────────────────────

install_binary() {
  local tmp_file="$1"

  if [ -w "$INSTALL_DIR" ]; then
    mv "$tmp_file" "${INSTALL_DIR}/${BIN_NAME}"
  else
    info "Requesting sudo to install to ${INSTALL_DIR}..."
    sudo mv "$tmp_file" "${INSTALL_DIR}/${BIN_NAME}"
  fi
}

# ── npm alternative ────────────────────────────────────────────

try_npm_install() {
  if command -v npm &>/dev/null; then
    info "npm detected. Installing via npm..."
    npm install -g @prastya-dev/jckw-agent
    success "Installed via npm!"
    return 0
  fi
  return 1
}

# ── Main ───────────────────────────────────────────────────────

main() {
  banner

  echo -e "${GRAY}  Select Language / Pilih Bahasa:${RESET}"
  echo -e "${GRAY}  1. English${RESET}"
  echo -e "${GRAY}  2. Bahasa Indonesia${RESET}"
  read -p "  [1/2]: " LANG_CHOICE
  
  if [ "$LANG_CHOICE" = "1" ]; then
    IS_EN=true
  else
    IS_EN=false
  fi

  # Try npm first if available
  if try_npm_install; then
    if [ "$IS_EN" = true ]; then
      echo -e "\n${CYAN}  Installation complete, please close this tab and try 'jckw' in your terminal!${RESET}\n"
    else
      echo -e "\n${CYAN}  Instalasi selesai silahkan close tab ini dan coba di terminal anda jckw${RESET}\n"
    fi
    exit 0
  fi

  detect_platform
  get_latest_version
  TMP=$(download_binary)
  install_binary "$TMP"

  if [ "$IS_EN" = true ]; then
    success "jckw ${VERSION} installed to ${INSTALL_DIR}/${BIN_NAME}"
    echo -e "\n${CYAN}  Installation complete, please close this tab and try 'jckw' in your terminal!${RESET}\n"
  else
    success "jckw ${VERSION} berhasil diinstal ke ${INSTALL_DIR}/${BIN_NAME}"
    echo -e "\n${CYAN}  Instalasi selesai silahkan close tab ini dan coba di terminal anda jckw${RESET}\n"
  fi
}

main "$@"
