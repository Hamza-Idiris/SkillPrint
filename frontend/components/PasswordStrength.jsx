import { useMemo } from 'react';

export default function PasswordStrength({ password = '' }) {
  const analysis = useMemo(() => {
    let score = 0;
    if (!password) return { score: 0, label: '', color: 'bg-slate-200' };

    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 1:
      case 2:
        return { score, label: 'Weak', color: 'bg-red-500' };
      case 3:
      case 4:
        return { score, label: 'Medium', color: 'bg-amber-500' };
      case 5:
        return { score, label: 'Strong', color: 'bg-emerald-500' };
      default:
        return { score: 0, label: 'Weak', color: 'bg-red-500' };
    }
  }, [password]);

  if (!password) return null;

  return (
    <div className="mt-1.5 flex flex-col gap-1">
      <div className="flex h-1.5 w-full gap-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-full flex-1 transition-colors duration-300 ${
              level <= analysis.score ? analysis.color : 'bg-transparent'
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-[var(--color-ink-soft)]">
        Password strength: <strong className="font-medium text-[var(--color-ink)]">{analysis.label}</strong>
      </span>
    </div>
  );
}
