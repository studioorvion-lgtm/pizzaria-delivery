import React, { useState, useEffect } from 'react';

export default function TopBanner() {
  const [secondsLeft, setSecondsLeft] = useState(24 * 60 + 38); // 24:38 inicial

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 24 * 60 + 59));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="w-full bg-[#D32F2F] text-white py-1.5 px-4 text-center text-xs sm:text-sm font-bold tracking-wide flex items-center justify-center gap-1.5 shadow-sm sticky top-0 z-40">
      <span>🔥</span>
      <span>PROMOÇÃO COMBO ENCERRA EM:</span>
      <span className="font-mono bg-black/20 px-1.5 py-0.5 rounded text-yellow-300 font-extrabold text-sm ml-1">
        {formatted}
      </span>
    </div>
  );
}
