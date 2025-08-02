import React, { useState, useEffect } from 'react';
import { getProducts, getSiteConfig, getFeaturedProducts } from '../services/dataService';

const DataTest = () => {
  const [products, setProducts] = useState([]);
  const [siteConfig, setSiteConfig] = useState({});
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testDataFetching = async () => {
      try {
        setLoading(true);
        console.log('🧪 Testing data fetching from backend...');

        // Test products
        console.log('1. Fetching products...');
        const productsData = await getProducts();
        console.log('✅ Products fetched:', productsData.length);
        setProducts(productsData);

        // Test site config
        console.log('2. Fetching site config...');
        const configData = await getSiteConfig();
        console.log('✅ Site config fetched:', configData);
        setSiteConfig(configData);

        // Test featured products
        console.log('3. Fetching featured products...');
        const featuredData = await getFeaturedProducts();
        console.log('✅ Featured products fetched:', featuredData.length);
        setFeaturedProducts(featuredData);

        console.log('🎉 All data fetching tests completed successfully!');
        setLoading(false);
      } catch (err) {
        console.error('❌ Data fetching test failed:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    testDataFetching();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-gray-600">Testing data fetching...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">
          <h2 className="text-xl font-bold">❌ Data Fetching Failed</h2>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧪 Data Fetching Test Results</h1>
      
      <div className="grid gap-6">
        {/* Products Test */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-green-800 mb-2">
            ✅ Products Test
          </h2>
          <p className="text-green-700">
            Successfully fetched {products.length} products from backend
          </p>
          {products.length > 0 && (
            <div className="mt-2 text-sm text-green-600">
              Sample product: {products[0].name}
            </div>
          )}
        </div>

        {/* Site Config Test */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            ✅ Site Config Test
          </h2>
          <p className="text-blue-700">
            Successfully fetched site configuration from backend
          </p>
          {siteConfig.branding && (
            <div className="mt-2 text-sm text-blue-600">
              Store name: {siteConfig.branding.name}
            </div>
          )}
        </div>

        {/* Featured Products Test */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-purple-800 mb-2">
            ✅ Featured Products Test
          </h2>
          <p className="text-purple-700">
            Successfully fetched {featuredProducts.length} featured products from backend
          </p>
          {featuredProducts.length > 0 && (
            <div className="mt-2 text-sm text-purple-600">
              Sample featured product: {featuredProducts[0].name}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            🎉 Test Summary
          </h2>
          <p className="text-gray-700">
            All data fetching tests passed! The frontend is successfully connecting to the backend MongoDB database.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataTest; 