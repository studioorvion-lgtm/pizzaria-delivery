import React from 'react';
import { siteConfig } from '../config/site';

export default function Footer({ onOpenPrivacy, onOpenTerms }) {
  return (
    <footer className="w-full bg-white border-t border-gray-100 py-8 px-4 text-center mt-10">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <h4 className="text-sm font-extrabold uppercase tracking-wider text-gray-900 mb-1">
          {siteConfig.name}
        </h4>
        <p className="text-xs text-gray-500 max-w-md mx-auto mb-3">
          {siteConfig.tagline}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-gray-500 font-medium mb-4">
          <span>⏰ {siteConfig.hours}</span>
          <span>•</span>
          <span>🛵 Delivery em {siteConfig.deliveryTime}</span>
          {siteConfig.phone && (
            <>
              <span>•</span>
              <span>📞 {siteConfig.phoneDisplay}</span>
            </>
          )}
        </div>

        <p className="text-[11px] text-gray-400">
          CNPJ: {siteConfig.cnpj} • Todos os direitos reservados.
        </p>

        {/* Links funcionais para Política de Privacidade e Termos de Uso */}
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mt-3">
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="hover:text-gray-900 underline cursor-pointer transition"
          >
            Políticas de Privacidade
          </button>
          <span>|</span>
          <button
            type="button"
            onClick={onOpenTerms}
            className="hover:text-gray-900 underline cursor-pointer transition"
          >
            Termos de Uso
          </button>
        </div>
      </div>
    </footer>
  );
}
