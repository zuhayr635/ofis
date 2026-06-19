import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const dataDirectory = path.join(directory, 'data');
const databaseFile = path.join(dataDirectory, 'baskent-class.sqlite');
const legacyJsonFile = path.join(dataDirectory, 'db.json');

export const defaultSettings = {
  companyName: 'BAŞKENT CLASS',
  phoneDisplay: '0541 790 01 79',
  phoneRaw: '905417900179',
  whatsapp: '905417900179',
  heroEyebrow: 'Mekânlara karakter katar',
  heroLine: 'İşiniz kadar',
  heroHighlight: 'seçkin',
  heroSuffix: 'ofisler.',
  heroDescription: 'Yönetici odalarından ortak çalışma alanlarına; estetik, konfor ve işlevi tek çizgide buluşturan premium ofis mobilyaları.',
  featuredSeries: 'VERA · YÖNETİCİ SERİSİ',
  featuredLine: 'Gücün',
  featuredHighlight: 'zarif formu.',
  featuredDescription: 'Vera; güçlü geometrisini sıcak ceviz dokusu ve ince gold detaylarla dengeler. Yönetici odasına gösterişten uzak, kendinden emin bir karakter kazandırır.'
};

export const defaultProducts = [
  { id: 'p1', name: 'Makam Takımları', category: 'Makam Takımları', description: 'İmza niteliğinde tasarımlar', sku: 'BC-MK-01', status: 'active', createdAt: new Date().toISOString() },
  { id: 'p2', name: 'Personel Masaları', category: 'Personel Masaları', description: 'Verimli çalışma alanları', sku: 'BC-PM-01', status: 'active', createdAt: new Date().toISOString() },
  { id: 'p3', name: 'Toplantı Masaları', category: 'Toplantı Masaları', description: 'Fikirlerin buluşma noktası', sku: 'BC-TM-01', status: 'active', createdAt: new Date().toISOString() },
  { id: 'p4', name: 'Ofis Koltukları', category: 'Ofis Koltukları', description: 'Konforun zarif yorumu', sku: 'BC-OK-01', status: 'active', createdAt: new Date().toISOString() }
];

const initialData = () => ({ settings: { ...defaultSettings }, products: defaultProducts.map((item) => ({ ...item })), inquiries: [] });

fs.mkdirSync(dataDirectory, { recursive: true });
const databaseWasPresent = fs.existsSync(databaseFile);
const database = new DatabaseSync(databaseFile);

database.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  PRAGMA synchronous = NORMAL;

  CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    sku TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft')),
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS inquiries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    product TEXT NOT NULL,
    message TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Yeni' CHECK (status IN ('Yeni', 'Görüşüldü', 'Tamamlandı')),
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
  CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
  CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);
`);

const settingsQuery = database.prepare('SELECT data FROM site_settings WHERE id = 1');
const productsQuery = database.prepare('SELECT id, name, category, description, sku, status, created_at AS createdAt FROM products ORDER BY rowid');
const inquiriesQuery = database.prepare('SELECT id, name, phone, product, message, status, created_at AS createdAt FROM inquiries ORDER BY created_at DESC');
const saveSettings = database.prepare(`
  INSERT INTO site_settings (id, data, updated_at) VALUES (1, ?, ?)
  ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
`);
const insertProduct = database.prepare('INSERT INTO products (id, name, category, description, sku, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
const insertInquiry = database.prepare('INSERT INTO inquiries (id, name, phone, product, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');

export function readStore() {
  const row = settingsQuery.get();
  let settings = defaultSettings;
  if (row?.data) {
    try { settings = { ...defaultSettings, ...JSON.parse(row.data) }; }
    catch { settings = defaultSettings; }
  }
  return {
    settings,
    products: productsQuery.all(),
    inquiries: inquiriesQuery.all()
  };
}

export function writeStore(data) {
  database.exec('BEGIN IMMEDIATE');
  try {
    saveSettings.run(JSON.stringify({ ...defaultSettings, ...data.settings }), new Date().toISOString());
    database.exec('DELETE FROM products; DELETE FROM inquiries;');
    for (const item of data.products ?? []) {
      insertProduct.run(item.id, item.name, item.category, item.description ?? '', item.sku ?? '', item.status === 'draft' ? 'draft' : 'active', item.createdAt ?? new Date().toISOString());
    }
    for (const item of data.inquiries ?? []) {
      insertInquiry.run(item.id, item.name, item.phone, item.product, item.message ?? '', item.status ?? 'Yeni', item.createdAt ?? new Date().toISOString());
    }
    database.exec('COMMIT');
    return data;
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}

export function updateStore(mutator) {
  const data = readStore();
  const result = mutator(data) ?? data;
  writeStore(data);
  return result;
}

export function resetStore() {
  const inquiries = readStore().inquiries;
  const data = { ...initialData(), inquiries };
  writeStore(data);
  return data;
}

function initializeDatabase() {
  const current = readStore();
  if (current.products.length || settingsQuery.get()) return;

  let seed = initialData();
  if (!databaseWasPresent && fs.existsSync(legacyJsonFile)) {
    try {
      const legacy = JSON.parse(fs.readFileSync(legacyJsonFile, 'utf8'));
      seed = {
        settings: { ...defaultSettings, ...(legacy.settings ?? {}) },
        products: Array.isArray(legacy.products) ? legacy.products : defaultProducts,
        inquiries: Array.isArray(legacy.inquiries) ? legacy.inquiries : []
      };
    } catch {
      seed = initialData();
    }
  }
  writeStore(seed);

  if (fs.existsSync(legacyJsonFile)) {
    const migratedFile = `${legacyJsonFile}.migrated`;
    if (!fs.existsSync(migratedFile)) fs.renameSync(legacyJsonFile, migratedFile);
  }
}

initializeDatabase();
