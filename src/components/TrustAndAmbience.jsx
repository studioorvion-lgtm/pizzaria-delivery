import React from 'react';
import { ShieldCheck, Flame, Sparkles, Truck, HeartHandshake, Award } from 'lucide-react';
import { AMBIENCE_PHOTOS } from '../data/menu';

export default function TrustAndAmbience() {
  const pillars = [
    {
      icon: Flame,
      title: 'Massa com Fermentação de 48h',
      desc: 'Massa de longa maturação com farinha especial. Leve, aerada, crocante por fora e macia por dentro, de facílima digestão.',
    },
    {
      icon: Sparkles,
      title: 'Ingredientes Rigorosamente Selecionados',
      desc: 'Molho de tomates selecionados, queijo mozzarella de primeira linha e embutidos artesanais para garantir sabor autêntico.',
    },
    {
      icon: Truck,
      title: 'Embalagem Térmica Lacrada',
      desc: 'Sua pizza sai do forno diretamente para caixas térmicas com lacre inviolável de segurança, chegando quentinha à sua mesa.',
    },
    {
      icon: ShieldCheck,
      title: 'Pagamento Oficial via Pix',
      desc: 'Ambiente seguro com criptografia bancária de ponta a ponta. Identificação do pagamento e liberação para preparo em menos de 1 minuto.',
    },
  ];

  return (
    <section className="w-full px-4 pt-8 pb-6" id="diferenciais">
      <div className="max-w-4xl mx-auto">
        {/* Bloco de Pilares de Qualidade */}
        <div className="bg-gradient-to-br from-stone-900 to-neutral-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-800 mb-8 relative overflow-hidden">
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>Padrão de Excelência Artesanal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Por que a Donatello é a Preferida?
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm mt-1">
              Fazemos pizza com respeito à tradição e cuidado artesanal em cada detalhe.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {pillars.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 hover:bg-white/10 transition"
                >
                  <div className="p-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-white mb-1">
                      {item.title}
                    </h3>
                    <p className="text-stone-300 text-xs leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fotos do Ambiente / Cozinha Real */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-3 border border-gray-200/80 shadow-xs">
            <div className="rounded-xl overflow-hidden mb-2">
              <img
                src={AMBIENCE_PHOTOS.kitchen}
                alt="Cozinha e forno da pizzaria"
                className="w-full h-48 sm:h-56 object-cover hover:scale-105 transition duration-500"
                loading="lazy"
                decoding="async"
              />
            </div>
            <p className="text-xs font-bold text-gray-800">
              Forno em alta temperatura e bancada de preparo higienizada
            </p>
            <p className="text-[11px] text-gray-500">
              Massa aberta artesanalmente na hora para garantir textura inigualável.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-3 border border-gray-200/80 shadow-xs">
            <div className="rounded-xl overflow-hidden mb-2">
              <img
                src={AMBIENCE_PHOTOS.restaurant}
                alt="Clientes e salão da pizzaria"
                className="w-full h-48 sm:h-56 object-cover hover:scale-105 transition duration-500"
                loading="lazy"
                decoding="async"
              />
            </div>
            <p className="text-xs font-bold text-gray-800">
              Mais de 1.800 clientes atendidos e satisfeitos
            </p>
            <p className="text-[11px] text-gray-500">
              Compromisso com pontualidade na entrega e sabor que fideliza a família toda.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
