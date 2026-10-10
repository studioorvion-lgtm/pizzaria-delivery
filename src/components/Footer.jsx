import React from 'react';
import { siteConfig } from '../config/site';

export default function Footer({ onOpenPrivacy, onOpenTerms, onOpenAdmin }) {
  return (
    <footer className="bg-white border-t border-gray-200 py-10 px-4 text-center">
      <div className="max-w-4xl mx-auto">
        <h3 className="font-black text-xl text-[#006437] mb-2 uppercase italic tracking-tight">
          {siteConfig.name}
        </h3>
        <p className="text-gray-500 text-sm mb-6">
          {siteConfig.tagline}
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-8 text-xs font-bold text-gray-500 uppercase tracking-widest">
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="hover:text-red-600 cursor-pointer transition"
          >
            Políticas de Privacidade
          </button>
          <span>|</span>
          <button
            type="button"
            onClick={onOpenTerms}
            className="hover:text-red-600 cursor-pointer transition"
          >
            Termos de Uso
          </button>
        </div>

        <p className="text-[10px] text-gray-400 uppercase tracking-tighter">
          © 2026 {siteConfig.name} | Todos os direitos reservados
        </p>

        {onOpenAdmin && (
          <button
            type="button"
            onClick={onOpenAdmin}
            className="mt-3 text-[11px] text-gray-400 hover:text-emerald-700 font-semibold cursor-pointer transition underline inline-block"
          >
            Acesso Lojista (Painel)
          </button>
        )}
      </div>
    </footer>
  );
}
