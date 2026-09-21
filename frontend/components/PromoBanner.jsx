'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, X } from 'lucide-react';

export default function PromoBanner({ globalDiscount }) {
  const [dismissed, setDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  // Calculate live countdown timer
  useEffect(() => {
    if (!globalDiscount?.endDate) {
      setTimeLeft('');
      return;
    }

    const targetDate = new Date(globalDiscount.endDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft('Sale ending soon!');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const formatTwo = (num) => String(num).padStart(2, '0');
      setTimeLeft(`${days}d ${formatTwo(hours)}:${formatTwo(minutes)}:${formatTwo(seconds)}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [globalDiscount?.endDate]);

  if (dismissed || !globalDiscount?.active) {
    return null;
  }

  const label = globalDiscount.label || `${globalDiscount.percent || 30}% off all courses`;
  const buttonText = globalDiscount.buttonText || 'Browse courses';
  const buttonLink = globalDiscount.buttonLink || '/courses';

  return (
    <div className="relative z-50 flex flex-wrap items-center justify-between gap-3 bg-black px-4 py-2 text-white border-b border-slate-900">
      {/* Spacer for center alignment on desktop */}
      <div className="hidden md:block md:w-32" />

      {/* Main Promo Label (Center) */}
      <div className="flex flex-1 items-center justify-center text-center font-bold text-sm sm:text-base tracking-wide">
        <span>{label}</span>
      </div>

      {/* Right Controls: Timer + Action Button + Dismiss */}
      <div className="flex items-center gap-3 ml-auto md:ml-0">
        {timeLeft && (
          <span className="flex items-center gap-1.5 font-mono text-xs text-slate-300">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>{timeLeft}</span>
          </span>
        )}

        <Link
          href={buttonLink}
          className="rounded-full bg-white px-4 py-1 text-xs font-semibold text-black transition-colors hover:bg-slate-200"
        >
          {buttonText}
        </Link>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss banner"
          className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
