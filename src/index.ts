#!/usr/bin/env node
// ============================================================
// JCKW-AGENT — Main Entry Point
// CLI args: (none) | --config | --uninstall | --version
// ============================================================

import * as readline from 'readline';

import { configExists, isConfigured, readConfig } from './core/config';
import { stateManager } from './core/state';
import { applyTheme, getTheme, separator } from './ui/theme';
import { renderBanner } from './ui/banner';
import { renderStatusBar, printUserMessage } from './ui/statusbar';
import { ensureValidToken } from './auth/token';
import { runWizard, runRelogin, runUninstall } from './auth/wizard';
import { handleSlashCommand } from './commands/slash';
import { sendMessage } from './api/client';
import { APP_VERSION } from './core/constants';

// ── Graceful Shutdown ──────────────────────────────────────

process.on('SIGINT', () => {
  const t = getTheme();
  process.stdout.write(`\n\n${t.accent}  Goodbye! ${t.dim}— JCKW-AGENT${t.reset}\n\n`);
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  const t = getTheme();
  process.stderr.write(`\n${t.error}  ✗ Uncaught error: ${err.message}${t.reset}\n`);
  process.exit(1);
});

// ── Main Input Loop ────────────────────────────────────────

async function startMainLoop(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
    historySize: 100,
  });

  // Emit keypress events for readline (needed for raw history navigation)
  readline.emitKeypressEvents(process.stdin, rl);

  function promptInput(): Promise<string> {
    const t = getTheme();
    return new Promise((resolve) => {
      rl.question(`${t.accent}> ${t.reset}`, (answer) => {
        resolve(answer);
      });
    });
  }

  // Main loop
  while (true) {
    let input: string;
    try {
      input = await promptInput();
    } catch {
      // readline was closed (e.g. Ctrl+D / EOF)
      break;
    }

    input = input.trim();
    if (!input) continue;

    const t = getTheme();

    // Handle slash commands
    if (input.startsWith('/')) {
      // Pause readline during raw-mode UI interactions
      rl.pause();
      try {
        await handleSlashCommand(input);
      } finally {
        rl.resume();
      }
      continue;
    }

    // User message → AI
    printUserMessage(input);

    // Add to state history
    stateManager.addMessage({
      role: 'user',
      content: input,
      timestamp: Date.now(),
    });

    rl.pause();
    try {
      await sendMessage(input);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      process.stdout.write(`\n${t.error}  ✗ ${msg}${t.reset}\n`);
    } finally {
      rl.resume();
    }

    renderStatusBar();
  }

  rl.close();
}

// ── Bootstrap ──────────────────────────────────────────────

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // ─ --version / -v ─
  if (args.includes('--version') || args.includes('-v')) {
    console.log(`JCKW-AGENT v${APP_VERSION}`);
    process.exit(0);
  }

  // ─ --uninstall ─
  if (args.includes('--uninstall')) {
    await runUninstall();
    process.exit(0);
  }

  // ─ --config / --wizard (force re-login) ─
  if (args.includes('--config') || args.includes('--wizard')) {
    applyTheme('chat');
    await runRelogin();
    console.log('\nRestart "jckw" untuk mulai chat.\n');
    process.exit(0);
  }

  // ─ Normal startup ─

  // Check if first-time setup is needed
  if (!configExists() || !isConfigured()) {
    applyTheme('chat');
    console.log('\nWelcome to JCKW-AGENT! Let\'s get you set up.\n');
    await runWizard();
    console.log('\nLaunching JCKW-AGENT...\n');
  }

  // Load configuration
  const config = readConfig();

  // Initialize application state
  stateManager.update({
    selectedModel: config.settings.default_model,
    activeMode: config.settings.default_mode,
    config,
    currentDir: process.cwd(),
  });

  // Apply initial theme based on saved mode
  applyTheme(config.settings.default_mode);

  // Ensure valid auth token
  try {
    await ensureValidToken();
  } catch (err: unknown) {
    const t = getTheme();
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(`\n${t.error}  ✗ Auth error: ${msg}${t.reset}\n\n`);
    process.exit(1);
  }

  // ─ Render UI ─
  // Clear screen
  process.stdout.write('\x1b[2J\x1b[H');

  renderBanner();
  renderStatusBar();

  // Start the main interaction loop
  await startMainLoop();
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`\nFatal: ${msg}\n`);
  process.exit(1);
});
