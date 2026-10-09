import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-100 py-8 px-4 text-center mt-10">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <h4 className="text-sm font-extrabold uppercase tracking-wider text-gray-900 mb-1">
          DONATELLO PIZZARIA ARTESANAL
        </h4>
        <p className="text-xs text-gray-500 max-w-md mx-auto mb-3">
          A verdadeira pizza artesanal na sua casa • Massa de fermentação lenta de 48h
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500 font-medium mb-4">
          <span>⏰ Todos os dias: 18h às 23h30</span>
          <span>•</span>
          <span>🛵 Delivery em até 30 min</span>
          <span>•</span>
          <span>📞 (11) 99876-5432</span>
        </div>

        <p className="text-[11px] text-gray-400">
          CNPJ: 45.123.890/0001-44 • Todos os direitos reservados.
        </p>

        <div className="flex items-center justify-center gap-4 text-[11px] text-gray-400 mt-2">
          <a href="#termos" onClick={(e) => e.preventDefault()} className="hover:underline">
            Políticas de Privacidade
          </a>
          <span>|</span>
          <a href="#termos" onClick={(e) => e.preventDefault()} className="hover:underline">
            Termos de Uso
          </a>
        </div>
      </div>
    </footer>
  );
}
