import { initDefaultConfig, writeConfig, readConfig, getConfigDir } from '../core/config';
import { createOAuthSession, openBrowser, fetchUserProjects } from './oauth';
import { getTheme } from '../ui/theme';
import { showModelSelector } from '../ui/modelselector';
import { fetchModels } from '../api/client';
import { DEFAULT_MODEL } from '../core/constants';

// ============================================================
// JCKW-AGENT — "Connect Antigravity" Dialog
//
// Meniru persis UI seperti di foto:
//  ┌──────────────────────────────────────────┐
//  │  Connect Antigravity                     │
//  ├──────────────────────────────────────────┤
//  │  ⠋  Waiting for popup authorization...  │  ← spinner animasi
//  ├──────── OR PASTE CALLBACK URL ───────────┤
//  │  Step 1: Open this URL in your browser   │
//  │  https://accounts.google.com/...         │
//  │  Step 2: Paste the callback URL here     │
//  │  http://localhost:8085/callback?... > _  │  ← input
//  └──────────────────────────────────────────┘
// ============================================================

// ── ANSI helpers ───────────────────────────────────────────

const A = {
  reset:      '\x1b[0m',
  bold:       '\x1b[1m',
  dim:        '\x1b[2m',
  cyan:       '\x1b[96m',
  blue:       '\x1b[94m',
  green:      '\x1b[92m',
  red:        '\x1b[91m',
  white:      '\x1b[97m',
  gray:       '\x1b[90m',
  saveCursor: '\x1b7',
  restCursor: '\x1b8',
  up: (n: number) => `\x1b[${n}A`,
  col: (c: number) => `\x1b[${c}G`,
  clearLine:  '\x1b[2K',
};

const SPINNER_FRAMES = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];

/** Strip ANSI escape codes to get visible length */
function vlen(s: string): number {
  // eslint-disable-next-line no-control-regex
  return s.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '').replace(/\x1b[78]/g, '').length;
}

// ── Dialog renderer ────────────────────────────────────────

interface DialogInfo {
  lines:       string[];
  spinnerLine: number;  // 0-indexed line containing spinner
  spinnerCol:  number;  // 1-indexed terminal column of spinner char
}

function buildDialog(authUrl: string, spinnerChar: string): DialogInfo {
  const cols  = process.stdout.columns || 80;
  const W     = Math.max(50, Math.min(cols - 4, 66)); // box total width
  const inner = W - 2;                                // inside │ │

  const t = getTheme();

  // ── Border / box helpers ─────────────────────────────────
  const top    = `${A.blue}┌${'─'.repeat(inner)}┐${A.reset}`;
  const bottom = `${A.blue}└${'─'.repeat(inner)}┘${A.reset}`;
  const mid    = `${A.blue}├${'─'.repeat(inner)}┤${A.reset}`;

  function centeredDiv(label: string): string {
    const vis  = vlen(label);
    const pad  = inner - vis;
    const lp   = Math.floor(pad / 2);
    const rp   = pad - lp;
    return `${A.blue}├${'─'.repeat(lp)}${A.gray}${label}${'─'.repeat(rp)}${A.blue}┤${A.reset}`;
  }

  function row(content: string, leftPad = 2): string {
    const pad = ' '.repeat(leftPad);
    const vis = vlen(content);
    const rightSpaces = Math.max(0, inner - leftPad - vis - leftPad);
    return `${A.blue}│${A.reset}${pad}${content}${' '.repeat(rightSpaces)}${' '.repeat(leftPad)}${A.blue}│${A.reset}`;
  }

  // ── Truncate URL to fit ──────────────────────────────────
  const maxUrl = inner - 4;
  const urlShort = authUrl.length > maxUrl
    ? authUrl.slice(0, maxUrl - 3) + '...'
    : authUrl;

  const spinnerContent = `${A.cyan}${spinnerChar}${A.reset}  ${A.white}Waiting for browser authorization...${A.reset}`;
  const spinnerCol = 4;

  const lines: string[] = [];
  lines.push(top);                                                    // 0
  lines.push(row(`${A.bold}${A.white}Connect Antigravity${A.reset}`)); // 1
  lines.push(mid);                                                    // 2
  lines.push(row(''));                                                // 3
  lines.push(row(spinnerContent));                                    // 4 ← SPINNER
  lines.push(row(''));                                                // 5
  lines.push(bottom);                                                 // 6

  return { lines, spinnerLine: 4, spinnerCol };
}

// ── Connect Antigravity Dialog ─────────────────────────────

/**
 * Render "Connect Antigravity" dialog and handle the auth flow.
 * Race between:
 *  - Automatic callback (browser → Google → localhost callback)
 *  - Manual paste (user pastes the full callback URL)
 */
async function showConnectDialog(
  authUrl:     string,
  serverCode:  Promise<string>,
  onCancel:    () => void,
): Promise<string> {
  // ── Initial render ─────────────────────────────────────
  let spinnerIdx = 0;
  const dialog = buildDialog(authUrl, SPINNER_FRAMES[0]);

  process.stdout.write('\n');
  dialog.lines.forEach(l => process.stdout.write(l + '\n'));

  // Lines printed above cursor: dialog.lines.length (each with \n)
  // spinnerLine offset from current cursor position:
  const DIALOG_HEIGHT = dialog.lines.length; // 7
  const SPINNER_OFFSET = DIALOG_HEIGHT - dialog.spinnerLine; // 7 - 4 = 3

  // Hide cursor during spinner
  process.stdout.write('\x1b[?25l');

  const spinnerInterval = setInterval(() => {
    spinnerIdx = (spinnerIdx + 1) % SPINNER_FRAMES.length;
    const c = SPINNER_FRAMES[spinnerIdx];

    process.stdout.write(
      A.up(SPINNER_OFFSET) +
      A.col(dialog.spinnerCol) +
      A.cyan + c + A.reset +
      '\x1b[' + (SPINNER_OFFSET) + 'B' // move down back
    );
  }, 80);

  // Allow Ctrl+C to cancel
  const cancelPromise = new Promise<never>((_, reject) => {
    if (process.stdin.isTTY) process.stdin.setRawMode(true);
    process.stdin.resume();
    const onData = (b: Buffer) => {
      if (b.toString() === '\x03') { // Ctrl+C
        cleanup();
        onCancel();
        reject(new Error('Login dibatalkan'));
      }
    };
    function cleanup() {
      process.stdin.removeListener('data', onData);
      if (process.stdin.isTTY) process.stdin.setRawMode(false);
      process.stdin.pause();
    }
    process.stdin.on('data', onData);
    
    // Also cleanup if serverCode resolves/rejects
    serverCode.finally(cleanup).catch(()=>{});
  });

  try {
    const code = await Promise.race([serverCode, cancelPromise]);
    clearInterval(spinnerInterval);
    process.stdout.write(
      A.up(SPINNER_OFFSET) + A.col(dialog.spinnerCol) +
      A.green + '✓' + A.reset +
      '\x1b[' + (SPINNER_OFFSET) + 'B'
    );
    process.stdout.write('\x1b[?25h\n'); // show cursor, newline
    return code;
  } catch (err) {
    clearInterval(spinnerInterval);
    process.stdout.write('\x1b[?25h\n'); // show cursor
    throw err;
  }
}


// ── Success Screen ─────────────────────────────────────────

function showSuccessScreen(name: string, email: string): void {
  const t   = getTheme();
  const col = process.stdout.columns || 80;
  const sep = `${t.separator}${'─'.repeat(col)}${t.reset}`;

  process.stdout.write('\x1b[2J\x1b[H'); // clear screen

 const logo = [
  `  ${A.cyan}╭──────────────────────────────────────────╮${A.reset}`,
  `  ${A.cyan}│${A.reset}  ${A.bold}${A.blue}J C K W${A.reset} ${A.gray}•${A.reset} ${A.bold}${A.white}A G E N T${A.reset}                     ${A.cyan}│${A.reset}`,
  `  ${A.cyan}│${A.reset}  ${A.gray}▸ Next-Gen CLI AI Assistant${A.reset}             ${A.cyan}│${A.reset}`,
  `  ${A.cyan}╰──────────────────────────────────────────╯${A.reset}`,
];
  console.log('');
  logo.forEach(l => console.log(l));
  console.log('');
  console.log(sep);
  console.log(`  ${A.green}✓ Login berhasil!${A.reset}`);
  if (name)  console.log(`  ${A.gray}Halo,${A.reset} ${A.bold}${A.white}${name}${A.reset}`);
  if (email) console.log(`  ${A.gray}Akun :${A.reset} ${A.white}${email}${A.reset}`);
 
  console.log(sep + '\n');
}

// ── runWizard ──────────────────────────────────────────────

export async function runWizard(): Promise<void> {
  const t   = getTheme();
  const col = process.stdout.columns || 80;
  const sep = `${t.separator}${'─'.repeat(col)}${t.reset}`;

  // Splash
  process.stdout.write('\x1b[2J\x1b[H');
  const logo = [
  `  ${A.cyan}╭──────────────────────────────────────────╮${A.reset}`,
  `  ${A.cyan}│${A.reset}  ${A.bold}${A.blue}J C K W${A.reset} ${A.gray}•${A.reset} ${A.bold}${A.white}A G E N T${A.reset}                     ${A.cyan}│${A.reset}`,
  `  ${A.cyan}│${A.reset}  ${A.gray}▸ Next-Gen CLI AI Assistant${A.reset}             ${A.cyan}│${A.reset}`,
  `  ${A.cyan}╰──────────────────────────────────────────╯${A.reset}`,
];
  console.log('');
  logo.forEach(l => console.log(l));
  console.log('');
  console.log(sep);
  console.log(`  ${A.white}Masuk dengan akun Google untuk melanjutkan${A.reset}`);
  console.log(sep);
  console.log(`
  ${A.gray}Lanjutkan ke Google →${A.reset} Browser terbuka otomatis
  ${A.gray}Pilih akun Google Anda → Klik "Izinkan"${A.reset}

`);

  // Pastikan config dasar ada
  let cfg;
  try { cfg = readConfig(); } catch { cfg = initDefaultConfig(); }

  // Buat OAuth session (server + URL sudah siap)
  let session;
  try {
    session = await createOAuthSession();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`\n  ${A.red}✗ Gagal mempersiapkan OAuth: ${msg}${A.reset}\n`);
    process.exit(1);
  }

  // Buka browser
  await openBrowser(session.authUrl);

  // Tampilkan dialog "Connect Antigravity" + tunggu code
  let code: string;
  try {
    code = await showConnectDialog(
      session.authUrl,
      session.waitForCode,
      () => session.cancel(),
    );
  } catch (err: unknown) {
    session.cancel();
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`\n  ${A.red}✗ Login gagal: ${msg}${A.reset}\n`);
    process.exit(1);
  }

  // Tukar code → tokens
  process.stdout.write(`\n  ${A.gray}Mengambil token...${A.reset}\n`);
  let tokens;
  try {
    tokens = await session.exchangeCode(code);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`\n  ${A.red}✗ Token exchange gagal: ${msg}${A.reset}\n`);
    process.exit(1);
  }

  // Ambil project otomatis
  process.stdout.write(`  ${A.gray}Mencari Google Cloud Project aktif...${A.reset}\n`);
  const projects = await fetchUserProjects(tokens.access_token);
  
  if (projects.length > 0) {
    cfg.environment.project_id = projects[0];
    process.stdout.write(`  ${A.green}✓ Menggunakan Project: ${A.white}${projects[0]}${A.reset}\n`);
    if (projects.length > 1) {
      process.stdout.write(`    ${A.gray}(Anda memiliki ${projects.length} project. Edit ~/.config/jckw/config.json untuk mengubahnya)${A.reset}\n`);
    }
  } else {
    process.stdout.write(`  ${A.red}⚠ Peringatan: Tidak ada Google Cloud Project ditemukan!${A.reset}\n`);
    process.stdout.write(`    ${A.gray}Buat project di console.cloud.google.com agar bisa memanggil AI.${A.reset}\n`);
  }

  // Simpan tokens
  cfg.auth.access_token  = tokens.access_token;
  cfg.auth.refresh_token = tokens.refresh_token;
  cfg.auth.token_type    = tokens.token_type;
  cfg.auth.expiry_date   = tokens.expiry_date;
  cfg.auth.user_email    = tokens.user_email;
  cfg.auth.user_name     = tokens.user_name;
  cfg.auth.user_picture  = tokens.user_picture;
  writeConfig(cfg);

  // Sukses
  showSuccessScreen(tokens.user_name, tokens.user_email);

  // Model Selection
  process.stdout.write(`\n  ${A.gray}Mengambil daftar model AI...${A.reset}\n`);
  let models = [DEFAULT_MODEL]; // fallback
  try {
    models = await fetchModels();
  } catch (err) {
    // ignore
  }

  const chosen = await showModelSelector(models, DEFAULT_MODEL);
  if (chosen) {
    cfg.settings.default_model = chosen;
    writeConfig(cfg);
    process.stdout.write(`\n  ${A.green}✓ Model default disimpan: ${A.white}${chosen}${A.reset}\n\n`);
  } else {
    process.stdout.write(`\n  ${A.gray}Menggunakan model bawaan: ${A.white}${DEFAULT_MODEL}${A.reset}\n\n`);
  }
}

// ── Re-login ────────────────────────────────────────────────

export async function runRelogin(): Promise<void> {
  try {
    const cfg = readConfig();
    cfg.auth.access_token = ''; cfg.auth.refresh_token = ''; cfg.auth.expiry_date = 0;
    writeConfig(cfg);
  } catch { /* config belum ada */ }
  await runWizard();
}

// ── Uninstall ────────────────────────────────────────────────

export async function runUninstall(): Promise<void> {
  const t   = getTheme();
  const col = process.stdout.columns || 80;
  const sep = `${t.separator}${'─'.repeat(col)}${t.reset}`;
  const { deleteConfig, getConfigDir: gcd } = await import('../core/config');

  console.log('\n' + sep);
  console.log(`  ${A.cyan}Antigravity — JCKW-AGENT Uninstall${A.reset}`);
  console.log(sep);
  try {
    deleteConfig();
    console.log(`\n  ${A.green}✓ Sesi dihapus: ${gcd()}${A.reset}`);
  } catch {
    console.log(`\n  ${A.gray}⚠ Tidak ada data di: ${gcd()}${A.reset}`);
  }
  console.log(`
  ${A.gray}Hapus binary:${A.reset}
  ${A.white}  Linux/macOS → ${A.cyan}sudo rm /usr/local/bin/jckw${A.reset}
  ${A.white}  Windows     → ${A.cyan}hapus jckw.exe dari PATH${A.reset}

  ${A.gray}Hapus npm:${A.reset}
  ${A.white}  ${A.cyan}npm uninstall -g @prastya-dev/jckw-agent${A.reset}
`);
  console.log(sep + '\n');
}
