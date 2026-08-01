Berikut adalah isi lengkap file **`README.md`** (versi pengguna) yang siap langsung kamu salin dan tempel (*copy-paste*) ke file `README.md` di root proyekmu:

```markdown
# JCKW-AGENT

```

```text
 ┏┓┏━╸╻┏ ╻ ╻   ┏━┓┏━╸┏━╸┏┓╻╺┳╸
  ┃┃  ┣┻┓┃╻┃╺━╸┣━┫┃╺┓┣╸ ┃┗┫ ┃ 
┗━┛┗━╸╹ ╹┗┻┛   ╹ ╹┗━┛┗━╸╹ ╹ ╹ 

```

> **JCKW-AGENT** — AI CLI Terminal Interface powered by Google Antigravity, developed by [prastya-dev](https://github.com/prastya-dev).

JCKW-Agent adalah asisten AI berbasis terminal yang memberikan akses langsung ke berbagai model AI canggih (termasuk Claude dan Gemini) melalui integrasi 1st-party provider, lengkap dengan fitur eksekusi perintah terminal otomatis.

---

## Fitur Utama

* **Akses Model AI Luas:** Mendukung perpindahan model AI secara dinamis seperti Claude dan Gemini.
* **Dual Operational Mode:**
* **Chat Mode:** Berkomunikasi dan berkonsultasi mengenai pemrograman atau topik umum.
* **Exec Mode:** Meminta AI membuat dan mengeksekusi perintah terminal secara langsung dengan sistem konfirmasi keamanan.


* **Otentikasi Otomatis:** Sistem login OAuth2 yang terintegrasi secara aman.
* **Antarmuka TUI Interaktif:** Menu navigasi terminal yang bersih, responsif, dan mudah digunakan.
* **Tanpa Dependensi:** Tersedia versi biner mandiri yang dapat dijalankan tanpa perlu menginstal Node.js.

---

## Cara Instalasi

Pilih salah satu metode instalasi di bawah ini.

### Metode 1: Instalasi Otomatis (Direkomendasikan)

Metode ini mengunduh file biner mandiri tanpa memerlukan Node.js di komputer Anda.

#### Linux / macOS

Buka terminal dan jalankan perintah berikut:

```bash
curl -fsSL [https://raw.githubusercontent.com/prastya-dev/JCKW_AGENT/main/scripts/install.sh](https://raw.githubusercontent.com/prastya-dev/JCKW_AGENT/main/scripts/install.sh) | bash

```

#### Windows

Buka PowerShell sebagai Administrator dan jalankan perintah berikut:

```powershell
irm [https://raw.githubusercontent.com/prastya-dev/JCKW_AGENT/main/scripts/install.ps1](https://raw.githubusercontent.com/prastya-dev/JCKW_AGENT/main/scripts/install.ps1) | iex

```

---

### Metode 2: Instalasi via NPM

Jika Anda sudah menginstal Node.js (v18 atau yang lebih baru), Anda dapat menginstalnya secara global melalui NPM:

```bash
npm install -g @prastya-dev/jckw-agent

```

---

## Cara Penggunaan

Setelah proses instalasi selesai, buka terminal baru dan ketik:

```bash
jckw

```

Saat pertama kali dijalankan, aplikasi akan membimbing Anda melalui proses otentikasi awal.

### Perintah dalam Aplikasi (Slash Commands)

Saat berada di dalam aplikasi `jckw`, Anda dapat menggunakan perintah garis miring berikut:

| Perintah | Fungsi |
| --- | --- |
| `/model` | Membuka menu interaktif untuk memilih model AI. |
| `/chat` | Mengubah mode ke Chat Mode (mode diskusi). |
| `/exec` | Mengubah mode ke Exec Mode (mode eksekusi perintah terminal). |
| `/clear` | Membersihkan layar terminal dan riwayat percakapan sesi ini. |
| `/cd` | Mengubah direktori kerja terminal aktif. |
| `/quiz` | Memulai mode kuis interaktif seputar pemrograman. |
| `/help` | Menampilkan daftar bantuan dan informasi penggunaan. |
| `/exit` | Keluar dari aplikasi JCKW-Agent. |

---

## Kontributor

* **[prastya-dev](https://github.com/prastya-dev)** — Creator & Lead Developer

---

## Lisensi

Aplikasi ini dilindungi di bawah lisensi [MIT](https://www.google.com/search?q=LICENSE).

```

```
