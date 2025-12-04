import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import AnnouncementBar from './components/AnnouncementBar'
import Navbar from './components/Navbar'
import HeroCarousel from './components/HeroCarousel'
import FeatureSection from './components/FeatureSection'
import HotDealsSection from './components/HotDealsSection'
import TwoBoxSection from './components/TwoBoxSection'
import ServiceFeaturesSection from './components/ServiceFeaturesSection'
import TestimonialSection from './components/TestimonialSection'
import Footer from './components/Footer'
import ContactUs from './components/ContactUs'
import FAQPage from './components/FAQPage'
import ProductListingPage from './components/ProductListingPage'
import ProductDetailPage from './components/ProductDetailPage'
import AccountPage from './components/AccountPage'
import WishlistPage from './pages/WishlistPage'
import LogoutPage from './pages/LogoutPage'
import CartPage from './pages/CartPage'
import WelcomePopup from './components/WelcomePopup'
import './App.css'
import authService from './services/authService'

// Home page component
const HomePage: React.FC = () => (
  <>
    <HeroCarousel />
    <ServiceFeaturesSection />
    <FeatureSection />
    <HotDealsSection />
    <TwoBoxSection />
    <TestimonialSection />
  </>
);

const App: React.FC = () => {
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [welcomeUsername, setWelcomeUsername] = useState('');

  // (Removed legacy login page redirect) Standalone /login page is removed in favor of modal

  // Gracefully handle direct visits to /login or /signup by opening modals
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/login' || path === '/signup') {
      // Replace URL with home to avoid broken route and open the appropriate modal
      window.history.replaceState(null, '', '/');
      window.dispatchEvent(new Event(path === '/signup' ? 'auth:openRegister' : 'auth:openLogin'));
    }
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
          <Route path="/home" element={<HomePage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/products" element={<ProductListingPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/shop" element={<ProductListingPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/cart" element={<CartPage />} />
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
