'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, ShieldCheck, ExternalLink } from 'lucide-react';
import api from '@/lib/api';

export default function AdminCommentsPage() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/comments/unanswered')
      .then(({ data }) => setComments(data.comments))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2">
        <MessageSquare size={20} className="text-[var(--color-signal)]" />
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">Unanswered comments</h1>
      </div>
      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
        Top-level lesson comments that have not yet received an admin reply.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]" />
          ))
        ) : comments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] py-12 text-center text-sm text-[var(--color-ink-soft)]">
            All comments have been answered.
          </div>
        ) : (
          comments.map((c) => (
            <div
              key={c._id}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-ink-soft)]">
                    <span className="font-semibold text-[var(--color-ink)]">{c.authorId?.name || 'Unknown'}</span>
                    <span>•</span>
                    <span>{c.courseId?.title || 'Unknown course'}</span>
                    <span>•</span>
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--color-ink)]">{c.text}</p>
                </div>
                <Link
                  href={`/courses/${c.courseId?._id || c.courseId}`}
                  target="_blank"
                  className="flex items-center gap-1 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-signal)] hover:border-[var(--color-signal)] shrink-0"
                >
                  <ExternalLink size={12} />
                  Go to lesson
                </Link>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-[var(--color-ink-soft)]">
                <ShieldCheck size={12} className="text-[var(--color-signal)]" />
                Open the lesson page as admin to reply
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
