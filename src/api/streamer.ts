import * as http from 'http';
import * as https from 'https';
import { TYPEWRITER_DELAY_MS } from '../core/constants';

// ============================================================
// JCKW-AGENT — SSE Stream Parser + Typewriter Effect
// Parses Server-Sent Events from Google Antigravity API
// and renders text with a typewriter character-by-character effect
// ============================================================

/** Sleep helper for typewriter delay */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Write a single character to stdout with typewriter delay */
async function writeChar(char: string): Promise<void> {
  process.stdout.write(char);
  if (TYPEWRITER_DELAY_MS > 0) {
    await sleep(TYPEWRITER_DELAY_MS);
  }
}

/** Write a string with typewriter effect character by character */
async function typewriterWrite(text: string): Promise<void> {
  for (const char of text) {
    await writeChar(char);
  }
}

/**
 * Extract text chunks from a single SSE data line.
 * Handles multiple Gemini/Antigravity response shapes.
 */
function extractTextFromChunk(jsonStr: string): string {
  try {
    const data = JSON.parse(jsonStr);

    // Shape 0: { response: { candidates: [{ content: { parts: [{ text: "..." }] } }] } }
    if (data.response?.candidates && Array.isArray(data.response.candidates)) {
      const parts = data.response.candidates[0]?.content?.parts;
      if (parts && Array.isArray(parts)) {
        return parts.map((p: { text?: string }) => p.text || '').join('');
      }
    }

    // Shape 1: { candidates: [{ content: { parts: [{ text: "..." }] } }] }
    if (data.candidates && Array.isArray(data.candidates)) {
      const parts = data.candidates[0]?.content?.parts;
      if (parts && Array.isArray(parts)) {
        return parts.map((p: { text?: string }) => p.text || '').join('');
      }
    }

    // Shape 2: Array of candidate objects
    if (Array.isArray(data)) {
      const parts = data[0]?.candidates?.[0]?.content?.parts;
      if (parts && Array.isArray(parts)) {
        return parts.map((p: { text?: string }) => p.text || '').join('');
      }
    }

    // Shape 3: Direct text field
    if (typeof data.text === 'string') {
      return data.text;
    }

  } catch {
    // Not valid JSON, skip
  }
  return '';
}

/**
 * Stream and parse the HTTP response from the Antigravity API.
 * Calls resolve with the full accumulated response text.
 * Outputs each text chunk via typewriter effect.
 */
export function streamResponse(
  res: http.IncomingMessage,
  resolve: (text: string) => void,
  reject: (err: Error) => void,
): void {
  let buffer = '';
  let fullText = '';
  let pendingWrites: Promise<void> = Promise.resolve();

  res.setEncoding('utf8');

  res.on('data', (chunk: string) => {
    buffer += chunk;
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      let jsonStr = '';

      if (trimmed.startsWith('data: ')) {
        const payload = trimmed.slice(6).trim();
        if (payload === '[DONE]') continue;
        jsonStr = payload;
      } else if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        jsonStr = trimmed;
      } else {
        continue;
      }

      const text = extractTextFromChunk(jsonStr);
      if (!text) continue;

      fullText += text;

      // Chain typewriter writes to preserve order
      const textCopy = text;
      pendingWrites = pendingWrites.then(() => typewriterWrite(textCopy));
    }
  });

  res.on('end', () => {
    // Process any remaining buffer content
    if (buffer.trim()) {
      const text = extractTextFromChunk(buffer.trim());
      if (text) {
        fullText += text;
        pendingWrites = pendingWrites.then(() => typewriterWrite(text));
      }
    }

    // Wait for all pending typewriter writes to finish before resolving
    pendingWrites.then(() => {
      process.stdout.write('\n');
      resolve(fullText);
    });
  });

  res.on('error', (err) => {
    reject(new Error(`Stream error: ${err.message}`));
  });
}
