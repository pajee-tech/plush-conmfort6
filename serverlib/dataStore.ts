/**
 * Plush Comfort — persistent data store
 *
 * Three interchangeable back-ends, chosen automatically from DATABASE_URL:
 *
 *  1. PostgreSQL (Neon, Supabase, Vercel Postgres, any Postgres)
 *     DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
 *
 *  2. MySQL / MariaDB (Hostinger, cPanel hosts, Aiven…)
 *     DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE"
 *
 *  3. JSON files (default when DATABASE_URL is empty — only for a server with a permanent disk)
 *
 * Tables are created automatically:
 *   pc_store  (store_key, store_value JSON text)   — users, sessions, products, design, orders…
 *   pc_files  (file_name, mime, data binary)        — uploaded images, so they survive on Vercel
 *
 * Reads are served from an in-memory cache. In database mode the cache is refreshed from the
 * database so several serverless instances always show the same live data.
 */
import fs from 'fs';
import path from 'path';

type Json = any;
type BackendName = 'postgres' | 'mysql' | 'file';

interface Backend {
  name: BackendName;
  loadAll(): Promise<Record<string, Json>>;
  save(key: string, value: Json): Promise<void>;
  saveFile?(name: string, mime: string, data: Buffer): Promise<void>;
  loadFile?(name: string): Promise<{ mime: string; data: Buffer } | null>;
}

const cache = new Map<string, Json>();
let backend: Backend;
let lastRefresh = 0;
const REFRESH_MS = Number(process.env.DB_REFRESH_MS || 3000);
const pending = new Set<Promise<unknown>>();

function wantsSsl(url: string): boolean {
  if (process.env.DATABASE_SSL === 'true') return true;
  if (process.env.DATABASE_SSL === 'false') return false;
  return /sslmode=require|neon\.tech|supabase\.co|aivencloud/i.test(url);
}

// ---------- JSON files ----------
function fileBackend(dir: string): Backend {
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch {}
  return {
    name: 'file',
    async loadAll() {
      const out: Record<string, Json> = {};
      try {
        for (const f of fs.readdirSync(dir)) {
          if (!f.endsWith('.json')) continue;
          try {
            out[f.replace(/\.json$/, '')] = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'));
          } catch (err) {
            console.error(`[dataStore] Could not parse ${f}:`, err);
          }
        }
      } catch {}
      return out;
    },
    async save(key, value) {
      const target = path.join(dir, `${key}.json`);
      const tmp = `${target}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(value, null, 2), 'utf-8');
      fs.renameSync(tmp, target); // atomic replace — no half-written files
    },
  };
}

// ---------- PostgreSQL (Neon) ----------
async function postgresBackend(url: string): Promise<Backend> {
  const pgMod: any = await import('pg');
  const Pool = pgMod.Pool || pgMod.default?.Pool;
  // pg reads sslmode from the URL; we strip it and pass ssl explicitly so it works everywhere
  const cleanUrl = url.replace(/([?&])(sslmode|channel_binding)=[^&]*/g, '$1').replace(/[?&]+$/, '').replace('?&', '?');
  const pool = new Pool({
    connectionString: cleanUrl,
    ssl: wantsSsl(url) ? { rejectUnauthorized: false } : undefined,
    max: process.env.VERCEL ? 3 : 10,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 15_000,
  });
  pool.on('error', (err: any) => console.error('[dataStore] Postgres pool error:', err?.message || err));

  await pool.query(`CREATE TABLE IF NOT EXISTS pc_store (
    store_key   VARCHAR(120) PRIMARY KEY,
    store_value TEXT NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS pc_files (
    file_name  VARCHAR(255) PRIMARY KEY,
    mime       VARCHAR(100) NOT NULL,
    data       BYTEA NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);

  return {
    name: 'postgres',
    async loadAll() {
      const { rows } = await pool.query('SELECT store_key, store_value FROM pc_store');
      const out: Record<string, Json> = {};
      for (const r of rows) {
        try {
          out[r.store_key] = JSON.parse(r.store_value);
        } catch {}
      }
      return out;
    },
    async save(key, value) {
      await pool.query(
        `INSERT INTO pc_store (store_key, store_value, updated_at) VALUES ($1, $2, NOW())
         ON CONFLICT (store_key) DO UPDATE SET store_value = EXCLUDED.store_value, updated_at = NOW()`,
        [key, JSON.stringify(value)]
      );
    },
    async saveFile(name, mime, data) {
      await pool.query(
        `INSERT INTO pc_files (file_name, mime, data) VALUES ($1, $2, $3)
         ON CONFLICT (file_name) DO UPDATE SET mime = EXCLUDED.mime, data = EXCLUDED.data`,
        [name, mime, data]
      );
    },
    async loadFile(name) {
      const { rows } = await pool.query('SELECT mime, data FROM pc_files WHERE file_name = $1', [name]);
      return rows[0] ? { mime: rows[0].mime, data: rows[0].data } : null;
    },
  };
}

// ---------- MySQL / MariaDB (Hostinger) ----------
async function mysqlBackend(url: string): Promise<Backend> {
  const mysql = await import('mysql2/promise');
  const pool = mysql.createPool({
    uri: url,
    waitForConnections: true,
    connectionLimit: process.env.VERCEL ? 3 : 5,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });
  await pool.query(
    `CREATE TABLE IF NOT EXISTS pc_store (
       store_key VARCHAR(120) NOT NULL PRIMARY KEY,
       store_value LONGTEXT NOT NULL,
       updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
     ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await pool.query(
    `CREATE TABLE IF NOT EXISTS pc_files (
       file_name VARCHAR(255) NOT NULL PRIMARY KEY,
       mime VARCHAR(100) NOT NULL,
       data LONGBLOB NOT NULL,
       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
     ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  return {
    name: 'mysql',
    async loadAll() {
      const [rows] = await pool.query('SELECT store_key, store_value FROM pc_store');
      const out: Record<string, Json> = {};
      for (const r of rows as Array<{ store_key: string; store_value: string }>) {
        try {
          out[r.store_key] = JSON.parse(r.store_value);
        } catch {}
      }
      return out;
    },
    async save(key, value) {
      await pool.query(
        'INSERT INTO pc_store (store_key, store_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE store_value = VALUES(store_value)',
        [key, JSON.stringify(value)]
      );
    },
    async saveFile(name, mime, data) {
      await pool.query(
        'INSERT INTO pc_files (file_name, mime, data) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE mime = VALUES(mime), data = VALUES(data)',
        [name, mime, data]
      );
    },
    async loadFile(name) {
      const [rows] = await pool.query('SELECT mime, data FROM pc_files WHERE file_name = ?', [name]);
      const r = (rows as any[])[0];
      return r ? { mime: r.mime, data: r.data } : null;
    },
  };
}

let initPromise: Promise<void> | null = null;
let initError = '';

export function initDataStore(fileDir: string): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const url = (process.env.DATABASE_URL || '').trim();
    const kind = /^postgres(ql)?:\/\//i.test(url) ? 'postgres' : /^mysql:\/\//i.test(url) ? 'mysql' : '';
    if (url && !kind) {
      initError = 'DATABASE_URL must start with postgresql:// (Neon) or mysql:// (Hostinger).';
      console.error('[dataStore] ' + initError);
    }
    if (kind) {
      try {
        backend = kind === 'postgres' ? await postgresBackend(url) : await mysqlBackend(url);
        console.log(`[dataStore] Connected to ${kind} database.`);
        // First run: migrate any existing JSON files into the database so nothing is lost
        const existing = await backend.loadAll();
        if (Object.keys(existing).length === 0) {
          const legacy = await fileBackend(fileDir).loadAll();
          for (const [k, v] of Object.entries(legacy)) await backend.save(k, v);
          if (Object.keys(legacy).length) console.log(`[dataStore] Migrated ${Object.keys(legacy).length} JSON files into ${kind}.`);
        }
      } catch (err: any) {
        initError = `${kind} connection failed: ${err?.message || err}`;
        console.error(`[dataStore] ${initError} — falling back to JSON files`);
        backend = fileBackend(fileDir);
      }
    } else {
      backend = fileBackend(fileDir);
      console.log(`[dataStore] Using JSON file storage in ${fileDir}`);
    }
    const all = await backend.loadAll();
    cache.clear();
    for (const [k, v] of Object.entries(all)) cache.set(k, v);
    lastRefresh = Date.now();
  })();
  return initPromise;
}

function isDb(): boolean {
  return Boolean(backend && backend.name !== 'file');
}

/** Re-sync the cache from the database when it is older than REFRESH_MS (no-op for file storage). */
export async function refreshIfStale(force = false): Promise<void> {
  if (!isDb()) return;
  if (!force && Date.now() - lastRefresh < REFRESH_MS) return;
  if (pending.size) await flushWrites(); // never read back older data over our own unsaved writes
  lastRefresh = Date.now();
  try {
    const all = await backend.loadAll();
    for (const [k, v] of Object.entries(all)) cache.set(k, v);
  } catch (err) {
    console.warn('[dataStore] refresh failed:', err);
  }
}

export function readData<T>(key: string, fallback: T): T {
  return cache.has(key) ? (cache.get(key) as T) : fallback;
}

export function writeData<T>(key: string, value: T): void {
  cache.set(key, value);
  if (!backend) return;
  const p = backend
    .save(key, value)
    .catch((err) => console.error(`[dataStore] save "${key}" failed:`, err))
    .finally(() => pending.delete(p));
  pending.add(p);
}

/** Wait until every queued database write has finished (serverless functions freeze after the response). */
export async function flushWrites(): Promise<void> {
  while (pending.size) await Promise.allSettled([...pending]);
}

export function filesInDatabase(): boolean {
  return Boolean(isDb() && backend.saveFile);
}

export async function saveFileToDb(name: string, mime: string, data: Buffer): Promise<void> {
  if (!filesInDatabase()) return;
  await backend.saveFile!(name, mime, data);
}

export async function loadFileFromDb(name: string): Promise<{ mime: string; data: Buffer } | null> {
  if (!isDb() || !backend.loadFile) return null;
  return backend.loadFile(name);
}

export function storageBackendName(): string {
  return backend?.name || 'starting';
}

export function storageError(): string {
  return initError;
}
