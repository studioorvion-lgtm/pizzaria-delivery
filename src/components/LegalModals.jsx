import React from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';
import { siteConfig } from '../config/site';

export default function LegalModals({ activeModal, onClose }) {
  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl border border-gray-100 flex flex-col relative">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            {activeModal === 'privacy' ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            ) : (
              <FileText className="w-5 h-5 text-[#D32F2F]" />
            )}
            <h3 className="font-extrabold text-gray-900 text-base sm:text-lg">
              {activeModal === 'privacy' ? 'Política de Privacidade' : 'Termos de Uso'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto text-xs sm:text-sm text-gray-600 space-y-4 leading-relaxed">
          {activeModal === 'privacy' ? (
            <>
              <p>
                A <strong>{siteConfig.name}</strong> respeita e prioriza a sua privacidade. Esta política descreve como tratamos as informações coletadas durante a realização dos seus pedidos em nossa plataforma de delivery.
              </p>
              
              <h4 className="font-bold text-gray-900 text-sm">1. Coleta de Dados</h4>
              <p>
                Coletamos apenas os dados essenciais para o processamento, entrega e comunicação do seu pedido: nome completo, telefone para contato/WhatsApp e endereço completo de entrega.
              </p>

              <h4 className="font-bold text-gray-900 text-sm">2. Pagamento e Segurança</h4>
              <p>
                Todas as transações via Pix são processadas por infraestrutura bancária criptografada de alta segurança. Seus dados financeiros não são armazenados em nossos servidores.
              </p>

              <h4 className="font-bold text-gray-900 text-sm">3. Uso das Informações</h4>
              <p>
                Os dados fornecidos são utilizados unicamente para:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Localização e entrega do pedido pelo motoboy;</li>
                <li>Notificações em tempo real sobre o status da entrega;</li>
                <li>Cumprimento de obrigações legais e emissão de comprovantes fiscais.</li>
              </ul>

              <h4 className="font-bold text-gray-900 text-sm">4. Seus Direitos (LGPD)</h4>
              <p>
                Você possui total direito de solicitar a confirmação, correção ou exclusão de seus dados pessoais a qualquer momento através dos nossos canais de atendimento.
              </p>
            </>
          ) : (
            <>
              <p>
                Bem-vindo à plataforma de delivery online da <strong>{siteConfig.name}</strong>. Ao realizar um pedido, você concorda com os termos e condições abaixo.
              </p>

              <h4 className="font-bold text-gray-900 text-sm">1. Pedidos e Cardápio</h4>
              <p>
                Os produtos, combos, ingredientes e preços disponíveis no cardápio online estão sujeitos a disponibilidade. A confirmação do pedido ocorre após o processamento da solicitação.
              </p>

              <h4 className="font-bold text-gray-900 text-sm">2. Pagamentos via Pix</h4>
              <p>
                Para pedidos efetuados na modalidade Pix, o início da preparação do pedido na cozinha e sua expedição para entrega ocorrem mediante a confirmação da transação pelo sistema bancário.
              </p>

              <h4 className="font-bold text-gray-900 text-sm">3. Prazos de Entrega</h4>
              <p>
                Trabalhamos para cumprir o prazo médio estimado de {siteConfig.deliveryTime}. Variações pontuais podem ocorrer em virtude de condições climáticas adversas ou horários de pico.
              </p>

              <h4 className="font-bold text-gray-900 text-sm">4. Cancelamentos e Trocas</h4>
              <p>
                Em caso de divergência no pedido recebido, entre em contato imediatamente com nossa central de atendimento para providenciarmos a troca ou reembolso de forma ágil.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-800 hover:bg-black text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Entendido e Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
