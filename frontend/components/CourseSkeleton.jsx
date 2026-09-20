export default function CourseSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] animate-pulse">
      <div className="aspect-video w-full bg-slate-200 dark:bg-slate-800" />
      <div className="flex flex-col gap-3 p-4">
        <div className="h-4 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-2 flex items-center justify-between border-t border-[var(--color-border)] pt-3">
          <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-5 w-12 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
}
