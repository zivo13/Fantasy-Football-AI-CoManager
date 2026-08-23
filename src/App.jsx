import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { ClientDashboard } from './components/client/ClientDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { CookieBanner } from './components/CookieBanner';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';

const MainLayout = () => {
  const { currentTab } = useApp();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      <div>
        <Navbar />
        <main>
          {currentTab === 'landing' && <LandingPage />}
          {currentTab === 'client' && <ClientDashboard />}
          {currentTab === 'admin' && <AdminDashboard />}
        </main>
      </div>
      <AuthModal />
      <Footer />
      <CookieBanner onOpenPrivacyModal={() => setShowPrivacyModal(true)} />
      <PrivacyPolicyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
