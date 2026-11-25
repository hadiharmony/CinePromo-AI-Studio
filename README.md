# PromoReel Studio AI

Aplikasi pembuat konten iklan produk berbasis AI (Native Android Jetpack Compose + Static No-Build PWA siap GitHub Pages) dengan dua mode produksi utama: **VIDEO ADS** (video promosi sinematik) dan **PHOTO ADS** (poster & foto iklan produk profesional), atau **BOTH** sekaligus. Unggah 1 foto produk — tambahkan deskripsi, manfaat, harga, diskon, atau promo secara opsional — lalu dapatkan aset siap posting beserta paket media sosial lengkap (Hook, Caption, CTA & Tagar).

---

## Struktur File (Siap Upload ke GitHub Pages)

```text
/
├── index.html          # Aplikasi PWA lengkap (HTML + CSS + JS, tanpa build step)
├── manifest.json       # Konfigurasi PWA (standalone, portrait, ikon 192 & 512)
├── sw.js               # Service Worker app-shell caching (tanpa cache data sensitif)
├── icon-192.png        # Ikon aplikasi 192x192 PNG
├── icon-512.png        # Ikon aplikasi 512x512 PNG
├── README.md           # Panduan instalasi, konfigurasi & deployment
├── firestore.rules     # Aturan keamanan Firestore berbasis kepemilikan user
├── backend/            # Backend AI aman (Firebase Cloud Functions v2 / Cloud Run)
│   ├── index.js
│   ├── package.json
│   └── .env.example
└── app/                # Aplikasi Native Android (Jetpack Compose + Firebase AI Logic)
```

---

## Fitur Utama

1. **Upload Foto Produk Terpadu + Pilihan Mode (`VIDEO`, `PHOTO`, `BOTH`)**
   - Cukup unggah 1 foto produk; Gemini Vision menganalisis visual, warna, kategori, dan daya tarik produk sambil mempertahankan identitas produk asli (bentuk, logo, merek, dan detail kemasan).
   - Opsional: Nama Produk, Deskripsi, Manfaat, **Harga**, **Diskon**, dan **Badge Promo**.
2. **VIDEO ADS — Pembuatan Video Promosi Dinamis & Estetik**
   - Storyboard 5–6 adegan otomatis (Hook, Hero Reveal, Benefit, Lifestyle, Social Proof, CTA) lengkap dengan gerakan kamera (`ZoomIn`, `ParallaxOrbit`, `WhipPan`, `KenBurns`, `PulseBeat`, `SlideReveal`), transisi beat, dan rekomendasi musik.
   - **PWA**: Mesin render video HTML5 `<canvas>` 30fps + tombol **Render & Unduh Video (.webm)** langsung di browser.
3. **PHOTO ADS — Studio Foto Iklan Produk Profesional (Real PNG/JPEG Export)**
   - **AI Background Replacement** (menjaga identitas produk asli) + **Studio Compositor HD bawaan** (tetap berfungsi kapan saja tanpa ketergantungan kuota model gambar).
   - **9 Template Komersial**: `Luxury`, `Minimalist`, `Cinematic`, `Modern Commercial`, `Lifestyle`, `Beauty`, `Food`, `Fashion`, dan `Technology`.
   - **6 Preset Pencahayaan Sinematik & Color Grading**, **Realistic Shadow**, **Glossy Reflection**, **AI Headline & Advertising Copy**, serta **Multiple Design Variations** (3 variasi otomatis).
   - **Editor Desain Sederhana**: Ubah teks, harga, diskon, promo badge, CTA, font, ukuran teks, skala & posisi objek produk (X/Y), intensitas bayangan/refleksi, serta komposisi layout.
   - **Unduh File Gambar Nyata (PNG / JPEG HD)** dalam 4 rasio: **9:16** (`1080×1920`), **1:1** (`1080×1080`), **4:5** (`1080×1350`), dan **16:9** (`1920×1080`).
   - **Transparansi Layanan AI Image Generation**: Model `gemini-nano-banana-2.1` memerlukan paket Firebase Blaze / kuota aktif. Apabila tidak tersedia atau offline, **Studio Compositor HD** secara otomatis menggabungkan foto produk asli (100% utuh) dengan latar studio, cahaya sinematik, bayangan & refleksi realistis menjadi file PNG/JPEG siap unduh.
4. **Integrasi Media Sosial & WhatsApp Lengkap**
   - Paket otomatis untuk **TikTok**, **Instagram Reels**, **YouTube Shorts**, dan **Shopee / WhatsApp**.
   - **Brankas Hook Viral** (Curiosity, Pain-Point, Aesthetic, FOMO, Social Proof), tombol **Salin Semua**, dan **Share WhatsApp / Sosmed** beserta file gambar iklan.
5. **Subtitle Kinetik Otomatis (.SRT & .VTT)**
   - Tersinkronisasi otomatis dengan durasi setiap adegan, bisa diedit per baris, disalin, atau diunduh.
6. **Cloud Sync Firebase Nyata (My Projects)**
   - Autentikasi Google Sign-In, penyimpanan Cloud Firestore (`/users/{uid}/promoCampaigns/{id}`) menyimpan hasil Video Ads & Photo Ads sekaligus, indikator status nyata (`SAVING`, `SAVED`, `SAVE FAILED`), dan tombol **Retry**.

---

## Cara Deploy Static PWA ke GitHub Pages

1. Push seluruh file root (`index.html`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`, `README.md`) ke repositori GitHub Anda.
2. Buka **Settings → Pages → Build and deployment**, pilih branch `main` dan folder `/ (root)`.
3. Akses URL HTTPS GitHub Pages Anda (mendukung subpath seperti `https://username.github.io/nama-repo/`).
4. Klik tombol **Cloud & Backend** di pojok kanan atas untuk memasukkan konfigurasi publik Firebase Web App dan URL backend Cloud Functions Anda.
5. Di Android Chrome, buka menu `⋮` lalu pilih **Install app** untuk memasang sebagai PWA standalone.

---

## Cara Deploy Secure AI Backend (`/backend`)

API key Gemini **tidak pernah disimpan** di `index.html`, `sw.js`, `manifest.json`, atau repositori publik.

```bash
cd backend
npm install
firebase functions:secrets:set GEMINI_API_KEY
firebase deploy --only functions,firestore:rules
```

Salin base URL Cloud Functions Anda (mis. `https://asia-southeast1-<project-id>.cloudfunctions.net`) ke panel **Cloud & Backend** di dalam aplikasi web.

---

## Mode Offline vs Online

- **Offline (Service Worker App Shell):** Antarmuka aplikasi, draf lokal, dan editor tetap dapat dibuka saat offline.
- **Online Required:** Analisis foto produk AI, generasi video/frame AI, regenerasi kit sosmed AI, dan sinkronisasi Cloud Firestore memerlukan koneksi internet aktif.
