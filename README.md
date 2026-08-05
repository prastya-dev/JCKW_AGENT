<div align="center">

```text
 ┏┓┏━╸╻┏ ╻ ╻   ┏━┓┏━╸┏━╸┏┓╻╺┳╸
  ┃┃  ┣┻┓┃╻┃╺━╸┣━┫┃╺┓┣╸ ┃┗┫ ┃ 
┗━┛┗━╸╹ ╹┗┻┛   ╹ ╹┗━┛┗━╸╹ ╹ ╹ 
```

**Next-Gen AI CLI Terminal Interface**

[![npm version](https://badge.fury.io/js/@prastya-dev%2Fjckw-agent.svg)](https://badge.fury.io/js/@prastya-dev%2Fjckw-agent)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/@prastya-dev/jckw-agent)](https://nodejs.org/)

JCKW-Agent is a revolutionary terminal-based AI assistant designed specifically for developers and power users. Fully integrated with advanced models from Google Antigravity, JCKW-Agent brings the power of next-generation coding and AI assistance right to your fingertips in the terminal.

[Key Features](#-key-features) • [Installation](#-installation) • [Usage](#-usage-guide) • [Contributors](#-contributors)

</div>

---

## Key Features

- **Advanced AI Models Access:** Seamlessly supports cutting-edge models (Claude, Gemini, etc.) dynamically through Google's infrastructure.
- **Dual Operational Modes:**
  - `CHAT MODE` : An interactive discussion companion for coding, debugging, or general Q&A.
  - `EXEC MODE` : Command the AI to autonomously compose and execute terminal commands (equipped with a security confirmation system).
- **Smart Authentication (OAuth2):** Secure integrated login system via browser.
- **Modern TUI (Terminal User Interface):** A beautiful, intuitive, and responsive terminal experience featuring seamless keyboard navigation.
- **Zero Dependencies:** Available as a standalone binary (Linux, macOS, Windows) requiring absolutely no Node.js installation!
- **Smart OS Integration:** "Run JCKW Here" feature for lightning-fast access via Windows Context Menu.

---

## Installation

Choose the method that best fits your workflow:

### Method 1: Automatic Installation (Standalone Binary)
> [!TIP]
> This method is highly recommended if you prefer a hassle-free setup without installing Node.js.

#### Linux / macOS
Open your terminal and run the following installation script:
```bash
curl -fsSL https://raw.githubusercontent.com/prastya-dev/JCKW_AGENT/main/scripts/install.sh | bash
```

#### Windows (Powershell)
Open PowerShell **as Administrator**, and run:
```powershell
irm https://raw.githubusercontent.com/prastya-dev/JCKW_AGENT/main/scripts/install.ps1 | iex
```
> [!NOTE]
> The Windows installation will automatically add a **"Run JCKW Here"** option when you right-click in File Explorer.

---

### Method 2: Installation via NPM
> [!IMPORTANT]
> Ensure you have **Node.js (version 18 or higher)** installed on your machine.

Open your terminal and run:
```bash
npm install -g @prastya-dev/jckw-agent
```

---

## Usage Guide

Starting JCKW-Agent is as easy as calling its name. Open a new terminal and type:

```bash
jckw
```
*(Note: Upon first launch, you will be guided through a simple Google account login process).*

### Launch Flags
You can instantly jump into a specific mode by appending flags:
- `jckw -c` → Enter **Chat Mode**
- `jckw -e` → Enter **Exec Mode**
- `jckw -q` → Enter **Quiz Mode**
- `jckw --update` → Check and update to the latest release version automatically.

### Slash Commands
Type these commands directly inside the application's prompt to access various features:

| Command | Description |
| :--- | :--- |
| `/model` | Open an interactive menu to change the active AI model. |
| `/chat` | Switch to **Chat Mode** (For casual discussion & coding). |
| `/exec` | Switch to **Exec Mode** (AI will create & execute terminal commands). |
| `/quiz` | Switch to **Quiz Mode** (AI answers very briefly & to the point). |
| `/cd <path>`| Change the active working directory from within the application. |
| `/clear` | Clear the terminal screen and reset the session history. |
| `/token` | View information regarding your AI token usage limits and quota. |
| `/help` | Display the comprehensive help menu. |
| `/exit` | Exit the application. |

---

## Uninstall

If you wish to completely remove the application (including the Windows Registry Context Menu and secret session configurations):

Run the following command in any terminal:
```bash
jckw --uninstall
```

---

## Contributors

Crafted with  by **[prastya-dev](https://github.com/prastya-dev)** — _Creator & Lead Developer_.

---
<div align="center">
  <i>JCKW-Agent is an open-source software licensed under MIT.</i>
</div>
