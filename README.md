# Başkent Class Büro — React + Express

Premium ofis mobilyaları sitesi ve yönetim panelinden oluşan full-stack proje.

Node.js 24 LTS kullanır. Sürüm `package.json`, `.nvmrc` ve `nixpacks.toml` içinde sabitlenmiştir.

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

## Coolify + Nixpacks

Proje kökündeki `nixpacks.toml` aşağıdaki akışı otomatik uygular:

1. Node.js 24 ortamını hazırlar.
2. `npm ci` ile paketleri kurar.
3. `npm run build` ile React uygulamasını derler.
4. `npm run start` ile Express sunucusunu başlatır.

Coolify ayarları:

- Build Pack: `Nixpacks`
- Health Check Path: `/api/health`
- Container Port: `3001` veya Coolify'ın verdiği `$PORT`
- Persistent Storage hedefi: `/app/data`

Canlı ortam değişkenleri:

```text
AUTH_SECRET=uzun-rastgele-en-az-32-karakter-bir-deger
ADMIN_USERNAME=admin
ADMIN_PASSWORD=guclu-bir-sifre
```

`DATA_DIR=/app/data` Nixpacks yapılandırmasında hazırdır. Coolify'da `/app/data` hedefine bir persistent volume bağlanmazsa uygulama çalışır ancak SQLite verileri yeni deploy sırasında korunmayabilir.
