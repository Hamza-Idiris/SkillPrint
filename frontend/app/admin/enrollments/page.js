'use client';

import { useEffect, useState } from 'react';
import { ShieldOff } from 'lucide-react';
import api from '@/lib/api';

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/enrollments').then(({ data }) => setEnrollments(data.enrollments)).finally(() => setLoading(false));
  };
  // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time data fetch on mount, not a cascading render
  useEffect(load, []);

  const handleRevoke = async (id, studentName) => {
    const refund = confirm(`Revoke access for ${studentName}?\n\nClick OK to also attempt a Waafi refund, or Cancel to revoke without refunding.`);
    const reason = prompt('Reason (optional):') || '';
    try {
      await api.put(`/enrollments/${id}/revoke`, { reason, refund });
      load();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to revoke enrollment');
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">Enrollments</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
        Payments are verified instantly via WaafiPay — students are auto-enrolled on success.
      </p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--color-border)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--color-surface)] text-xs uppercase text-[var(--color-ink-soft)]">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Transaction</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-[var(--color-ink-soft)]">Loading…</td></tr>
            ) : enrollments.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-[var(--color-ink-soft)]">No enrollments yet.</td></tr>
            ) : (
              enrollments.map((e) => (
                <tr key={e._id} className="border-t border-[var(--color-border)] bg-[var(--color-paper)]">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--color-ink)]">{e.studentId?.name}</p>
                    <p className="text-xs text-[var(--color-ink-soft)]">{e.studentId?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-ink-soft)]">{e.courseId?.title}</td>
                  <td className="px-4 py-3 font-data">${e.payment?.amountPaid?.toFixed(2)}</td>
                  <td className="px-4 py-3 font-data text-xs text-[var(--color-ink-soft)]">{e.payment?.transactionId}</td>
                  <td className="px-4 py-3">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{
                        background: e.status === 'approved' ? 'var(--color-mint-soft)' : 'var(--color-danger-soft)',
                        color: e.status === 'approved' ? 'var(--color-mint)' : 'var(--color-danger)',
                      }}
                    >
                      {e.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {e.status === 'approved' && (
                      <button
                        onClick={() => handleRevoke(e._id, e.studentId?.name)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-danger)]"
                      >
                        <ShieldOff size={14} /> Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
