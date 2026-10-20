import React, { useState, useEffect } from 'react';
import { AdminUser, ActiveSession, UserRole, AuditLog, PasswordResetRequest } from '../../types';
import { adminAuthService } from '../../services/adminAuthService';
import { ACCESS_AREAS, AccessAreaId, ROLE_DEFAULT_ACCESS, getEffectiveAccess } from '../../utils/permissions';
import {
  UserPlus,
  Laptop,
  Smartphone,
  LogOut,
  Trash2,
  Edit2,
  Check,
  X,
  KeyRound,
  History,
  BellRing,
  Eye,
  EyeOff,
  Wand2,
} from 'lucide-react';

const ROLE_LABEL: Record<UserRole, string> = {
  master_admin: 'Owner (Master)',
  admin: 'Administrator',
  editor: 'Editor',
  marketer: 'Marketer',
};

const fmt = (iso?: string) =>
  iso ? new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const arr = new Uint32Array(12);
  crypto.getRandomValues(arr);
  let pw = Array.from(arr, (n) => chars[n % chars.length]).join('');
  if (!/[0-9]/.test(pw)) pw = pw.slice(0, 11) + '7';
  return pw;
}

const AccessPicker: React.FC<{ value: AccessAreaId[]; onChange: (v: AccessAreaId[]) => void }> = ({ value, onChange }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
    {ACCESS_AREAS.map((a) => {
      const checked = a.id === 'overview' || value.includes(a.id);
      return (
        <label
          key={a.id}
          className={`flex items-start gap-2 p-2.5 rounded-xl border text-xs cursor-pointer ${checked ? 'border-[#A25828] bg-[#FAF2EB]/60' : 'border-stone-200'}`}
        >
          <input
            type="checkbox"
            checked={checked}
            disabled={a.id === 'overview'}
            onChange={(e) => onChange(e.target.checked ? [...value, a.id] : value.filter((v) => v !== a.id))}
            className="mt-0.5 accent-[#A25828]"
          />
          <span>
            <span className="font-semibold text-stone-900 block">{a.label}</span>
            <span className="text-[10px] text-stone-500">{a.description}</span>
          </span>
        </label>
      );
    })}
  </div>
);

const PasswordField: React.FC<{ value: string; onChange: (v: string) => void; required?: boolean }> = ({ value, onChange, required }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <input
          type={show ? 'text' : 'password'}
          required={required}
          minLength={8}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Min 8 characters, letters + numbers"
          className="w-full p-2.5 rounded-xl border border-stone-300 pr-9 font-mono"
        />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-2.5 top-2.5 text-stone-400" aria-label="Show password">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      <button
        type="button"
        onClick={() => {
          onChange(generatePassword());
          setShow(true);
        }}
        className="px-3 rounded-xl border border-stone-300 text-stone-700 hover:border-[#A25828] flex items-center gap-1 text-[11px] font-semibold"
        title="Generate a strong password"
      >
        <Wand2 className="w-3.5 h-3.5" /> Generate
      </button>
    </div>
  );
};

export const UsersRolesManager: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [requests, setRequests] = useState<PasswordResetRequest[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Create
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<Exclude<UserRole, 'master_admin'>>('editor');
  const [newAccess, setNewAccess] = useState<AccessAreaId[]>(ROLE_DEFAULT_ACCESS.editor);

  // Edit
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [editAccess, setEditAccess] = useState<AccessAreaId[]>([]);
  const [editPassword, setEditPassword] = useState('');

  // History
  const [historyUser, setHistoryUser] = useState<AdminUser | null>(null);
  const [history, setHistory] = useState<{ logs: AuditLog[]; sessions: ActiveSession[] }>({ logs: [], sessions: [] });

  const loadData = async () => {
    const [u, s, r] = await Promise.all([
      adminAuthService.getUsers(),
      adminAuthService.getActiveSessions(true),
      adminAuthService.getPasswordResetRequests(),
    ]);
    setUsers(u);
    setSessions(s);
    setRequests(r);
  };

  useEffect(() => {
    loadData();
  }, []);

  const notice = (msg: string) => {
    setErrorMsg(null);
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await adminAuthService.createUser({
      email: newEmail,
      name: newName,
      password: newPassword,
      role: newRole,
      permissions: Array.from(new Set(['overview', ...newAccess])),
      phone: newPhone || undefined,
    });
    if (res.success) {
      notice(`Account created for ${newName}. Share the email and password with them privately.`);
      setIsCreateOpen(false);
      setNewEmail('');
      setNewName('');
      setNewPhone('');
      setNewPassword('');
      loadData();
    } else setErrorMsg(res.error || 'Failed to create user');
  };

  const openEdit = (u: AdminUser) => {
    setEditing({ ...u });
    setEditAccess(getEffectiveAccess(u));
    setEditPassword('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const res = await adminAuthService.updateUser(editing.id, {
      name: editing.name,
      phone: editing.phone || '',
      ...(editing.role !== 'master_admin'
        ? { role: editing.role, isActive: editing.isActive, permissions: Array.from(new Set(['overview', ...editAccess])) }
        : {}),
      ...(editPassword ? { password: editPassword } : {}),
    });
    if (res.success) {
      notice(editPassword ? `Saved. New password set for ${editing.name} — they have been signed out of other devices.` : `Saved changes for ${editing.name}.`);
      setEditing(null);
      loadData();
    } else setErrorMsg(res.error || 'Update failed');
  };

  const handleDelete = async (u: AdminUser) => {
    if (!confirm(`Delete ${u.name}'s account? They will be signed out immediately.`)) return;
    if (await adminAuthService.deleteUser(u.id)) {
      notice(`Deleted ${u.name}.`);
      loadData();
    }
  };

  const openHistory = async (u: AdminUser) => {
    setHistoryUser(u);
    setHistory({ logs: [], sessions: [] });
    setHistory(await adminAuthService.getUserHistory(u.id));
  };

  const pending = requests.filter((r) => r.status === 'pending');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E0D5] space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A25828]">Owner only</span>
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#221C18] mt-1">Staff Accounts &amp; Access</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-2xl">
              Staff cannot sign up themselves. Create each login here, choose which dashboard areas they can open, and change their password whenever needed.
            </p>
          </div>
          <button
            onClick={() => {
              setNewPassword(generatePassword());
              setNewAccess(ROLE_DEFAULT_ACCESS[newRole]);
              setIsCreateOpen(true);
            }}
            className="bg-[#A25828] hover:bg-[#8A461A] text-white px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Staff Login</span>
          </button>
        </div>

        {notification && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" /> {notification}
          </div>
        )}
        {errorMsg && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">{errorMsg}</div>}

        {/* Password requests */}
        {pending.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <BellRing className="w-4 h-4" /> Password change requests ({pending.length})
            </div>
            {pending.map((r) => {
              const u = users.find((x) => x.id === r.userId);
              return (
                <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-3 rounded-xl border border-amber-200 text-xs">
                  <div>
                    <span className="font-semibold">{r.userName}</span> <span className="text-stone-500">({r.userEmail})</span>
                    <span className="text-stone-400"> · {fmt(r.requestedAt)}</span>
                    {r.note && <div className="text-stone-600 italic mt-0.5">“{r.note}”</div>}
                  </div>
                  <div className="flex gap-2">
                    {u && (
                      <button onClick={() => openEdit(u)} className="px-3 py-1.5 rounded-lg bg-[#A25828] text-white font-semibold">
                        Set new password
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        await adminAuthService.resolvePasswordResetRequest(r.id, 'dismissed');
                        loadData();
                      }}
                      className="px-3 py-1.5 rounded-lg border border-stone-300 font-semibold"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Users */}
        <div className="border border-stone-200 rounded-2xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200 font-bold">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Role &amp; access</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4">Password changed</th>
                <th className="py-3 px-4">Last sign-in</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-stone-50/50 align-top">
                  <td className="py-3 px-4">
                    <span className="font-bold text-stone-900 block">{u.name}</span>
                    <span className="text-[11px] text-stone-400 font-mono">{u.email}</span>
                    {u.phone && <span className="text-[10px] text-stone-400 block">{u.phone}</span>}
                  </td>
                  <td className="py-3 px-4 max-w-[260px]">
                    <span className="font-semibold text-[#8A461A]">{ROLE_LABEL[u.role]}</span>
                    <div className="text-[10px] text-stone-500 mt-0.5">
                      {u.role === 'master_admin'
                        ? 'Full access'
                        : getEffectiveAccess(u)
                            .filter((a) => a !== 'overview')
                            .map((a) => ACCESS_AREAS.find((x) => x.id === a)?.label.split(' ')[0])
                            .join(', ')}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[11px] text-stone-500">{fmt(u.createdAt)}</td>
                  <td className="py-3 px-4 text-[11px] text-stone-500">{fmt(u.passwordChangedAt || u.createdAt)}</td>
                  <td className="py-3 px-4 text-[11px] text-stone-500">{u.lastLoginAt ? fmt(u.lastLoginAt) : 'Never'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
                      {u.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openHistory(u)} className="p-1.5 text-stone-400 hover:text-[#A25828]" title="Account history & logs">
                        <History className="w-4 h-4" />
                      </button>
                      <button onClick={() => openEdit(u)} className="p-1.5 text-stone-400 hover:text-[#A25828]" title={u.role === 'master_admin' ? 'Edit my details' : 'Edit access / change password'}>
                        {u.role === 'master_admin' ? <Edit2 className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />}
                      </button>
                      {u.role !== 'master_admin' && (
                        <button onClick={() => handleDelete(u)} className="p-1.5 text-stone-400 hover:text-red-600" title="Delete account">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sessions */}
        <div className="pt-6 border-t border-stone-200 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-serif font-bold text-base text-[#221C18]">Signed-in devices (all accounts)</h4>
              <p className="text-[11px] text-stone-500">Sign out any device you don't recognise.</p>
            </div>
            <button
              onClick={async () => {
                if (!confirm('Sign out all of YOUR other devices?')) return;
                const r = await adminAuthService.logoutOtherDevices();
                if (r.success) notice(`Signed out ${r.revokedCount || 0} other device(s).`);
                loadData();
              }}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign out my other devices
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sessions.map((s) => (
              <div key={s.id} className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${s.isCurrent ? 'border-[#A25828] bg-[#FAF2EB]/40' : 'border-stone-200'}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 shrink-0">
                    {/mobile/i.test(s.device) ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0 text-[11px]">
                    <div className="font-bold text-stone-900 text-xs truncate">
                      {s.userName} {s.isCurrent && <span className="ml-1 bg-[#A25828] text-white text-[9px] px-1.5 py-0.5 rounded-full">This device</span>}
                    </div>
                    <div className="text-stone-500 truncate">{s.device} · IP {s.ip}</div>
                    <div className="text-stone-400">Signed in {fmt(s.signedInAt)} {s.method ? `· ${s.method}` : ''}</div>
                  </div>
                </div>
                {!s.isCurrent && (
                  <button
                    onClick={async () => {
                      await adminAuthService.revokeSession(s.id);
                      notice('Device signed out.');
                      loadData();
                    }}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                  >
                    Sign out
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setIsCreateOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 z-10 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <h3 className="font-serif font-bold text-lg text-[#221C18]">Create staff login</h3>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 text-stone-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Full name</label>
                  <input required value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full p-2.5 rounded-xl border border-stone-300" />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Email (their username)</label>
                  <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full p-2.5 rounded-xl border border-stone-300" />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Phone / WhatsApp (optional)</label>
                  <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="w-full p-2.5 rounded-xl border border-stone-300" />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Role (sets default access)</label>
                  <select
                    value={newRole}
                    onChange={(e) => {
                      const r = e.target.value as Exclude<UserRole, 'master_admin'>;
                      setNewRole(r);
                      setNewAccess(ROLE_DEFAULT_ACCESS[r]);
                    }}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-semibold"
                  >
                    <option value="admin">Administrator</option>
                    <option value="editor">Editor</option>
                    <option value="marketer">Marketer</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Password (you share this with them)</label>
                <PasswordField value={newPassword} onChange={setNewPassword} required />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-2">Dashboard access</label>
                <AccessPicker value={newAccess} onChange={setNewAccess} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 rounded-xl border text-stone-600 font-semibold">Cancel</button>
                <button type="submit" className="bg-[#A25828] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#8A461A]">Create login</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setEditing(null)} />
          <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 z-10 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <h3 className="font-serif font-bold text-lg text-[#221C18]">{editing.role === 'master_admin' ? 'My owner details' : `Edit ${editing.name}`}</h3>
              <button onClick={() => setEditing(null)} className="p-1 text-stone-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Full name</label>
                  <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full p-2.5 rounded-xl border border-stone-300" />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Phone / WhatsApp</label>
                  <input value={editing.phone || ''} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} className="w-full p-2.5 rounded-xl border border-stone-300" />
                </div>
                {editing.role !== 'master_admin' && (
                  <>
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Role</label>
                      <select value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value as UserRole })} className="w-full p-2.5 rounded-xl border border-stone-300 bg-white">
                        <option value="admin">Administrator</option>
                        <option value="editor">Editor</option>
                        <option value="marketer">Marketer</option>
                      </select>
                    </div>
                    <label className="flex items-center gap-2 mt-6 font-semibold text-stone-700">
                      <input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} className="accent-[#A25828]" />
                      Account active (untick to block sign-in)
                    </label>
                  </>
                )}
              </div>

              {editing.role !== 'master_admin' && (
                <>
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E0D5] space-y-2">
                    <label className="block font-bold text-stone-800">Set a new password</label>
                    <p className="text-[11px] text-stone-500">Leave empty to keep the current password. The staff member is signed out and must use the new one.</p>
                    <PasswordField value={editPassword} onChange={setEditPassword} />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-2">Dashboard access</label>
                    <AccessPicker value={editAccess} onChange={setEditAccess} />
                  </div>
                </>
              )}
              {editing.role === 'master_admin' && (
                <p className="text-[11px] text-stone-500">Change your own password in the <strong>My Account</strong> tab.</p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl border text-stone-600 font-semibold">Cancel</button>
                <button type="submit" className="bg-[#A25828] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#8A461A]">Save changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History modal */}
      {historyUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setHistoryUser(null)} />
          <div className="relative bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 z-10 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#221C18]">Account history — {historyUser.name}</h3>
                <p className="text-[11px] text-stone-500">
                  Created {fmt(historyUser.createdAt)} · Password last set {fmt(historyUser.passwordChangedAt || historyUser.createdAt)}
                </p>
              </div>
              <button onClick={() => setHistoryUser(null)} className="p-1 text-stone-400"><X className="w-5 h-5" /></button>
            </div>
            <h4 className="font-bold text-xs text-stone-800 mb-2">Signed-in devices now ({history.sessions.length})</h4>
            <ul className="text-[11px] text-stone-600 mb-4 space-y-1">
              {history.sessions.map((s) => (
                <li key={s.id}>• {s.device} · IP {s.ip} · since {fmt(s.signedInAt)}</li>
              ))}
              {history.sessions.length === 0 && <li className="text-stone-400">Not signed in anywhere.</li>}
            </ul>
            <h4 className="font-bold text-xs text-stone-800 mb-2">Log (sign-ins, passwords, changes)</h4>
            <div className="border border-stone-200 rounded-xl overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead className="bg-[#FAF8F5] text-stone-500 uppercase text-[9px]">
                  <tr>
                    <th className="text-left p-2">When</th>
                    <th className="text-left p-2">Event</th>
                    <th className="text-left p-2">Details</th>
                    <th className="text-left p-2">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {history.logs.map((l) => (
                    <tr key={l.id}>
                      <td className="p-2 whitespace-nowrap">{fmt(l.timestamp)}</td>
                      <td className="p-2 font-mono text-[#A25828]">{l.action}</td>
                      <td className="p-2">{l.details}</td>
                      <td className="p-2 font-mono">{l.ipAddress || ''}</td>
                    </tr>
                  ))}
                  {history.logs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-stone-400">No events yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
