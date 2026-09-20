'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, LoaderCircle, Upload } from 'lucide-react';
import Modal from '@/components/Modal';
import api, { getErrorMessage } from '@/lib/api';

const emptyLesson = () => ({ title: '', videoUrl: '', duration: '10:00 mins', isPreviewFree: false });

const emptyForm = () => ({
  title: '',
  description: '',
  category: '',
  price: '',
  discountPercent: 0,
  discountActive: false,
  coverImage: null, // { url, public_id }
  lessons: [emptyLesson()],
});

export default function CourseFormModal({ open, onClose, courseId, onSaved }) {
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState('');
  const isEdit = !!courseId;

  useEffect(() => {
    if (!open) return;
    if (courseId) {
      api.get(`/courses/${courseId}/admin`).then(({ data }) => {
        const c = data.course;
        setForm({
          title: c.title,
          description: c.description,
          category: c.category,
          price: c.price,
          discountPercent: c.discountPercent || 0,
          discountActive: !!c.discountActive,
          coverImage: c.coverImage,
          lessons: c.lessons.length
            ? c.lessons.map((l) => ({ title: l.title, videoUrl: l.videoUrl || '', duration: l.duration, isPreviewFree: l.isPreviewFree }))
            : [emptyLesson()],
        });
      });
    } else {
      setForm(emptyForm());
    }
    setError('');
  }, [open, courseId]);

  const updateLesson = (idx, field, value) => {
    setForm((f) => {
      const lessons = [...f.lessons];
      lessons[idx] = { ...lessons[idx], [field]: value };
      return { ...f, lessons };
    });
  };

  const addLesson = () => setForm((f) => ({ ...f, lessons: [...f.lessons, emptyLesson()] }));
  const removeLesson = (idx) => setForm((f) => ({ ...f, lessons: f.lessons.filter((_, i) => i !== idx) }));

  // Per-lesson "upload from computer" state, keyed by lesson index — separate
  // from `form` since it's transient UI state, not saved course data.
  const [videoUploads, setVideoUploads] = useState({}); // { [idx]: { uploading, progress, error } }

  const handleVideoFileUpload = async (idx, file) => {
    if (!file) return;
    setVideoUploads((v) => ({ ...v, [idx]: { uploading: true, progress: 0, error: null } }));

    try {
      const fd = new FormData();
      fd.append('video', file);
      fd.append('title', form.lessons[idx].title || file.name);

      const { data } = await api.post('/admin/videos/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          const progress = evt.total ? Math.round((evt.loaded / evt.total) * 100) : 0;
          setVideoUploads((v) => ({ ...v, [idx]: { uploading: true, progress, error: null } }));
        },
      });
      updateLesson(idx, 'videoUrl', data.videoUrl);
      setVideoUploads((v) => ({ ...v, [idx]: { uploading: false, progress: 100, error: null } }));
    } catch (err) {
      setVideoUploads((v) => ({ ...v, [idx]: { uploading: false, progress: 0, error: getErrorMessage(err) } }));
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Cover must exist before we can attach it via /courses/:id/cover, so for
    // new courses we stash the file and upload right after creation instead.
    if (!isEdit) {
      setForm((f) => ({ ...f, _pendingCoverFile: file, coverImage: { url: URL.createObjectURL(file), public_id: '' } }));
      return;
    }

    setUploadingCover(true);
    try {
      const fd = new FormData();
      fd.append('cover', file);
      const { data } = await api.post(`/courses/${courseId}/cover`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((f) => ({ ...f, coverImage: data.coverImage }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        price: Number(form.price),
        discountPercent: Number(form.discountPercent) || 0,
        discountActive: !!form.discountActive,
        lessons: form.lessons.filter((l) => l.title && l.videoUrl),
      };

      if (isEdit) {
        await api.put(`/courses/${courseId}`, payload);
      } else {
        // Placeholder cover required by backend; real cover uploaded right after.
        const created = await api.post('/courses', {
          ...payload,
          coverImage: form.coverImage?.public_id ? form.coverImage : { url: 'https://placehold.co/1200x675?text=SkillSprint', public_id: '' },
        });
        const newId = created.data.course._id;
        if (form._pendingCoverFile) {
          const fd = new FormData();
          fd.append('cover', form._pendingCoverFile);
          await api.post(`/courses/${newId}/cover`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        }
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit course' : 'New course'} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="flex max-h-[75vh] flex-col gap-4 overflow-y-auto pr-1">
        <div className="flex items-center gap-4">
          <div className="h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-[var(--color-signal-soft)]">
            {form.coverImage?.url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.coverImage.url} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <label className="flex cursor-pointer items-center gap-2 rounded-full border border-[var(--color-border)] px-3 py-2 text-xs font-medium text-[var(--color-ink)] hover:border-[var(--color-signal)]">
            {uploadingCover ? <LoaderCircle size={14} className="animate-spin" /> : <Upload size={14} />}
            Cover image
            <input type="file" accept="image/*" hidden onChange={handleCoverUpload} />
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
          Title
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
          Description
          <textarea
            required
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
            Category
            <input
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
            Price (USD) — course salary
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
            />
          </label>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2.5">
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-ink)]">
            <input
              type="checkbox"
              checked={form.discountActive}
              onChange={(e) => setForm({ ...form, discountActive: e.target.checked })}
            />
            Course-specific discount
          </label>
          <input
            type="number"
            min="0"
            max="100"
            disabled={!form.discountActive}
            value={form.discountPercent}
            onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
            className="w-20 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 text-sm outline-none disabled:opacity-50"
          />
          <span className="text-sm text-[var(--color-ink-soft)]">% off (overrides sitewide discount)</span>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--color-ink)]">Lessons</span>
            <button type="button" onClick={addLesson} className="flex items-center gap-1 text-xs font-medium text-[var(--color-signal)]">
              <Plus size={14} /> Add lesson
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {form.lessons.map((lesson, idx) => (
              <div key={idx} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] p-3">
                <div className="flex items-center justify-between">
                  <span className="font-data text-xs text-[var(--color-ink-soft)]">Lesson {idx + 1}</span>
                  <button type="button" onClick={() => removeLesson(idx)} className="text-[var(--color-danger)]">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input
                    placeholder="Title"
                    value={lesson.title}
                    onChange={(e) => updateLesson(idx, 'title', e.target.value)}
                    className="col-span-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-2 text-sm outline-none"
                  />
                  <input
                    placeholder="YouTube unlisted URL"
                    value={lesson.videoUrl}
                    onChange={(e) => updateLesson(idx, 'videoUrl', e.target.value)}
                    disabled={videoUploads[idx]?.uploading}
                    className="col-span-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-2 text-sm outline-none disabled:opacity-60"
                  />
                  <div className="col-span-2 flex items-center gap-2">
                    <label
                      className={`flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-[var(--color-border)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-ink-soft)] hover:border-[var(--color-signal)] hover:text-[var(--color-signal)] ${
                        videoUploads[idx]?.uploading ? 'pointer-events-none opacity-60' : ''
                      }`}
                    >
                      {videoUploads[idx]?.uploading ? (
                        <LoaderCircle size={12} className="animate-spin" />
                      ) : (
                        <Upload size={12} />
                      )}
                      Upload video from computer
                      <input
                        type="file"
                        accept="video/*"
                        hidden
                        disabled={videoUploads[idx]?.uploading}
                        onChange={(e) => handleVideoFileUpload(idx, e.target.files?.[0])}
                      />
                    </label>
                    {videoUploads[idx]?.uploading && (
                      <span className="font-data text-xs text-[var(--color-ink-soft)]">
                        {videoUploads[idx].progress}% uploaded — processing on YouTube may take a bit longer
                      </span>
                    )}
                  </div>
                  {videoUploads[idx]?.error && (
                    <p className="col-span-2 rounded-lg bg-[var(--color-danger-soft)] px-2.5 py-1.5 text-xs text-[var(--color-danger)]">
                      {videoUploads[idx].error}
                    </p>
                  )}
                  <input
                    placeholder="Duration e.g. 12:30 mins"
                    value={lesson.duration}
                    onChange={(e) => updateLesson(idx, 'duration', e.target.value)}
                    className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-2 text-sm outline-none"
                  />
                  <label className="flex items-center gap-2 text-xs text-[var(--color-ink-soft)]">
                    <input
                      type="checkbox"
                      checked={lesson.isPreviewFree}
                      onChange={(e) => updateLesson(idx, 'isPreviewFree', e.target.checked)}
                    />
                    Free preview
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="rounded-lg bg-[var(--color-danger-soft)] px-3 py-2 text-sm text-[var(--color-danger)]">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="sticky bottom-0 mt-2 flex items-center justify-center gap-2 rounded-full bg-[var(--color-signal)] px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70"
        >
          {saving && <LoaderCircle size={16} className="animate-spin" />}
          {isEdit ? 'Save changes' : 'Create course'}
        </button>
      </form>
    </Modal>
  );
}
