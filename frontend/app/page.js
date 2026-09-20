'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Video, BadgePercent } from 'lucide-react';
import api from '@/lib/api';
import CourseCard from '@/components/CourseCard';

export default function HomePage() {
  const [settings, setSettings] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [settingsRes, coursesRes] = await Promise.all([
          api.get('/settings'),
          api.get('/courses'),
        ]);
        setSettings(settingsRes.data.settings);
        setCourses(coursesRes.data.courses.slice(0, 6));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      {settings?.announcementBar && (
        <div className="bg-[var(--color-ink)] px-5 py-2 text-center text-sm font-medium text-white">
          {settings.announcementBar}
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--color-border)]">
        <div
          className="absolute inset-0 -z-10 opacity-90"
          style={{
            background:
              'radial-gradient(1100px 500px at 15% -10%, var(--color-signal-soft), transparent 60%), radial-gradient(900px 500px at 100% 0%, var(--color-signal-soft), transparent 55%)',
          }}
        />
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-20 md:py-28">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-full bg-[var(--color-signal-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-signal)]"
          >
            Mentorship-backed courses
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="max-w-2xl font-display text-4xl font-bold leading-[1.1] text-[var(--color-ink)] md:text-5xl"
          >
            {settings?.heroTitle || 'Learn skills that move your career forward'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-lg text-lg text-[var(--color-ink-soft)]"
          >
            {settings?.heroSubtitle || 'Practical courses, mentorship, and hands-on projects.'}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Link
              href="/courses"
              className="group inline-flex items-center gap-2 rounded-full bg-[var(--color-signal)] px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-95"
            >
              Browse courses
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { icon: Video, label: 'Gated lesson videos', desc: 'Unlock instantly on enrollment' },
              { icon: ShieldCheck, label: 'Secure mobile payments', desc: 'Pay by mobile wallet' },
              { icon: BadgePercent, label: 'Regular discounts', desc: 'Sitewide & per-course sales' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/70 p-3">
                <Icon size={18} className="mt-0.5 shrink-0 text-[var(--color-signal)]" />
                <div>
                  <p className="text-sm font-semibold text-[var(--color-ink)]">{label}</p>
                  <p className="text-xs text-[var(--color-ink-soft)]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats / social proof */}
      {settings?.stats?.length > 0 && (
        <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 py-10 sm:grid-cols-4">
            {settings.stats.map((s, i) => (
              <motion.div
                key={`${s.label}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="text-center"
              >
                <p className="font-data text-2xl font-bold text-[var(--color-signal)] md:text-3xl">{s.value}</p>
                <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Featured courses */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold text-[var(--color-ink)]">Featured courses</h2>
          <Link href="/courses" className="text-sm font-medium text-[var(--color-signal)] hover:underline">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-soft)]">No courses published yet — check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
