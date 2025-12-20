import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// Policy tabs
type PolicyTab = 'refund' | 'terms' | 'privacy';

interface PolicySection {
  title: string;
  content: string;
}

// Default data for each policy
const refundPolicyData = {
  pageTitle: 'Refund Policy',
  introduction: 'We want you to be completely satisfied with your purchase. If you are not satisfied, we offer a comprehensive refund policy to ensure your peace of mind.',
  sections: [
    {
      title: 'Eligibility for Refunds',
      content: 'Items must be returned within 30 days of the original purchase date. Products must be unused, in their original packaging, and in the same condition as when received. Proof of purchase (receipt or order confirmation) is required for all returns.'
    },
    {
      title: 'Non-Refundable Items',
      content: 'The following items are not eligible for refunds: Gift cards, Downloadable software products, Items marked as "Final Sale" or "Non-Returnable", Personalized or custom-made products, Perishable goods.'
    },
    {
      title: 'Refund Process',
      content: 'To initiate a refund, please contact our customer service team with your order number and reason for return. Once your return is approved, you will receive instructions on how to ship the item back. Refunds will be processed within 5-10 business days after we receive the returned item.'
    },
    {
      title: 'Refund Methods',
      content: 'Refunds will be credited to the original payment method used for the purchase. Credit card refunds may take an additional 5-10 business days to appear on your statement, depending on your bank.'
    },
    {
      title: 'Shipping Costs',
      content: 'Original shipping charges are non-refundable unless the return is due to our error (damaged, defective, or incorrect item). Customers are responsible for return shipping costs unless otherwise specified.'
    },
    {
      title: 'Damaged or Defective Items',
      content: 'If you receive a damaged or defective item, please contact us within 48 hours of delivery. We will arrange for a replacement or full refund, including shipping costs.'
    }
  ]
};

const termsConditionsData = {
  pageTitle: 'Terms & Conditions',
  introduction: 'Please read these Terms and Conditions carefully before using our website and services. By accessing or using our platform, you agree to be bound by these terms.',
  sections: [
    {
      title: 'Acceptance of Terms',
      content: 'By accessing and using this website, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this website.'
    },
    {
      title: 'Use of the Website',
      content: 'You may use our website for lawful purposes only. You must not use our website in any way that causes damage to the website or impairment of its availability. You are prohibited from using the website to transmit malicious computer software.'
    },
    {
      title: 'User Accounts',
      content: 'When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding your password and for any activities or actions under your account.'
    },
    {
      title: 'Products and Services',
      content: 'All products and services are subject to availability. We reserve the right to discontinue any product at any time. Prices are subject to change without notice.'
    },
    {
      title: 'Orders and Payment',
      content: 'We reserve the right to refuse or cancel any order for any reason, including product availability, errors in pricing, or errors in your order.'
    },
    {
      title: 'Intellectual Property',
      content: 'All content on this website is our property and protected by copyright, trademark, and other intellectual property laws. You may not reproduce or distribute any content without our express written permission.'
    },
    {
      title: 'Limitation of Liability',
      content: 'We shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service.'
    }
  ]
};

const privacyPolicyData = {
  pageTitle: 'Privacy Policy',
  introduction: 'Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase.',
  sections: [
    {
      title: 'Information We Collect',
      content: 'We collect information you provide directly to us: Personal information (name, email, phone, address), Payment information (credit card, billing address), Account credentials, and Purchase history.'
    },
    {
      title: 'How We Use Your Information',
      content: 'We use your information to: Process orders, Send order updates, Provide customer support, Send promotional communications (with consent), Improve our services, and Detect fraud.'
    },
    {
      title: 'Information Sharing',
      content: 'We may share your information with service providers (payment processors, shipping carriers), business partners (with consent), and legal authorities when required. We do not sell your personal information.'
    },
    {
      title: 'Cookies and Tracking',
      content: 'We use cookies to enhance your browsing experience, analyze traffic, and personalize content. You can control cookie preferences through your browser settings.'
    },
    {
      title: 'Data Security',
      content: 'We implement appropriate security measures to protect your personal information including encryption, secure servers, and regular security assessments.'
    },
    {
      title: 'Your Rights',
      content: 'You have the right to: Access your personal information, Request correction of inaccurate data, Request deletion of your data, Opt-out of marketing, and Data portability.'
    },
    {
      title: 'Changes to This Policy',
      content: 'We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on this page.'
    }
  ]
};

const PoliciesPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine active tab from URL hash or default to refund
  const getInitialTab = (): PolicyTab => {
    const hash = location.hash.replace('#', '');
    if (hash === 'terms' || hash === 'privacy' || hash === 'refund') {
      return hash as PolicyTab;
    }
    // Also check for old URL patterns
    if (location.pathname.includes('terms')) return 'terms';
    if (location.pathname.includes('privacy')) return 'privacy';
    return 'refund';
  };

  const [activeTab, setActiveTab] = useState<PolicyTab>(getInitialTab);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));

  // Update URL hash when tab changes
  const handleTabChange = (tab: PolicyTab) => {
    setActiveTab(tab);
    setExpandedSections(new Set([0])); // Reset expanded sections
    navigate(`/policies#${tab}`, { replace: true });
  };

  // Listen for hash changes
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash === 'terms' || hash === 'privacy' || hash === 'refund') {
      setActiveTab(hash as PolicyTab);
    }
  }, [location.hash]);

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  // Get current policy data based on active tab
  const getCurrentPolicy = () => {
    switch (activeTab) {
      case 'terms':
        return termsConditionsData;
      case 'privacy':
        return privacyPolicyData;
      default:
        return refundPolicyData;
    }
  };

  const currentPolicy = getCurrentPolicy();

  const tabs = [
    { id: 'refund' as PolicyTab, label: 'Refund Policy', icon: '↩️' },
    { id: 'terms' as PolicyTab, label: 'Terms & Conditions', icon: '📋' },
    { id: 'privacy' as PolicyTab, label: 'Privacy Policy', icon: '🔒' },
  ];

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Legal & Policies
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Important information about our policies and terms
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  flex-shrink-0 flex items-center gap-2 px-4 sm:px-6 py-4 text-sm sm:text-base font-medium
                  border-b-2 transition-colors whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Policy Title & Introduction */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            {currentPolicy.pageTitle}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {currentPolicy.introduction}
          </p>
          <p className="text-sm text-gray-400 mt-3">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Policy Sections - Accordion Style */}
        <div className="space-y-3">
          {currentPolicy.sections.map((section, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleSection(index)}
                className="w-full flex items-center justify-between p-4 sm:p-5 bg-white hover:bg-gray-50 transition-colors text-left"
              >
                <span className="font-semibold text-gray-900 pr-4">
                  {section.title}
                </span>
                <span
                  className={`flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-transform duration-200 ${
                    expandedSections.has(index) ? 'rotate-180' : ''
                  }`}
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              
              {expandedSections.has(index) && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 bg-white">
                  <p className="text-gray-600 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 p-6 bg-gray-50 rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Have Questions?
          </h3>
          <p className="text-gray-600 mb-4">
            If you have any questions about our policies, please don't hesitate to contact us.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Us
            </Link>
            <Link
              to="/faq"
              className="inline-flex items-center gap-2 bg-white text-gray-700 px-5 py-2.5 rounded-full text-sm font-medium border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View FAQ
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PoliciesPage;
