'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { DollarSign, Users, BookMarked, Layers, AlertTriangle, MessageSquare } from 'lucide-react';
import api from '@/lib/api';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CARDS = [
  { key: 'totalRevenue', label: 'Total revenue', icon: DollarSign, format: (v) => `$${Number(v).toFixed(2)}` },
  { key: 'activeStudents', label: 'Active students', icon: Users, format: (v) => v },
  { key: 'totalApprovedEnrollments', label: 'Enrollments', icon: BookMarked, format: (v) => v },
  { key: 'totalCourses', label: 'Published courses', icon: Layers, format: (v) => v },
];

function Skeleton({ w = 'w-16', h = 'h-7' }) {
  return <span className={`inline-block ${h} ${w} animate-pulse rounded bg-[var(--color-border)]`} />;
}

function RevenueChart({ data }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.total), 1);
  return (
    <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h2 className="font-display font-semibold text-[var(--color-ink)]">Revenue — last 6 months</h2>
      <div className="mt-5 flex items-end gap-3" style={{ height: 140 }}>
        {data.map((d) => {
          const pct = (d.total / max) * 100;
          const label = `${MONTHS[(d._id.month - 1) % 12]} ${String(d._id.year).slice(2)}`;
          return (
            <div key={`${d._id.year}-${d._id.month}`} className="flex flex-1 flex-col items-center gap-1">
              <span className="font-data text-[10px] text-[var(--color-ink-soft)]">${d.total.toFixed(0)}</span>
              <div
                className="w-full rounded-t-lg bg-[var(--color-signal)]"
                style={{ height: `${Math.max(pct, 4)}%`, minHeight: 6 }}
              />
              <span className="font-data text-[10px] text-[var(--color-ink-soft)]">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [revenueByMonth, setRevenueByMonth] = useState([]);

  useEffect(() => {
    api.get('/admin/analytics').then(({ data }) => {
      setStats(data.stats);
      setRecentEnrollments(data.recentEnrollments || []);
      setRevenueByMonth(data.revenueByMonth || []);
    });
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">Dashboard</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Platform overview.</p>

      {/* Alert banners */}
      <div className="mt-4 flex flex-col gap-2">
        {stats && stats.expiringIn7Days > 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm font-medium text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
            <AlertTriangle size={16} />
            {stats.expiringIn7Days} enrollment{stats.expiringIn7Days === 1 ? '' : 's'} expiring in the next 7 days.
          </div>
        )}
        {stats && stats.unansweredComments > 0 && (
          <Link
            href="/admin/comments"
            className="flex items-center gap-2 rounded-xl border border-[var(--color-signal-soft)] bg-[var(--color-signal-soft)] px-4 py-3 text-sm font-medium text-[var(--color-signal)] hover:opacity-80"
          >
            <MessageSquare size={16} />
            {stats.unansweredComments} unanswered comment{stats.unansweredComments === 1 ? '' : 's'} — click to review
          </Link>
        )}
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map(({ key, label, icon: Icon, format }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-signal-soft)] text-[var(--color-signal)]">
              <Icon size={18} />
            </div>
            <p className="mt-4 font-data text-2xl font-bold text-[var(--color-ink)]">
              {stats ? format(stats[key]) : <Skeleton />}
            </p>
            <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue chart */}
      <RevenueChart data={revenueByMonth} />

      {/* Recent enrollments */}
      <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="font-display font-semibold text-[var(--color-ink)]">Recent enrollments</h2>
        {recentEnrollments.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--color-ink-soft)]">No enrollments yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">
                  <th className="pb-3 pr-4">Student</th>
                  <th className="pb-3 pr-4">Course</th>
                  <th className="pb-3 pr-4">Package</th>
                  <th className="pb-3 pr-4">Paid</th>
                  <th className="pb-3 pr-4">Expires</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {recentEnrollments.map((e) => {
                  const expired = e.expiresAt && new Date(e.expiresAt) < new Date();
                  return (
                    <tr key={e._id}>
                      <td className="py-3 pr-4">
                        <p className="font-medium text-[var(--color-ink)]">{e.studentId?.name || '—'}</p>
                        <p className="text-xs text-[var(--color-ink-soft)]">{e.studentId?.email || ''}</p>
                      </td>
                      <td className="py-3 pr-4 text-[var(--color-ink)]">{e.courseId?.title || '—'}</td>
                      <td className="py-3 pr-4 text-[var(--color-ink-soft)]">{e.package?.label || 'Forever'}</td>
                      <td className="py-3 pr-4 font-data font-semibold text-[var(--color-ink)]">
                        ${Number(e.payment?.amountPaid || 0).toFixed(2)}
                      </td>
                      <td className="py-3 pr-4">
                        {e.expiresAt ? (
                          <span className={expired ? 'text-[var(--color-danger)]' : 'text-[var(--color-ink-soft)]'}>
                            {new Date(e.expiresAt).toLocaleDateString()}
                            {expired && ' (expired)'}
                          </span>
                        ) : (
                          <span className="text-[var(--color-ink-soft)]">Forever</span>
                        )}
                      </td>
                      <td className="py-3 text-[var(--color-ink-soft)]">
                        {new Date(e.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
