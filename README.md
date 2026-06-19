# Başkent Class Büro — React + Express

Premium ofis mobilyaları sitesi ve yönetim panelinden oluşan full-stack proje.

Node.js 22.5 veya üzeri gerektirir; önerilen sürüm Node.js 24 LTS'tir.

## Teknoloji

- React 19 + Vite
- Express 5 REST API
- HMAC imzalı yönetici oturumu
- Kurulumsuz gömülü SQLite veritabanı (`server/data/baskent-class.sqlite`)

## Kurulum

```powershell
npm.cmd install
npm.cmd run dev
```

- Site: `http://localhost:5173`
- Admin: `http://localhost:5173/admin`
- API: `http://localhost:3001/api/health`

SQLite Node.js ile birlikte gömülü gelir. MySQL/PostgreSQL kurulumu, bağlantı adresi, veritabanı kullanıcısı veya manuel tablo oluşturma gerekmez. Backend ilk çalışmada veritabanı dosyasını ve tabloları otomatik hazırlar. Eski `db.json` bulunursa verileri bir kez otomatik aktarır.

## Yönetici girişi

- Kullanıcı: `admin`
- Şifre: `class2026`

Canlı ortamda aşağıdaki değişkenleri mutlaka tanımlayın:

```text
AUTH_SECRET=uzun-ve-rastgele-bir-deger
ADMIN_USERNAME=admin
ADMIN_PASSWORD=guclu-bir-sifre
PORT=3001
```

## Production

```powershell
npm.cmd run build
npm.cmd start
```

Production sunucusu derlenmiş React uygulamasını ve API'yi aynı porttan sunar.
