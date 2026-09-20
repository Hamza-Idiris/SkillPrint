'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import api, { getErrorMessage } from '@/lib/api';

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') || '';
  const email = params.get('email') || '';

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(
    !token || !email ? { type: 'error', text: 'Invalid reset link. Please request a new one.' } : null
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const { data } = await api.post('/auth/reset-password', {
        token,
        email,
        password: form.password,
      });
      setMessage({ type: 'success', text: data.message });
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-5 py-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">Reset password</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Enter a new password for {email || 'your account'}.</p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
            New password
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

          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
            Confirm password
            <input
              type={showPw ? 'text' : 'password'}
              required
              minLength={6}
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
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
              {message.type === 'success' && ' Redirecting to login…'}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !token || !email}
            className="mt-2 flex items-center justify-center gap-2 rounded-full bg-[var(--color-signal)] px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70"
          >
            {loading && <LoaderCircle size={16} className="animate-spin" />}
            Set new password
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-ink-soft)]">
          <Link href="/forgot-password" className="font-medium text-[var(--color-signal)] hover:underline">
            Request a new link
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
