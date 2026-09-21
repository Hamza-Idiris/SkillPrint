'use client';

import { useEffect, useRef, useState } from 'react';
import { Upload, LoaderCircle, Plus, Trash2, Tag } from 'lucide-react';
import api, { getErrorMessage } from '@/lib/api';

export default function AdminCmsPage() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savingDiscount, setSavingDiscount] = useState(false);
  const [savingStats, setSavingStats] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [message, setMessage] = useState(null);
  const bannerRef = useRef(null);

  const load = () =>
    api.get('/admin/settings').then(({ data }) => {
      const s = data?.settings || {};

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
          answer: 'SkillSprint is a modern, full-stack learning management system that delivers video-based courses with a mentorship-first approach and gated access for enrolled learners.',
        },
        {
          question: 'How does mentorship work?',
          answer: 'Mentors guide learners through practical work, review progress, and help students turn course lessons into real outcomes through live sessions and feedback.',
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

      setSettings({
        ...s,
        aboutTitle: s.aboutTitle ?? 'About SkillSprint',
        aboutLead: s.aboutLead ?? defaultAboutLead,
        aboutMission: s.aboutMission ?? defaultAboutMission,
        aboutDescription: s.aboutDescription ?? defaultAboutDescription,
        aboutHighlights:
          Array.isArray(s.aboutHighlights) && s.aboutHighlights.some((h) => h?.title || h?.description) ? s.aboutHighlights : defaultHighlights,
        aboutHowItWorks:
          Array.isArray(s.aboutHowItWorks) && s.aboutHowItWorks.some((st) => st?.title || st?.description) ? s.aboutHowItWorks : defaultHowItWorks,
        aboutValues: Array.isArray(s.aboutValues) && s.aboutValues.some((v) => v?.title || v?.description) ? s.aboutValues : defaultValues,
        aboutContactTitle: s.aboutContactTitle ?? defaultAboutContactTitle,
        aboutContactLead: s.aboutContactLead ?? defaultAboutContactLead,
        aboutFaq: Array.isArray(s.aboutFaq) && s.aboutFaq.some((f) => f?.question || f?.answer) ? s.aboutFaq : defaultFaq,
        aboutTimeline:
          Array.isArray(s.aboutTimeline) && s.aboutTimeline.some((t) => t?.year || t?.title || t?.description) ? s.aboutTimeline : defaultTimeline,
        aboutPrimaryCtaLabel: s.aboutPrimaryCtaLabel ?? 'Browse courses',
        aboutPrimaryCtaHref: s.aboutPrimaryCtaHref ?? '/courses',
      });
    });
  useEffect(() => {
    load();
  }, []);

  if (!settings) return <p className="text-sm text-[var(--color-ink-soft)]">Loading…</p>;

  const saveSiteContent = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const { data } = await api.put('/admin/settings', {
        heroTitle: settings.heroTitle,
        heroSubtitle: settings.heroSubtitle,
        announcementBar: settings.announcementBar,
        contactEmail: settings.contactEmail,
        contactPhone: settings.contactPhone,
        address: settings.address,
        socialLinks: settings.socialLinks,
        footerCopyright: settings.footerCopyright,
        aboutTitle: settings.aboutTitle,
        aboutLead: settings.aboutLead,
        aboutMission: settings.aboutMission,
        aboutDescription: settings.aboutDescription,
        aboutHighlights: settings.aboutHighlights,
        aboutHowItWorks: settings.aboutHowItWorks,
        aboutValues: settings.aboutValues,
        aboutPrimaryCtaLabel: settings.aboutPrimaryCtaLabel,
        aboutPrimaryCtaHref: settings.aboutPrimaryCtaHref,
        aboutContactTitle: settings.aboutContactTitle,
        aboutContactLead: settings.aboutContactLead,
        aboutFaq: settings.aboutFaq,
        aboutTimeline: settings.aboutTimeline,
      });
      setSettings(data.settings);
      setMessage({ type: 'success', text: 'Site content updated.' });
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const saveDiscountHandler = async () => {
    setSavingDiscount(true);
    setMessage(null);
    try {
      const { data } = await api.put('/admin/settings/discount', {
        active: !!settings.globalDiscount?.active,
        percent: Number(settings.globalDiscount?.percent) || 0,
        label: settings.globalDiscount?.label || '30% off all courses',
        endDate: settings.globalDiscount?.endDate || null,
        buttonText: settings.globalDiscount?.buttonText || 'Browse courses',
        buttonLink: settings.globalDiscount?.buttonLink || '/courses',
      });
      setSettings({ ...settings, globalDiscount: data.globalDiscount });
      setMessage({ type: 'success', text: 'Sitewide global discount settings saved successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setSavingDiscount(false);
    }
  };

  const uploadBanner = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      const fd = new FormData();
      fd.append('banner', file);
      const { data } = await api.post('/admin/settings/banner', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSettings((s) => ({ ...s, bannerImage: data.bannerImage }));
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setUploadingBanner(false);
    }
  };

  const saveDiscount = async (e) => {
    e.preventDefault();
    setSavingDiscount(true);
    setMessage(null);
    try {
      const { data } = await api.put('/admin/settings/discount', settings.globalDiscount);
      setSettings((s) => ({ ...s, globalDiscount: data.globalDiscount }));
      setMessage({ type: 'success', text: 'Sitewide discount updated.' });
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setSavingDiscount(false);
    }
  };

  const updateStat = (idx, field, value) => {
    setSettings((s) => {
      const stats = [...s.stats];
      stats[idx] = { ...stats[idx], [field]: value };
      return { ...s, stats };
    });
  };
  const addStat = () => setSettings((s) => ({ ...s, stats: [...s.stats, { label: '', value: '' }] }));
  const removeStat = (idx) => setSettings((s) => ({ ...s, stats: s.stats.filter((_, i) => i !== idx) }));

  const saveStats = async (e) => {
    e.preventDefault();
    setSavingStats(true);
    setMessage(null);
    try {
      const { data } = await api.put('/admin/settings', { stats: settings.stats });
      setSettings(data.settings);
      setMessage({ type: 'success', text: 'Homepage stats updated.' });
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setSavingStats(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">Site CMS &amp; discounts</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Live-edit the homepage and manage sitewide sales.</p>

      {message && (
        <p
          className="mt-4 rounded-lg px-3 py-2 text-sm"
          style={{
            background: message.type === 'success' ? 'var(--color-mint-soft)' : 'var(--color-danger-soft)',
            color: message.type === 'success' ? 'var(--color-mint)' : 'var(--color-danger)',
          }}
        >
          {message.text}
        </p>
      )}

      {/* Sitewide Global Discount Section */}
      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-semibold text-[var(--color-ink)] flex items-center gap-2">
              <Tag className="h-4 w-4 text-[var(--color-signal)]" /> Sitewide Global Discount & Promo Banner
            </h2>
            <p className="text-xs text-[var(--color-ink-soft)] mt-0.5">
              Apply a sitewide percentage discount across ALL courses and display the top countdown banner.
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--color-ink)]">
            <input
              type="checkbox"
              checked={!!settings.globalDiscount?.active}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  globalDiscount: { ...settings.globalDiscount, active: e.target.checked },
                })
              }
              className="h-4 w-4 rounded accent-[var(--color-signal)]"
            />
            Discount Active
          </label>
        </div>

        {settings.globalDiscount?.active && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[var(--color-border)] pt-4">
            <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--color-ink)]">
              Discount Percentage (%)
              <input
                type="number"
                min="0"
                max="100"
                value={settings.globalDiscount?.percent || 0}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    globalDiscount: {
                      ...settings.globalDiscount,
                      percent: Number(e.target.value) || 0,
                    },
                  })
                }
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2 text-sm outline-none focus:border-[var(--color-signal)]"
                placeholder="e.g. 30"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--color-ink)]">
              Banner Title / Message
              <input
                type="text"
                value={settings.globalDiscount?.label || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    globalDiscount: {
                      ...settings.globalDiscount,
                      label: e.target.value,
                    },
                  })
                }
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2 text-sm outline-none focus:border-[var(--color-signal)]"
                placeholder="e.g. 30% off all courses"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--color-ink)]">
              Sale End Date & Time (for Countdown Timer)
              <input
                type="datetime-local"
                value={
                  settings.globalDiscount?.endDate
                    ? new Date(settings.globalDiscount.endDate).toISOString().slice(0, 16)
                    : ''
                }
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    globalDiscount: {
                      ...settings.globalDiscount,
                      endDate: e.target.value ? new Date(e.target.value).toISOString() : null,
                    },
                  })
                }
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2 text-sm outline-none focus:border-[var(--color-signal)]"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--color-ink)]">
              Button Label
              <input
                type="text"
                value={settings.globalDiscount?.buttonText || 'Browse courses'}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    globalDiscount: {
                      ...settings.globalDiscount,
                      buttonText: e.target.value,
                    },
                  })
                }
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2 text-sm outline-none focus:border-[var(--color-signal)]"
              />
            </label>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={saveDiscountHandler}
            disabled={savingDiscount}
            className="flex items-center gap-2 rounded-full bg-[var(--color-signal)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
          >
            {savingDiscount ? <LoaderCircle size={14} className="animate-spin" /> : null}
            Save Sitewide Discount
          </button>
        </div>
      </div>

      {/* Hero / announcement */}
      <form onSubmit={saveSiteContent} className="mt-6 flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="font-display font-semibold text-[var(--color-ink)]">Hero section</h2>

        <div className="h-32 w-full overflow-hidden rounded-xl bg-[var(--color-signal-soft)]">
          {settings.bannerImage?.url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.bannerImage.url} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <button
          type="button"
          onClick={() => bannerRef.current?.click()}
          disabled={uploadingBanner}
          className="flex w-fit items-center gap-2 rounded-full border border-[var(--color-border)] px-3 py-2 text-xs font-medium hover:border-[var(--color-signal)]"
        >
          {uploadingBanner ? <LoaderCircle size={14} className="animate-spin" /> : <Upload size={14} />}
          Upload banner image
        </button>
        <input ref={bannerRef} type="file" accept="image/*" hidden onChange={uploadBanner} />

        <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
          Hero title
          <input
            value={settings.heroTitle}
            onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
          Hero subtitle
          <textarea
            rows={2}
            value={settings.heroSubtitle}
            onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
            className="resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
          Announcement bar <span className="font-normal text-[var(--color-ink-soft)]">(leave blank to hide)</span>
          <input
            value={settings.announcementBar}
            onChange={(e) => setSettings({ ...settings, announcementBar: e.target.value })}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
          />
        </label>

        <hr className="border-[var(--color-border)]" />
        <h2 className="font-display font-semibold text-[var(--color-ink)]">Contact info (shown in footer)</h2>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
            Contact email
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              placeholder="hello@skillsprint.com"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
            Contact phone
            <input
              value={settings.contactPhone}
              onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
              placeholder="+252 61 XXX XXXX"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
          Address / location
          <input
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            placeholder="Mogadishu, Somalia"
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
          />
        </label>

        <hr className="border-[var(--color-border)]" />
        <h2 className="font-display font-semibold text-[var(--color-ink)]">Social links</h2>
        <p className="-mt-2 text-xs text-[var(--color-ink-soft)]">Leave any blank to hide that icon from the footer.</p>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
            Facebook URL
            <input
              value={settings.socialLinks.facebook}
              onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, facebook: e.target.value } })}
              placeholder="https://facebook.com/yourpage"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
            Instagram URL
            <input
              value={settings.socialLinks.instagram}
              onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, instagram: e.target.value } })}
              placeholder="https://instagram.com/yourpage"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
            X (Twitter) URL
            <input
              value={settings.socialLinks.twitter}
              onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, twitter: e.target.value } })}
              placeholder="https://x.com/yourpage"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
            WhatsApp
            <input
              value={settings.socialLinks.whatsapp}
              onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, whatsapp: e.target.value } })}
              placeholder="252618827482 or full wa.me link"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
            />
          </label>
        </div>

        <hr className="border-[var(--color-border)]" />
        <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
          Footer copyright text <span className="font-normal text-[var(--color-ink-soft)]">(year is added automatically)</span>
          <input
            value={settings.footerCopyright}
            onChange={(e) => setSettings({ ...settings, footerCopyright: e.target.value })}
            placeholder="SkillSprint. All rights reserved."
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
          />
        </label>

        <hr className="border-[var(--color-border)]" />
        <h2 className="font-display font-semibold text-[var(--color-ink)]">About Us page content</h2>
        <p className="text-xs text-[var(--color-ink-soft)]">Shown on the public `/about` page. Leave blank to hide parts.</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
            About title
            <input
              value={settings.aboutTitle || ''}
              onChange={(e) => setSettings({ ...settings, aboutTitle: e.target.value })}
              placeholder="About SkillSprint"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
            Primary CTA label
            <input
              value={settings.aboutPrimaryCtaLabel || ''}
              onChange={(e) => setSettings({ ...settings, aboutPrimaryCtaLabel: e.target.value })}
              placeholder="Browse courses"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
          About lead <span className="font-normal text-[var(--color-ink-soft)]">(short 1-2 lines)</span>
          <textarea
            rows={3}
            value={settings.aboutLead || ''}
            onChange={(e) => setSettings({ ...settings, aboutLead: e.target.value })}
            className="resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
          Mission <span className="font-normal text-[var(--color-ink-soft)]">(your mission statement)</span>
          <textarea
            rows={2}
            value={settings.aboutMission || ''}
            onChange={(e) => setSettings({ ...settings, aboutMission: e.target.value })}
            className="resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
          Story / problem &amp; solution
          <textarea
            rows={5}
            value={settings.aboutDescription || ''}
            onChange={(e) => setSettings({ ...settings, aboutDescription: e.target.value })}
            className="resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
          />
        </label>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-[var(--color-ink)]">Highlights</h3>
            <button
              type="button"
              onClick={() =>
                setSettings((s) => ({
                  ...s,
                  aboutHighlights: [...(s.aboutHighlights || []), { title: '', description: '' }],
                }))
              }
              className="text-xs font-medium text-[var(--color-signal)]"
            >
              Add highlight
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {(settings.aboutHighlights || []).length === 0 && (
              <p className="text-sm text-[var(--color-ink-soft)]">No highlights yet.</p>
            )}
            {(settings.aboutHighlights || []).map((h, idx) => (
              <div key={idx} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-[var(--color-ink-soft)]">Highlight {idx + 1}</p>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((s) => ({ ...s, aboutHighlights: (s.aboutHighlights || []).filter((_, i) => i !== idx) }))
                    }
                    className="text-[var(--color-danger)]"
                  >
                    Remove
                  </button>
                </div>
                <label className="mt-2 flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
                  Title
                  <input
                    value={h.title || ''}
                    onChange={(e) =>
                      setSettings((s) => {
                        const next = [...(s.aboutHighlights || [])];
                        next[idx] = { ...next[idx], title: e.target.value };
                        return { ...s, aboutHighlights: next };
                      })
                    }
                    className="rounded-lg border border-[var(--color-border)] bg-transparent px-2.5 py-2 text-sm outline-none"
                  />
                </label>
                <label className="mt-2 flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
                  Description
                  <textarea
                    rows={2}
                    value={h.description || ''}
                    onChange={(e) =>
                      setSettings((s) => {
                        const next = [...(s.aboutHighlights || [])];
                        next[idx] = { ...next[idx], description: e.target.value };
                        return { ...s, aboutHighlights: next };
                      })
                    }
                    className="resize-none rounded-lg border border-[var(--color-border)] bg-transparent px-2.5 py-2 text-sm outline-none"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-[var(--color-ink)]">How it works</h3>
            <button
              type="button"
              onClick={() =>
                setSettings((s) => ({
                  ...s,
                  aboutHowItWorks: [...(s.aboutHowItWorks || []), { title: '', description: '' }],
                }))
              }
              className="text-xs font-medium text-[var(--color-signal)]"
            >
              Add step
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {(settings.aboutHowItWorks || []).length === 0 && (
              <p className="text-sm text-[var(--color-ink-soft)]">No steps yet.</p>
            )}
            {(settings.aboutHowItWorks || []).map((s, idx) => (
              <div key={idx} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-[var(--color-ink-soft)]">Step {idx + 1}</p>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((st) => ({ ...st, aboutHowItWorks: (st.aboutHowItWorks || []).filter((_, i) => i !== idx) }))
                    }
                    className="text-[var(--color-danger)]"
                  >
                    Remove
                  </button>
                </div>
                <label className="mt-2 flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
                  Title
                  <input
                    value={s.title || ''}
                    onChange={(e) =>
                      setSettings((st) => {
                        const next = [...(st.aboutHowItWorks || [])];
                        next[idx] = { ...next[idx], title: e.target.value };
                        return { ...st, aboutHowItWorks: next };
                      })
                    }
                    className="rounded-lg border border-[var(--color-border)] bg-transparent px-2.5 py-2 text-sm outline-none"
                  />
                </label>
                <label className="mt-2 flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
                  Description
                  <textarea
                    rows={2}
                    value={s.description || ''}
                    onChange={(e) =>
                      setSettings((st) => {
                        const next = [...(st.aboutHowItWorks || [])];
                        next[idx] = { ...next[idx], description: e.target.value };
                        return { ...st, aboutHowItWorks: next };
                      })
                    }
                    className="resize-none rounded-lg border border-[var(--color-border)] bg-transparent px-2.5 py-2 text-sm outline-none"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-[var(--color-ink)]">Values</h3>
            <button
              type="button"
              onClick={() =>
                setSettings((s) => ({
                  ...s,
                  aboutValues: [...(s.aboutValues || []), { title: '', description: '' }],
                }))
              }
              className="text-xs font-medium text-[var(--color-signal)]"
            >
              Add value
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {(settings.aboutValues || []).length === 0 && <p className="text-sm text-[var(--color-ink-soft)]">No values yet.</p>}
            {(settings.aboutValues || []).map((v, idx) => (
              <div key={idx} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-[var(--color-ink-soft)]">Value {idx + 1}</p>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((st) => ({ ...st, aboutValues: (st.aboutValues || []).filter((_, i) => i !== idx) }))
                    }
                    className="text-[var(--color-danger)]"
                  >
                    Remove
                  </button>
                </div>
                <label className="mt-2 flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
                  Title
                  <input
                    value={v.title || ''}
                    onChange={(e) =>
                      setSettings((st) => {
                        const next = [...(st.aboutValues || [])];
                        next[idx] = { ...next[idx], title: e.target.value };
                        return { ...st, aboutValues: next };
                      })
                    }
                    className="rounded-lg border border-[var(--color-border)] bg-transparent px-2.5 py-2 text-sm outline-none"
                  />
                </label>
                <label className="mt-2 flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
                  Description
                  <textarea
                    rows={2}
                    value={v.description || ''}
                    onChange={(e) =>
                      setSettings((st) => {
                        const next = [...(st.aboutValues || [])];
                        next[idx] = { ...next[idx], description: e.target.value };
                        return { ...st, aboutValues: next };
                      })
                    }
                    className="resize-none rounded-lg border border-[var(--color-border)] bg-transparent px-2.5 py-2 text-sm outline-none"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-[var(--color-border)]" />
        <h2 className="font-display font-semibold text-[var(--color-ink)]">FAQ + timeline + contact CTA</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
            Contact CTA title
            <input
              value={settings.aboutContactTitle || ''}
              onChange={(e) => setSettings({ ...settings, aboutContactTitle: e.target.value })}
              placeholder="Questions or ready to start?"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
          Contact CTA lead
          <textarea
            rows={2}
            value={settings.aboutContactLead || ''}
            onChange={(e) => setSettings({ ...settings, aboutContactLead: e.target.value })}
            className="resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
          />
        </label>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-[var(--color-ink)]">FAQ</h3>
            <button
              type="button"
              onClick={() =>
                setSettings((s) => ({
                  ...s,
                  aboutFaq: [...(s.aboutFaq || []), { question: '', answer: '' }],
                }))
              }
              className="text-xs font-medium text-[var(--color-signal)]"
            >
              Add FAQ
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {(settings.aboutFaq || []).length === 0 && (
              <p className="text-sm text-[var(--color-ink-soft)]">No FAQ items yet.</p>
            )}
            {(settings.aboutFaq || []).map((f, idx) => (
              <div key={idx} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-[var(--color-ink-soft)]">FAQ {idx + 1}</p>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((st) => ({ ...st, aboutFaq: (st.aboutFaq || []).filter((_, i) => i !== idx) }))
                    }
                    className="text-[var(--color-danger)]"
                  >
                    Remove
                  </button>
                </div>
                <label className="mt-2 flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
                  Question
                  <input
                    value={f.question || ''}
                    onChange={(e) =>
                      setSettings((st) => {
                        const next = [...(st.aboutFaq || [])];
                        next[idx] = { ...next[idx], question: e.target.value };
                        return { ...st, aboutFaq: next };
                      })
                    }
                    className="rounded-lg border border-[var(--color-border)] bg-transparent px-2.5 py-2 text-sm outline-none"
                  />
                </label>
                <label className="mt-2 flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
                  Answer
                  <textarea
                    rows={3}
                    value={f.answer || ''}
                    onChange={(e) =>
                      setSettings((st) => {
                        const next = [...(st.aboutFaq || [])];
                        next[idx] = { ...next[idx], answer: e.target.value };
                        return { ...st, aboutFaq: next };
                      })
                    }
                    className="resize-none rounded-lg border border-[var(--color-border)] bg-transparent px-2.5 py-2 text-sm outline-none"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-[var(--color-ink)]">Timeline</h3>
            <button
              type="button"
              onClick={() =>
                setSettings((s) => ({
                  ...s,
                  aboutTimeline: [...(s.aboutTimeline || []), { year: '', title: '', description: '' }],
                }))
              }
              className="text-xs font-medium text-[var(--color-signal)]"
            >
              Add timeline item
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {(settings.aboutTimeline || []).length === 0 && <p className="text-sm text-[var(--color-ink-soft)]">No timeline items yet.</p>}
            {(settings.aboutTimeline || []).map((t, idx) => (
              <div key={idx} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-[var(--color-ink-soft)]">Item {idx + 1}</p>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((st) => ({ ...st, aboutTimeline: (st.aboutTimeline || []).filter((_, i) => i !== idx) }))
                    }
                    className="text-[var(--color-danger)]"
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
                    Year (optional)
                    <input
                      value={t.year || ''}
                      onChange={(e) =>
                        setSettings((st) => {
                          const next = [...(st.aboutTimeline || [])];
                          next[idx] = { ...next[idx], year: e.target.value };
                          return { ...st, aboutTimeline: next };
                        })
                      }
                      className="rounded-lg border border-[var(--color-border)] bg-transparent px-2.5 py-2 text-sm outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
                    Title
                    <input
                      value={t.title || ''}
                      onChange={(e) =>
                        setSettings((st) => {
                          const next = [...(st.aboutTimeline || [])];
                          next[idx] = { ...next[idx], title: e.target.value };
                          return { ...st, aboutTimeline: next };
                        })
                      }
                      className="rounded-lg border border-[var(--color-border)] bg-transparent px-2.5 py-2 text-sm outline-none"
                    />
                  </label>
                </div>
                <label className="mt-2 flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
                  Description
                  <textarea
                    rows={3}
                    value={t.description || ''}
                    onChange={(e) =>
                      setSettings((st) => {
                        const next = [...(st.aboutTimeline || [])];
                        next[idx] = { ...next[idx], description: e.target.value };
                        return { ...st, aboutTimeline: next };
                      })
                    }
                    className="resize-none rounded-lg border border-[var(--color-border)] bg-transparent px-2.5 py-2 text-sm outline-none"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
          Primary CTA href
          <input
            value={settings.aboutPrimaryCtaHref || ''}
            onChange={(e) => setSettings({ ...settings, aboutPrimaryCtaHref: e.target.value })}
            placeholder="/courses"
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          className="flex w-fit items-center gap-2 rounded-full bg-[var(--color-signal)] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70"
        >
          {saving && <LoaderCircle size={16} className="animate-spin" />}
          Save site content
        </button>
      </form>

      {/* Course packages */}
      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-semibold text-[var(--color-ink)]">Course access packages</h2>
            <p className="text-xs text-[var(--color-ink-soft)]">Students pick one of these when enrolling. Set price in USD.</p>
          </div>
          <button
            type="button"
            onClick={() =>
              setSettings((s) => ({
                ...s,
                coursePackages: [...(s.coursePackages || []), { key: `pkg_${Date.now()}`, label: '', durationDays: 30, priceUSD: 0, enabled: true }],
              }))
            }
            className="flex items-center gap-1 text-xs font-medium text-[var(--color-signal)]"
          >
            <Plus size={14} /> Add package
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {(settings.coursePackages || []).map((pkg, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_1fr_80px_80px_auto] items-center gap-2">
              <input
                placeholder="Label (e.g. 1 Month)"
                value={pkg.label || ''}
                onChange={(e) =>
                  setSettings((s) => {
                    const next = [...(s.coursePackages || [])];
                    next[idx] = { ...next[idx], label: e.target.value };
                    return { ...s, coursePackages: next };
                  })
                }
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-paper)] px-2.5 py-2 text-sm outline-none"
              />
              <input
                type="number"
                min="0"
                placeholder="Days (0=forever)"
                value={pkg.durationDays ?? 0}
                onChange={(e) =>
                  setSettings((s) => {
                    const next = [...(s.coursePackages || [])];
                    next[idx] = { ...next[idx], durationDays: Number(e.target.value) };
                    return { ...s, coursePackages: next };
                  })
                }
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-paper)] px-2.5 py-2 text-sm outline-none"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="$ Price"
                value={pkg.priceUSD ?? ''}
                onChange={(e) =>
                  setSettings((s) => {
                    const next = [...(s.coursePackages || [])];
                    next[idx] = { ...next[idx], priceUSD: Number(e.target.value) };
                    return { ...s, coursePackages: next };
                  })
                }
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-paper)] px-2.5 py-2 text-sm outline-none"
              />
              <label className="flex cursor-pointer items-center gap-1 text-xs text-[var(--color-ink-soft)]">
                <input
                  type="checkbox"
                  checked={pkg.enabled !== false}
                  onChange={(e) =>
                    setSettings((s) => {
                      const next = [...(s.coursePackages || [])];
                      next[idx] = { ...next[idx], enabled: e.target.checked };
                      return { ...s, coursePackages: next };
                    })
                  }
                />
                On
              </label>
              <button
                type="button"
                onClick={() =>
                  setSettings((s) => ({ ...s, coursePackages: (s.coursePackages || []).filter((_, i) => i !== idx) }))
                }
                className="text-[var(--color-danger)]"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={async () => {
            setSaving(true);
            setMessage(null);
            try {
              const { data } = await api.put('/admin/settings', { coursePackages: settings.coursePackages });
              setSettings((s) => ({ ...s, coursePackages: data.settings.coursePackages }));
              setMessage({ type: 'success', text: 'Packages saved.' });
            } catch (err) {
              setMessage({ type: 'error', text: getErrorMessage(err) });
            } finally {
              setSaving(false);
            }
          }}
          disabled={saving}
          className="flex w-fit items-center gap-2 rounded-full bg-[var(--color-signal)] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70"
        >
          {saving && <LoaderCircle size={16} className="animate-spin" />}
          Save packages
        </button>
      </div>

      {/* Homepage stats */}
      <form onSubmit={saveStats} className="mt-6 flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold text-[var(--color-ink)]">Homepage stats</h2>
          <button type="button" onClick={addStat} className="flex items-center gap-1 text-xs font-medium text-[var(--color-signal)]">
            <Plus size={14} /> Add stat
          </button>
        </div>
        <p className="-mt-2 text-xs text-[var(--color-ink-soft)]">Shown as a bar under the hero, e.g. &quot;500+ Students&quot;.</p>

        <div className="flex flex-col gap-2">
          {settings.stats.length === 0 && (
            <p className="text-sm text-[var(--color-ink-soft)]">No stats yet — click &quot;Add stat&quot; to create one.</p>
          )}
          {settings.stats.map((stat, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                placeholder="Value, e.g. 500+"
                value={stat.value}
                onChange={(e) => updateStat(idx, 'value', e.target.value)}
                className="w-32 rounded-lg border border-[var(--color-border)] bg-[var(--color-paper)] px-2.5 py-2 text-sm outline-none"
              />
              <input
                placeholder="Label, e.g. Students"
                value={stat.label}
                onChange={(e) => updateStat(idx, 'label', e.target.value)}
                className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-paper)] px-2.5 py-2 text-sm outline-none"
              />
              <button type="button" onClick={() => removeStat(idx)} className="text-[var(--color-danger)]">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={savingStats}
          className="flex w-fit items-center gap-2 rounded-full bg-[var(--color-signal)] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70"
        >
          {savingStats && <LoaderCircle size={16} className="animate-spin" />}
          Save stats
        </button>
      </form>

      {/* Global discount */}
      <form onSubmit={saveDiscount} className="mt-6 flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="font-display font-semibold text-[var(--color-ink)]">Sitewide discount</h2>
        <p className="text-xs text-[var(--color-ink-soft)]">
          Applies to every course that doesn&apos;t have its own active discount set.
        </p>

        <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-ink)]">
          <input
            type="checkbox"
            checked={settings.globalDiscount.active}
            onChange={(e) => setSettings({ ...settings, globalDiscount: { ...settings.globalDiscount, active: e.target.checked } })}
          />
          Active
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
            Percent off
            <input
              type="number"
              min="0"
              max="100"
              value={settings.globalDiscount.percent}
              onChange={(e) => setSettings({ ...settings, globalDiscount: { ...settings.globalDiscount, percent: Number(e.target.value) } })}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
            Label <span className="font-normal text-[var(--color-ink-soft)]">(e.g. &quot;Ramadan Sale&quot;)</span>
            <input
              value={settings.globalDiscount.label}
              onChange={(e) => setSettings({ ...settings, globalDiscount: { ...settings.globalDiscount, label: e.target.value } })}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={savingDiscount}
          className="flex w-fit items-center gap-2 rounded-full bg-[var(--color-signal)] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70"
        >
          {savingDiscount && <LoaderCircle size={16} className="animate-spin" />}
          Save discount
        </button>
      </form>
    </div>
  );
}
