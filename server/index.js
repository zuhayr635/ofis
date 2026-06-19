import express from 'express';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createToken, requireAuth, verifyCredentials } from './auth.js';
import { checkDatabase, closeStore, defaultSettings, readStore, resetStore, updateStore } from './store.js';

const app = express();
const port = Number(process.env.PORT) || 3001;
const host = process.env.HOST || '0.0.0.0';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '100kb' }));

const clean = (value, max = 300) => String(value ?? '').trim().slice(0, max);

app.get('/api/health', (_req, res) => {
  const databaseOk = checkDatabase();
  res.status(databaseOk ? 200 : 503).json({
    ok: databaseOk,
    service: 'Başkent Class API',
    database: databaseOk ? 'sqlite:ready' : 'sqlite:error'
  });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body ?? {};
  if (!verifyCredentials(username, password)) return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });
  res.json({ token: createToken(username), user: { username, role: 'admin' } });
});

app.get('/api/public/content', (_req, res) => {
  const data = readStore();
  res.json({ settings: data.settings, products: data.products.filter((product) => product.status === 'active') });
});

app.post('/api/public/inquiries', (req, res) => {
  const inquiry = {
    id: crypto.randomUUID(),
    name: clean(req.body?.name, 80),
    phone: clean(req.body?.phone, 30),
    product: clean(req.body?.product, 100),
    message: clean(req.body?.message, 1000),
    status: 'Yeni',
    createdAt: new Date().toISOString()
  };
  if (!inquiry.name || !inquiry.phone || !inquiry.product) return res.status(400).json({ error: 'Ad, telefon ve ürün alanları zorunludur.' });
  updateStore((data) => data.inquiries.push(inquiry));
  res.status(201).json(inquiry);
});

app.use('/api/admin', requireAuth);

app.get('/api/admin/dashboard', (_req, res) => {
  const data = readStore();
  res.json({
    totalInquiries: data.inquiries.length,
    newInquiries: data.inquiries.filter((item) => item.status === 'Yeni').length,
    completedInquiries: data.inquiries.filter((item) => item.status === 'Tamamlandı').length,
    activeProducts: data.products.filter((item) => item.status === 'active').length,
    recentInquiries: [...data.inquiries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
  });
});

app.get('/api/admin/settings', (_req, res) => res.json(readStore().settings));
app.put('/api/admin/settings', (req, res) => {
  const allowed = Object.keys(defaultSettings);
  const next = {};
  for (const key of allowed) if (key in req.body) next[key] = clean(req.body[key], 500);
  const settings = updateStore((data) => (data.settings = { ...data.settings, ...next }));
  res.json(settings);
});

app.get('/api/admin/products', (_req, res) => res.json(readStore().products));
app.post('/api/admin/products', (req, res) => {
  const product = {
    id: crypto.randomUUID(),
    name: clean(req.body?.name, 80), category: clean(req.body?.category, 80),
    description: clean(req.body?.description, 180), sku: clean(req.body?.sku, 30),
    status: req.body?.status === 'draft' ? 'draft' : 'active', createdAt: new Date().toISOString()
  };
  if (!product.name || !product.category) return res.status(400).json({ error: 'Ürün adı ve kategori zorunludur.' });
  updateStore((data) => data.products.push(product));
  res.status(201).json(product);
});
app.put('/api/admin/products/:id', (req, res) => {
  const product = updateStore((data) => {
    const item = data.products.find((entry) => entry.id === req.params.id);
    if (!item) return null;
    Object.assign(item, {
      name: clean(req.body?.name, 80), category: clean(req.body?.category, 80),
      description: clean(req.body?.description, 180), sku: clean(req.body?.sku, 30),
      status: req.body?.status === 'draft' ? 'draft' : 'active'
    });
    return item;
  });
  if (!product) return res.status(404).json({ error: 'Ürün bulunamadı.' });
  res.json(product);
});
app.delete('/api/admin/products/:id', (req, res) => {
  const deleted = updateStore((data) => {
    const before = data.products.length;
    data.products = data.products.filter((item) => item.id !== req.params.id);
    return before !== data.products.length;
  });
  if (!deleted) return res.status(404).json({ error: 'Ürün bulunamadı.' });
  res.status(204).end();
});

app.get('/api/admin/inquiries', (_req, res) => res.json(readStore().inquiries));
app.patch('/api/admin/inquiries/:id', (req, res) => {
  const allowed = ['Yeni', 'Görüşüldü', 'Tamamlandı'];
  const inquiry = updateStore((data) => {
    const item = data.inquiries.find((entry) => entry.id === req.params.id);
    if (!item) return null;
    if (allowed.includes(req.body?.status)) item.status = req.body.status;
    return item;
  });
  if (!inquiry) return res.status(404).json({ error: 'Talep bulunamadı.' });
  res.json(inquiry);
});
app.delete('/api/admin/inquiries/:id', (req, res) => {
  const deleted = updateStore((data) => {
    const before = data.inquiries.length;
    data.inquiries = data.inquiries.filter((item) => item.id !== req.params.id);
    return before !== data.inquiries.length;
  });
  if (!deleted) return res.status(404).json({ error: 'Talep bulunamadı.' });
  res.status(204).end();
});

app.post('/api/admin/reset', (_req, res) => res.json(resetStore()));

app.use(express.static(path.join(root, 'dist')));
app.get('/{*splat}', (_req, res) => res.sendFile(path.join(root, 'dist', 'index.html')));

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Beklenmeyen bir sunucu hatası oluştu.' });
});

const httpServer = app.listen(port, host, () => {
  console.log(`Başkent Class API http://${host}:${port} adresinde çalışıyor.`);
});

let shuttingDown = false;
const shutdown = (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} alındı, sunucu güvenli biçimde kapatılıyor.`);
  httpServer.close(() => {
    closeStore();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
