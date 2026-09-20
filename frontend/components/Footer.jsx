'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Phone, MapPin, MessageCircle, ExternalLink, GraduationCap } from 'lucide-react';
import api from '@/lib/api';

export default function Footer() {
  const pathname = usePathname();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api
      .get('/settings')
      .then(({ data }) => setSettings(data.settings))
      .catch(() => {}); // footer degrades gracefully to defaults if this fails
  }, []);

  if (pathname?.startsWith('/admin')) return null;

  const social = settings?.socialLinks || {};
  const hasSocial = social.facebook || social.instagram || social.twitter || social.whatsapp;
  const hasContact = settings?.contactEmail || settings?.contactPhone || settings?.address;

  const socialLinkList = [
    { key: 'facebook', label: 'Facebook', href: social.facebook },
    { key: 'instagram', label: 'Instagram', href: social.instagram },
    { key: 'twitter', label: 'X', href: social.twitter },
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      href: social.whatsapp
        ? social.whatsapp.startsWith('http')
          ? social.whatsapp
          : `https://wa.me/${social.whatsapp.replace(/[^\d]/g, '')}`
        : '',
    },
  ].filter((s) => s.href);

  return (
    <footer className="border-t border-[var(--color-border)] py-12">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-display text-base font-bold text-[var(--color-ink)]">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-signal)] text-white">
                <GraduationCap size={15} />
              </span>
              SkillSprint
            </div>
            <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
              {settings?.aboutLead || settings?.heroSubtitle || 'Practical courses, mentorship, and hands-on projects.'}
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-sm font-semibold text-[var(--color-ink)]">Explore</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--color-ink-soft)]">
              <Link href="/courses" className="w-fit hover:text-[var(--color-signal)]">Courses</Link>
              <Link href="/about" className="w-fit hover:text-[var(--color-signal)]">About</Link>
              <Link href="/login" className="w-fit hover:text-[var(--color-signal)]">Log in</Link>
              <Link href="/register" className="w-fit hover:text-[var(--color-signal)]">Sign up</Link>
            </div>
          </div>

          {/* Contact */}
          {hasContact && (
            <div>
              <p className="text-sm font-semibold text-[var(--color-ink)]">Contact</p>
              <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--color-ink-soft)]">
                {settings.contactEmail && (
                  <a href={`mailto:${settings.contactEmail}`} className="flex items-center gap-2 hover:text-[var(--color-signal)]">
                    <Mail size={14} /> {settings.contactEmail}
                  </a>
                )}
                {settings.contactPhone && (
                  <a href={`tel:${settings.contactPhone}`} className="flex items-center gap-2 hover:text-[var(--color-signal)]">
                    <Phone size={14} /> {settings.contactPhone}
                  </a>
                )}
                {settings.address && (
                  <span className="flex items-start gap-2">
                    <MapPin size={14} className="mt-0.5 shrink-0" /> {settings.address}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Social */}
          {hasSocial && (
            <div>
              <p className="text-sm font-semibold text-[var(--color-ink)]">Follow</p>
              <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--color-ink-soft)]">
                {socialLinkList.map((s) => (
                  <a
                    key={s.key}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-[var(--color-signal)]"
                  >
                    {s.key === 'whatsapp' ? <MessageCircle size={14} /> : <ExternalLink size={14} />}
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 border-t border-[var(--color-border)] pt-6 text-sm text-[var(--color-ink-soft)]">
          © {new Date().getFullYear()} {settings?.footerCopyright || 'SkillSprint. All rights reserved.'}
        </div>
      </div>
    </footer>
  );
}
