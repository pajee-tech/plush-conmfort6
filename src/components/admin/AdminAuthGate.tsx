import React, { useState, useEffect, useRef } from 'react';
import { adminAuthService, AuthConfig } from '../../services/adminAuthService';
import { AdminUser } from '../../types';
import {
  Lock,
  ShieldCheck,
  KeyRound,
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
  UserCheck,
  Shield,
  Loader2,
  Mail,
  MessageCircle,
  ArrowLeft,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface AdminAuthGateProps {
  children: (props: { user: AdminUser; onLogout: () => void; onUserUpdate: (u: AdminUser) => void }) => React.ReactNode;
}

declare global {
  interface Window {
    grecaptcha?: any;
    __pcRecaptchaLoaded?: () => void;
  }
}

/** Google reCAPTCHA v2 checkbox (only used when RECAPTCHA_SITE_KEY is set on the server). */
const RecaptchaWidget: React.FC<{ siteKey: string; onToken: (t: string | null) => void; resetSignal: number }> = ({ siteKey, onToken, resetSignal }) => {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);

  useEffect(() => {
    const render = () => {
      if (!ref.current || !window.grecaptcha?.render || widgetId.current !== null) return;
      widgetId.current = window.grecaptcha.render(ref.current, {
        sitekey: siteKey,
        callback: (t: string) => onToken(t),
        'expired-callback': () => onToken(null),
        'error-callback': () => onToken(null),
      });
    };
    if (window.grecaptcha?.render) {
      render();
    } else {
      window.__pcRecaptchaLoaded = render;
      if (!document.getElementById('pc-recaptcha-script')) {
        const s = document.createElement('script');
        s.id = 'pc-recaptcha-script';
        s.src = 'https://www.google.com/recaptcha/api.js?onload=__pcRecaptchaLoaded&render=explicit';
        s.async = true;
        s.defer = true;
        document.head.appendChild(s);
      }
    }
  }, [siteKey]);

  useEffect(() => {
    if (widgetId.current !== null && window.grecaptcha?.reset) {
      window.grecaptcha.reset(widgetId.current);
      onToken(null);
    }
  }, [resetSignal]);

  return <div ref={ref} className="flex justify-center min-h-[78px]" />;
};

const PasswordInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  minLength?: number;
  id?: string;
}> = ({ value, onChange, placeholder = '••••••••••••', autoComplete, minLength, id }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 rounded-xl border border-stone-300 bg-white pr-10 focus:outline-none focus:ring-2 focus:ring-[#A25828]"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 cursor-pointer"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};

const Notice: React.FC<{ kind: 'error' | 'success' | 'info'; children: React.ReactNode }> = ({ kind, children }) => (
  <div
    className={`p-3 rounded-xl text-xs font-semibold flex items-start gap-2 border ${
      kind === 'error'
        ? 'bg-red-50 border-red-200 text-red-700'
        : kind === 'success'
        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
        : 'bg-amber-50 border-amber-200 text-amber-900'
    }`}
  >
    {kind === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0" /> : kind === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <Info className="w-4 h-4 shrink-0" />}
    <span>{children}</span>
  </div>
);

export const AdminAuthGate: React.FC<AdminAuthGateProps> = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isInitialized, setIsInitialized] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [config, setConfig] = useState<AuthConfig>({ recaptchaSiteKey: null, otpEmailEnabled: false, otpWhatsappEnabled: false, emailConfigured: false });

  const [activeTab, setActiveTab] = useState<'staff' | 'master'>('staff');
  // Master sub views
  const [masterMode, setMasterMode] = useState<'password' | 'code' | 'forgot'>('password');

  // Shared
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [lockoutMinutes, setLockoutMinutes] = useState<number | null>(null);

  // Staff
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffRemember, setStaffRemember] = useState(true);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaReset, setRecaptchaReset] = useState(0);
  const [simCaptcha, setSimCaptcha] = useState<'idle' | 'checking' | 'done'>('idle');
  const [staffForgotOpen, setStaffForgotOpen] = useState(false);
  const [forgotNote, setForgotNote] = useState('');

  // Master
  const [masterEmail, setMasterEmail] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [masterRemember, setMasterRemember] = useState(true);
  const [otpIdentifier, setOtpIdentifier] = useState('');
  const [otpChannel, setOtpChannel] = useState<'email' | 'whatsapp'>('email');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');

  // Setup
  const [initName, setInitName] = useState('');
  const [initEmail, setInitEmail] = useState('');
  const [initPhone, setInitPhone] = useState('');
  const [initPassword, setInitPassword] = useState('');
  const [initConfirmPassword, setInitConfirmPassword] = useState('');

  // Admin area must never be indexed
  useEffect(() => {
    const meta = document.querySelector('meta[name="robots"]') || document.head.appendChild(Object.assign(document.createElement('meta'), { name: 'robots' }));
    const previous = meta.getAttribute('content') || 'index, follow';
    meta.setAttribute('content', 'noindex, nofollow, noarchive');
    return () => meta.setAttribute('content', previous);
  }, []);

  useEffect(() => {
    (async () => {
      setIsChecking(true);
      const [status, cfg] = await Promise.all([adminAuthService.getStatus(), adminAuthService.getConfig()]);
      setConfig(cfg);
      if (status.error) setServerError(status.error);
      setIsInitialized(status.initialized);
      setCurrentUser(status.authenticated && status.user ? status.user : null);
      setIsChecking(false);
    })();
  }, []);

  const resetMessages = () => {
    setError(null);
    setInfo(null);
  };

  const switchTab = (tab: 'staff' | 'master') => {
    setActiveTab(tab);
    setMasterMode('password');
    setOtpSent(false);
    setOtpCode('');
    resetMessages();
  };

  const captchaOk = config.recaptchaSiteKey ? Boolean(recaptchaToken) : simCaptcha === 'done';

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (!captchaOk) {
      setError('Please tick "I\'m not a robot" before signing in.');
      return;
    }
    setBusy(true);
    const res = await adminAuthService.login(staffEmail, staffPassword, staffRemember, 'staff', recaptchaToken);
    setBusy(false);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setLockoutMinutes(null);
    } else {
      setError(res.error || 'Invalid staff credentials');
      if (res.waitMinutes) setLockoutMinutes(res.waitMinutes);
      setRecaptchaReset((n) => n + 1);
      setSimCaptcha('idle');
    }
  };

  const handleStaffForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setBusy(true);
    const res = await adminAuthService.requestPasswordResetFromOwner(staffEmail, forgotNote);
    setBusy(false);
    if (res.success) {
      setInfo(res.message || 'Request sent to the owner.');
      setStaffForgotOpen(false);
      setForgotNote('');
    } else setError(res.error || 'Could not send the request.');
  };

  const handleMasterLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setBusy(true);
    const res = await adminAuthService.login(masterEmail, masterPassword, masterRemember, 'master');
    setBusy(false);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setLockoutMinutes(null);
    } else {
      setError(res.error || 'Invalid owner credentials');
      if (res.waitMinutes) setLockoutMinutes(res.waitMinutes);
    }
  };

  const sendCode = async (purpose: 'login' | 'reset') => {
    resetMessages();
    if (!otpIdentifier.trim()) {
      setError(otpChannel === 'whatsapp' ? 'Enter the owner email or WhatsApp number.' : 'Enter the owner email address.');
      return;
    }
    setBusy(true);
    const res = await adminAuthService.requestOtp(otpIdentifier, purpose, otpChannel);
    setBusy(false);
    if (res.success) {
      setOtpSent(true);
      setInfo(`${res.message || 'Code sent.'}${res.sentTo ? ` (sent to ${res.sentTo})` : ''}${res.devNotice ? ` — ${res.devNotice}` : ''}`);
    } else setError(res.error || 'Could not send the code.');
  };

  const handleCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setBusy(true);
    const res = await adminAuthService.loginWithOtp(otpIdentifier, otpCode, masterRemember);
    setBusy(false);
    if (res.success && res.user) setCurrentUser(res.user);
    else setError(res.error || 'Incorrect code');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (newPassword !== newPassword2) {
      setError('The two passwords do not match.');
      return;
    }
    setBusy(true);
    const res = await adminAuthService.resetPasswordWithOtp(otpIdentifier, otpCode, newPassword);
    setBusy(false);
    if (res.success) {
      setMasterMode('password');
      setOtpSent(false);
      setOtpCode('');
      setNewPassword('');
      setNewPassword2('');
      setMasterEmail(otpIdentifier.includes('@') ? otpIdentifier : masterEmail);
      setInfo('Password updated. Sign in with your new password.');
    } else setError((res as any).error || 'Could not reset the password.');
  };

  const handleMasterInit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (initPassword !== initConfirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setBusy(true);
    const res = await adminAuthService.initMaster(initName, initEmail, initPassword, initPhone);
    setBusy(false);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setIsInitialized(true);
    } else setError(res.error || 'Setup failed');
  };

  const handleLogout = async () => {
    await adminAuthService.logout();
    setCurrentUser(null);
    setRecaptchaToken(null);
    setSimCaptcha('idle');
  };

  // ---------------- RENDER ----------------
  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#A25828] text-white flex items-center justify-center mx-auto animate-pulse shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-stone-600">Checking secure session…</p>
        </div>
      </div>
    );
  }

  if (currentUser) {
    return <>{children({ user: currentUser, onLogout: handleLogout, onUserUpdate: setCurrentUser })}</>;
  }

  const cardShell = (content: React.ReactNode) => (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4 py-10">
      <div className="bg-white rounded-3xl border border-[#E8E0D5] p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-fade-in">{content}</div>
    </div>
  );

  // 1. One-time owner setup
  if (!isInitialized) {
    return cardShell(
      <>
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-[#A25828] text-white flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#A25828]">First-time setup</span>
          <h1 className="font-serif font-bold text-2xl text-[#221C18]">Create the Owner (Master) Account</h1>
          <p className="text-xs text-stone-500 leading-relaxed">
            This runs only once. The owner account creates all staff logins. Use an email you can always access — it is used for password-reset codes.
          </p>
        </div>
        {error && <Notice kind="error">{error}</Notice>}
        <form onSubmit={handleMasterInit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Owner full name</label>
            <input type="text" required value={initName} onChange={(e) => setInitName(e.target.value)} className="w-full p-3 rounded-xl border border-stone-300" />
          </div>
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Owner email</label>
            <input type="email" required autoComplete="email" value={initEmail} onChange={(e) => setInitEmail(e.target.value)} className="w-full p-3 rounded-xl border border-stone-300" />
          </div>
          <div>
            <label className="block font-semibold text-stone-700 mb-1">WhatsApp number (optional, for login codes)</label>
            <input type="tel" placeholder="+44 7..." value={initPhone} onChange={(e) => setInitPhone(e.target.value)} className="w-full p-3 rounded-xl border border-stone-300" />
          </div>
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Password (min 8 characters, letters + numbers)</label>
            <PasswordInput value={initPassword} onChange={setInitPassword} minLength={8} autoComplete="new-password" />
          </div>
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Confirm password</label>
            <PasswordInput value={initConfirmPassword} onChange={setInitConfirmPassword} minLength={8} autoComplete="new-password" />
          </div>
          <button type="submit" disabled={busy} className="w-full bg-[#A25828] hover:bg-[#8A461A] text-white py-3.5 rounded-full font-bold shadow-md disabled:opacity-50">
            {busy ? 'Creating account…' : 'Create Owner Account & Sign In'}
          </button>
        </form>
      </>
    );
  }

  // 2. Login portal
  return cardShell(
    <>
      <div className="text-center space-y-1.5">
        <div className="w-14 h-14 rounded-2xl bg-[#A25828] text-white flex items-center justify-center mx-auto shadow-md">
          <Lock className="w-7 h-7" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[#A25828] text-[10px] font-bold tracking-wider uppercase">
          <Shield className="w-3 h-3" />
          <span>Restricted Staff &amp; Owner Area</span>
        </div>
        <h1 className="font-serif font-bold text-2xl text-[#221C18]">Plush Comfort Portal</h1>
        <p className="text-xs text-stone-500">Internal access only · Accounts are created by the store owner</p>
      </div>

      {serverError && <Notice kind="error">{serverError}</Notice>}

      <div className="grid grid-cols-2 p-1 bg-[#F5EFE6] rounded-2xl text-xs font-semibold" role="tablist">
        {(['staff', 'master'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => switchTab(tab)}
            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === tab ? 'bg-white text-[#221C18] shadow-sm font-bold' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {tab === 'staff' ? <UserCheck className="w-4 h-4 text-[#A25828]" /> : <KeyRound className="w-4 h-4 text-[#A25828]" />}
            <span>{tab === 'staff' ? 'Staff & Member' : 'Master Login'}</span>
          </button>
        ))}
      </div>

      {lockoutMinutes && <Notice kind="info">Temporarily locked after repeated attempts. Please wait {lockoutMinutes} minute(s).</Notice>}
      {error && !lockoutMinutes && <Notice kind="error">{error}</Notice>}
      {info && <Notice kind="success">{info}</Notice>}

      {/* ---------------- STAFF ---------------- */}
      {activeTab === 'staff' && !staffForgotOpen && (
        <form onSubmit={handleStaffLogin} className="space-y-4 text-xs">
          <div>
            <label htmlFor="staff-email" className="block font-semibold text-stone-700 mb-1">Staff email</label>
            <input
              id="staff-email"
              type="email"
              required
              autoComplete="username"
              placeholder="name@plushcomfort.uk"
              value={staffEmail}
              onChange={(e) => setStaffEmail(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#A25828]"
            />
          </div>
          <div>
            <label htmlFor="staff-password" className="block font-semibold text-stone-700 mb-1">Password</label>
            <PasswordInput id="staff-password" value={staffPassword} onChange={setStaffPassword} autoComplete="current-password" />
          </div>

          {config.recaptchaSiteKey ? (
            <RecaptchaWidget siteKey={config.recaptchaSiteKey} onToken={setRecaptchaToken} resetSignal={recaptchaReset} />
          ) : (
            <button
              type="button"
              onClick={() => {
                if (simCaptcha !== 'idle') return;
                setSimCaptcha('checking');
                setTimeout(() => setSimCaptcha('done'), 600);
              }}
              className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl p-3 flex items-center justify-between select-none"
            >
              <span className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
                    simCaptcha === 'done' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-stone-400 bg-white'
                  }`}
                >
                  {simCaptcha === 'checking' ? <Loader2 className="w-3.5 h-3.5 text-[#A25828] animate-spin" /> : simCaptcha === 'done' ? <Check className="w-4 h-4" /> : null}
                </span>
                <span className="text-xs font-semibold text-stone-800">I'm not a robot</span>
              </span>
              <span className="text-[9px] text-stone-400 text-right leading-tight">
                reCAPTCHA
                <br />
                (connect keys in .env)
              </span>
            </button>
          )}

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-600">
              <input type="checkbox" checked={staffRemember} onChange={(e) => setStaffRemember(e.target.checked)} className="rounded" />
              <span>Remember this device</span>
            </label>
            <button type="button" onClick={() => { resetMessages(); setStaffForgotOpen(true); }} className="text-[#A25828] hover:underline font-semibold">
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={busy || !captchaOk || Boolean(lockoutMinutes)}
            className="w-full bg-[#A25828] hover:bg-[#8A461A] text-white py-3.5 rounded-full font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? 'Signing in…' : 'Sign In as Staff'}
          </button>
          <p className="text-[11px] text-stone-500 text-center">
            No account? Staff cannot sign up themselves — ask the store owner to create your login.
          </p>
        </form>
      )}

      {activeTab === 'staff' && staffForgotOpen && (
        <form onSubmit={handleStaffForgot} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E0D5] text-stone-600 leading-relaxed">
            Staff passwords are managed by the owner. Send a request and the owner will set a new password for you in
            <strong> Dashboard → Staff &amp; Roles</strong>. They will share it with you directly.
          </div>
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Your staff email</label>
            <input type="email" required value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} className="w-full p-3 rounded-xl border border-stone-300" />
          </div>
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Message to owner (optional)</label>
            <textarea rows={2} value={forgotNote} onChange={(e) => setForgotNote(e.target.value)} placeholder="e.g. I forgot my password after the holiday" className="w-full p-3 rounded-xl border border-stone-300" />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setStaffForgotOpen(false)} className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 py-3 rounded-full font-semibold">
              Back
            </button>
            <button type="submit" disabled={busy} className="flex-1 bg-[#A25828] hover:bg-[#8A461A] text-white py-3 rounded-full font-bold disabled:opacity-50">
              {busy ? 'Sending…' : 'Request New Password'}
            </button>
          </div>
        </form>
      )}

      {/* ---------------- MASTER ---------------- */}
      {activeTab === 'master' && masterMode === 'password' && (
        <form onSubmit={handleMasterLogin} className="space-y-4 text-xs">
          <div>
            <label htmlFor="master-email" className="block font-semibold text-stone-700 mb-1">Owner email</label>
            <input
              id="master-email"
              type="email"
              required
              autoComplete="username"
              value={masterEmail}
              onChange={(e) => setMasterEmail(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#A25828]"
            />
          </div>
          <div>
            <label htmlFor="master-password" className="block font-semibold text-stone-700 mb-1">Password</label>
            <PasswordInput id="master-password" value={masterPassword} onChange={setMasterPassword} autoComplete="current-password" />
          </div>
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-600">
              <input type="checkbox" checked={masterRemember} onChange={(e) => setMasterRemember(e.target.checked)} className="rounded" />
              <span>Remember session</span>
            </label>
            <button
              type="button"
              onClick={() => {
                resetMessages();
                setOtpIdentifier(masterEmail);
                setOtpSent(false);
                setMasterMode('forgot');
              }}
              className="text-[#A25828] hover:underline font-semibold"
            >
              Forgot password?
            </button>
          </div>
          <button type="submit" disabled={busy || Boolean(lockoutMinutes)} className="w-full bg-[#221C18] hover:bg-black text-white py-3.5 rounded-full font-bold shadow-md disabled:opacity-50">
            {busy ? 'Signing in…' : 'Sign In with Password'}
          </button>
          <div className="relative text-center">
            <span className="absolute inset-x-0 top-1/2 border-t border-stone-200" />
            <span className="relative bg-white px-3 text-[11px] text-stone-400">or</span>
          </div>
          <button
            type="button"
            onClick={() => {
              resetMessages();
              setOtpIdentifier(masterEmail);
              setOtpSent(false);
              setMasterMode('code');
            }}
            className="w-full border border-[#D5C7B7] hover:border-[#A25828] text-[#221C18] py-3 rounded-full font-semibold flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4 text-[#A25828]" />
            Sign in with a code (email / WhatsApp)
          </button>
        </form>
      )}

      {activeTab === 'master' && (masterMode === 'code' || masterMode === 'forgot') && (
        <form onSubmit={masterMode === 'code' ? handleCodeLogin : handleResetPassword} className="space-y-4 text-xs">
          <button type="button" onClick={() => { resetMessages(); setMasterMode('password'); }} className="flex items-center gap-1 text-stone-500 hover:text-stone-800 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to password sign-in
          </button>
          <div>
            <h2 className="font-serif font-bold text-lg text-[#221C18]">
              {masterMode === 'code' ? 'Sign in with a one-time code' : 'Reset owner password'}
            </h2>
            <p className="text-stone-500 mt-1">
              {masterMode === 'code'
                ? 'We send a 6-digit code to the owner email or WhatsApp. It expires in 10 minutes.'
                : 'We send a 6-digit code to the owner email or WhatsApp, then you choose a new password.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(['email', 'whatsapp'] as const).map((ch) => {
              const disabled = ch === 'whatsapp' ? !config.otpWhatsappEnabled : !config.otpEmailEnabled;
              return (
                <button
                  key={ch}
                  type="button"
                  disabled={disabled}
                  onClick={() => setOtpChannel(ch)}
                  title={disabled ? 'Not connected yet — see the setup guide in the README' : ''}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-semibold ${
                    otpChannel === ch ? 'border-[#A25828] bg-[#FAF2EB] text-[#8A461A]' : 'border-stone-200 text-stone-600'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {ch === 'email' ? <Mail className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
                  {ch === 'email' ? 'Email' : 'WhatsApp'}
                </button>
              );
            })}
          </div>
          {!config.emailConfigured && (
            <p className="text-[11px] text-amber-700">
              Email sending (SMTP) is not connected yet. In development the code is printed in the server console.
            </p>
          )}

          <div>
            <label className="block font-semibold text-stone-700 mb-1">{otpChannel === 'whatsapp' ? 'Owner email or WhatsApp number' : 'Owner email'}</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={otpIdentifier}
                onChange={(e) => setOtpIdentifier(e.target.value)}
                className="flex-1 p-3 rounded-xl border border-stone-300"
              />
              <button
                type="button"
                disabled={busy}
                onClick={() => sendCode(masterMode === 'code' ? 'login' : 'reset')}
                className="shrink-0 px-4 rounded-xl bg-stone-900 text-white font-semibold disabled:opacity-50"
              >
                {otpSent ? 'Resend' : 'Send code'}
              </button>
            </div>
          </div>

          {otpSent && (
            <>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">6-digit code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full p-3 rounded-xl border border-stone-300 text-center text-lg tracking-[0.5em] font-bold"
                />
              </div>
              {masterMode === 'forgot' && (
                <>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">New password</label>
                    <PasswordInput value={newPassword} onChange={setNewPassword} minLength={8} autoComplete="new-password" />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Confirm new password</label>
                    <PasswordInput value={newPassword2} onChange={setNewPassword2} minLength={8} autoComplete="new-password" />
                  </div>
                </>
              )}
              <button type="submit" disabled={busy} className="w-full bg-[#221C18] hover:bg-black text-white py-3.5 rounded-full font-bold shadow-md disabled:opacity-50">
                {busy ? 'Checking…' : masterMode === 'code' ? 'Verify Code & Sign In' : 'Save New Password'}
              </button>
            </>
          )}
        </form>
      )}

      <div className="text-center text-[10px] text-stone-400 pt-2 border-t border-stone-200">
        Protected internal area · Not indexed by search engines
      </div>
    </>
  );
};
