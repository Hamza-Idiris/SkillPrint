'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlayCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function MyCoursesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    api
      .get('/enrollments/mine')
      .then(({ data }) => setEnrollments(data.enrollments))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || !user) return null;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">My Learning</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Courses you&apos;re enrolled in.</p>

      {loading ? (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]" />
          ))}
        </div>
      ) : enrollments.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-[var(--color-border)] py-16 text-center">
          <p className="text-sm text-[var(--color-ink-soft)]">You haven&apos;t enrolled in any courses yet.</p>
          <Link href="/courses" className="mt-3 inline-block text-sm font-medium text-[var(--color-signal)] hover:underline">
            Browse the catalog
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((e) => (
            <Link
              key={e._id}
              href={`/courses/${e.courseId?._id}`}
              className="group flex items-center gap-4 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors hover:border-[var(--color-signal)]"
            >
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-[var(--color-signal-soft)]">
                {e.courseId?.coverImage?.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.courseId.coverImage.url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-semibold text-[var(--color-ink)]">{e.courseId?.title}</p>
                <p className="mt-1 text-xs text-[var(--color-ink-soft)]">{e.courseId?.category}</p>
              </div>
              <PlayCircle size={20} className="shrink-0 text-[var(--color-signal)] opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
