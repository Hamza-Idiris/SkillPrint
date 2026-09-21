const mongoose = require('mongoose');

// Singleton document (one row) holding site-wide CMS content and the global discount.
const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'site', unique: true }, // always 'site'

    // Dynamic Site CMS
    heroTitle: { type: String, default: 'Learn skills that move your career forward' },
    heroSubtitle: { type: String, default: 'Practical courses, mentorship, and hands-on projects.' },
    bannerImage: {
      url: { type: String, default: '' },
      public_id: { type: String, default: '' },
    },
    announcementBar: { type: String, default: '' },

    // Contact info & social links — shown in the footer
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    address: { type: String, default: '' },
    socialLinks: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' }, // X
      whatsapp: { type: String, default: '' }, // full wa.me link or phone number
    },
    footerCopyright: { type: String, default: '' }, // e.g. "SkillSprint. All rights reserved." — year is prepended automatically

    // About page CMS (public)
    aboutTitle: { type: String, default: 'About SkillSprint' },
    aboutLead: {
      type: String,
      default:
        'SkillSprint is a modern, full-stack Learning Management System (LMS) designed to deliver video-based courses through an intuitive 2-role dynamic portal with streamlined admin approvals, customizable student profiles, and gated content access.',
    },
    aboutDescription: {
      type: String,
      default:
        'I built SkillSprint to bridge the gap between high-quality technical education and effortless course delivery.\n\nMany small-to-medium learning portals and independent mentors struggle with bloated, overly expensive platforms that are difficult to manage and slow to customize. SkillSprint was started to provide a lean, modern, full-stack solution that gives instructors total control over their dynamic content without technical overhead, while offering students a seamless, engaging learning experience.\n\nBuilt for students across Somalia, with practical learning and real career outcomes.',
    },
    aboutMission: {
      type: String,
      default:
        'To empower educators and learners with a fast, intuitive, and accessible digital portal that makes launching and mastering high-impact technical skills simple and seamless.',
    },
    aboutHighlights: [
      {
        title: { type: String, default: '' },
        description: { type: String, default: '' },
      },
    ],
    aboutHowItWorks: [
      {
        title: { type: String, default: '' },
        description: { type: String, default: '' },
      },
    ],
    aboutValues: [
      {
        title: { type: String, default: '' },
        description: { type: String, default: '' },
      },
    ],
    aboutPrimaryCtaLabel: { type: String, default: 'Browse courses' },
    aboutPrimaryCtaHref: { type: String, default: '/courses' },

    // Course access packages — global, shown on the enrollment modal
    coursePackages: {
      type: [
        {
          key: { type: String, required: true },   // e.g. '1month'
          label: { type: String, required: true },  // e.g. '1 Month'
          durationDays: { type: Number, default: 0 }, // 0 = forever
          priceUSD: { type: Number, required: true },
          enabled: { type: Boolean, default: true },
        },
      ],
      default: [
        { key: '1month',  label: '1 Month',  durationDays: 30,  priceUSD: 9,   enabled: true },
        { key: '3months', label: '3 Months', durationDays: 90,  priceUSD: 24,  enabled: true },
        { key: '6months', label: '6 Months', durationDays: 180, priceUSD: 44,  enabled: true },
        { key: '1year',   label: '1 Year',   durationDays: 365, priceUSD: 79,  enabled: true },
        { key: 'forever', label: 'Forever',  durationDays: 0,   priceUSD: 129, enabled: true },
      ],
    },

    // FAQ & timeline (public)
    aboutContactTitle: { type: String, default: 'Questions or ready to start?' },
    aboutContactLead: {
      type: String,
      default: 'Send us a message and we’ll help you choose the right course and understand how learning works on SkillSprint.',
    },
    aboutFaq: [
      {
        question: { type: String, default: '' },
        answer: { type: String, default: '' },
      },
    ],
    aboutTimeline: [
      {
        year: { type: String, default: '' },
        title: { type: String, default: '' },
        description: { type: String, default: '' },
      },
    ],

    // Homepage stats bar, e.g. { label: "Students", value: "500+" }
    stats: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],

    // Global discount, applied to any course that does not have its own active discount
    globalDiscount: {
      active: { type: Boolean, default: false },
      percent: { type: Number, min: 0, max: 100, default: 0 },
      label: { type: String, default: '30% off all courses' }, // e.g. "30% off all courses"
      endDate: { type: Date, default: null }, // Target countdown date/time
      buttonText: { type: String, default: 'Browse courses' },
      buttonLink: { type: String, default: '/courses' },
    },
  },
  { timestamps: true }
);

settingsSchema.statics.getSingleton = async function getSingleton() {
  let doc = await this.findOne({ key: 'site' });
  if (!doc) doc = await this.create({ key: 'site' });
  return doc;
};

module.exports = mongoose.model('Settings', settingsSchema);
