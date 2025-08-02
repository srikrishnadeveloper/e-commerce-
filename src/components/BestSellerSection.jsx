import React from 'react';
import { useHomepage } from '../hooks/useSiteConfig';

const BestSellerSection = () => {
  const { data: homepageData, loading, error } = useHomepage();

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-gray-500">Loading best sellers...</div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    console.error('BestSellerSection config error:', error);
    return null;
  }

  const bestSellerData = homepageData?.bestSellerSection || {
    title: "Best Sellers",
    subtitle: "Most popular products loved by our customers"
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-black mb-4">
            {bestSellerData.title}
          </h2>
          <p className="text-lg text-black max-w-2xl mx-auto">
            {bestSellerData.subtitle}
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-gray-500">Best seller products will be displayed here</p>
          <p className="text-sm text-gray-400 mt-2">
            This section uses real-time configuration from MongoDB
          </p>
        </div>
      </div>
    </section>
  );
};

export default BestSellerSection;
