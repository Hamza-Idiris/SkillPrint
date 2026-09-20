'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'How do course enrollments work on SkillSprint?',
    answer: 'Once you select a course and complete checkout via mobile payment (WaafiPay), your enrollment is instantly activated and you get immediate access to all video lessons.',
  },
  {
    question: 'Can I watch free preview lessons before purchasing?',
    answer: 'Yes! Instructors mark introductory lessons as free previews. You can watch them directly on any course detail page without registering.',
  },
  {
    question: 'Are certificates provided upon course completion?',
    answer: 'Yes, after completing 100% of the course video lessons, a verified digital certificate of completion is generated for your profile.',
  },
  {
    question: 'What payment methods are supported?',
    answer: 'SkillSprint supports mobile payments through WaafiPay (Zaad, Sahal, E-Dahab) as well as simulated mock payments for testing.',
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => setOpenIndex(openIndex === idx ? null : idx);

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
          Frequently Asked Questions
        </h2>
        <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
          Everything you need to know about SkillSprint learning platform
        </p>
      </div>

      <div className="mt-8 space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="flex w-full items-center justify-between p-4 text-left font-medium text-[var(--color-ink)]"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 text-[var(--color-ink-soft)] transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="border-t border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-ink-soft)] leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
