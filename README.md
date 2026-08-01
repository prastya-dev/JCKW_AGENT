# JCKW-AGENT

```
  ░██  ░███████  ░██    ░██░██    ░██    ░██
  ░██ ░██    ░██ ░██   ░██ ░██    ░██    ░██
  ░██ ░██        ░███████   ░██  ░████  ░██
  ░██ ░██    ░██ ░██   ░██   ░██░██ ░██░██
  ░██  ░███████  ░██    ░██   ░███   ░███

                 AI CLI V1.0
```

> **JCKW-AGENT** — AI CLI Terminal Interface powered by Google Antigravity, developed by [prastya-dev](https://github.com/prastya-dev).

JCKW-Agent kini menggunakan metode *1st-party provider* (layaknya Antigravity VS Code Plugin & 9router) sehingga Anda memiliki akses penuh ke endpoint *daily-cloudcode-pa*, model *Claude*, serta penanganan *Onboarding* Gemini Code Assist secara otomatis tanpa limitasi.

---

## Struktur Folder & Penjelasan File (`src/`)

Seluruh source code utama JCKW-AGENT ada di dalam direktori `src/`. Berikut adalah penjelasan fungsi dari setiap file yang terpakai:

### API & Engine (`src/api/`)
- **`client.ts`** — File utama untuk melakukan koneksi ke API Antigravity. Mengurus proses *Onboarding* otomatis (`loadCodeAssist`), sinkronisasi daftar model (`fetchModels`), dan mengirim prompt ke server.
- **`prompt.ts`** — **(PENTING)** File ini memuat **Template Prompt System**. Jika Anda ingin mengubah kepribadian AI, batasan jawaban AI, format output (misal: JSON exec), atau bahasa bawaan, silakan ubah pada file ini.
- **`streamer.ts`** — Mengurus *Server-Sent Events* (SSE) dan memberikan efek mengetik (*typewriter effect*) saat merender balasan dari AI ke terminal.

### Authentication (`src/auth/`)
- **`oauth.ts`** — Mengurus otentikasi OAuth2 PKCE *flow*, mulai dari pembuatan link login, membuka browser otomatis, menangkap *callback* dari lokal web server, hingga pertukaran token akses.
- **`token.ts`** — Mengelola *Access Token* dan memastikan token selalu dalam kondisi *fresh* (me-refresh otomatis di latar belakang jika hampir kedaluwarsa).
- **`wizard.ts`** — Menampilkan antarmuka interaktif pada terminal saat aplikasi baru pertama kali dijalankan (meminta login dll).

### Commands (`src/commands/`)
- **`slash.ts`** — Menangani semua perintah garis miring bawaan (seperti `/model`, `/exec`, `/chat`, `/quiz`, `/clear`, `/help`, `/exit`, dan `/cd`).

### Core (`src/core/`)
- **`config.ts`** — Menangani baca/tulis konfigurasi dari/ke `~/.config/jckw/config.json`.
- **`constants.ts`** — Menyimpan variabel *constant* aplikasi (URL Endpoint, Client ID 1st-party bawaan, konfigurasi bawaan `temperature`, dan daftar fallback model).
- **`state.ts`** — Mengelola state/memori aplikasi ketika berjalan (seperti *history* percakapan, mode aktif, dll).

### Execution (`src/exec/`)
- **`parser.ts`** — Bertugas mengekstrak blok eksekusi perintah (seperti `json_exec`) dari *output* yang diberikan oleh AI pada mode Exec.
- **`runner.ts`** — Mengeksekusi perintah terminal tersebut (melalui *child_process*) jika diizinkan oleh pengguna, dan menangkap *stdout/stderr* nya.

### Tampilan & Antarmuka (`src/ui/`)
- **`banner.ts`** — **(PENTING)** File ini memuat **Teks ASCII / Logo CLI** yang muncul saat aplikasi pertama dijalankan. Ubah string `ASCII_BANNER` di file ini untuk mengganti logo.
- **`theme.ts`** — **(PENTING)** File ini memuat **Warna Tema ANSI**. Jika Anda ingin mengubah warna mode `chat` (cyan) atau mode `exec` (merah), silakan edit *hex color* atau ansi code di dalam fungsi konfigurasi tema ini.
- **`confirm.ts`** — Merender dialog konfirmasi interaktif dengan tombol `[ Ya ]` dan `[ Tidak ]` saat mode Exec ingin menjalankan suatu perintah.
- **`modelselector.ts`** — Merender menu TUI (*Terminal User Interface*) untuk memilih model secara interaktif menggunakan tombol Panah (Arrow).
- **`statusbar.ts`** — Merender bar status di bagian bawah layar beserta pemformatan pesan masuk dari pengguna.

### Main
- **`index.ts`** — Merupakan titik awal masuk aplikasi (entry point) tempat *main loop* input-output interaktif dieksekusi.

---

## Panduan Kustomisasi

### 1. Mengganti Template Prompt & Sifat AI
Buka file `src/api/prompt.ts`.
Anda akan melihat fungsi `buildContents(userText: string)`. Di sana terdapat beberapa teks instruksi statis untuk mode *chat* dan mode *exec*. Ubah teks pada blok-blok tersebut sesuai kebutuhan (misal, menyuruhnya menjawab dengan gaya bahasa tertentu).

### 2. Mengganti Tema / Warna Teks
Buka file `src/ui/theme.ts`.
Di file ini ada definisi `ThemeColors`. Anda bisa mengubah kode warna HEX atau *ANSI escape sequence* yang dirender untuk mode `chat` dan `exec`.
Contoh:
```typescript
const themes = {
  chat: { accent: '\x1b[38;2;0;212;255m', ... },
  exec: { accent: '\x1b[38;2;255;70;70m', ... }
};
```

### 3. Mengganti Logo ASCII (Banner)
Buka file `src/ui/banner.ts`.
Ubah variabel constanta yang berisi *string* multiline ASCII untuk menyesuaikan dengan logo/nama CLI kustom milik Anda sendiri.

---

## Cara Publish ke NPM (Node Package Manager)

Jika Anda ingin mempublikasikan CLI ini ke NPM agar orang lain bisa menginstallnya dengan perintah `npm install -g nama-paket-anda`, ikuti langkah berikut:

1. **Ubah Data di package.json**: Buka file `package.json` lalu ubah `"name": "@prastya-dev/jckw-agent"` menjadi nama yang Anda inginkan (harus unik di seluruh npm). Jangan lupa sesuaikan juga `version`, `author`, dan `description`.
2. **Login ke NPM**: Buka terminal dan ketik `npm login`. Ikuti instruksi di layar (masukkan username, password, email, dan kode OTP yang dikirim ke email). Jika Anda belum punya akun, daftar dulu di [npmjs.com](https://www.npmjs.com).
3. **Build Kode**: Kompilasi source code TypeScript menjadi JavaScript yang siap dijalankan dengan perintah:
   ```bash
   npm run build
   ```
4. **Publish**: Setelah berhasil login dan build, ketik perintah berikut untuk mengunggah paket Anda ke NPM:
   ```bash
   npm publish
   ```
   *(Catatan: Jika nama paket Anda menggunakan scope seperti `@username/nama-paket`, tambahkan flag `--access public` di akhir perintah).*

---

## Tutorial Install (Untuk Pengguna Akhir)

Setelah Anda mempublikasikan *package* tersebut ke NPM, pengguna mana pun di dunia bisa menginstalnya dengan mudah:

1. Pastikan **Node.js** (minimal versi 18) sudah terinstal di komputer pengguna.
2. Buka Terminal (Linux/macOS) atau Command Prompt / PowerShell (Windows).
3. Jalankan perintah instalasi global berikut:
   ```bash
   npm install -g nama-paket-anda
   ```
4. Selesai! Kini pengguna cukup mengetik nama perintah (sesuai *bin* di `package.json`, misalnya `jckw`) di terminal apa pun untuk menjalankan AI CLI.

---

## Opsi Build Lain (Binary Executable)

Jika Anda tidak ingin mempublish ke NPM, Anda bisa mengemasnya menjadi satu file `.exe` (Windows), linux binary, atau macOS binary sehingga pengguna tidak perlu menginstall Node.js:

```bash
# Build binary
npm run pkg:linux
npm run pkg:macos
npm run pkg:win
```

---

## License

MIT © [prastya-dev](https://github.com/prastya-dev)
# JCKW_AGENT
