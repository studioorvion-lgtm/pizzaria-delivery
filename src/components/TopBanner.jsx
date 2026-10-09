import React, { useState, useEffect } from 'react';

export default function TopBanner() {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 25 * 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="banner-top text-white text-center py-2 text-xs font-bold uppercase tracking-widest sticky top-0 z-50 shadow-sm flex items-center justify-center gap-1.5">
      <span>🔥</span>
      <span>Promoção combo encerra em:</span>
      <span className="font-extrabold tracking-wider">{formatted}</span>
    </div>
  );
}
