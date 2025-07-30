import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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
import './App.css'

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
        </Routes>
        <Footer />
      </div>
    </Router>
  )
}

export default App
