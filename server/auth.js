import crypto from 'node:crypto';

const SECRET = process.env.AUTH_SECRET || 'baskent-class-dev-secret-change-in-production';
const USERNAME = process.env.ADMIN_USERNAME || 'admin';
const PASSWORD = process.env.ADMIN_PASSWORD || 'class2026';

const encode = (value) => Buffer.from(value).toString('base64url');
const sign = (value) => crypto.createHmac('sha256', SECRET).update(value).digest('base64url');

export function createToken(username) {
  const payload = encode(JSON.stringify({ sub: username, exp: Date.now() + 8 * 60 * 60 * 1000 }));
  return `${payload}.${sign(payload)}`;
}

export function verifyCredentials(username, password) {
  const suppliedUser = Buffer.from(String(username));
  const expectedUser = Buffer.from(USERNAME);
  const suppliedPassword = crypto.scryptSync(String(password), 'bc-admin', 32);
  const expectedPassword = crypto.scryptSync(PASSWORD, 'bc-admin', 32);
  return suppliedUser.length === expectedUser.length
    && crypto.timingSafeEqual(suppliedUser, expectedUser)
    && crypto.timingSafeEqual(suppliedPassword, expectedPassword);
}

export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Oturum gerekli.' });
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return res.status(401).json({ error: 'Geçersiz oturum.' });
  const expected = sign(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) {
    return res.status(401).json({ error: 'Geçersiz oturum.' });
  }
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (data.exp < Date.now()) return res.status(401).json({ error: 'Oturum süresi doldu.' });
    req.user = data.sub;
    next();
  } catch {
    return res.status(401).json({ error: 'Geçersiz oturum.' });
  }
}
