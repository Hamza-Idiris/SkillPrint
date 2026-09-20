'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, BookOpen, Palette, Users, ClipboardList, GraduationCap, LogOut, MessageSquare } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/enrollments', label: 'Enrollments', icon: ClipboardList },
  { href: '/admin/comments', label: 'Comments', icon: MessageSquare },
  { href: '/admin/cms', label: 'Site CMS & Discounts', icon: Palette },
  { href: '/admin/users', label: 'Users', icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <Link href="/" className="mb-6 flex items-center gap-2 px-2 font-display text-lg font-bold text-[var(--color-ink)]">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-signal)] text-white">
          <GraduationCap size={18} />
        </span>
        SkillSprint
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-[var(--color-signal-soft)] text-[var(--color-signal)]'
                  : 'text-[var(--color-ink-soft)] hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)]'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
        <ThemeToggle />
        <button
          onClick={() => {
            logout();
            router.push('/');
          }}
          className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-ink-soft)] hover:text-[var(--color-danger)]"
        >
          <LogOut size={14} /> Log out
        </button>
      </div>
    </aside>
  );
}
