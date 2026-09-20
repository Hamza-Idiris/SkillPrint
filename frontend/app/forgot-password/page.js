'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LoaderCircle, Mail } from 'lucide-react';
import api, { getErrorMessage } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setResetUrl('');
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage({ type: 'success', text: data.message });
      if (data.resetUrl) setResetUrl(data.resetUrl);
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-5 py-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">Forgot password</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
          Enter your email and we will generate a reset link for you.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
            Email
            <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5">
              <Mail size={16} className="shrink-0 text-[var(--color-ink-soft)]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
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

          {resetUrl && (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-xs">
              <p className="font-semibold text-[var(--color-ink)]">Your reset link (open in browser):</p>
              <a
                href={resetUrl}
                className="mt-1 block break-all font-mono text-[var(--color-signal)] underline"
              >
                {resetUrl}
              </a>
              <p className="mt-2 text-[var(--color-ink-soft)]">This link expires in 1 hour.</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 rounded-full bg-[var(--color-signal)] px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70"
          >
            {loading && <LoaderCircle size={16} className="animate-spin" />}
            Generate reset link
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-ink-soft)]">
          Remembered it?{' '}
          <Link href="/login" className="font-medium text-[var(--color-signal)] hover:underline">
            Back to log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
