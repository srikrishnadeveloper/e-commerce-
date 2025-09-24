// Simple test to check if the API is working
const API_BASE_URL = 'http://localhost:5001/api';

async function testAPI() {
  console.log('🔄 Testing API connection...');
  
  try {
    // Test health endpoint
    console.log('Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('Health response:', healthData);
    
    // Test siteconfig endpoint
    console.log('Testing siteconfig/all endpoint...');
    const configResponse = await fetch(`${API_BASE_URL}/siteconfig/all`);
    const configData = await configResponse.json();
    console.log('Config response:', configData);
    
    if (configData.success && configData.data) {
      console.log('✅ API is working!');
      console.log('Footer data:', configData.data.footer);
      console.log('Company data:', configData.data.company);
    } else {
      console.log('❌ API response format issue:', configData);
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

// Run the test
testAPI();
