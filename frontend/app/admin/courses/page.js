'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import CourseFormModal from '@/components/admin/CourseFormModal';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/courses').then(({ data }) => setCourses(data.courses)).finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time data fetch on mount, not a cascading render
  useEffect(load, []);

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await api.delete(`/courses/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">Courses</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Create, edit, and manage course content.</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-full bg-[var(--color-signal)] px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95"
        >
          <Plus size={16} /> New course
        </button>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--color-border)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--color-surface)] text-xs uppercase text-[var(--color-ink-soft)]">
            <tr>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Lessons</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--color-ink-soft)]">Loading…</td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--color-ink-soft)]">No courses yet.</td>
              </tr>
            ) : (
              courses.map((c) => (
                <tr key={c.id} className="border-t border-[var(--color-border)] bg-[var(--color-paper)]">
                  <td className="px-4 py-3 font-medium text-[var(--color-ink)]">{c.title}</td>
                  <td className="px-4 py-3 text-[var(--color-ink-soft)]">{c.category}</td>
                  <td className="px-4 py-3 font-data">
                    ${c.effectivePrice.toFixed(2)}
                    {c.discount?.active && (
                      <span className="ml-1 text-xs text-[var(--color-signal)]">(-{c.discount.percent}%)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-ink-soft)]">{c.lessonCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setEditingId(c.id);
                          setModalOpen(true);
                        }}
                        className="text-[var(--color-ink-soft)] hover:text-[var(--color-signal)]"
                        aria-label="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.title)}
                        className="text-[var(--color-ink-soft)] hover:text-[var(--color-danger)]"
                        aria-label="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CourseFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        courseId={editingId}
        onSaved={load}
      />
    </div>
  );
}
