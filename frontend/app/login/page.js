'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await login(form.email, form.password);
    setLoading(false);
    if (res.success) router.push('/courses');
    else setError(res.message);
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-5 py-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">Welcome back</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Log in to continue your courses.</p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
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
            Password
            <div className="flex items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3">
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full py-2.5 text-sm outline-none bg-transparent"
              />
              <button type="button" onClick={() => setShowPw((s) => !s)} className="text-[var(--color-ink-soft)]">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs font-medium text-[var(--color-signal)] hover:underline">
              Forgot password?
            </Link>
          </div>

          {error && <p className="rounded-lg bg-[var(--color-danger-soft)] px-3 py-2 text-sm text-[var(--color-danger)]">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 rounded-full bg-[var(--color-signal)] px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70"
          >
            {loading && <LoaderCircle size={16} className="animate-spin" />}
            Log in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-ink-soft)]">
          New to SkillSprint?{' '}
          <Link href="/register" className="font-medium text-[var(--color-signal)] hover:underline">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
