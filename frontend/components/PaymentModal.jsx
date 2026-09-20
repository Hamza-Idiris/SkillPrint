'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, CheckCircle2, LoaderCircle, Clock } from 'lucide-react';
import Modal from './Modal';
import api, { getErrorMessage } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function PaymentModal({ open, onClose, course, onSuccess }) {
  const { user } = useAuth();
  const [accountNo, setAccountNo] = useState(user?.phoneNumber || '');
  const [status, setStatus] = useState('form'); // form | paying | success | error
  const [error, setError] = useState('');
  const [packages, setPackages] = useState([]);
  const [selectedPkg, setSelectedPkg] = useState(null);

  useEffect(() => {
    if (!open) return;
    api.get('/settings').then(({ data }) => {
      const pkgs = (data.settings?.coursePackages || []).filter((p) => p.enabled !== false);
      setPackages(pkgs);
      if (pkgs.length > 0 && !selectedPkg) {
        setSelectedPkg(pkgs[0].key);
      }
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!course) return null;

  const currentPkg = packages.find((p) => p.key === selectedPkg) || packages[0];

  const handlePay = async (e) => {
    e.preventDefault();
    setStatus('paying');
    setError('');
    try {
      const { data } = await api.post('/enrollments/purchase', {
        courseId: course.id,
        accountNo,
        packageKey: selectedPkg || 'forever',
      });
      setStatus('success');
      onSuccess?.(data.enrollment);
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus('error');
    }
  };

  const close = () => {
    if (status === 'paying') return;
    setStatus('form');
    setError('');
    onClose();
  };

  const displayPrice = currentPkg ? `$${Number(currentPkg.priceUSD).toFixed(2)}` : `$${course.effectivePrice.toFixed(2)}`;
  const displayAccess = currentPkg
    ? currentPkg.durationDays === 0
      ? 'Lifetime access'
      : `Access for ${currentPkg.label}`
    : 'Lifetime access';

  return (
    <Modal open={open} onClose={close} title={status === 'success' ? "You're enrolled" : 'Choose a package'}>
      {status === 'success' ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3 py-4 text-center"
        >
          <CheckCircle2 size={48} className="text-[var(--color-mint)]" />
          <p className="text-sm text-[var(--color-ink-soft)]">
            Payment approved. <span className="font-medium text-[var(--color-ink)]">{course.title}</span> is now unlocked.
          </p>
          <button
            onClick={close}
            className="mt-2 w-full rounded-full bg-[var(--color-signal)] px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95"
          >
            Start learning
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handlePay} className="flex flex-col gap-4">
          <div className="rounded-xl bg-[var(--color-signal-soft)] p-3 text-sm">
            <p className="text-[var(--color-ink-soft)]">You&apos;re enrolling in</p>
            <p className="font-display font-semibold text-[var(--color-ink)]">{course.title}</p>
          </div>

          {packages.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-[var(--color-ink)]">Select access package</p>
              <div className="flex flex-col gap-2">
                {packages.map((pkg) => (
                  <label
                    key={pkg.key}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-colors ${
                      selectedPkg === pkg.key
                        ? 'border-[var(--color-signal)] bg-[var(--color-signal-soft)]'
                        : 'border-[var(--color-border)] bg-[var(--color-surface)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="package"
                        value={pkg.key}
                        checked={selectedPkg === pkg.key}
                        onChange={() => setSelectedPkg(pkg.key)}
                        className="accent-[var(--color-signal)]"
                      />
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-ink)]">{pkg.label}</p>
                        <p className="flex items-center gap-1 text-xs text-[var(--color-ink-soft)]">
                          <Clock size={11} />
                          {pkg.durationDays === 0 ? 'Lifetime access' : `${pkg.durationDays} days access`}
                        </p>
                      </div>
                    </div>
                    <span className="font-data text-base font-bold text-[var(--color-signal)]">
                      ${Number(pkg.priceUSD).toFixed(2)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
            Mobile wallet number
            <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2.5">
              <Smartphone size={16} className="text-[var(--color-ink-soft)]" />
              <input
                type="tel"
                required
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value)}
                placeholder="e.g. 61XXXXXXX"
                className="w-full bg-transparent text-sm text-[var(--color-ink)] outline-none"
              />
            </div>
            <span className="text-xs font-normal text-[var(--color-ink-soft)]">
              You&apos;ll get a payment prompt on this number to approve with your PIN.
            </span>
          </label>

          {error && (
            <p className="rounded-lg bg-[var(--color-danger-soft)] px-3 py-2 text-sm text-[var(--color-danger)]">{error}</p>
          )}

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm">
            <span className="text-[var(--color-ink-soft)]">{displayAccess} · </span>
            <span className="font-semibold text-[var(--color-ink)]">{displayPrice}</span>
          </div>

          <button
            type="submit"
            disabled={status === 'paying'}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-signal)] px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70"
          >
            {status === 'paying' ? (
              <>
                <LoaderCircle size={16} className="animate-spin" /> Waiting for approval on your phone…
              </>
            ) : (
              `Pay ${displayPrice}`
            )}
          </button>
        </form>
      )}
    </Modal>
  );
}
