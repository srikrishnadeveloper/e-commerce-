import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import AnnouncementBar from './components/AnnouncementBar.tsx'
import Navbar from './components/Navbar.tsx'
import HeroCarousel from './components/HeroCarousel.tsx'
import HotDealsSection from './components/HotDealsSection.tsx'
import TwoBoxSection from './components/TwoBoxSection.tsx'
import TestimonialSection from './components/TestimonialSection.tsx'
import Footer from './components/Footer.tsx'
import ContactUs from './components/ContactUs.tsx'
import AboutUs from './components/AboutUs.tsx'
import FAQPage from './components/FAQPage.tsx'
import ProductListingPage from './components/ProductListingPage.tsx'
import ProductDetailPage from './components/ProductDetailPage.tsx'
import AccountPage from './components/AccountPage.tsx'
import WishlistPage from './pages/WishlistPage'
import LogoutPage from './pages/LogoutPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import BillingPage from './pages/BillingPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import OrderTracking from './components/OrderTracking'
import WelcomePopup from './components/WelcomePopup'
import ResetPasswordPage from './pages/ResetPasswordPage'
import RefundPolicyPage from './pages/RefundPolicyPage'
import TermsConditionsPage from './pages/TermsConditionsPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import NotFoundPage from './pages/NotFoundPage'
import './App.css'
import authService from './services/authService'

// Home page component
const HomePage: React.FC = () => (
  <>
    <HeroCarousel />
    <HotDealsSection />
    <TwoBoxSection />
    <TestimonialSection />
  </>
);

const App: React.FC = () => {
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [welcomeUsername, setWelcomeUsername] = useState('');
  const [announcementHeight, setAnnouncementHeight] = useState<number>(0);

  // (Removed legacy login page redirect) Standalone /login page is removed in favor of modal

  // Gracefully handle direct visits to /login or /signup by opening modals
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/login' || path === '/signup') {
      window.history.replaceState(null, '', '/');
      window.dispatchEvent(new Event(path === '/signup' ? 'auth:openRegister' : 'auth:openLogin'));
    }
  }, []);

  // Adjust layout padding based on AnnouncementBar height
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<number>;
      const h = typeof custom.detail === 'number' ? custom.detail : 0;
      setAnnouncementHeight(h);
    };
    window.addEventListener('announcementbar:height', handler as EventListener);
    return () => window.removeEventListener('announcementbar:height', handler as EventListener);
  }, []);

  // Listen for login events to show welcome popup (only once per user)
  useEffect(() => {
    const handleAuthChange = () => {
      const user = authService.getCurrentUserFromStorage();
      if (user && user.name) {
        const flagKey = `welcomeShown:${user._id || user.id || user.email || user.name}`;
        if (!localStorage.getItem(flagKey)) {
          setWelcomeUsername(user.name);
          setShowWelcomePopup(true);
          localStorage.setItem(flagKey, '1');
        }
      }
    };

    window.addEventListener('auth:changed', handleAuthChange);
    return () => {
      window.removeEventListener('auth:changed', handleAuthChange);
    };
  }, []);

  const handleWelcomePopupClose = () => {
    setShowWelcomePopup(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-white">
        <AnnouncementBar />
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/products" element={<ProductListingPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/shop" element={<ProductListingPage />} />
          <Route path="/account" element={<AccountPage />} />
          {/** Removed legacy login/signup routes; authentication handled via modals **/}
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />
          <Route path="/terms-conditions" element={<TermsConditionsPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Footer />
        
        {/* Welcome Popup */}
        <WelcomePopup
          username={welcomeUsername}
          isVisible={showWelcomePopup}
          onClose={handleWelcomePopupClose}
        />
      </div>
    </Router>
  )
}

export default App
