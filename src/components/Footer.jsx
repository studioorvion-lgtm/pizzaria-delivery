import React from 'react';
import { siteConfig } from '../config/site';

export default function Footer({ onOpenPrivacy, onOpenTerms, onOpenAdmin }) {
  return (
    <footer className="bg-white border-t border-gray-200/80 py-8 px-4 text-xs text-gray-500">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Esquerda: Logo e Slogan no Estilo YOR */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-gray-100 overflow-hidden flex items-center justify-center shrink-0">
            <img
              src="/images/pizzaria.webp"
              alt={siteConfig.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="font-black text-gray-900 text-sm tracking-tight block uppercase">
              DONATELLO PIZZARIA.
            </span>
            <span className="text-[11px] text-gray-400">
              Sabor artesanal onde você estiver.
            </span>
          </div>
        </div>

        {/* Centro: Links Institucionais */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="hover:text-red-600 transition cursor-pointer"
          >
            Políticas de Privacidade
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={onOpenTerms}
            className="hover:text-red-600 transition cursor-pointer"
          >
            Termos de Uso
          </button>
          {onOpenAdmin && (
            <>
              <span>•</span>
              <button
                type="button"
                onClick={onOpenAdmin}
                className="text-gray-400 hover:text-emerald-700 transition cursor-pointer underline"
              >
                Acesso Lojista
              </button>
            </>
          )}
        </div>

        {/* Direita: Status Aberto Agora */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span>Aberto agora</span>
        </div>
      </div>
    </footer>
  );
}
