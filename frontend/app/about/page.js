'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { ArrowRight, Sparkles, Mail, Phone, MessageCircle, MapPin } from 'lucide-react';

export default function AboutPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/settings')
      .then(({ data }) => setSettings(data.settings))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const aboutTitle = settings?.aboutTitle || 'About SkillSprint';

  const defaultAboutLead =
    'SkillSprint is a modern, full-stack Learning Management System (LMS) designed to deliver video-based courses through an intuitive 2-role dynamic portal with streamlined admin approvals, customizable student profiles, and gated content access.';
  const defaultAboutMission =
    'To empower educators and learners with a fast, intuitive, and accessible digital portal that makes launching and mastering high-impact technical skills simple and seamless.';
  const defaultAboutDescription =
    'I built SkillSprint to bridge the gap between high-quality technical education and effortless course delivery.\n\nMany small-to-medium learning portals and independent mentors struggle with bloated, overly expensive platforms that are difficult to manage and slow to customize. SkillSprint was started to provide a lean, modern, full-stack solution that gives instructors total control over their dynamic content without technical overhead, while offering students a seamless, engaging learning experience.\n\nBuilt for students across Somalia, with practical learning and real career outcomes.';

  const defaultHighlights = [
    {
      title: 'Mentorship-backed live sessions',
      description: 'Learn with real mentors through guided live sessions and feedback on your projects.',
    },
    {
      title: 'Practical, career-focused learning',
      description: 'Course content designed around outcomes—so skills translate into real progress and opportunities.',
    },
    {
      title: 'Gated content access',
      description: 'Unlock lesson videos after enrollment—clean access control without messy links.',
    },
    {
      title: 'Streamlined admin approvals',
      description: 'Admin reviews and approvals keep the platform fast and organized without technical overhead.',
    },
    {
      title: 'Built for students in Somalia',
      description: 'Designed to support learners across Somalia with an accessible, modern portal experience.',
    },
  ];

  const defaultHowItWorks = [
    {
      title: 'Create and approve course content',
      description: 'Mentors add lessons, and admins approve and publish so learners get the right material.',
    },
    {
      title: 'Enroll with mobile payment',
      description: 'Students enroll using WaafiPay and unlock gated lesson videos right away.',
    },
    {
      title: 'Attend live sessions and learn by doing',
      description: 'Join live sessions, complete practical tasks, and follow mentorship guidance.',
    },
    {
      title: 'Track progress and reach career outcomes',
      description: 'Measure learning, build confidence through projects, and move toward real career results.',
    },
  ];

  const defaultValues = [
    { title: 'Mentorship first', description: 'Guidance matters—learning is better with real feedback.' },
    { title: 'Simplicity & speed', description: 'A lean platform that’s easy for instructors and smooth for students.' },
    { title: 'Practical outcomes', description: 'We focus on skills you can apply, not just content you watch.' },
    { title: 'Accessible for everyone', description: 'Fast and intuitive access designed for learners in Somalia.' },
    { title: 'Student experience', description: 'Customizable profiles and organized progress that keeps learners motivated.' },
  ];

  const defaultAboutContactTitle = 'Questions or ready to start?';
  const defaultAboutContactLead =
    'Send us a message and we’ll help you choose the right course, understand mentorship, and get started quickly.';

  const defaultFaq = [
    {
      question: 'What is SkillSprint?',
      answer:
        'SkillSprint is a modern, full-stack learning management system that delivers video-based courses with a mentorship-first approach and gated access for enrolled learners.',
    },
    {
      question: 'How does mentorship work?',
      answer:
        'Mentors guide learners through practical work, review progress, and help students turn course lessons into real outcomes through live sessions and feedback.',
    },
    {
      question: 'Do I get access only after enrollment?',
      answer: 'Yes. Course content is gated, so enrolled learners can access lessons right away without complicated manual steps.',
    },
    {
      question: 'Are live sessions required?',
      answer: 'Live sessions are encouraged because they’re where learning becomes practical. However, learners can also use the course materials to move at their own pace.',
    },
    {
      question: 'Who is SkillSprint for?',
      answer: 'SkillSprint is built for students and learners across Somalia—especially people who want career-focused, hands-on technical skills.',
    },
    {
      question: 'How do I track my progress?',
      answer: 'Your learning dashboard helps you review what you’ve completed and stay consistent through projects and mentorship guidance.',
    },
  ];

  const defaultTimeline = [
    {
      year: '',
      title: 'Started with a clear mission',
      description: 'Bridge the gap between high-quality technical education and effortless course delivery.',
    },
    {
      year: '',
      title: 'Built a two-role portal',
      description: 'A streamlined experience for admins/instructors and a focused learning experience for students.',
    },
    {
      year: '',
      title: 'Mentorship + practical outcomes',
      description: 'Live sessions, guided projects, and career-focused learning—built for real progress.',
    },
    {
      year: '',
      title: 'Growing for learners in Somalia',
      description: 'More courses, better mentorship workflows, and a smoother path to technical skills.',
    },
  ];

  const aboutLead = settings?.aboutLead || defaultAboutLead;
  const aboutMission = settings?.aboutMission || defaultAboutMission;
  const aboutDescription = settings?.aboutDescription || defaultAboutDescription;

  const highlights = (settings?.aboutHighlights || []).filter((h) => h?.title || h?.description);
  const howItWorks = (settings?.aboutHowItWorks || []).filter((s) => s?.title || s?.description);
  const values = (settings?.aboutValues || []).filter((v) => v?.title || v?.description);

  const highlightsToRender = highlights.length > 0 ? highlights : defaultHighlights;
  const howItWorksToRender = howItWorks.length > 0 ? howItWorks : defaultHowItWorks;
  const valuesToRender = values.length > 0 ? values : defaultValues;

  const ctaLabel = settings?.aboutPrimaryCtaLabel || 'Browse courses';
  const ctaHref = settings?.aboutPrimaryCtaHref || '/courses';

  const aboutContactTitle = settings?.aboutContactTitle || defaultAboutContactTitle;
  const aboutContactLead = settings?.aboutContactLead || defaultAboutContactLead;

  const faq = (settings?.aboutFaq || []).filter((f) => f?.question || f?.answer);
  const timeline = (settings?.aboutTimeline || []).filter((t) => t?.year || t?.title || t?.description);

  const faqToRender = faq.length > 0 ? faq : defaultFaq;
  const timelineToRender = timeline.length > 0 ? timeline : defaultTimeline;

  return (
    <div>
      <section className="relative overflow-hidden border-b border-[var(--color-border)]">
        <div
          className="absolute inset-0 -z-10 opacity-90"
          style={{
            background:
              'radial-gradient(1100px 500px at 15% -10%, var(--color-signal-soft), transparent 60%), radial-gradient(900px 500px at 100% 0%, var(--color-signal-soft), transparent 55%)',
          }}
        />

        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-14 md:py-16">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-signal-soft)] text-[var(--color-signal)]">
              <Sparkles size={18} />
            </span>
            <h1 className="font-display text-3xl font-bold leading-[1.1] text-[var(--color-ink)]">{aboutTitle}</h1>
          </div>

          {loading ? (
            <div className="h-24 animate-pulse rounded-2xl bg-[var(--color-surface)]" />
          ) : (
            <>
              {aboutLead && <p className="max-w-2xl text-lg text-[var(--color-ink-soft)]">{aboutLead}</p>}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {aboutMission && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
                  >
                    <p className="font-display text-xl font-bold text-[var(--color-ink)]">Our Mission</p>
                    <p className="mt-3 whitespace-pre-line text-[var(--color-ink-soft)]">{aboutMission}</p>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.05 }}
                  className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
                >
                  <p className="font-display text-xl font-bold text-[var(--color-ink)]">Why SkillSprint</p>
                  {aboutDescription ? (
                    <p className="mt-3 whitespace-pre-line text-[var(--color-ink-soft)]">{aboutDescription}</p>
                  ) : (
                    <p className="mt-3 text-[var(--color-ink-soft)]">Add your story in the Admin CMS.</p>
                  )}
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.1 }}
                className="flex items-start gap-4"
              >
                <Link
                  href={ctaHref}
                  className="group inline-flex items-center gap-2 rounded-full bg-[var(--color-signal)] px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-95"
                >
                  {ctaLabel}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-12">
        <section>
          <h2 className="font-display text-2xl font-bold text-[var(--color-ink)]">What you get</h2>
          <p className="mt-1 text-[var(--color-ink-soft)]">Built for fast learning, real mentors, and real outcomes.</p>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(highlightsToRender || []).length > 0 ? (
              highlightsToRender.map((h, idx) => (
                <div key={`${h.title}-${idx}`} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                  {h.title && <p className="font-semibold text-[var(--color-ink)]">{h.title}</p>}
                  {h.description && <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{h.description}</p>}
                </div>
              ))
            ) : (
              <div className="sm:col-span-2 lg:col-span-3 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] py-10 text-center text-sm text-[var(--color-ink-soft)]">
                Add highlights in Admin CMS.
              </div>
            )}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold text-[var(--color-ink)]">How it works</h2>
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            {(howItWorksToRender || []).length > 0 ? (
              howItWorksToRender.map((s, idx) => (
                <div key={`${s.title}-${idx}`} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                  <p className="font-data text-xs font-semibold uppercase tracking-wide text-[var(--color-signal)]">Step {idx + 1}</p>
                  {s.title && <p className="mt-2 text-lg font-semibold text-[var(--color-ink)]">{s.title}</p>}
                  {s.description && <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{s.description}</p>}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] py-10 text-center text-sm text-[var(--color-ink-soft)]">
                Add steps in Admin CMS.
              </div>
            )}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold text-[var(--color-ink)]">Our values</h2>
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            {(valuesToRender || []).length > 0 ? (
              valuesToRender.map((v, idx) => (
                <div key={`${v.title}-${idx}`} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                  {v.title && <p className="font-semibold text-[var(--color-ink)]">{v.title}</p>}
                  {v.description && <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{v.description}</p>}
                </div>
              ))
            ) : (
              <div className="md:col-span-3 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] py-10 text-center text-sm text-[var(--color-ink-soft)]">
                Add values in Admin CMS.
              </div>
            )}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold text-[var(--color-ink)]">Our timeline</h2>
          <div className="mt-6 flex flex-col gap-4">
            {timelineToRender.map((t, idx) => (
              <div key={`${t.title}-${idx}`} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                {t.year && <p className="font-data text-xs font-semibold uppercase tracking-wide text-[var(--color-signal)]">{t.year}</p>}
                {t.title && <p className="mt-1 text-lg font-semibold text-[var(--color-ink)]">{t.title}</p>}
                {t.description && <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{t.description}</p>}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold text-[var(--color-ink)]">FAQ</h2>
          <div className="mt-6 flex flex-col gap-4">
            {faqToRender.map((f, idx) => (
              <details
                key={`${f.question}-${idx}`}
                className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
              >
                <summary className="cursor-pointer list-none font-semibold text-[var(--color-ink)]">
                  {f.question || 'Question'}
                </summary>
                {f.answer && <p className="mt-3 whitespace-pre-line text-sm text-[var(--color-ink-soft)]">{f.answer}</p>}
              </details>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold text-[var(--color-ink)]">{aboutContactTitle}</h2>
          <p className="mt-1 text-[var(--color-ink-soft)]">{aboutContactLead}</p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {settings?.contactEmail && (
              <a
                href={`mailto:${settings.contactEmail}`}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm font-semibold text-[var(--color-ink)] hover:border-[var(--color-signal)]"
              >
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  Email
                </div>
              </a>
            )}
            {settings?.contactPhone && (
              <a
                href={`tel:${settings.contactPhone}`}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm font-semibold text-[var(--color-ink)] hover:border-[var(--color-signal)]"
              >
                <div className="flex items-center gap-2">
                  <Phone size={16} />
                  Call
                </div>
              </a>
            )}
            {settings?.socialLinks?.whatsapp && (
              <a
                href={
                  settings.socialLinks.whatsapp.startsWith('http')
                    ? settings.socialLinks.whatsapp
                    : `https://wa.me/${settings.socialLinks.whatsapp.replace(/[^\d]/g, '')}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm font-semibold text-[var(--color-ink)] hover:border-[var(--color-signal)]"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle size={16} />
                  WhatsApp
                </div>
              </a>
            )}
          </div>

          {settings?.address && (
            <div className="mt-4 flex items-start gap-2 text-sm text-[var(--color-ink-soft)]">
              <MapPin size={16} className="mt-0.5" />
              <p className="whitespace-pre-line">{settings.address}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

