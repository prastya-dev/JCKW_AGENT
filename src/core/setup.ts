import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';
import { getTheme } from '../ui/theme';

// ============================================================
// JCKW-AGENT — OS Integration Setup
// Handles Context Menu & Application Launcher generation
// ============================================================

export async function setupOSIntegrations(): Promise<void> {
  const t = getTheme();
  const platform = os.platform();
  const packageDir = path.join(__dirname, '..', '..');
  const iconPngPath = path.join(packageDir, 'icon.png');
  const iconIcoPath = path.join(packageDir, 'jckw.ico');

  console.log(`\n${t.dim}Mempersiapkan OS Integrations...${t.reset}`);

  try {
    if (platform === 'win32') {
      await setupWindows(iconIcoPath, t);
    } else if (platform === 'linux') {
      await setupLinux(iconPngPath, t);
    } else {
      console.log(`\n${t.warn}  ! OS Anda (${platform}) saat ini belum didukung untuk fitur Auto-Setup shortcut.${t.reset}\n`);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`\n${t.error}  ✗ Gagal melakukan setup: ${msg}${t.reset}\n`);
  }
}

async function setupWindows(iconPath: string, t: any): Promise<void> {
  console.log(`${t.dim}Mendeteksi sistem Windows...${t.reset}`);
  
  const hasIcon = fs.existsSync(iconPath);
  const iconStr = hasIcon ? `"${iconPath}"` : '';

  // Use a reliable command string that attempts wt.exe but falls back to cmd.exe start
  const jckwCmd = `cmd.exe /s /c "start /b wt.exe -d \\"%V\\" cmd.exe /k jckw 2>nul || start /d \\"%V\\" cmd.exe /k jckw"`;
  const jckwCmdDir = `cmd.exe /s /c "start /b wt.exe -d \\"%1\\" cmd.exe /k jckw 2>nul || start /d \\"%1\\" cmd.exe /k jckw"`;

  const addReg = (keyPath: string, cmdValue: string, iconVal: string) => {
    try {
      execSync(`reg add "${keyPath}" /ve /t REG_SZ /d "Run JCKW Here" /f`, { stdio: 'ignore' });
      if (iconVal) {
        execSync(`reg add "${keyPath}" /v "Icon" /t REG_SZ /d "${iconVal}" /f`, { stdio: 'ignore' });
      }
      execSync(`reg add "${keyPath}\\command" /ve /t REG_SZ /d "${cmdValue}" /f`, { stdio: 'ignore' });
    } catch (e) {
      throw new Error(`Gagal menulis Registry Key: ${keyPath}`);
    }
  };

  // 1. Background File Explorer
  addReg(`HKCU\\Software\\Classes\\Directory\\Background\\shell\\JCKW`, jckwCmd.replace(/%1/g, '%V'), iconStr);
  
  // 2. Directory
  addReg(`HKCU\\Software\\Classes\\Directory\\shell\\JCKW`, jckwCmdDir, iconStr);

  console.log(`${t.accentBg}\x1b[30m ✓ Windows Context Menu (Run JCKW Here) berhasil ditambahkan! ${t.reset}\n`);
}

async function setupLinux(iconPath: string, t: any): Promise<void> {
  console.log(`${t.dim}Mendeteksi sistem Linux...${t.reset}`);
  
  const home = os.homedir();
  
  // Create dirs
  const iconDir = path.join(home, '.local/share/icons/hicolor/256x256/apps');
  const appDir = path.join(home, '.local/share/applications');
  const kdeDir = path.join(home, '.local/share/kio/servicemenus');
  const fmDir = path.join(home, '.local/share/file-manager/actions');

  [iconDir, appDir, kdeDir, fmDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  // Copy Icon
  const targetIcon = path.join(iconDir, 'jckw.png');
  if (fs.existsSync(iconPath)) {
    fs.copyFileSync(iconPath, targetIcon);
  }

  // 1. App Launcher Shortcut
  const appDesktop = `[Desktop Entry]
Name=JCKW Agent
Comment=AI CLI Terminal Interface
Exec=jckw
Icon=jckw
Terminal=true
Type=Application
Categories=Utility;Development;TerminalEmulator;
`;
  fs.writeFileSync(path.join(appDir, 'jckw.desktop'), appDesktop);

  // 2. KDE/Dolphin Context Menu
  const kdeDesktop = `[Desktop Entry]
Type=Service
ServiceTypes=KonqPopupMenu/Plugin
MimeType=inode/directory;
Actions=runJckw;
X-KDE-Priority=TopLevel

[Desktop Action runJckw]
Name=Run JCKW Here
Icon=jckw
Exec=konsole --workdir %f -e jckw || gnome-terminal --working-directory=%f -- jckw || xterm -e "cd %f && jckw"
`;
  fs.writeFileSync(path.join(kdeDir, 'jckw.desktop'), kdeDesktop);

  // 3. Nautilus/Nemo Context Menu
  const fmDesktop = `[Desktop Entry]
Type=Action
Name=Run JCKW Here
Icon=jckw
Profiles=profile-zero;

[X-Action-Profile profile-zero]
Exec=gnome-terminal --working-directory=%f -- jckw || konsole --workdir %f -e jckw || xterm -e "cd %f && jckw"
Name=Default profile
`;
  fs.writeFileSync(path.join(fmDir, 'jckw.desktop'), fmDesktop);

  console.log(`${t.accentBg}\x1b[30m ✓ Linux Desktop Shortcut & Context Menu berhasil ditambahkan! ${t.reset}\n`);
}
