'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Lock, Play, LoaderCircle } from 'lucide-react';
import api, { getErrorMessage } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SERVER_ORIGIN = API_URL.replace(/\/api\/?$/, '');

/**
 * The spec's core UX moment: a lesson is either behind a lock (not enrolled,
 * not a free preview) or fully unlocked (enrolled / preview). We never ask
 * the backend for the raw video URL — only a short-lived stream token — so
 * the unlock is a real state change, not a cosmetic one.
 */
export default function GatedVideoPlayer({ courseId, lessonId, title, isPreviewFree, isEnrolled, isLoggedIn }) {
  const [state, setState] = useState('idle'); // idle | loading | playing | error
  const [streamUrl, setStreamUrl] = useState(null);
  const [error, setError] = useState('');

  const canAttemptPlay = isPreviewFree || isEnrolled;

  const handlePlay = async () => {
    if (!canAttemptPlay) return;
    setState('loading');
    setError('');
    try {
      const { data } = await api.post(`/courses/${courseId}/lessons/${lessonId}/token`);
      setStreamUrl(`${SERVER_ORIGIN}${data.streamUrl}`);
      setState('playing');
    } catch (err) {
      setError(getErrorMessage(err));
      setState('error');
    }
  };

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-ink)]">
      <AnimatePresence mode="wait">
        {state === 'playing' && streamUrl ? (
          <motion.iframe
            key="player"
            src={streamUrl}
            title={title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <motion.div
            key="locked"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-[var(--color-ink)] to-[#0b0d11] px-6 text-center backdrop-blur-sm"
          >
            <motion.button
              onClick={handlePlay}
              disabled={!canAttemptPlay || state === 'loading'}
              whileHover={canAttemptPlay ? { scale: 1.06 } : {}}
              whileTap={canAttemptPlay ? { scale: 0.96 } : {}}
              className={`relative flex h-16 w-16 items-center justify-center rounded-full border-2 transition-colors ${
                canAttemptPlay
                  ? 'border-[var(--color-signal)] bg-[var(--color-signal-soft)] text-[var(--color-signal)] cursor-pointer'
                  : 'border-white/20 bg-white/5 text-white/50 cursor-not-allowed'
              }`}
            >
              {canAttemptPlay && (
                <motion.span
                  className="absolute inset-0 rounded-full border-2 border-[var(--color-signal)]"
                  animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                />
              )}
              {state === 'loading' ? (
                <LoaderCircle size={26} className="animate-spin" />
              ) : canAttemptPlay ? (
                <Play size={26} fill="currentColor" />
              ) : (
                <Lock size={24} />
              )}
            </motion.button>

            <div>
              <p className="font-display text-base font-semibold text-white">{title}</p>
              {canAttemptPlay ? (
                <p className="mt-1 text-sm text-white/60">
                  {isPreviewFree ? 'Free preview — tap to play' : 'Unlocked — tap to play'}
                </p>
              ) : (
                <p className="mt-1 text-sm text-white/60">
                  {isLoggedIn ? 'Enroll in this course to unlock this lesson' : 'Log in and enroll to unlock this lesson'}
                </p>
              )}
              {error && <p className="mt-2 text-sm text-[var(--color-danger)]">{error}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
