import { AdminUser, ActiveSession, AuditLog, UserRole, PasswordResetRequest } from '../types';

const TOKEN_KEY = 'plush_comfort_admin_token';
const USER_KEY = 'plush_comfort_admin_user';

interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
  networkError?: boolean;
}

/** fetch + JSON parse that never throws (handles HTML error pages and empty bodies). */
async function safeFetchJson<T = any>(url: string, init?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, init);
    const text = await res.text();
    const trimmed = text.trim();
    if (!trimmed || trimmed.startsWith('<')) {
      return {
        ok: false,
        status: res.status,
        error: `The server API is not reachable (HTTP ${res.status}). Make sure the site runs with "npm start" (Node server), not as static files.`,
      };
    }
    try {
      const data = JSON.parse(trimmed);
      return { ok: res.ok, status: res.status, data, error: !res.ok ? data.error || `Request failed (HTTP ${res.status})` : undefined };
    } catch (e: any) {
      return { ok: false, status: res.status, error: `Unexpected server response: ${e.message}` };
    }
  } catch (err: any) {
    return { ok: false, status: 0, networkError: true, error: `Network error: ${err.message || 'server unreachable'}` };
  }
}

function authHeaders(json = true): Record<string, string> {
  const token = adminAuthService.getToken();
  const h: Record<string, string> = {};
  if (json) h['Content-Type'] = 'application/json';
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

/* ---------------- Image compression (WebP, max ~200 KB) ---------------- */

const MAX_IMAGE_BYTES = 200 * 1024;
const MAX_IMAGE_DIMENSION = 1600;

function dataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] || '';
  return Math.floor((base64.length * 3) / 4);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not read this image file.'));
    img.src = src;
  });
}

/**
 * Converts any uploaded image (JPG, PNG, HEIC-preview, WebP...) into an optimised WebP
 * that is at most 1600px on the long side and normally between 100–200 KB.
 * SVG and GIF files are uploaded unchanged.
 */
export async function compressImageToWebp(dataUrl: string): Promise<string> {
  if (!dataUrl.startsWith('data:image/') || /^data:image\/(svg\+xml|gif)/.test(dataUrl)) return dataUrl;
  const img = await loadImage(dataUrl);
  let width = img.naturalWidth;
  let height = img.naturalHeight;
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(width, height));
  width = Math.round(width * scale);
  height = Math.round(height * scale);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;

  let result = dataUrl;
  for (let attempt = 0; attempt < 6; attempt++) {
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    for (const q of [0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55]) {
      result = canvas.toDataURL('image/webp', q);
      if (!result.startsWith('data:image/webp')) return dataUrl; // very old browser — keep original
      if (dataUrlBytes(result) <= MAX_IMAGE_BYTES) return result;
    }
    width = Math.round(width * 0.85);
    height = Math.round(height * 0.85);
  }
  return result;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/* ---------------- Service ---------------- */

export interface AuthConfig {
  recaptchaSiteKey: string | null;
  otpEmailEnabled: boolean;
  otpWhatsappEnabled: boolean;
  emailConfigured: boolean;
  storage?: string;
}

type LoginResult = { success: boolean; token?: string; user?: AdminUser; error?: string; waitMinutes?: number };

export const adminAuthService = {
  getToken(): string | null {
    try {
      return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken(token: string, remember = false): void {
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
      if (remember) localStorage.setItem(TOKEN_KEY, token);
    } catch {}
  },

  clearToken(): void {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {}
  },

  getStoredUser(): AdminUser | null {
    try {
      const raw = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setStoredUser(user: AdminUser, remember = false): void {
    try {
      const json = JSON.stringify(user);
      sessionStorage.setItem(USER_KEY, json);
      if (remember) localStorage.setItem(USER_KEY, json);
    } catch {}
  },

  async getConfig(): Promise<AuthConfig> {
    const res = await safeFetchJson<AuthConfig>('/api/auth/config');
    return res.ok && res.data
      ? res.data
      : { recaptchaSiteKey: null, otpEmailEnabled: false, otpWhatsappEnabled: false, emailConfigured: false };
  },

  async getStatus(): Promise<{ initialized: boolean; authenticated: boolean; user: AdminUser | null; error?: string }> {
    const res = await safeFetchJson<{ initialized: boolean; authenticated: boolean; user: AdminUser | null }>(
      '/api/auth/status',
      { headers: authHeaders(false) }
    );
    if (res.ok && res.data) {
      if (!res.data.authenticated) this.clearToken();
      else if (res.data.user) this.setStoredUser(res.data.user, Boolean(localStorage.getItem(TOKEN_KEY)));
      return res.data;
    }
    return { initialized: true, authenticated: false, user: null, error: res.error };
  },

  async initMaster(name: string, email: string, password: string, phone?: string): Promise<LoginResult> {
    const res = await safeFetchJson<LoginResult>('/api/auth/init-master', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password, phone }),
    });
    if (res.ok && res.data?.success) {
      this.setToken(res.data.token!, true);
      this.setStoredUser(res.data.user!, true);
      return res.data;
    }
    return { success: false, error: res.error || 'Setup failed' };
  },

  async login(
    email: string,
    password: string,
    remember = false,
    loginType: 'staff' | 'master' = 'staff',
    recaptchaToken?: string | null
  ): Promise<LoginResult> {
    const res = await safeFetchJson<LoginResult>('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password, loginType, recaptchaToken }),
    });
    if (res.ok && res.data?.success) {
      this.setToken(res.data.token!, remember);
      this.setStoredUser(res.data.user!, remember);
      return res.data;
    }
    return { success: false, error: res.error || 'Invalid credentials', waitMinutes: res.data?.waitMinutes };
  },

  /** Owner only: send a 6-digit code by email or WhatsApp for sign-in or password reset. */
  async requestOtp(
    identifier: string,
    purpose: 'login' | 'reset',
    channel: 'email' | 'whatsapp' = 'email'
  ): Promise<{ success: boolean; message?: string; sentTo?: string; devNotice?: string; error?: string }> {
    const res = await safeFetchJson('/api/auth/otp/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: identifier.trim(), purpose, channel }),
    });
    return res.ok && res.data ? res.data : { success: false, error: res.error };
  },

  async loginWithOtp(identifier: string, code: string, remember = true): Promise<LoginResult> {
    const res = await safeFetchJson<LoginResult>('/api/auth/otp/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: identifier.trim(), code: code.trim() }),
    });
    if (res.ok && res.data?.success) {
      this.setToken(res.data.token!, remember);
      this.setStoredUser(res.data.user!, remember);
      return res.data;
    }
    return { success: false, error: res.error || 'Incorrect code' };
  },

  async resetPasswordWithOtp(identifier: string, code: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const res = await safeFetchJson<{ success: boolean; message?: string }>('/api/auth/otp/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: identifier.trim(), code: code.trim(), newPassword }),
    });
    return res.ok && res.data ? res.data : { success: false, error: res.error };
  },

  /** Staff: ask the owner to set a new password. */
  async requestPasswordResetFromOwner(email: string, note?: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const res = await safeFetchJson<{ success: boolean; message?: string }>('/api/auth/password-reset-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), note }),
    });
    return res.ok && res.data ? res.data : { success: false, error: res.error };
  },

  async getPasswordResetRequests(): Promise<PasswordResetRequest[]> {
    const res = await safeFetchJson<{ requests: PasswordResetRequest[] }>('/api/auth/password-reset-requests', {
      headers: authHeaders(false),
    });
    return res.data?.requests || [];
  },

  async resolvePasswordResetRequest(id: string, status: 'resolved' | 'dismissed') {
    await safeFetchJson(`/api/auth/password-reset-requests/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });
  },

  async logout(): Promise<void> {
    if (this.getToken()) {
      await safeFetchJson('/api/auth/logout', { method: 'POST', headers: authHeaders(false) });
    }
    this.clearToken();
  },

  async logoutOtherDevices(): Promise<{ success: boolean; revokedCount?: number; error?: string }> {
    const res = await safeFetchJson('/api/auth/logout-other-devices', { method: 'POST', headers: authHeaders(false) });
    return res.ok && res.data ? res.data : { success: false, error: res.error };
  },

  async getActiveSessions(all = false): Promise<ActiveSession[]> {
    const res = await safeFetchJson<{ sessions: ActiveSession[] }>(`/api/auth/active-sessions${all ? '?all=1' : ''}`, {
      headers: authHeaders(false),
    });
    return res.data?.sessions || [];
  },

  async revokeSession(sessionId: string): Promise<boolean> {
    const res = await safeFetchJson(`/api/auth/sessions/${sessionId}`, { method: 'DELETE', headers: authHeaders(false) });
    return res.ok;
  },

  async updateMe(updates: { name?: string; phone?: string }) {
    const res = await safeFetchJson<{ success: boolean; user: AdminUser }>('/api/auth/me', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(updates),
    });
    if (res.ok && res.data?.user) this.setStoredUser(res.data.user, Boolean(localStorage.getItem(TOKEN_KEY)));
    return res.ok ? { success: true, user: res.data!.user } : { success: false, error: res.error };
  },

  async changeMyPassword(currentPassword: string, newPassword: string) {
    const res = await safeFetchJson('/api/auth/me/password', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return res.ok ? { success: true } : { success: false, error: res.error };
  },

  async getUsers(): Promise<AdminUser[]> {
    const res = await safeFetchJson<{ users: AdminUser[] }>('/api/auth/users', { headers: authHeaders(false) });
    return res.data?.users || [];
  },

  async createUser(user: {
    email: string;
    name: string;
    password: string;
    role: UserRole;
    permissions: string[];
    phone?: string;
  }): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    const res = await safeFetchJson<{ success: boolean; user?: AdminUser }>('/api/auth/users', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(user),
    });
    return res.ok && res.data ? res.data : { success: false, error: res.error };
  },

  async updateUser(
    id: string,
    updates: Partial<AdminUser> & { password?: string }
  ): Promise<{ success: boolean; error?: string }> {
    const res = await safeFetchJson(`/api/auth/users/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(updates),
    });
    return res.ok ? { success: true } : { success: false, error: res.error };
  },

  async deleteUser(id: string): Promise<boolean> {
    const res = await safeFetchJson(`/api/auth/users/${id}`, { method: 'DELETE', headers: authHeaders(false) });
    return res.ok;
  },

  async getUserHistory(id: string): Promise<{ logs: AuditLog[]; sessions: ActiveSession[] }> {
    const res = await safeFetchJson<{ logs: AuditLog[]; sessions: ActiveSession[] }>(`/api/auth/users/${id}/history`, {
      headers: authHeaders(false),
    });
    return res.data || { logs: [], sessions: [] };
  },

  async getAuditLogs(
    params: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      action?: string;
      mine?: boolean;
      scope?: 'store' | 'technical';
    } = {}
  ): Promise<{ logs: AuditLog[]; total: number; page: number; totalPages: number }> {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.search) q.set('search', params.search);
    if (params.category) q.set('category', params.category);
    if (params.action) q.set('action', params.action);
    if (params.mine) q.set('mine', '1');
    if (params.scope) q.set('scope', params.scope);
    const res = await safeFetchJson<{ logs: AuditLog[]; total: number; page: number; totalPages: number }>(
      `/api/audit-logs?${q.toString()}`,
      { headers: authHeaders(false) }
    );
    return res.data || { logs: [], total: 0, page: 1, totalPages: 1 };
  },

  async exportAuditLogsCsv(): Promise<void> {
    const res = await fetch('/api/audit-logs/export', { headers: authHeaders(false) });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plush-comfort-audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },

  async logAudit(
    action: string,
    category: any,
    target: string,
    details: string,
    beforeAfter?: Record<string, { before: any; after: any }>
  ): Promise<void> {
    if (!this.getToken()) return;
    safeFetchJson('/api/audit-logs', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ action, category, target, details, beforeAfter }),
    }).catch(() => {});
  },

  /**
   * Upload an image. Every image is first converted to an optimised WebP (≤ ~200 KB)
   * in the browser, so the server and storefront always receive light, fast images.
   */
  async uploadImage(
    base64Data: string,
    filename: string,
    alt?: string
  ): Promise<{ success: boolean; url?: string; filename?: string; error?: string }> {
    let payload = base64Data;
    try {
      payload = await compressImageToWebp(base64Data);
    } catch (err: any) {
      return { success: false, error: err.message || 'Image could not be processed' };
    }
    const res = await safeFetchJson<{ success: boolean; url?: string; filename?: string }>('/api/upload', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ data: payload, filename: filename.replace(/\.[a-z0-9]+$/i, ''), alt }),
    });
    return res.ok && res.data ? res.data : { success: false, error: res.error || 'Upload failed' };
  },

  /** Upload a short MP4/WebM video (max 20 MB) — e.g. for the homepage video button. */
  async uploadVideo(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
    if (file.size > 20 * 1024 * 1024) return { success: false, error: 'Video is larger than 20 MB. Use a YouTube link instead.' };
    const dataUrl = await readFileAsDataUrl(file);
    const res = await safeFetchJson<{ success: boolean; url?: string }>('/api/upload', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ data: dataUrl, filename: file.name }),
    });
    return res.ok && res.data ? res.data : { success: false, error: res.error || 'Upload failed' };
  },
};
