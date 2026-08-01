import * as os from 'os';
import { stateManager } from '../core/state';

// ============================================================
// JCKW-AGENT — System Prompt Builder
// Injects runtime environment variables into the prompt template
// ============================================================

const SYSTEM_PROMPT_TEMPLATE = `Kamu adalah Jckw-agent, AI CLI Yang dikembangkan oleh prastya-dev.

KONTEKS LINGKUNGAN PENGGUNA:
- Sistem Operasi: {PLATFORM_OS}
- Shell Utama: {CURRENT_SHELL}
- Direktori Kerja: {CURRENT_DIRECTORY}
- Mode Aktif saat ini: {CURRENT_MODE}

ATURAN PERILAKU:
1. Jawab pertanyaan dengan ringkas, jelas, dan fokus pada lingkungan CLI tanpa simbol *.
2. Jika mode saat ini adalah 'chat', berikan penjelasan atau potongan kode tanpa format eksekusi otomatis.
3. Jika mode saat ini adalah 'exec' dan pengguna meminta tindakan pada sistem/file:
   - Sertakan perintah terminal yang disarankan dalam format blok JSON khusus di akhir respons:
     \`\`\`json_exec
     { "command": "perintah_terminal_disini" }
     \`\`\`
4. Jika mode saat ini adalah 'quiz', jawab dengan SUPER SINGKAT, to the point, tanpa penjelasan, tanpa basa basi. Langsung berikan jawaban intinya saja.`;

/** Detect the current shell from environment variables */
function detectShell(): string {
  if (process.platform === 'win32') {
    return process.env.COMSPEC || 'cmd.exe';
  }
  return process.env.SHELL || '/bin/sh';
}

/** Detect platform in human-readable format */
function detectOS(): string {
  const platform = os.platform();
  const release  = os.release();
  switch (platform) {
    case 'darwin': return `macOS ${release}`;
    case 'win32':  return `Windows ${release}`;
    case 'linux':  return `Linux ${release}`;
    default:       return `${platform} ${release}`;
  }
}

/** Build the injected system prompt with runtime values */
export function buildSystemPrompt(): string {
  const state = stateManager.get();
  return SYSTEM_PROMPT_TEMPLATE
    .replace('{PLATFORM_OS}',      detectOS())
    .replace('{CURRENT_SHELL}',    detectShell())
    .replace('{CURRENT_DIRECTORY}', state.currentDir)
    .replace('{CURRENT_MODE}',     state.activeMode);
}

/** Build the contents array for the API payload */
export function buildContents(userMessage: string): Array<{role: string; parts: Array<{text: string}>}> {
  const state = stateManager.get();
  const systemPrompt = buildSystemPrompt();

  const contents: Array<{role: string; parts: Array<{text: string}>}> = [];

  // Inject system prompt as part of the first user message
  const firstContent = `${systemPrompt}\n\n${userMessage}`;

  if (state.history.length === 0) {
    // No history — just the system-injected user message
    contents.push({
      role: 'user',
      parts: [{ text: firstContent }],
    });
  } else {
    // Build history + current message
    // First message includes system prompt injection
    let isFirst = true;
    for (const msg of state.history) {
      if (msg.role === 'system') continue;
      const text = isFirst && msg.role === 'user'
        ? `${systemPrompt}\n\n${msg.content}`
        : msg.content;
      isFirst = false;
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text }],
      });
    }

    // Append the new user message
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });
  }

  return contents;
}
