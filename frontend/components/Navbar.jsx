'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, GraduationCap } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isAdminArea = pathname?.startsWith('/admin');
  if (isAdminArea) return null; // admin has its own shell/sidebar

  const navLink = (href, label) => (
    <Link
      href={href}
      onClick={() => setOpen(false)}
      className={`text-sm font-medium transition-colors hover:text-[var(--color-signal)] ${
        pathname === href ? 'text-[var(--color-signal)]' : 'text-[var(--color-ink-soft)]'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-paper)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold text-[var(--color-ink)]">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-signal)] text-white">
            <GraduationCap size={18} />
          </span>
          SkillSprint
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navLink('/', 'Home')}
          {navLink('/courses', 'Courses')}
          {navLink('/about', 'About')}
          {user && navLink('/my-courses', 'My Learning')}
          {user?.role === 'admin' && navLink('/admin', 'Admin')}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {!loading && !user && (
            <>
              <Link href="/login" className="text-sm font-medium text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-[var(--color-signal)] px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-95"
              >
                Get started
              </Link>
            </>
          )}
          {!loading && user && (
            <div className="flex items-center gap-3">
              <Link href="/profile" className="flex items-center gap-2 text-sm font-medium text-[var(--color-ink)]">
                <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[var(--color-signal-soft)] text-[var(--color-signal)]">
                  {user.avatar?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar.url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    user.name?.[0]?.toUpperCase() || 'U'
                  )}
                </span>
                {user.name?.split(' ')[0]}
              </Link>
              <button
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                className="text-sm font-medium text-[var(--color-ink-soft)] hover:text-[var(--color-danger)]"
              >
                Log out
              </button>
            </div>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-paper)] px-5 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {navLink('/courses', 'Courses')}
            {navLink('/', 'Home')}
            {navLink('/about', 'About')}
            {user && navLink('/my-courses', 'My Learning')}
            {user?.role === 'admin' && navLink('/admin', 'Admin')}
            <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
              <ThemeToggle />
              {!user ? (
                <div className="flex gap-4">
                  <Link href="/login" onClick={() => setOpen(false)} className="text-sm font-medium">
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="rounded-full bg-[var(--color-signal)] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Get started
                  </Link>
                </div>
              ) : (
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                    router.push('/');
                  }}
                  className="text-sm font-medium text-[var(--color-danger)]"
                >
                  Log out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
