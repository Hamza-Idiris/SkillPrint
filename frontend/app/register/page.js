'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const scorePassword = (pw) => {
  let score = 0;
  if (pw.length >= 6) score += 1;
  if (pw.length >= 10) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return Math.min(score, 4);
};

const STRENGTH_LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['var(--color-danger)', 'var(--color-danger)', '#f59e0b', 'var(--color-signal)', 'var(--color-mint)'];

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', phoneNumber: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const strength = useMemo(() => scorePassword(form.password), [form.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await register(form);
    setLoading(false);
    if (res.success) router.push('/courses');
    else setError(res.message);
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-5 py-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">Create your account</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Start learning in a few seconds.</p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
            Full name
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
            Mobile wallet number <span className="font-normal text-[var(--color-ink-soft)]">(used for course payments)</span>
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              placeholder="e.g. 61XXXXXXX"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
            Password
            <div className="flex items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3">
              <input
                type={showPw ? 'text' : 'password'}
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-transparent py-2.5 text-sm outline-none"
              />
              <button type="button" onClick={() => setShowPw((s) => !s)} className="text-[var(--color-ink-soft)]">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          {form.password.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-1.5 flex-1 rounded-full transition-colors"
                    style={{ background: i < strength ? STRENGTH_COLORS[strength] : 'var(--color-border)' }}
                  />
                ))}
              </div>
              <span className="text-xs font-medium" style={{ color: STRENGTH_COLORS[strength] }}>
                {STRENGTH_LABELS[strength]}
              </span>
            </div>
          )}

          {error && <p className="rounded-lg bg-[var(--color-danger-soft)] px-3 py-2 text-sm text-[var(--color-danger)]">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 rounded-full bg-[var(--color-signal)] px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70"
          >
            {loading && <LoaderCircle size={16} className="animate-spin" />}
            Create account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-ink-soft)]">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-[var(--color-signal)] hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
