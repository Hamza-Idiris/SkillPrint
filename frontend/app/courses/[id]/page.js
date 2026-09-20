'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, PlayCircle, Tag, BadgeCheck, AlertTriangle, Clock } from 'lucide-react';
import api, { getErrorMessage } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import GatedVideoPlayer from '@/components/GatedVideoPlayer';
import PaymentModal from '@/components/PaymentModal';
import LessonComments from '@/components/LessonComments';

export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentExpired, setEnrollmentExpired] = useState(false);
  const [enrollmentExpiresAt, setEnrollmentExpiresAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [payOpen, setPayOpen] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get(`/courses/${id}`);
      setCourse(data.course);
      setIsEnrolled(data.isEnrolled);
      setEnrollmentExpired(data.enrollmentExpired || false);
      setEnrollmentExpiresAt(data.enrollmentExpiresAt || null);
      setActiveLessonId(data.course.lessons[0]?.id || null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reloading course data when the route param changes, not a cascading render
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return <div className="mx-auto max-w-5xl px-5 py-16 text-sm text-[var(--color-ink-soft)]">Loading course…</div>;
  }
  if (error || !course) {
    return <div className="mx-auto max-w-5xl px-5 py-16 text-sm text-[var(--color-danger)]">{error || 'Course not found.'}</div>;
  }

  const activeLesson = course.lessons.find((l) => l.id === activeLessonId) || course.lessons[0];
  const hasDiscount = course.discount?.active && course.discount.percent > 0;

  const handleEnrollClick = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setPayOpen(true);
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {activeLesson ? (
            <GatedVideoPlayer
              courseId={course.id}
              lessonId={activeLesson.id}
              title={activeLesson.title}
              isPreviewFree={activeLesson.isPreviewFree}
              isEnrolled={isEnrolled}
              isLoggedIn={!!user}
            />
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] text-sm text-[var(--color-ink-soft)]">
              No lessons published yet.
            </div>
          )}

          <div className="mt-6">
            <span className="flex w-fit items-center gap-1 rounded-full bg-[var(--color-signal-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-signal)]">
              <Tag size={11} /> {course.category}
            </span>
            <h1 className="mt-3 font-display text-2xl font-bold text-[var(--color-ink)] md:text-3xl">{course.title}</h1>
            <p className="mt-3 text-[var(--color-ink-soft)]">{course.description}</p>
          </div>

          {activeLesson && (
            <LessonComments
              courseId={course.id}
              lessonId={activeLesson.id}
              isEnrolled={isEnrolled}
              isAdmin={user?.role === 'admin'}
            />
          )}

          <div className="mt-8">
            <h2 className="mb-3 font-display text-lg font-semibold text-[var(--color-ink)]">Lessons</h2>
            <div className="flex flex-col gap-2">
              {course.lessons.map((lesson, idx) => {
                const unlocked = lesson.isPreviewFree || isEnrolled;
                const active = lesson.id === activeLessonId;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLessonId(lesson.id)}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                      active
                        ? 'border-[var(--color-signal)] bg-[var(--color-signal-soft)]'
                        : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-signal)]/50'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="font-data text-xs text-[var(--color-ink-soft)]">{String(idx + 1).padStart(2, '0')}</span>
                      {unlocked ? (
                        <PlayCircle size={16} className="text-[var(--color-signal)]" />
                      ) : (
                        <Lock size={14} className="text-[var(--color-ink-soft)]" />
                      )}
                      <span className="text-sm font-medium text-[var(--color-ink)]">{lesson.title}</span>
                      {lesson.isPreviewFree && (
                        <span className="rounded-full bg-[var(--color-mint-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--color-mint)]">
                          Free preview
                        </span>
                      )}
                    </span>
                    <span className="font-data text-xs text-[var(--color-ink-soft)]">{lesson.duration}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar: pricing / enroll */}
        <motion.aside
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-fit rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
        >
          <div className="flex items-baseline gap-2">
            {hasDiscount && (
              <span className="text-sm text-[var(--color-ink-soft)] line-through">${course.price.toFixed(2)}</span>
            )}
            <span className="font-data text-3xl font-bold text-[var(--color-ink)]">${course.effectivePrice.toFixed(2)}</span>
            {hasDiscount && (
              <span className="rounded-full bg-[var(--color-signal)] px-2 py-0.5 text-xs font-semibold text-white">
                -{course.discount.percent}%
              </span>
            )}
          </div>

          {enrollmentExpired ? (
            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-[var(--color-danger-soft)] bg-[var(--color-danger-soft)] p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-danger)]">
                <AlertTriangle size={16} /> Access expired
              </div>
              {enrollmentExpiresAt && (
                <p className="flex items-center gap-1 text-xs text-[var(--color-danger)]">
                  <Clock size={12} /> Expired {new Date(enrollmentExpiresAt).toLocaleDateString()}
                </p>
              )}
              <button
                onClick={handleEnrollClick}
                className="w-full rounded-full bg-[var(--color-signal)] px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95"
              >
                Re-enroll
              </button>
            </div>
          ) : isEnrolled ? (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-[var(--color-mint-soft)] px-3 py-3 text-sm font-medium text-[var(--color-mint)]">
              <BadgeCheck size={18} /> You&apos;re enrolled
            </div>
          ) : (
            <button
              onClick={handleEnrollClick}
              className="mt-4 w-full rounded-full bg-[var(--color-signal)] px-4 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95"
            >
              Enroll now
            </button>
          )}

          <ul className="mt-5 flex flex-col gap-2 text-sm text-[var(--color-ink-soft)]">
            <li>• {course.lessonCount} lesson{course.lessonCount === 1 ? '' : 's'}</li>
            {enrollmentExpiresAt && !enrollmentExpired && (
              <li className="flex items-center gap-1">
                <Clock size={12} /> Access until {new Date(enrollmentExpiresAt).toLocaleDateString()}
              </li>
            )}
            {!enrollmentExpiresAt && !enrollmentExpired && <li>• Lifetime access after enrollment</li>}
            <li>• Pay securely by mobile wallet</li>
          </ul>
        </motion.aside>
      </div>

      <PaymentModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        course={course}
        onSuccess={() => {
          setIsEnrolled(true);
        }}
      />
    </div>
  );
}
