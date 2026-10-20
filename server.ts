import 'dotenv/config'; // loads .env on Hostinger / VPS / local (Vercel uses its own Environment Variables)
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import compression from 'compression';
import { fileURLToPath, pathToFileURL } from 'url';
import {
  generateSeoDataForRoute,
  injectSeoIntoHtml,
  generateXmlSitemap,
  generateRobotsTxt,
  runSeoAudit,
  autoFixMissingSeo,
} from './src/utils/seoEngine';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_BLOG_POSTS,
  INITIAL_SETTINGS,
  INITIAL_ORDERS,
} from './src/data/initialData';
import { Product, Category, BlogPost, StoreSettings, Order } from './src/types';
import { getEffectiveAccess, AccessAreaId } from './src/utils/permissions';
import {
  initDataStore,
  readData,
  writeData,
  refreshIfStale,
  flushWrites,
  storageBackendName,
  storageError,
  filesInDatabase,
  saveFileToDb,
  loadFileFromDb,
} from './serverlib/dataStore';
import {
  isEmailConfigured,
  isWhatsAppConfigured,
  isRecaptchaConfigured,
  sendOtpEmail,
  sendOtpWhatsApp,
  verifyRecaptcha,
} from './serverlib/messaging';

const __filename = fileURLToPath(import.meta.url);
// When running from the bundled file (dist-api/server.mjs on Vercel / Hostinger) the project root is one level up
const __here = path.dirname(__filename);
const __dirname = path.basename(__here) === 'dist-api' ? path.dirname(__here) : __here;

const app = express();
const PORT = process.env.PORT || 3000;
const SITE_URL = (process.env.SITE_URL || 'https://plushcomfort.uk').replace(/\/+$/, '');
// The bundled build (dist-api/server.mjs) always runs in production mode, even if NODE_ENV is not set
const IS_PRODUCTION = process.env.NODE_ENV === 'production' || path.basename(__here) === 'dist-api';

app.set('trust proxy', true);
// NOINDEX=true → keep this copy (e.g. a subdomain) out of Google
if (process.env.NOINDEX === 'true') {
  app.use((_req, res, next) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    next();
  });
}
app.use(compression());
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Storage locations (serverless platforms only allow writing to /tmp)
const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : process.env.VERCEL
  ? path.resolve('/tmp', 'plush_comfort_data')
  : path.resolve(__dirname, 'data');
const UPLOADS_DIR = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : process.env.VERCEL
  ? path.resolve('/tmp', 'plush_comfort_uploads')
  : path.resolve(__dirname, 'public', 'uploads');

try {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
} catch (dirErr) {
  console.warn('Directory creation warning:', dirErr);
}

const dataReady = initDataStore(DATA_DIR);

// Every request waits for the store to be loaded and refreshes the database cache.
// Requests that change data always read the very latest copy first (several serverless
// instances may be running), and the response is only sent once all writes are saved —
// otherwise Vercel can freeze the function before the database write finishes.
app.use(async (req, res, next) => {
  try {
    await dataReady;
    await refreshIfStale(req.method !== 'GET' && req.method !== 'HEAD');
  } catch {}
  const originalEnd = res.end.bind(res) as (...a: any[]) => any;
  (res as any).end = (...args: any[]) => {
    flushWrites()
      .catch(() => {})
      .finally(() => originalEnd(...args));
    return res;
  };
  next();
});

// Data keys (file name in /data or row key in MySQL table pc_store)
const K = {
  USERS: 'admin_users',
  SESSIONS: 'active_sessions',
  LOGS: 'audit_logs',
  DESIGN: 'store_design',
  PRODUCTS: 'store_products',
  CATEGORIES: 'store_categories',
  BLOGS: 'store_blogs',
  ORDERS: 'store_orders',
  RESET_REQUESTS: 'password_reset_requests',
  OTPS: 'otp_codes',
};

// ==========================================
// TYPES
// ==========================================
type Role = 'master_admin' | 'admin' | 'editor' | 'marketer';

interface StoredUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  passwordHash: string;
  salt: string;
  role: Role;
  permissions: string[];
  createdAt: string;
  createdBy?: string;
  lastLoginAt?: string;
  passwordChangedAt?: string;
  isActive: boolean;
}

interface StoredSession {
  id: string;
  token: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: Role;
  permissions: string[];
  device: string;
  userAgent?: string;
  ip: string;
  method?: string;
  signedInAt: string;
  lastActiveAt: string;
  expiresAt?: string;
}

interface StoredAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  action: string;
  category: string;
  target: string;
  details: string;
  beforeAfter?: Record<string, { before: any; after: any }>;
  ipAddress?: string;
  userAgent?: string;
  subjectUserId?: string; // the account this event is about (for per-account history)
}

interface StoredOtp {
  userId: string;
  purpose: 'login' | 'reset';
  codeHash: string;
  expiresAt: number;
  attempts: number;
  sentAt: number;
  channel: 'email' | 'whatsapp';
}

interface ResetRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  note?: string;
  requestedAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
  resolvedAt?: string;
  resolvedBy?: string;
}

// ==========================================
// HELPERS
// ==========================================
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}
function hashPasswordLegacy(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}
function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}
/** Verifies a password and transparently upgrades legacy 10k-iteration hashes to 100k. */
function verifyPassword(user: StoredUser, password: string): boolean {
  if (safeEqual(hashPassword(password, user.salt), user.passwordHash)) return true;
  if (safeEqual(hashPasswordLegacy(password, user.salt), user.passwordHash)) {
    user.passwordHash = hashPassword(password, user.salt);
    return true;
  }
  return false;
}
function setPassword(user: StoredUser, password: string) {
  user.salt = generateSalt();
  user.passwordHash = hashPassword(password, user.salt);
  user.passwordChangedAt = new Date().toISOString();
}
function passwordProblem(pw: unknown): string | null {
  if (typeof pw !== 'string' || pw.length < 8) return 'Password must be at least 8 characters long.';
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return 'Password must contain letters and numbers.';
  return null;
}
function clientIp(req: Request): string {
  return (req.ip || req.socket.remoteAddress || '127.0.0.1').replace('::ffff:', '');
}
function describeDevice(ua: string): string {
  const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
  const os = /Windows/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Mac OS/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : 'Unknown OS';
  const kind = /Mobile|Android|iPhone/.test(ua) ? 'Mobile' : 'Desktop';
  return `${browser} on ${os} (${kind})`;
}
function publicUser(u: StoredUser) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    phone: u.phone,
    role: u.role,
    permissions: u.permissions,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
    passwordChangedAt: u.passwordChangedAt,
    isActive: u.isActive,
  };
}
function maskEmail(email: string) {
  const [n, d] = email.split('@');
  return `${n.slice(0, 2)}${'*'.repeat(Math.max(1, n.length - 2))}@${d}`;
}
function maskPhone(phone: string) {
  const digits = phone.replace(/[^0-9]/g, '');
  return `•••• ${digits.slice(-3)}`;
}

const getUsers = () => readData<StoredUser[]>(K.USERS, []);
const saveUsers = (u: StoredUser[]) => writeData(K.USERS, u);
const getSessions = () => readData<StoredSession[]>(K.SESSIONS, []);
const saveSessions = (s: StoredSession[]) => writeData(K.SESSIONS, s);

// Rate limiting (in-memory per IP)
const loginRateLimits = new Map<string, { attempts: number; lockedUntil?: number }>();
function checkRateLimit(key: string): { allowed: boolean; message?: string; waitMinutes?: number } {
  const record = loginRateLimits.get(key);
  const now = Date.now();
  if (record?.lockedUntil && record.lockedUntil > now) {
    const waitMinutes = Math.ceil((record.lockedUntil - now) / 60000);
    return {
      allowed: false,
      message: `Temporarily locked after repeated failed attempts. Try again in ${waitMinutes} minute(s).`,
      waitMinutes,
    };
  }
  return { allowed: true };
}
function recordFailure(key: string) {
  const record = loginRateLimits.get(key) || { attempts: 0 };
  record.attempts += 1;
  if (record.attempts >= 5) {
    record.lockedUntil = Date.now() + 15 * 60 * 1000;
    record.attempts = 0;
  }
  loginRateLimits.set(key, record);
}
function resetFailures(key: string) {
  loginRateLimits.delete(key);
}

function recordAuditLog(log: Omit<StoredAuditLog, 'id' | 'timestamp'>): void {
  const logs = readData<StoredAuditLog[]>(K.LOGS, []).slice();
  logs.unshift({
    ...log,
    id: `log-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    timestamp: new Date().toISOString(),
  });
  if (logs.length > 5000) logs.length = 5000;
  writeData(K.LOGS, logs);
}

function createSession(user: StoredUser, req: Request, method: string): StoredSession {
  const ua = String(req.headers['user-agent'] || 'Web Browser');
  const now = new Date();
  const session: StoredSession = {
    id: `sess-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    token: crypto.randomBytes(32).toString('hex'),
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    role: user.role,
    permissions: user.permissions,
    device: describeDevice(ua),
    userAgent: ua,
    ip: clientIp(req),
    method,
    signedInAt: now.toISOString(),
    lastActiveAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
  const sessions = getSessions().filter((s) => !s.expiresAt || new Date(s.expiresAt).getTime() > Date.now());
  sessions.push(session);
  saveSessions(sessions);
  user.lastLoginAt = now.toISOString();
  return session;
}

// ==========================================
// AUTH MIDDLEWARE
// ==========================================
interface AuthenticatedRequest extends Request {
  user?: StoredSession;
}

async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication token required' });

  let sessions = getSessions();
  let idx = sessions.findIndex((s) => s.token === token);
  if (idx === -1) {
    // The session may have been created moments ago on another server instance
    await refreshIfStale(true);
    sessions = getSessions();
    idx = sessions.findIndex((s) => s.token === token);
  }
  if (idx === -1) return res.status(401).json({ error: 'Session expired or invalidated. Please log in again.' });

  const session = sessions[idx];
  if (session.expiresAt && new Date(session.expiresAt).getTime() < Date.now()) {
    saveSessions(sessions.filter((s) => s.token !== token));
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }

  // Always use the latest role / access from the user record (owner may have changed it)
  const user = getUsers().find((u) => u.id === session.userId);
  if (!user || !user.isActive) {
    saveSessions(sessions.filter((s) => s.userId !== session.userId));
    return res.status(401).json({ error: 'This account has been disabled.' });
  }
  const updated = { ...session, role: user.role, permissions: user.permissions, userName: user.name, lastActiveAt: new Date().toISOString() };
  // Only persist lastActive at most once a minute to avoid write storms
  if (Date.now() - new Date(session.lastActiveAt).getTime() > 60_000) {
    const copy = sessions.slice();
    copy[idx] = updated;
    saveSessions(copy);
  }
  req.user = updated;
  next();
}

function requireMaster(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.user?.role === 'master_admin') return next();
  return res.status(403).json({ error: 'Only the Master Admin (owner) can do this.' });
}

function requireAccess(...areas: AccessAreaId[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const access = getEffectiveAccess({ role: req.user.role, permissions: req.user.permissions });
    if (areas.some((a) => access.includes(a))) return next();
    return res.status(403).json({ error: 'Your account does not have access to this area. Ask the owner to grant access.' });
  };
}

function actor(req: AuthenticatedRequest) {
  const u = req.user!;
  return { userId: u.userId, userName: u.userName, userEmail: u.userEmail, userRole: u.role, ipAddress: u.ip };
}

// ==========================================
// AUTH ROUTES
// ==========================================

// Public runtime config for the login screen (no secrets)
app.get('/api/auth/config', (_req, res) => {
  res.json({
    recaptchaSiteKey: isRecaptchaConfigured() ? process.env.RECAPTCHA_SITE_KEY : null,
    otpEmailEnabled: isEmailConfigured() || !IS_PRODUCTION,
    otpWhatsappEnabled: isWhatsAppConfigured(),
    emailConfigured: isEmailConfigured(),
    storage: storageBackendName(),
  });
});

app.get('/api/auth/status', async (req: Request, res: Response) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (token && !getSessions().some((s) => s.token === token)) await refreshIfStale(true);
  const users = getUsers();
  const session = token ? getSessions().find((s) => s.token === token) : undefined;
  const user = session ? users.find((u) => u.id === session.userId && u.isActive) : undefined;
  res.json({
    initialized: users.some((u) => u.role === 'master_admin'),
    authenticated: Boolean(session && user),
    user: user ? publicUser(user) : null,
  });
});

// One-time owner setup
app.post('/api/auth/init-master', (req: Request, res: Response) => {
  const users = getUsers().slice();
  if (users.some((u) => u.role === 'master_admin')) {
    return res.status(403).json({ error: 'Master Admin has already been set up. Setup is permanently locked.' });
  }
  const { email, name, password, phone } = req.body || {};
  if (!email || !name) return res.status(400).json({ error: 'Full name and email are required.' });
  const pwErr = passwordProblem(password);
  if (pwErr) return res.status(400).json({ error: pwErr });

  const master: StoredUser = {
    id: `usr-master-${Date.now()}`,
    email: String(email).trim().toLowerCase(),
    name: String(name).trim(),
    phone: phone ? String(phone).trim() : undefined,
    passwordHash: '',
    salt: '',
    role: 'master_admin',
    permissions: ['all'],
    createdAt: new Date().toISOString(),
    isActive: true,
  };
  setPassword(master, password);
  users.push(master);
  const session = createSession(master, req, 'initial setup');
  saveUsers(users);

  recordAuditLog({
    userId: master.id,
    userName: master.name,
    userEmail: master.email,
    userRole: 'master_admin',
    action: 'MASTER_ACCOUNT_CREATED',
    category: 'security',
    target: master.email,
    details: `Owner (Master Admin) account created and password set for ${master.email}.`,
    ipAddress: session.ip,
    userAgent: session.userAgent,
    subjectUserId: master.id,
  });

  res.json({ success: true, token: session.token, user: publicUser(master) });
});

// Password login (Staff tab or Master tab)
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const ip = clientIp(req);
  const ua = String(req.headers['user-agent'] || '');
  const rate = checkRateLimit(ip);
  if (!rate.allowed) return res.status(429).json({ error: rate.message, waitMinutes: rate.waitMinutes });

  const { email, password, loginType, recaptchaToken } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  if (loginType === 'staff' && !(await verifyRecaptcha(recaptchaToken, ip))) {
    return res.status(400).json({ error: 'reCAPTCHA verification failed. Please tick "I\'m not a robot" again.' });
  }

  const users = getUsers().slice();
  const user = users.find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase());

  const fail = (reason: string) => {
    recordFailure(ip);
    recordAuditLog({
      userId: user?.id || 'unknown',
      userName: user?.name || 'Unknown',
      userEmail: String(email).trim().toLowerCase(),
      userRole: user?.role || 'unknown',
      action: 'LOGIN_FAILED',
      category: 'security',
      target: String(email).trim().toLowerCase(),
      details: `Failed ${loginType === 'master' ? 'master' : 'staff'} sign-in attempt (${reason}).`,
      ipAddress: ip,
      userAgent: ua,
      subjectUserId: user?.id,
    });
    return res.status(401).json({ error: 'Invalid email or password.' });
  };

  if (!user) return fail('unknown email');
  if (!user.isActive) return fail('account disabled');
  if (!verifyPassword(user, String(password))) return fail('wrong password');
  if (loginType === 'master' && user.role !== 'master_admin') return fail('staff account used on Master tab');
  if (loginType === 'staff' && user.role === 'master_admin') {
    return res.status(400).json({ error: 'This is the owner account — please use the "Master Login" tab.' });
  }

  resetFailures(ip);
  const session = createSession(user, req, 'password');
  saveUsers(users);

  recordAuditLog({
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    userRole: user.role,
    action: 'LOGIN',
    category: 'auth',
    target: 'Admin Session',
    details: `${user.name} signed in with password on ${session.device} (IP ${ip}).`,
    ipAddress: ip,
    userAgent: ua,
    subjectUserId: user.id,
  });

  res.json({ success: true, token: session.token, user: publicUser(user) });
});

// ---------- One-time codes (OTP) for the OWNER: "Login with code" and "Forgot password" ----------
const OTP_TTL_MS = 10 * 60 * 1000;

function findMasterByIdentifier(identifier: string): StoredUser | undefined {
  const id = String(identifier || '').trim().toLowerCase();
  const digits = id.replace(/[^0-9]/g, '');
  return getUsers().find(
    (u) =>
      u.role === 'master_admin' &&
      u.isActive &&
      (u.email.toLowerCase() === id || (digits.length >= 7 && u.phone && u.phone.replace(/[^0-9]/g, '').endsWith(digits.slice(-10))))
  );
}

app.post('/api/auth/otp/request', async (req: Request, res: Response) => {
  const ip = clientIp(req);
  const rate = checkRateLimit(`otp:${ip}`);
  if (!rate.allowed) return res.status(429).json({ error: rate.message });

  const { identifier, purpose = 'login', channel = 'email' } = req.body || {};
  if (!['login', 'reset'].includes(purpose)) return res.status(400).json({ error: 'Invalid request.' });
  const user = findMasterByIdentifier(identifier);

  // Always answer the same way so nobody can discover which emails exist
  const generic = {
    success: true,
    message: 'If this is the owner account, a 6-digit code has been sent. It expires in 10 minutes.',
  } as any;
  if (!user) {
    recordFailure(`otp:${ip}`);
    return res.json(generic);
  }

  const otps = readData<Record<string, StoredOtp>>(K.OTPS, {});
  const existing = otps[`${user.id}:${purpose}`];
  if (existing && Date.now() - existing.sentAt < 60_000) {
    return res.status(429).json({ error: 'Please wait a minute before requesting another code.' });
  }

  const code = String(crypto.randomInt(100000, 1000000));
  const useWhatsApp = channel === 'whatsapp';
  try {
    if (useWhatsApp) {
      if (!user.phone) return res.status(400).json({ error: 'No WhatsApp number is saved on the owner account. Add it under My Account first.' });
      await sendOtpWhatsApp(user.phone, code);
      generic.sentTo = maskPhone(user.phone);
    } else if (isEmailConfigured()) {
      await sendOtpEmail(user.email, code, purpose);
      generic.sentTo = maskEmail(user.email);
    } else if (!IS_PRODUCTION) {
      // Development only: no SMTP configured — print the code in the server console
      console.log(`\n[DEV OTP] ${purpose} code for ${user.email}: ${code}\n`);
      generic.devNotice = 'SMTP is not configured — in development the code is printed in the server console.';
    } else {
      return res.status(503).json({ error: 'Email sending is not configured on the server yet (see SMTP settings in the README).' });
    }
  } catch (err: any) {
    console.error('[otp] send failed:', err);
    return res.status(502).json({ error: `Could not send the code: ${err.message || 'messaging error'}` });
  }

  otps[`${user.id}:${purpose}`] = {
    userId: user.id,
    purpose,
    codeHash: crypto.createHash('sha256').update(code).digest('hex'),
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
    sentAt: Date.now(),
    channel: useWhatsApp ? 'whatsapp' : 'email',
  };
  writeData(K.OTPS, { ...otps });

  recordAuditLog({
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    userRole: user.role,
    action: purpose === 'login' ? 'LOGIN_CODE_SENT' : 'RESET_CODE_SENT',
    category: 'security',
    target: user.email,
    details: `${purpose === 'login' ? 'Sign-in' : 'Password reset'} code sent by ${useWhatsApp ? 'WhatsApp' : 'email'}.`,
    ipAddress: ip,
    subjectUserId: user.id,
  });
  res.json(generic);
});

function consumeOtp(user: StoredUser, purpose: 'login' | 'reset', code: string): string | null {
  const otps = { ...readData<Record<string, StoredOtp>>(K.OTPS, {}) };
  const key = `${user.id}:${purpose}`;
  const rec = otps[key];
  if (!rec || rec.expiresAt < Date.now()) return 'The code has expired. Please request a new one.';
  if (rec.attempts >= 5) {
    delete otps[key];
    writeData(K.OTPS, otps);
    return 'Too many wrong attempts. Please request a new code.';
  }
  const ok = safeEqual(crypto.createHash('sha256').update(String(code).trim()).digest('hex'), rec.codeHash);
  if (!ok) {
    otps[key] = { ...rec, attempts: rec.attempts + 1 };
    writeData(K.OTPS, otps);
    return 'Incorrect code.';
  }
  delete otps[key];
  writeData(K.OTPS, otps);
  return null;
}

app.post('/api/auth/otp/login', (req: Request, res: Response) => {
  const ip = clientIp(req);
  const { identifier, code } = req.body || {};
  const users = getUsers().slice();
  const found = findMasterByIdentifier(identifier);
  const user = found && users.find((u) => u.id === found.id);
  if (!user) return res.status(401).json({ error: 'Incorrect or expired code.' });
  const err = consumeOtp(user, 'login', code);
  if (err) {
    recordAuditLog({
      userId: user.id, userName: user.name, userEmail: user.email, userRole: user.role,
      action: 'LOGIN_FAILED', category: 'security', target: user.email,
      details: `Failed sign-in with code (${err})`, ipAddress: ip, subjectUserId: user.id,
    });
    return res.status(401).json({ error: err });
  }
  const session = createSession(user, req, 'one-time code');
  saveUsers(users);
  recordAuditLog({
    userId: user.id, userName: user.name, userEmail: user.email, userRole: user.role,
    action: 'LOGIN', category: 'auth', target: 'Admin Session',
    details: `${user.name} signed in with a one-time code on ${session.device} (IP ${ip}).`,
    ipAddress: ip, userAgent: session.userAgent, subjectUserId: user.id,
  });
  res.json({ success: true, token: session.token, user: publicUser(user) });
});

app.post('/api/auth/otp/reset-password', (req: Request, res: Response) => {
  const ip = clientIp(req);
  const { identifier, code, newPassword } = req.body || {};
  const pwErr = passwordProblem(newPassword);
  if (pwErr) return res.status(400).json({ error: pwErr });
  const users = getUsers().slice();
  const found = findMasterByIdentifier(identifier);
  const user = found && users.find((u) => u.id === found.id);
  if (!user) return res.status(401).json({ error: 'Incorrect or expired code.' });
  const err = consumeOtp(user, 'reset', code);
  if (err) return res.status(401).json({ error: err });

  setPassword(user, newPassword);
  saveUsers(users);
  saveSessions(getSessions().filter((s) => s.userId !== user.id)); // sign out everywhere
  recordAuditLog({
    userId: user.id, userName: user.name, userEmail: user.email, userRole: user.role,
    action: 'PASSWORD_CHANGED', category: 'security', target: user.email,
    details: 'Owner password reset with a one-time code. All sessions were signed out.',
    ipAddress: ip, subjectUserId: user.id,
  });
  res.json({ success: true, message: 'Password updated. Please sign in with your new password.' });
});

// ---------- Staff "forgot password" -> request to owner ----------
app.post('/api/auth/password-reset-request', (req: Request, res: Response) => {
  const ip = clientIp(req);
  const rate = checkRateLimit(`reset:${ip}`);
  if (!rate.allowed) return res.status(429).json({ error: rate.message });
  recordFailure(`reset:${ip}`); // max 5 requests per 15 minutes per IP

  const { email, note } = req.body || {};
  const user = getUsers().find((u) => u.email.toLowerCase() === String(email || '').trim().toLowerCase());
  if (user && user.role !== 'master_admin') {
    const list = readData<ResetRequest[]>(K.RESET_REQUESTS, []).slice();
    if (!list.some((r) => r.userId === user.id && r.status === 'pending')) {
      list.unshift({
        id: `rr-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        note: note ? String(note).slice(0, 300) : undefined,
        requestedAt: new Date().toISOString(),
        status: 'pending',
      });
      writeData(K.RESET_REQUESTS, list.slice(0, 200));
      recordAuditLog({
        userId: user.id, userName: user.name, userEmail: user.email, userRole: user.role,
        action: 'PASSWORD_RESET_REQUESTED', category: 'security', target: user.email,
        details: `${user.name} asked the owner for a password reset.`, ipAddress: ip, subjectUserId: user.id,
      });
    }
  }
  res.json({ success: true, message: 'Your request has been sent to the store owner. They will set a new password for you.' });
});

app.get('/api/auth/password-reset-requests', authenticateToken, requireMaster, (_req, res) => {
  res.json({ requests: readData<ResetRequest[]>(K.RESET_REQUESTS, []) });
});

app.put('/api/auth/password-reset-requests/:id', authenticateToken, requireMaster, (req: AuthenticatedRequest, res: Response) => {
  const list = readData<ResetRequest[]>(K.RESET_REQUESTS, []).slice();
  const idx = list.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Request not found.' });
  list[idx] = {
    ...list[idx],
    status: req.body?.status === 'dismissed' ? 'dismissed' : 'resolved',
    resolvedAt: new Date().toISOString(),
    resolvedBy: req.user!.userName,
  };
  writeData(K.RESET_REQUESTS, list);
  res.json({ success: true });
});

// ---------- Sessions ----------
app.post('/api/auth/logout', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const token = req.headers['authorization']?.split(' ')[1];
  saveSessions(getSessions().filter((s) => s.token !== token));
  recordAuditLog({
    ...actor(req),
    action: 'LOGOUT', category: 'auth', target: 'Admin Session',
    details: `${req.user!.userName} signed out (${req.user!.device}).`, subjectUserId: req.user!.userId,
  });
  res.json({ success: true, message: 'Logged out successfully.' });
});

app.post('/api/auth/logout-other-devices', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const token = req.headers['authorization']?.split(' ')[1];
  const sessions = getSessions();
  const remaining = sessions.filter((s) => s.userId !== req.user!.userId || s.token === token);
  const removed = sessions.length - remaining.length;
  saveSessions(remaining);
  recordAuditLog({
    ...actor(req),
    action: 'LOGOUT_OTHER_DEVICES', category: 'auth', target: 'Active Sessions',
    details: `${req.user!.userName} signed out ${removed} other device(s).`, subjectUserId: req.user!.userId,
  });
  res.json({ success: true, message: `Successfully logged out ${removed} other device(s).`, revokedCount: removed });
});

const sessionView = (s: StoredSession, currentToken?: string) => ({
  id: s.id,
  userId: s.userId,
  userName: s.userName,
  userEmail: s.userEmail,
  role: s.role,
  device: s.device,
  ip: s.ip,
  method: s.method,
  signedInAt: s.signedInAt,
  lastActiveAt: s.lastActiveAt,
  isCurrent: s.token === currentToken,
});

app.get('/api/auth/active-sessions', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const token = req.headers['authorization']?.split(' ')[1];
  const all = req.query.all === '1' && req.user!.role === 'master_admin';
  const sessions = getSessions().filter((s) => all || s.userId === req.user!.userId);
  res.json({ sessions: sessions.map((s) => sessionView(s, token)) });
});

app.delete('/api/auth/sessions/:sessionId', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const isMaster = req.user!.role === 'master_admin';
  const sessions = getSessions();
  const target = sessions.find((s) => s.id === req.params.sessionId);
  if (!target || (!isMaster && target.userId !== req.user!.userId)) {
    return res.status(404).json({ error: 'Session not found.' });
  }
  saveSessions(sessions.filter((s) => s.id !== target.id));
  recordAuditLog({
    ...actor(req),
    action: 'SESSION_REVOKED', category: 'security', target: target.userEmail,
    details: `${req.user!.userName} signed out ${target.userName}'s session on ${target.device}.`,
    subjectUserId: target.userId,
  });
  res.json({ success: true, message: 'Session revoked.' });
});

// ---------- My account ----------
app.put('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const users = getUsers().slice();
  const user = users.find((u) => u.id === req.user!.userId);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const { name, phone } = req.body || {};
  if (name) user.name = String(name).trim();
  if (phone !== undefined) user.phone = String(phone).trim() || undefined;
  saveUsers(users);
  recordAuditLog({
    ...actor(req),
    action: 'PROFILE_UPDATED', category: 'users', target: user.email,
    details: `${user.name} updated their name / WhatsApp number.`, subjectUserId: user.id,
  });
  res.json({ success: true, user: publicUser(user) });
});

app.put('/api/auth/me/password', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const users = getUsers().slice();
  const user = users.find((u) => u.id === req.user!.userId);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  // Staff passwords are managed by the owner only
  if (user.role !== 'master_admin') {
    return res.status(403).json({ error: 'Staff passwords are managed by the owner. Use "Request password change".' });
  }
  const { currentPassword, newPassword } = req.body || {};
  if (!verifyPassword(user, String(currentPassword || ''))) return res.status(401).json({ error: 'Current password is incorrect.' });
  const pwErr = passwordProblem(newPassword);
  if (pwErr) return res.status(400).json({ error: pwErr });
  setPassword(user, newPassword);
  saveUsers(users);
  recordAuditLog({
    ...actor(req),
    action: 'PASSWORD_CHANGED', category: 'security', target: user.email,
    details: `${user.name} changed their own password.`, subjectUserId: user.id,
  });
  res.json({ success: true });
});

// ---------- Staff accounts (Master only) ----------
app.get('/api/auth/users', authenticateToken, requireMaster, (_req, res) => {
  res.json({ users: getUsers().map(publicUser) });
});

app.post('/api/auth/users', authenticateToken, requireMaster, (req: AuthenticatedRequest, res: Response) => {
  const { email, name, password, role, permissions, phone } = req.body || {};
  if (!email || !name || !role) return res.status(400).json({ error: 'Email, name and role are required.' });
  if (!['admin', 'editor', 'marketer'].includes(role)) return res.status(400).json({ error: 'Role must be admin, editor or marketer.' });
  const pwErr = passwordProblem(password);
  if (pwErr) return res.status(400).json({ error: pwErr });

  const users = getUsers().slice();
  if (users.some((u) => u.email.toLowerCase() === String(email).trim().toLowerCase())) {
    return res.status(400).json({ error: 'A user with this email address already exists.' });
  }
  const newUser: StoredUser = {
    id: `usr-${Date.now()}`,
    email: String(email).trim().toLowerCase(),
    name: String(name).trim(),
    phone: phone ? String(phone).trim() : undefined,
    passwordHash: '',
    salt: '',
    role,
    permissions: Array.isArray(permissions) && permissions.length ? permissions : [role],
    createdAt: new Date().toISOString(),
    createdBy: req.user!.userName,
    isActive: true,
  };
  setPassword(newUser, password);
  users.push(newUser);
  saveUsers(users);

  recordAuditLog({
    ...actor(req),
    action: 'USER_CREATED', category: 'users', target: newUser.email,
    details: `Owner created staff account ${newUser.name} (${newUser.role}) and set the initial password. Access: ${getEffectiveAccess(newUser).join(', ')}.`,
    subjectUserId: newUser.id,
  });
  res.json({ success: true, user: publicUser(newUser) });
});

app.put('/api/auth/users/:id', authenticateToken, requireMaster, (req: AuthenticatedRequest, res: Response) => {
  const users = getUsers().slice();
  const target = users.find((u) => u.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'User not found.' });
  if (target.role === 'master_admin' && target.id !== req.user!.userId) {
    return res.status(403).json({ error: 'Cannot modify another Master Admin account.' });
  }
  const { name, role, permissions, isActive, password, phone } = req.body || {};
  const changes: string[] = [];
  if (name && name !== target.name) { changes.push(`name → ${name}`); target.name = String(name).trim(); }
  if (phone !== undefined && phone !== target.phone) { changes.push('WhatsApp number'); target.phone = String(phone).trim() || undefined; }
  if (role && target.role !== 'master_admin' && role !== target.role) { changes.push(`role ${target.role} → ${role}`); target.role = role; }
  if (Array.isArray(permissions) && target.role !== 'master_admin') { changes.push('access areas'); target.permissions = permissions; }
  if (typeof isActive === 'boolean' && target.role !== 'master_admin' && isActive !== target.isActive) {
    changes.push(isActive ? 'enabled' : 'disabled');
    target.isActive = isActive;
    if (!isActive) saveSessions(getSessions().filter((s) => s.userId !== target.id));
  }
  saveUsers(users);

  if (password) {
    const pwErr = passwordProblem(password);
    if (pwErr) return res.status(400).json({ error: pwErr });
    setPassword(target, password);
    saveUsers(users);
    // force the staff member to sign in again with the new password
    saveSessions(getSessions().filter((s) => s.userId !== target.id || target.id === req.user!.userId));
    recordAuditLog({
      ...actor(req),
      action: 'PASSWORD_CHANGED', category: 'security', target: target.email,
      details: `Owner set a new password for ${target.name}. Their other sessions were signed out.`,
      subjectUserId: target.id,
    });
    // Close any pending reset request for this user
    const rr = readData<ResetRequest[]>(K.RESET_REQUESTS, []).map((r) =>
      r.userId === target.id && r.status === 'pending'
        ? { ...r, status: 'resolved' as const, resolvedAt: new Date().toISOString(), resolvedBy: req.user!.userName }
        : r
    );
    writeData(K.RESET_REQUESTS, rr);
  }

  if (changes.length) {
    recordAuditLog({
      ...actor(req),
      action: 'USER_UPDATED', category: 'users', target: target.email,
      details: `Owner updated ${target.name}: ${changes.join(', ')}.`, subjectUserId: target.id,
    });
  }
  res.json({ success: true, message: 'User updated successfully.', user: publicUser(target) });
});

app.delete('/api/auth/users/:id', authenticateToken, requireMaster, (req: AuthenticatedRequest, res: Response) => {
  const users = getUsers();
  const target = users.find((u) => u.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'User not found.' });
  if (target.role === 'master_admin') return res.status(403).json({ error: 'Cannot delete the Master Admin account.' });
  saveUsers(users.filter((u) => u.id !== target.id));
  saveSessions(getSessions().filter((s) => s.userId !== target.id));
  recordAuditLog({
    ...actor(req),
    action: 'USER_DELETED', category: 'users', target: target.email,
    details: `Owner deleted staff account ${target.name} (${target.role}).`, subjectUserId: target.id,
  });
  res.json({ success: true, message: 'User deleted successfully.' });
});

// Account history: everything that happened to / was done by one account
app.get('/api/auth/users/:id/history', authenticateToken, requireMaster, (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const logs = readData<StoredAuditLog[]>(K.LOGS, []).filter((l) => l.subjectUserId === id || l.userId === id);
  const sessions = getSessions().filter((s) => s.userId === id).map((s) => sessionView(s));
  res.json({ logs: logs.slice(0, 300), sessions });
});

// ==========================================
// AUDIT / ACTIVITY LOGS
// ==========================================
app.get('/api/audit-logs', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const access = getEffectiveAccess({ role: req.user!.role, permissions: req.user!.permissions });
  const canSeeAll = req.user!.role === 'master_admin' || access.includes('audit');
  let logs = readData<StoredAuditLog[]>(K.LOGS, []);

  // Staff can only see their own activity unless they have "audit" access.
  // Security events (passwords, failed logins) are owner-only.
  if (!canSeeAll || req.query.mine === '1') logs = logs.filter((l) => l.userId === req.user!.userId);
  if (req.user!.role !== 'master_admin') logs = logs.filter((l) => l.category !== 'security' || l.userId === req.user!.userId);

  const { page = '1', limit = '20', search, category, action, scope } = req.query as Record<string, string>;
  if (category && category !== 'all') logs = logs.filter((l) => l.category === category);
  if (action && action !== 'all') logs = logs.filter((l) => l.action === action);
  if (scope === 'store') logs = logs.filter((l) => ['products', 'categories', 'design', 'settings', 'content', 'orders'].includes(l.category));
  if (scope === 'technical') logs = logs.filter((l) => ['auth', 'security', 'users', 'system'].includes(l.category));
  if (search) {
    const q = search.toLowerCase();
    logs = logs.filter((l) =>
      [l.target, l.details, l.userName, l.userEmail, l.action].some((v) => (v || '').toLowerCase().includes(q))
    );
  }
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(500, Math.max(1, parseInt(limit, 10) || 20));
  res.json({
    logs: logs.slice((pageNum - 1) * limitNum, pageNum * limitNum),
    total: logs.length,
    page: pageNum,
    totalPages: Math.max(1, Math.ceil(logs.length / limitNum)),
  });
});

app.get('/api/audit-logs/export', authenticateToken, requireAccess('audit'), (_req, res) => {
  const logs = readData<StoredAuditLog[]>(K.LOGS, []);
  const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const header = ['Timestamp', 'User', 'Email', 'Role', 'Category', 'Action', 'Target', 'Details', 'IP Address'];
  const rows = logs.map((l) => [l.timestamp, l.userName, l.userEmail, l.userRole, l.category, l.action, l.target, l.details, l.ipAddress].map(esc));
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="plush-comfort-audit-logs-${Date.now()}.csv"`);
  res.send([header.join(','), ...rows.map((r) => r.join(','))].join('\n'));
});

app.post('/api/audit-logs', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { action, category, target, details, beforeAfter } = req.body || {};
  if (!action || !category || !target || !details) {
    return res.status(400).json({ error: 'Action, category, target, and details are required.' });
  }
  if (category === 'security') return res.status(400).json({ error: 'Security events are recorded by the server only.' });
  recordAuditLog({ ...actor(req), action, category, target, details, beforeAfter, userAgent: String(req.headers['user-agent'] || '') });
  res.json({ success: true });
});

// ==========================================
// MEDIA UPLOAD (images are compressed to WebP in the browser before upload)
// ==========================================
app.post('/api/upload', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { data, filename, alt } = req.body || {};
  if (!data || !filename) return res.status(400).json({ error: 'Base64 data and filename are required.' });

  const matches = String(data).match(/^data:(image|video)\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!matches) return res.status(400).json({ error: 'Invalid file data format.' });
  const kind = matches[1];
  const allowed = kind === 'image' ? ['webp', 'jpeg', 'jpg', 'png', 'gif', 'svg+xml', 'avif'] : ['mp4', 'webm'];
  if (!allowed.includes(matches[2])) return res.status(400).json({ error: `File type ${matches[2]} is not allowed.` });
  const ext = matches[2].replace('jpeg', 'jpg').replace('svg+xml', 'svg');
  const buffer = Buffer.from(matches[3], 'base64');
  const maxBytes = kind === 'video' ? 20 * 1024 * 1024 : 2 * 1024 * 1024;
  if (buffer.length > maxBytes) return res.status(413).json({ error: `File is too large (max ${maxBytes / 1024 / 1024} MB).` });

  const cleanName = String(filename)
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, '')
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
  const finalFilename = `${cleanName}-${Date.now()}.${ext}`;
  try {
    fs.writeFileSync(path.join(UPLOADS_DIR, finalFilename), buffer);
  } catch (err) {
    if (!filesInDatabase()) return res.status(500).json({ error: 'Could not save the file on the server.' });
  }
  // With a database, uploads are also kept there so they survive on Vercel / serverless
  if (filesInDatabase()) {
    try {
      await saveFileToDb(finalFilename, `${kind}/${matches[2]}`, buffer);
    } catch (err: any) {
      console.error('[upload] database save failed:', err);
      return res.status(500).json({ error: 'Could not save the file in the database.' });
    }
  }

  recordAuditLog({
    ...actor(req),
    action: kind === 'video' ? 'VIDEO_UPLOAD' : 'IMAGE_UPLOAD',
    category: 'design',
    target: finalFilename,
    details: `Uploaded ${finalFilename} (${Math.round(buffer.length / 1024)} KB)${alt ? ` — alt: "${alt}"` : ''}`,
  });
  res.json({ success: true, url: `/uploads/${finalFilename}`, filename: finalFilename, size: buffer.length, alt: alt || '' });
});

// ==========================================
// STORE DATA (design, products, categories, blogs, orders)
// ==========================================
function summarise(prevList: any[] | null, nextList: any[], label: (x: any) => string): string {
  const prev = new Map((prevList || []).map((x) => [x.id, x]));
  const next = new Map(nextList.map((x) => [x.id, x]));
  const added = nextList.filter((x) => !prev.has(x.id)).map(label);
  const removed = (prevList || []).filter((x) => !next.has(x.id)).map(label);
  const changed = nextList.filter((x) => prev.has(x.id) && JSON.stringify(prev.get(x.id)) !== JSON.stringify(x)).map(label);
  const parts: string[] = [];
  if (added.length) parts.push(`added ${added.slice(0, 5).join(', ')}`);
  if (changed.length) parts.push(`updated ${changed.slice(0, 5).join(', ')}${changed.length > 5 ? ` +${changed.length - 5} more` : ''}`);
  if (removed.length) parts.push(`deleted ${removed.slice(0, 5).join(', ')}`);
  return parts.join('; ') || 'no visible changes';
}

app.get('/api/store/design', (_req, res) => {
  res.json({ design: readData(K.DESIGN, null) });
});

app.put('/api/store/design', authenticateToken, requireAccess('design', 'settings'), (req: AuthenticatedRequest, res: Response) => {
  const prev = readData<any>(K.DESIGN, null) || {};
  const next = req.body || {};
  writeData(K.DESIGN, next);
  const changedKeys = Object.keys(next).filter((k) => JSON.stringify(prev[k]) !== JSON.stringify(next[k]));
  recordAuditLog({
    ...actor(req),
    action: 'STORE_DESIGN_UPDATED', category: 'design', target: 'Store Design & Settings',
    details: `${req.user!.userName} updated: ${changedKeys.join(', ') || 'no visible changes'}.`,
  });
  res.json({ success: true, message: 'Store design updated and persisted.' });
});

app.get('/api/store/products', (_req, res) => {
  res.json({ products: readData(K.PRODUCTS, null) });
});

app.post('/api/store/products', authenticateToken, requireAccess('products', 'orders'), (req: AuthenticatedRequest, res: Response) => {
  const { products, changeSummary } = req.body || {};
  if (!Array.isArray(products)) return res.status(400).json({ error: 'Products array required.' });
  const prev = readData<Product[] | null>(K.PRODUCTS, null) || INITIAL_PRODUCTS;
  writeData(K.PRODUCTS, products);
  recordAuditLog({
    ...actor(req),
    action: 'PRODUCTS_SAVED', category: 'products', target: `Catalogue (${products.length} products)`,
    details: changeSummary || `${req.user!.userName}: ${summarise(prev, products, (p) => p.name)}.`,
  });
  res.json({ success: true, message: 'Products persisted.' });
});

app.get('/api/store/categories', (_req, res) => {
  res.json({ categories: readData(K.CATEGORIES, null) });
});

app.post('/api/store/categories', authenticateToken, requireAccess('categories'), (req: AuthenticatedRequest, res: Response) => {
  const { categories, changeSummary } = req.body || {};
  if (!Array.isArray(categories)) return res.status(400).json({ error: 'Categories array required.' });
  const prev = readData<Category[] | null>(K.CATEGORIES, null) || INITIAL_CATEGORIES;
  writeData(K.CATEGORIES, categories);
  recordAuditLog({
    ...actor(req),
    action: 'CATEGORIES_SAVED', category: 'categories', target: `Categories (${categories.length})`,
    details: changeSummary || `${req.user!.userName}: ${summarise(prev, categories, (c) => c.name)}.`,
  });
  res.json({ success: true, message: 'Categories persisted.' });
});

app.get('/api/store/blogs', (_req, res) => {
  res.json({ blogs: readData(K.BLOGS, null) });
});

app.post('/api/store/blogs', authenticateToken, requireAccess('content'), (req: AuthenticatedRequest, res: Response) => {
  const { blogs, changeSummary } = req.body || {};
  if (!Array.isArray(blogs)) return res.status(400).json({ error: 'Blogs array required.' });
  const prev = readData<BlogPost[] | null>(K.BLOGS, null) || INITIAL_BLOG_POSTS;
  writeData(K.BLOGS, blogs);
  recordAuditLog({
    ...actor(req),
    action: 'CONTENT_SAVED', category: 'content', target: `Blogs & Guides (${blogs.length})`,
    details: changeSummary || `${req.user!.userName}: ${summarise(prev, blogs, (b) => b.title)}.`,
  });
  res.json({ success: true });
});

// ---------- Orders ----------
function getOrders(): Order[] {
  return readData<Order[] | null>(K.ORDERS, null) || INITIAL_ORDERS;
}

// Customers place orders here (no login). Prices are re-calculated on the server.
app.post('/api/orders', (req: Request, res: Response) => {
  const ip = clientIp(req);
  const rate = checkRateLimit(`order:${ip}`);
  if (!rate.allowed) return res.status(429).json({ error: rate.message });

  const order = req.body?.order as Order | undefined;
  if (!order || !Array.isArray(order.items) || order.items.length === 0 || !order.customer?.email) {
    return res.status(400).json({ error: 'Invalid order.' });
  }
  const products = getCurrentProducts();
  const settings = getCurrentSettings();
  let subtotal = 0;
  if (order.items.some((it: any) => !products.some((x) => x.id === it.productId))) {
    return res.status(400).json({ error: 'One of the products in your basket is no longer available.' });
  }
  const items = order.items.map((it: any) => {
    const p = products.find((x) => x.id === it.productId)!;
    const v = it.variationId ? p.variations?.find((x) => x.id === it.variationId) : undefined;
    const unit = v ? v.salePrice ?? v.price : p.salePrice ?? p.price;
    const qty = Math.max(1, Math.min(20, Number(it.quantity) || 1));
    subtotal += unit * qty;
    return { ...it, name: p.name, sku: v?.sku || p.sku, price: unit, quantity: qty };
  });
  const deliveryFee =
    order.deliveryOption === 'white_glove'
      ? settings.whiteGloveDeliveryFee
      : subtotal >= settings.freeDeliveryThreshold
      ? 0
      : settings.standardDeliveryFee;
  const discountAmount = order.promoCode?.trim().toUpperCase() === 'PLUSH10' ? Math.round(subtotal * 10) / 100 : 0;
  const saved: Order = {
    ...order,
    items,
    subtotal,
    deliveryFee,
    discountAmount,
    total: Math.max(0, subtotal - discountAmount + deliveryFee),
    paymentStatus: order.paymentMethod === 'cod' ? 'pending' : order.paymentStatus,
    createdAt: new Date().toISOString(),
  };
  writeData(K.ORDERS, [saved, ...getOrders().filter((o) => o.id !== saved.id)]);

  // Reduce stock
  const updatedProducts = products.map((p) => {
    const lines = items.filter((i: any) => i.productId === p.id);
    if (!lines.length) return p;
    const qty = lines.reduce((a: number, i: any) => a + i.quantity, 0);
    return {
      ...p,
      stock: Math.max(0, p.stock - qty),
      variations: p.variations?.map((v) => {
        const vq = lines.filter((i: any) => i.variationId === v.id).reduce((a: number, i: any) => a + i.quantity, 0);
        return vq ? { ...v, stock: Math.max(0, v.stock - vq) } : v;
      }),
    };
  });
  writeData(K.PRODUCTS, updatedProducts);

  recordAuditLog({
    userId: 'customer', userName: saved.customer.fullName, userEmail: saved.customer.email, userRole: 'customer',
    action: 'ORDER_PLACED', category: 'orders', target: saved.orderNumber,
    details: `New order ${saved.orderNumber} — £${saved.total.toFixed(2)} (${items.length} line(s), ${saved.paymentMethod.toUpperCase()}).`,
    ipAddress: ip,
  });
  res.json({ success: true, order: saved });
});

app.get('/api/orders', authenticateToken, requireAccess('orders', 'overview'), (req: AuthenticatedRequest, res: Response) => {
  const access = getEffectiveAccess({ role: req.user!.role, permissions: req.user!.permissions });
  const orders = getOrders();
  if (req.user!.role === 'master_admin' || access.includes('orders')) return res.json({ orders });
  // Overview-only staff: totals without customer details
  res.json({ orders: orders.map((o) => ({ ...o, customer: { ...o.customer, email: '', phone: '', addressLine1: '', addressLine2: '' } })) });
});

app.put('/api/orders/:id', authenticateToken, requireAccess('orders'), (req: AuthenticatedRequest, res: Response) => {
  const orders = getOrders().slice();
  const idx = orders.findIndex((o) => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Order not found.' });
  const prev = orders[idx];
  const next = { ...prev, ...req.body, id: prev.id, orderNumber: prev.orderNumber };
  orders[idx] = next;
  writeData(K.ORDERS, orders);
  recordAuditLog({
    ...actor(req),
    action: 'ORDER_UPDATED', category: 'orders', target: prev.orderNumber,
    details: `${req.user!.userName} changed ${prev.orderNumber}: ${prev.fulfilmentStatus} → ${next.fulfilmentStatus}.`,
    beforeAfter: { fulfilmentStatus: { before: prev.fulfilmentStatus, after: next.fulfilmentStatus } },
  });
  res.json({ success: true, order: next });
});

// ==========================================
// SEO DATA RESOLUTION
// ==========================================
function getCurrentProducts(): Product[] {
  const list = readData<Product[] | null>(K.PRODUCTS, null);
  return Array.isArray(list) && list.length ? list : INITIAL_PRODUCTS;
}
function getCurrentCategories(): Category[] {
  const list = readData<Category[] | null>(K.CATEGORIES, null);
  return Array.isArray(list) && list.length ? list : INITIAL_CATEGORIES;
}
function getCurrentBlogPosts(): BlogPost[] {
  const list = readData<BlogPost[] | null>(K.BLOGS, null);
  return Array.isArray(list) && list.length ? list : INITIAL_BLOG_POSTS;
}
function getCurrentSettings(): StoreSettings {
  return { ...INITIAL_SETTINGS, ...(readData<Partial<StoreSettings> | null>(K.DESIGN, null) || {}) };
}

app.get('/sitemap.xml', (_req, res) => {
  try {
    const xml = generateXmlSitemap(getCurrentProducts(), getCurrentCategories(), getCurrentBlogPosts(), SITE_URL);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.status(200).send(xml);
  } catch (err) {
    console.error('Error generating sitemap.xml:', err);
    res.status(500).send('Error generating sitemap');
  }
});

app.get('/robots.txt', (_req, res) => {
  try {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.status(200).send(generateRobotsTxt(SITE_URL, process.env.NOINDEX === 'true'));
  } catch {
    res.status(500).send('User-agent: *\nAllow: /\n');
  }
});

app.get('/api/seo/audit', (_req, res) => {
  try {
    res.json({ success: true, audit: runSeoAudit(getCurrentProducts(), getCurrentCategories(), getCurrentBlogPosts()) });
  } catch {
    res.status(500).json({ error: 'Failed to run SEO audit' });
  }
});

app.post('/api/seo/auto-fix', authenticateToken, requireAccess('products', 'categories'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { updatedProducts, updatedCategories, fixCount } = autoFixMissingSeo(getCurrentProducts(), getCurrentCategories());
    writeData(K.PRODUCTS, updatedProducts);
    writeData(K.CATEGORIES, updatedCategories);
    recordAuditLog({
      ...actor(req),
      action: 'SEO_METADATA_AUTO_FIXED', category: 'settings', target: `Storewide SEO (${fixCount} fields)`,
      details: `${req.user!.userName} auto-generated SEO titles, descriptions and alt texts for ${fixCount} missing fields.`,
    });
    res.json({ success: true, fixCount, message: `Applied SEO fixes to ${fixCount} items.` });
  } catch {
    res.status(500).json({ error: 'Failed to auto-fix SEO fields' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    storage: storageBackendName(),
    databaseError: storageError() || undefined,
    persistent: storageBackendName() !== 'file' || !process.env.VERCEL,
    time: new Date().toISOString(),
  });
});

// ==========================================
// STATIC FILES, VITE (dev) & SERVER-RENDERED SEO HTML
// ==========================================

// Old image links (.jpg / .png / .jpeg) permanently redirect to the new WebP versions
app.get(/^\/(uploads|assets\/brand)\/.+\.(jpe?g|png)$/i, (req, res, next) => {
  const webpPath = req.path.replace(/\.(jpe?g|png)$/i, '.webp');
  const candidates = [
    path.join(UPLOADS_DIR, webpPath.replace(/^\/uploads\//, '')),
    path.resolve(__dirname, 'public', webpPath.slice(1)),
    path.resolve(__dirname, 'dist', webpPath.slice(1)),
  ];
  if (candidates.some((c) => fs.existsSync(c))) return res.redirect(301, webpPath);
  next();
});

// Runtime uploads (served in dev and production)
app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '30d', fallthrough: true }));
// …and from the database when the file is not on this server's disk (Vercel)
app.get('/uploads/:name', async (req, res, next) => {
  try {
    const file = await loadFileFromDb(path.basename(req.params.name));
    if (!file) return next();
    res.setHeader('Content-Type', file.mime);
    res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
    return res.send(file.data);
  } catch {
    return next();
  }
});

async function startServer() {
  await dataReady;
  let vite: any = null;
  if (!IS_PRODUCTION) {
    const { createServer: createViteServer } = await import('vite');
    vite = await createViteServer({ server: { middlewareMode: true }, appType: 'custom' });
    app.use(vite.middlewares);
  } else {
    // Hashed build assets can be cached forever; everything else for a day
    app.use('/assets', express.static(path.resolve(__dirname, 'dist', 'assets'), { maxAge: '1y', immutable: true }));
    app.use(express.static(path.resolve(__dirname, 'dist'), { index: false, redirect: false, maxAge: '1d' }));
  }

  app.get('*', async (req: Request, res: Response, next: NextFunction) => {
    const url = req.originalUrl;
    if (url.startsWith('/api/') || url.startsWith('/@') || path.extname(req.path)) return next();
    try {
      const settings = getCurrentSettings();
      const seoData = generateSeoDataForRoute(req.path, getCurrentProducts(), getCurrentCategories(), getCurrentBlogPosts(), settings);

      // Server-side render the storefront (not the staff dashboard) for fast first paint + SEO
      let ssr: { appHtml: string; bootJson?: string } | undefined;
      if (!req.path.startsWith('/admin') && process.env.DISABLE_SSR !== 'true') {
        try {
          const mod = vite
            ? await vite.ssrLoadModule('/src/entry-server.tsx')
            : await import(pathToFileURL(path.resolve(__dirname, 'dist-server', 'entry-server.js')).href);
          const bootData = {
            products: readData(K.PRODUCTS, null),
            categories: readData(K.CATEGORIES, null),
            blogs: readData(K.BLOGS, null),
            design: readData(K.DESIGN, null),
          };
          const hasLive = Object.values(bootData).some((v) => v);
          ssr = {
            appHtml: await mod.render(req.originalUrl, bootData),
            bootJson: hasLive ? JSON.stringify(bootData) : undefined,
          };
        } catch (ssrErr) {
          console.warn('[ssr] falling back to client rendering for', url, ssrErr);
        }
      }
      let template = '';
      if (vite) {
        template = await vite.transformIndexHtml(url, fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8'));
      } else {
        const distIndex = path.resolve(__dirname, 'dist', 'index.html');
        template = fs.readFileSync(fs.existsSync(distIndex) ? distIndex : path.resolve(__dirname, 'index.html'), 'utf-8');
      }
      res
        .status(seoData.statusCode)
        .setHeader('Content-Type', 'text/html; charset=utf-8')
        .setHeader('Cache-Control', 'no-cache')
        .send(injectSeoIntoHtml(template, seoData, settings, ssr));
    } catch (err: any) {
      console.error('Error rendering SEO HTML for route:', url, err);
      if (vite) vite.ssrFixStacktrace(err);
      res.status(500).send('Server Error rendering page');
    }
  });

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Plush Comfort] Server running on http://0.0.0.0:${PORT} (storage: ${storageBackendName()})`);
  });
}

if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  startServer().catch((err) => console.error('Failed to start server:', err));
}

export { app, startServer };
export default app;
