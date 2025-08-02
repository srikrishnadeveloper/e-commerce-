import React, { useState } from 'react';

const FAQPage = () => {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const faqData = {
    shopping: {
      title: "Shopping Information",
      questions: [
        {
          id: 'shop-1',
          question: "Pellentesque habitant morbi tristique senectus et netus?",
          answer: "The perfect way to enjoy brewing tea on low hanging fruit to identify. Duis autem vel eum iriure dolor in hendrerit vulputate velit esse molestae consequat, vel illum dolore eu feugiat nulla facilisis. For me, the most important part of improving at photography has been sharing it. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
        },
        {
          id: 'shop-2',
          question: "How much is shipping and how long will it take?",
          answer: "Shipping costs vary by location and selected shipping method. Standard shipping typically takes 5-7 business days, while express shipping takes 2-3 business days. Free shipping is available on orders over $50."
        },
        {
          id: 'shop-3',
          question: "How long will it take to get my package?",
          answer: "Delivery times depend on your location and chosen shipping method. Most orders are processed within 1-2 business days and shipped via our standard delivery service."
        },
        {
          id: 'shop-4',
          question: "Branding is simply a more efficient way to sell things?",
          answer: "Branding goes beyond just selling products. It creates an emotional connection with customers, builds trust, and helps establish your unique position in the market."
        }
      ]
    },
    payment: {
      title: "Payment Information",
      questions: [
        {
          id: 'pay-1',
          question: "Pellentesque habitant morbi tristique senectus et netus?",
          answer: "The perfect way to enjoy brewing tea on low hanging fruit to identify. Duis autem vel eum iriure dolor in hendrerit vulputate velit esse molestae consequat, vel illum dolore eu feugiat nulla facilisis. For me, the most important part of improving at photography has been sharing it. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
        },
        {
          id: 'pay-2',
          question: "How much is shipping and how long will it take?",
          answer: "We accept all major credit cards, PayPal, Apple Pay, and Google Pay. All transactions are secured with SSL encryption for your protection."
        },
        {
          id: 'pay-3',
          question: "How long will it take to get my package?",
          answer: "Payment processing typically takes 1-2 business days. Once payment is confirmed, your order will be prepared for shipment."
        },
        {
          id: 'pay-4',
          question: "Branding is simply a more efficient way to sell things?",
          answer: "We offer flexible payment options including installment plans for orders over $100. Contact our customer service team for more details."
        }
      ]
    },
    returns: {
      title: "Order Returns",
      questions: [
        {
          id: 'ret-1',
          question: "Pellentesque habitant morbi tristique senectus et netus?",
          answer: "The perfect way to enjoy brewing tea on low hanging fruit to identify. Duis autem vel eum iriure dolor in hendrerit vulputate velit esse molestae consequat, vel illum dolore eu feugiat nulla facilisis. For me, the most important part of improving at photography has been sharing it. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
        },
        {
          id: 'ret-2',
          question: "How much is shipping and how long will it take?",
          answer: "Returns are free within 30 days of purchase. We provide a prepaid return label and will process your refund within 5-7 business days of receiving the returned item."
        }
      ]
    }
  };

  const AccordionSection = ({ sectionKey, section }) => (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-black mb-6">{section.title}</h2>
      <div className="space-y-4">
        {section.questions.map((item) => (
          <div 
            key={item.id} 
            className="border-b border-gray-100 last:border-b-0"
          >
            <button
              onClick={() => toggleSection(item.id)}
              className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 transition-colors duration-200"
              aria-expanded={expandedSection === item.id}
            >
              <span className="text-base font-medium text-black pr-4">
                {item.question}
              </span>
              <svg
                className={`w-5 h-5 flex-shrink-0 transform transition-transform duration-200 ${
                  expandedSection === item.id ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {expandedSection === item.id && (
              <div className="pb-6 pr-8">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
      {/* Page Header */}
      <div className="text-center py-12 px-4">
        <h1 className="text-4xl font-bold text-black mb-2">FAQ 01</h1>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - FAQ Accordions */}
          <div className="lg:col-span-2">
            <AccordionSection sectionKey="shopping" section={faqData.shopping} />
            <AccordionSection sectionKey="payment" section={faqData.payment} />
            <AccordionSection sectionKey="returns" section={faqData.returns} />
          </div>

          {/* Right Column - Contact Card */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-8 shadow-sm border border-gray-100 sticky top-8">
              <h3 className="text-lg font-semibold text-black mb-4">Have a question</h3>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  If you have an issue or question that requires immediate assistance, you can click the button below to chat live with a Customer Service representative.
                </p>
                <p className="text-sm text-gray-600">
                  Please allow 06 - 12 business days from the time your package arrives back to us for a refund to be issued.
                </p>
              </div>

              <div className="space-y-3">
                <button 
                  className="w-full bg-black text-white py-3 px-6 rounded-md font-medium hover:bg-gray-800 transition-colors duration-200"
                >
                  Contact us
                </button>
                <button 
                  className="w-full border border-black text-black py-3 px-6 rounded-md font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  Live chat
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
