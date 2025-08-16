import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import AnnouncementBar from './components/AnnouncementBar.tsx'
import Navbar from './components/Navbar.tsx'
import HeroCarousel from './components/HeroCarousel.tsx'
import FeatureSection from './components/FeatureSection.tsx'
import HotDealsSection from './components/HotDealsSection.tsx'
import TwoBoxSection from './components/TwoBoxSection.tsx'
import ServiceFeaturesSection from './components/ServiceFeaturesSection.tsx'
import TestimonialSection from './components/TestimonialSection.tsx'
import Footer from './components/Footer.tsx'
import ContactUs from './components/ContactUs.tsx'
import FAQPage from './components/FAQPage.tsx'
import ProductListingPage from './components/ProductListingPage.tsx'
import ProductDetailPage from './components/ProductDetailPage.tsx'
import AccountPage from './components/AccountPage.tsx'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
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

  // Check for auto-login on app startup
  useEffect(() => {
    // If user is on login page and has remember me enabled, redirect to home
    if (window.location.pathname === '/login' && authService.autoLogin()) {
      window.location.href = '/';
    }
  }, []);

  // Listen for login events to show welcome popup
  useEffect(() => {
    const handleAuthChange = () => {
      const user = authService.getCurrentUserFromStorage();
      if (user && user.name) {
        setWelcomeUsername(user.name);
        setShowWelcomePopup(true);
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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
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
