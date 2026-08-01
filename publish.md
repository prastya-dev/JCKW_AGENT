# Panduan Publikasi & Instalasi JCKW-AGENT

Dokumen ini berisi panduan lengkap untuk mempublikasikan JCKW-AGENT ke NPM dan cara menginstalnya di berbagai platform.

## 🚀 Cara Publish ke NPM

Jika Anda ingin orang lain bisa menginstal JCKW-AGENT menggunakan perintah `npm i -g jckw-agent`, ikuti langkah-langkah publikasi berikut:

### 1. Persiapan Akun & Paket
1. Pastikan Anda memiliki akun di [npmjs.com](https://www.npmjs.com/).
2. Buka file `package.json` dan pastikan nama paket Anda unik (contoh: `"name": "jckw-agent"` atau `"name": "@username/jckw-agent"`).
3. Pastikan kolom `"version"` dinaikkan jika Anda melakukan pembaruan (contoh: dari `"1.0.0"` ke `"1.0.1"`).

### 2. Login ke NPM via Terminal
Buka terminal dan ketik perintah berikut:
```bash
npm login
```
*Anda akan diminta memasukkan username, password, email, dan kode OTP (jika diaktifkan).*

### 3. Build & Publish
Kompilasi kode TypeScript menjadi JavaScript lalu unggah ke server NPM:
```bash
# Hapus build lama dan build ulang
npm run build

# Publish ke NPM
npm publish
```
*(Catatan: Jika Anda memakai format `@username/jckw-agent`, gunakan perintah `npm publish --access public`).*

---

## 💻 Tutorial Instalasi Untuk Pengguna Akhir

Setelah paket di-publish ke NPM, siapa pun dapat menginstal JCKW-AGENT dengan sangat mudah, sesuai dengan kebutuhannya (via NPM atau installer script).

### Opsi 1: Instalasi Cepat via NPM (Direkomendasikan)
Jika pengguna sudah memiliki **Node.js** terinstal di PC/Laptop mereka, cukup jalankan **1 perintah** berikut di terminal mana pun (Command Prompt, PowerShell, atau Bash):

```bash
npm i -g jckw-agent
```
*(Ganti `jckw-agent` dengan nama paket Anda jika Anda mempublikasikannya dengan nama lain).*

### Opsi 2: Instalasi Sekali Klik (Tanpa Node.js)
Untuk pengguna yang **tidak ingin** menginstal Node.js, Anda bisa menyediakan skrip yang mengunduh *Binary Executable* (hasil dari `pkg`).

> **Catatan Developer:** Anda harus membuat *release* di GitHub yang berisi file biner hasil `npm run pkg:linux`, `pkg:macos`, dan `pkg:win`. Skrip instalasi di bawah ini harus diarahkan ke URL rilis GitHub Anda.

#### Untuk Pengguna Linux / macOS:
Jalankan 1 baris perintah ini di terminal:
```bash
curl -fsSL https://raw.githubusercontent.com/username/jckw-agent/main/scripts/install.sh | bash
```

#### Untuk Pengguna Windows:
Buka PowerShell sebagai Administrator dan jalankan:
```powershell
irm https://raw.githubusercontent.com/username/jckw-agent/main/scripts/install.ps1 | iex
```

Setelah instalasi berhasil dengan cara apa pun di atas, pengguna cukup mengetik:
```bash
jckw
```
Dan aplikasi akan otomatis berjalan beserta proses Setup Wizard!

---

## 💡 Tips Penggunaan

- Jika pengguna ingin **Mengganti Akun Google**, cukup ketik:
  ```bash
  jckw --wizard
  ```
- Untuk menguninstal aplikasi dan membersihkan seluruh riwayat cache:
  ```bash
  jckw --uninstall
  ```
