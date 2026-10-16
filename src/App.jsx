import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import TopBanner from './components/TopBanner';
import Header from './components/Header';
import HeroOffer from './components/HeroOffer';
import CategoryNav from './components/CategoryNav';
import SuperCombos from './components/SuperCombos';
import CombosEspeciais from './components/CombosEspeciais';
import BurgersSection from './components/BurgersSection';
import DrinksSection from './components/DrinksSection';
import TrustAndAmbience from './components/TrustAndAmbience';
import CustomerReviews from './components/CustomerReviews';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
import MobileBottomBar from './components/MobileBottomBar';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import PixScreen from './components/PixScreen';
import SuccessScreen from './components/SuccessScreen';
import MyOrderModal from './components/MyOrderModal';
import LegalModals from './components/LegalModals';
import Toast from './components/Toast';
import AdminPanel from './components/AdminPanel';

function checkIsAdminRoute() {
  if (typeof window === 'undefined') return false;
  const path = (window.location.pathname || '').toLowerCase();
  const search = (window.location.search || '').toLowerCase();
  const hash = (window.location.hash || '').toLowerCase();
  return (
    path.startsWith('/admin') ||
    path.startsWith('/painel') ||
    search.includes('admin') ||
    search.includes('painel') ||
    hash.startsWith('#/admin') ||
    hash.startsWith('#admin')
  );
}

export default function App() {
  const [isAdminView, setIsAdminView] = useState(checkIsAdminRoute);
  const [legalModal, setLegalModal] = useState(null); // 'privacy' | 'terms' | null
  const [isMyOrderOpen, setIsMyOrderOpen] = useState(false);

  useEffect(() => {
    const handleUrlChange = () => {
      setIsAdminView(checkIsAdminRoute());
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const navigateToSite = () => {
    window.history.pushState({}, '', '/');
    setIsAdminView(false);
  };

  const navigateToAdmin = () => {
    window.history.pushState({}, '', '/admin');
    setIsAdminView(true);
  };

  if (isAdminView) {
    return (
      <ErrorBoundary>
        <AdminPanel onBackToSite={navigateToSite} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <CartProvider>
        <div className="min-h-screen bg-[#f4f4f5] text-gray-900 flex flex-col font-sans pb-24 md:pb-0">
          {/* 1. Faixa Superior Fina */}
          <TopBanner />

          {/* 2. Topo com Logo, Nome e Dados */}
          <Header onOpenOrders={() => setIsMyOrderOpen(true)} />

          {/* 3. Oferta Principal em Destaque na Primeira Tela */}
          <HeroOffer />

          {/* 4. Navegação Rápida por Categorias */}
          <CategoryNav />

          {/* Conteúdo Principal do Cardápio */}
          <main className="flex-1 w-full max-w-5xl mx-auto py-2">
            {/* 5. Super Combos */}
            <SuperCombos />

            {/* 6. Combos Especiais */}
            <CombosEspeciais />

            {/* 7. Hambúrgueres / Acompanhamentos */}
            <BurgersSection />

            {/* 8. Bebidas */}
            <DrinksSection />

            {/* 9. Bloco de Prova / Pilares de Qualidade & Fotos do Ambiente */}
            <TrustAndAmbience />

            {/* 10. Avaliações de Clientes Verificados */}
            <CustomerReviews />

            {/* 11. CTA Final */}
            <FinalCTA />
          </main>

          {/* 12. Rodapé com links funcionais */}
          <Footer
            onOpenPrivacy={() => setLegalModal('privacy')}
            onOpenTerms={() => setLegalModal('terms')}
            onOpenAdmin={navigateToAdmin}
          />

          {/* Componentes Interativos e Checkout Pix */}
          <MobileBottomBar />
          <CartDrawer />
          <CheckoutModal />
          <PixScreen />
          <SuccessScreen />
          <MyOrderModal
            isOpen={isMyOrderOpen}
            onClose={() => setIsMyOrderOpen(false)}
          />
          <LegalModals
            activeModal={legalModal}
            onClose={() => setLegalModal(null)}
          />
          <Toast />
        </div>
      </CartProvider>
    </ErrorBoundary>
  );
}
