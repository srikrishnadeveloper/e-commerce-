import React, { useState, useEffect } from 'react';

const ApiTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testApiConnection = async () => {
      const results = {};
      
      try {
        // Test 1: Direct API call
        console.log('🧪 Testing direct API connection...');
        const response = await fetch('http://localhost:5001/api/products');
        const data = await response.json();
        
        results.directApi = {
          success: response.ok,
          status: response.status,
          productCount: data.data?.length || 0,
          sampleProduct: data.data?.[0]?.name || 'No products'
        };
        
        console.log('✅ Direct API test:', results.directApi);
      } catch (error) {
        results.directApi = {
          success: false,
          error: error.message
        };
        console.error('❌ Direct API test failed:', error);
      }

      try {
        // Test 2: Featured products
        console.log('🧪 Testing featured products...');
        const response = await fetch('http://localhost:5001/api/products/featured');
        const data = await response.json();
        
        results.featuredProducts = {
          success: response.ok,
          status: response.status,
          productCount: data.data?.length || 0,
          sampleProduct: data.data?.[0]?.name || 'No featured products'
        };
        
        console.log('✅ Featured products test:', results.featuredProducts);
      } catch (error) {
        results.featuredProducts = {
          success: false,
          error: error.message
        };
        console.error('❌ Featured products test failed:', error);
      }

      try {
        // Test 3: Site config
        console.log('🧪 Testing site config...');
        const response = await fetch('http://localhost:5001/api/siteconfig');
        const data = await response.json();
        
        results.siteConfig = {
          success: response.ok,
          status: response.status,
          configCount: data.count || 0,
          hasMainConfig: !!data.data?.main
        };
        
        console.log('✅ Site config test:', results.siteConfig);
      } catch (error) {
        results.siteConfig = {
          success: false,
          error: error.message
        };
        console.error('❌ Site config test failed:', error);
      }

      setTestResults(results);
      setLoading(false);
    };

    testApiConnection();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-gray-600">Testing API connection...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔌 API Connection Test Results</h1>
      
      <div className="grid gap-6">
        {/* Direct API Test */}
        <div className={`p-4 rounded-lg ${testResults.directApi?.success ? 'bg-green-50' : 'bg-red-50'}`}>
          <h2 className={`text-lg font-semibold mb-2 ${testResults.directApi?.success ? 'text-green-800' : 'text-red-800'}`}>
            {testResults.directApi?.success ? '✅' : '❌'} Direct API Connection
          </h2>
          {testResults.directApi?.success ? (
            <div className="text-green-700">
              <p>Status: {testResults.directApi.status}</p>
              <p>Products found: {testResults.directApi.productCount}</p>
              <p>Sample product: {testResults.directApi.sampleProduct}</p>
            </div>
          ) : (
            <div className="text-red-700">
              <p>Error: {testResults.directApi?.error}</p>
            </div>
          )}
        </div>

        {/* Featured Products Test */}
        <div className={`p-4 rounded-lg ${testResults.featuredProducts?.success ? 'bg-green-50' : 'bg-red-50'}`}>
          <h2 className={`text-lg font-semibold mb-2 ${testResults.featuredProducts?.success ? 'text-green-800' : 'text-red-800'}`}>
            {testResults.featuredProducts?.success ? '✅' : '❌'} Featured Products
          </h2>
          {testResults.featuredProducts?.success ? (
            <div className="text-green-700">
              <p>Status: {testResults.featuredProducts.status}</p>
              <p>Featured products: {testResults.featuredProducts.productCount}</p>
              <p>Sample product: {testResults.featuredProducts.sampleProduct}</p>
            </div>
          ) : (
            <div className="text-red-700">
              <p>Error: {testResults.featuredProducts?.error}</p>
            </div>
          )}
        </div>

        {/* Site Config Test */}
        <div className={`p-4 rounded-lg ${testResults.siteConfig?.success ? 'bg-green-50' : 'bg-red-50'}`}>
          <h2 className={`text-lg font-semibold mb-2 ${testResults.siteConfig?.success ? 'text-green-800' : 'text-red-800'}`}>
            {testResults.siteConfig?.success ? '✅' : '❌'} Site Configuration
          </h2>
          {testResults.siteConfig?.success ? (
            <div className="text-green-700">
              <p>Status: {testResults.siteConfig.status}</p>
              <p>Config sections: {testResults.siteConfig.configCount}</p>
              <p>Has main config: {testResults.siteConfig.hasMainConfig ? 'Yes' : 'No'}</p>
            </div>
          ) : (
            <div className="text-red-700">
              <p>Error: {testResults.siteConfig?.error}</p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            📊 Test Summary
          </h2>
          <div className="text-gray-700">
            <p>Backend URL: http://localhost:5001/api</p>
            <p>All tests passed: {Object.values(testResults).every(r => r.success) ? '✅ Yes' : '❌ No'}</p>
            {Object.values(testResults).every(r => r.success) && (
              <p className="text-green-600 font-semibold mt-2">
                🎉 Your frontend is successfully connected to the MongoDB backend!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTest; 