'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Tag } from 'lucide-react';

export default function CourseCard({ course }) {
  const hasDiscount = course.discount?.active && course.discount.percent > 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="group overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <Link href={`/courses/${course.id}`}>
        <div className="relative aspect-video overflow-hidden bg-[var(--color-signal-soft)]">
          {course.coverImage?.url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={course.coverImage.url}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
          {hasDiscount && (
            <span className="absolute left-3 top-3 rounded-full bg-[var(--color-signal)] px-2.5 py-1 font-data text-xs font-semibold text-white">
              -{course.discount.percent}%
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2.5 p-4">
          <span className="flex w-fit items-center gap-1 rounded-full bg-[var(--color-signal-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-signal)]">
            <Tag size={11} /> {course.category}
          </span>
          <h3 className="font-display text-base font-semibold leading-snug text-[var(--color-ink)] line-clamp-2">
            {course.title}
          </h3>
          <p className="text-sm text-[var(--color-ink-soft)] line-clamp-2">{course.description}</p>

          <div className="mt-1 flex items-center justify-between border-t border-[var(--color-border)] pt-3">
            <span className="flex items-center gap-1 text-xs text-[var(--color-ink-soft)]">
              <Clock size={12} /> {course.lessonCount} lesson{course.lessonCount === 1 ? '' : 's'}
            </span>
            <span className="flex items-baseline gap-1.5 font-data">
              {hasDiscount && (
                <span className="text-xs text-[var(--color-ink-soft)] line-through">${course.price.toFixed(2)}</span>
              )}
              <span className="text-base font-semibold text-[var(--color-ink)]">${course.effectivePrice.toFixed(2)}</span>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
