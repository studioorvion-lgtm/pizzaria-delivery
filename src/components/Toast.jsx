import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Toast() {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-gray-900/95 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 text-xs font-bold backdrop-blur-xs animate-bounce">
      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      <span>{toastMessage}</span>
    </div>
  );
}
