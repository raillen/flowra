/**
 * Script to test CORS configuration
 * Uses native fetch (Node.js 18+)
 * 
 * Usage: node scripts/test-cors.js
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

/**
 * Helper to format headers object
 */
function formatHeaders(headers) {
  const result = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

async function testCORS() {
  console.log('🧪 Testing CORS configuration...\n');

  try {
    // Test health endpoint (no auth required)
    console.log('1. Testing health endpoint...');
    console.log(`   URL: ${API_URL}/health`);
    const healthResponse = await fetch(`${API_URL}/health`);
    
    const contentType = healthResponse.headers.get('content-type');
    console.log(`   Status: ${healthResponse.status} ${healthResponse.statusText}`);
    console.log(`   Content-Type: ${contentType || 'N/A'}`);
    
    if (!healthResponse.ok) {
      const text = await healthResponse.text();
      console.error('❌ Health check failed:', `HTTP ${healthResponse.status}`);
      console.error('   Response (first 200 chars):', text.substring(0, 200));
      return;
    }
    
    if (contentType && contentType.includes('application/json')) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check passed:', healthData);
    } else {
      const text = await healthResponse.text();
      console.log('⚠️  Health endpoint returned non-JSON response');
      console.log('   Response (first 200 chars):', text.substring(0, 200));
    }
    
    console.log('   CORS Headers:', {
      'access-control-allow-origin': healthResponse.headers.get('access-control-allow-origin') || 'N/A',
      'access-control-allow-credentials': healthResponse.headers.get('access-control-allow-credentials') || 'N/A',
    });
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    if (error.cause) {
      console.error('   Cause:', error.cause);
    }
    console.error('\n💡 Dica: Certifique-se de que o backend está rodando:');
    console.error('   cd backend && npm run dev');
    return;
  }

  try {
    // Test CORS preflight
    console.log('\n2. Testing CORS preflight (OPTIONS)...');
    const optionsResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });
    
    if (optionsResponse.ok) {
      console.log('✅ CORS preflight passed');
      console.log('   Status:', optionsResponse.status);
      console.log('   CORS Headers:', {
        'access-control-allow-origin': optionsResponse.headers.get('access-control-allow-origin'),
        'access-control-allow-methods': optionsResponse.headers.get('access-control-allow-methods'),
        'access-control-allow-headers': optionsResponse.headers.get('access-control-allow-headers'),
        'access-control-allow-credentials': optionsResponse.headers.get('access-control-allow-credentials'),
      });
    } else {
      console.error('❌ CORS preflight failed:', `HTTP ${optionsResponse.status}`);
      console.error('   Headers:', formatHeaders(optionsResponse.headers));
    }
  } catch (error) {
    console.error('❌ CORS preflight failed:', error.message);
  }

  try {
    // Test actual request with origin
    console.log('\n3. Testing actual request with origin...');
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Origin': 'http://localhost:5173',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@kbsys.com',
        password: 'admin123',
      }),
    });
    
    const loginData = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ Login request passed');
      console.log('   Status:', loginResponse.status);
      console.log('   CORS Headers:', {
        'access-control-allow-origin': loginResponse.headers.get('access-control-allow-origin'),
        'access-control-allow-credentials': loginResponse.headers.get('access-control-allow-credentials'),
      });
    } else {
      console.error('❌ Login request failed:', `HTTP ${loginResponse.status}`);
      console.error('   Response:', loginData);
      console.error('   CORS Headers:', {
        'access-control-allow-origin': loginResponse.headers.get('access-control-allow-origin'),
        'access-control-allow-credentials': loginResponse.headers.get('access-control-allow-credentials'),
      });
    }
  } catch (error) {
    console.error('❌ Login request failed:', error.message);
    if (error.cause) {
      console.error('   Cause:', error.cause);
    }
  }

  console.log('\n✅ CORS test completed!');
}

testCORS().catch(console.error);

