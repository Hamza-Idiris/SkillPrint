'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, LoaderCircle } from 'lucide-react';
import api, { getErrorMessage } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user, loading, setUser, refresh } = useAuth();
  const router = useRouter();
  const fileRef = useRef(null);

  const [form, setForm] = useState({ name: '', bio: '', phoneNumber: '', targetSkills: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState(null); // { type, text }

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- populating a controlled form once the user loads, not a cascading render
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        phoneNumber: user.phoneNumber || '',
        targetSkills: (user.targetSkills || []).join(', '),
        password: '',
      });
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className="mx-auto max-w-2xl px-5 py-16 text-sm text-[var(--color-ink-soft)]">Loading…</div>;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      const { data } = await api.put('/users/profile', payload);
      setUser(data.user);
      setMessage({ type: 'success', text: 'Profile updated.' });
      setForm((f) => ({ ...f, password: '' }));
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      await api.put('/users/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await refresh();
      setMessage({ type: 'success', text: 'Avatar updated.' });
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">Profile settings</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Update your details and target skills.</p>

      <div className="mt-8 flex items-center gap-4">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[var(--color-signal-soft)] text-2xl font-semibold text-[var(--color-signal)]">
            {user.avatar?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar.url} alt="" className="h-full w-full object-cover" />
            ) : (
              user.name?.[0]?.toUpperCase()
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--color-paper)] bg-[var(--color-signal)] text-white"
            aria-label="Change avatar"
          >
            {uploadingAvatar ? <LoaderCircle size={14} className="animate-spin" /> : <Camera size={14} />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
        </div>
        <div>
          <p className="font-medium text-[var(--color-ink)]">{user.name}</p>
          <p className="text-sm text-[var(--color-ink-soft)]">{user.email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
          Full name
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
          Bio
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={3}
            maxLength={500}
            className="resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
          Mobile wallet number
          <input
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
          Target skills <span className="font-normal text-[var(--color-ink-soft)]">(comma separated)</span>
          <input
            value={form.targetSkills}
            onChange={(e) => setForm({ ...form, targetSkills: e.target.value })}
            placeholder="e.g. React, UX writing, SQL"
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
          New password <span className="font-normal text-[var(--color-ink-soft)]">(leave blank to keep current)</span>
          <input
            type="password"
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
          />
        </label>

        {message && (
          <p
            className="rounded-lg px-3 py-2 text-sm"
            style={{
              background: message.type === 'success' ? 'var(--color-mint-soft)' : 'var(--color-danger-soft)',
              color: message.type === 'success' ? 'var(--color-mint)' : 'var(--color-danger)',
            }}
          >
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-2 flex items-center justify-center gap-2 self-start rounded-full bg-[var(--color-signal)] px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70"
        >
          {saving && <LoaderCircle size={16} className="animate-spin" />}
          Save changes
        </button>
      </form>
    </div>
  );
}
