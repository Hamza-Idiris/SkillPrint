'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, LoaderCircle, MessageSquare, ShieldCheck, Trash2, CornerDownRight } from 'lucide-react';
import api, { getErrorMessage } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

function Avatar({ user, size = 32 }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-signal-soft)] text-[var(--color-signal)] font-semibold text-xs"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {user?.avatar?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.avatar.url} alt="" className="h-full w-full object-cover" />
      ) : (
        user?.name?.[0]?.toUpperCase() || '?'
      )}
    </span>
  );
}

function CommentItem({ comment, courseId, lessonId, onDeleted, onReplied }) {
  const { user } = useAuth();
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyError, setReplyError] = useState('');

  const canDelete =
    user && (user.role === 'admin' || user.id === comment.authorId?._id || user.id === comment.authorId?.id);

  const handleDelete = async () => {
    if (!confirm('Delete this comment?')) return;
    try {
      await api.delete(`/courses/${courseId}/lessons/${lessonId}/comments/${comment._id}`);
      onDeleted(comment._id);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmitting(true);
    setReplyError('');
    try {
      const { data } = await api.post(`/courses/${courseId}/lessons/${lessonId}/comments`, {
        text: replyText.trim(),
        parentId: comment._id,
      });
      onReplied(comment._id, data.comment);
      setReplyText('');
      setReplying(false);
    } catch (err) {
      setReplyError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex gap-3">
      <Avatar user={comment.authorId} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-[var(--color-ink)]">{comment.authorId?.name || 'Unknown'}</span>
          {comment.isAdminReply && (
            <span className="flex items-center gap-1 rounded-full bg-[var(--color-signal-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-signal)]">
              <ShieldCheck size={10} /> Admin
            </span>
          )}
          <span className="text-xs text-[var(--color-ink-soft)]">{new Date(comment.createdAt).toLocaleDateString()}</span>
        </div>
        <p className="mt-1 whitespace-pre-line text-sm text-[var(--color-ink)]">{comment.text}</p>

        <div className="mt-2 flex items-center gap-3">
          {user && !comment.parentId && (
            <button
              onClick={() => setReplying((r) => !r)}
              className="flex items-center gap-1 text-xs font-medium text-[var(--color-ink-soft)] hover:text-[var(--color-signal)]"
            >
              <CornerDownRight size={12} /> Reply
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 text-xs text-[var(--color-ink-soft)] hover:text-[var(--color-danger)]"
            >
              <Trash2 size={12} /> Delete
            </button>
          )}
        </div>

        {replying && (
          <form onSubmit={handleReply} className="mt-2 flex flex-col gap-2">
            <textarea
              rows={2}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply…"
              className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2 text-sm outline-none focus:border-[var(--color-signal)]"
            />
            {replyError && <p className="text-xs text-[var(--color-danger)]">{replyError}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1 rounded-full bg-[var(--color-signal)] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-70"
              >
                {submitting && <LoaderCircle size={12} className="animate-spin" />} Send
              </button>
              <button type="button" onClick={() => setReplying(false)} className="text-xs text-[var(--color-ink-soft)]">
                Cancel
              </button>
            </div>
          </form>
        )}

        {(comment.replies || []).length > 0 && (
          <div className="mt-3 flex flex-col gap-3 border-l-2 border-[var(--color-border)] pl-4">
            {comment.replies.map((reply) => (
              <div key={reply._id} className="flex gap-3">
                <Avatar user={reply.authorId} size={26} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[var(--color-ink)]">{reply.authorId?.name || 'Unknown'}</span>
                    {reply.isAdminReply && (
                      <span className="flex items-center gap-1 rounded-full bg-[var(--color-signal-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-signal)]">
                        <ShieldCheck size={10} /> Admin
                      </span>
                    )}
                    <span className="text-xs text-[var(--color-ink-soft)]">{new Date(reply.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-1 whitespace-pre-line text-sm text-[var(--color-ink)]">{reply.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LessonComments({ courseId, lessonId, isEnrolled, isAdmin }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canSee = isEnrolled || isAdmin;

  const load = useCallback(() => {
    if (!canSee || !courseId || !lessonId) return;
    setLoading(true);
    api
      .get(`/courses/${courseId}/lessons/${lessonId}/comments`)
      .then(({ data }) => setComments(data.comments))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [canSee, courseId, lessonId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching remote data and updating state in response, not a cascading render
    load();
  }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const { data } = await api.post(`/courses/${courseId}/lessons/${lessonId}/comments`, { text: text.trim() });
      setComments((prev) => [...prev, { ...data.comment, replies: [] }]);
      setText('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleted = (id) => {
    setComments((prev) => prev.filter((c) => c._id !== id));
  };

  const handleReplied = (parentId, reply) => {
    setComments((prev) =>
      prev.map((c) =>
        c._id === parentId ? { ...c, replies: [...(c.replies || []), reply] } : c
      )
    );
  };

  if (!canSee) return null;

  return (
    <div className="mt-10">
      <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-[var(--color-ink)]">
        <MessageSquare size={18} className="text-[var(--color-signal)]" />
        Questions &amp; Comments
      </h3>
      <p className="mt-1 text-xs text-[var(--color-ink-soft)]">
        Only enrolled students can see and post comments. Admins can reply to any comment.
      </p>

      {user && (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask a question or leave a comment about this lesson…"
            className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
          />
          {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="flex w-fit items-center gap-2 rounded-full bg-[var(--color-signal)] px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70"
          >
            {submitting ? <LoaderCircle size={14} className="animate-spin" /> : <Send size={14} />}
            Post comment
          </button>
        </form>
      )}

      <div className="mt-6 flex flex-col gap-5">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-[var(--color-surface)]" />
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-soft)]">No comments yet. Be the first to ask a question!</p>
        ) : (
          <AnimatePresence initial={false}>
            {comments.map((c) => (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
              >
                <CommentItem
                  comment={c}
                  courseId={courseId}
                  lessonId={lessonId}
                  onDeleted={handleDeleted}
                  onReplied={handleReplied}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
