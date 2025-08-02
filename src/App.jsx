import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AnnouncementBar from './components/AnnouncementBar';
import HeroCarousel from './components/HeroCarousel';
import ServiceFeaturesSection from './components/ServiceFeaturesSection';
import TwoBoxSection from './components/TwoBoxSection';
import HotDealsSection from './components/HotDealsSection';
import FeatureSection from './components/FeatureSection';
import TestimonialSection from './components/TestimonialSection';
import Footer from './components/Footer';
import ProductListingPage from './components/ProductListingPage';
import ProductDetailPage from './components/ProductDetailPage';
import ContactUs from './components/ContactUs';
import FAQPage from './components/FAQPage';
import AccountPage from './components/AccountPage';
import DataTest from './components/DataTest';
import ApiTest from './components/ApiTest';
import SiteConfigTest from './components/SiteConfigTest';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <AnnouncementBar />
        <Navbar />
        <Routes>
          <Route path="/" element={
            <>
              <HeroCarousel />
              <ServiceFeaturesSection />
              <TwoBoxSection />
              <HotDealsSection />
              <FeatureSection />
              <TestimonialSection />
            </>
          } />
          <Route path="/products" element={<ProductListingPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/test" element={<DataTest />} />
          <Route path="/api-test" element={<ApiTest />} />
          <Route path="/config-test" element={<SiteConfigTest />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
