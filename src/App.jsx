import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import Header from './components/Header';
import HeroStoreCard from './components/HeroStoreCard';
import PromoHighlights from './components/PromoHighlights';
import CatalogSection from './components/CatalogSection';
import DesktopSidebarCart from './components/DesktopSidebarCart';
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
        <div className="min-h-screen bg-[#f8f9fa] text-gray-900 flex flex-col font-sans pb-24 lg:pb-0">
          {/* 1. Topo Estilo YOR */}
          <Header onOpenOrders={() => setIsMyOrderOpen(true)} />

          {/* 2. Hero Amplo & 3. Card da Loja Sobreposto */}
          <HeroStoreCard />

          {/* 4. Promoções em Destaque (2 Cards Lado a Lado) */}
          <PromoHighlights />

          {/* 5. Conteúdo Principal: Catálogo (Esquerda) + Sacola Fixa (Direita no Desktop) */}
          <main className="max-w-6xl w-full mx-auto px-4 py-4 flex flex-col lg:flex-row gap-6 lg:gap-8 items-start flex-1">
            <CatalogSection />
            <DesktopSidebarCart />
          </main>

          {/* Rodapé Limpo Estilo YOR */}
          <Footer
            onOpenPrivacy={() => setLegalModal('privacy')}
            onOpenTerms={() => setLegalModal('terms')}
            onOpenAdmin={navigateToAdmin}
          />

          {/* Carrinho Mobile Flutuante e Modais */}
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
