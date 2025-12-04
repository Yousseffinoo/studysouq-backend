/**
 * Test Authentication Endpoints
 * Tests registration and login to verify they work correctly
 */

import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

// Test data
const testUser = {
  name: 'Test Admin',
  email: `test-${Date.now()}@test.com`,
  password: 'Test123'
};

const testLogin = {
  email: testUser.email,
  password: testUser.password
};

async function testAuth() {
  console.log('🧪 Testing Authentication Endpoints\n');
  console.log('════════════════════════════════════════\n');

  try {
    // Test 1: Register endpoint
    console.log('📝 Test 1: POST /api/auth/register');
    console.log('   Payload:', { name: testUser.name, email: testUser.email, password: '***' });
    
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        name: testUser.name,
        email: testUser.email,
        password: testUser.password
      });

      if (registerResponse.status === 201 && registerResponse.data.success) {
        console.log('   ✅ Registration successful!');
        console.log('   Response:', {
          success: registerResponse.data.success,
          message: registerResponse.data.message,
          hasUser: !!registerResponse.data.data?.user,
          hasAccessToken: !!registerResponse.data.data?.accessToken,
          hasRefreshToken: !!registerResponse.data.data?.refreshToken
        });
      } else {
        console.log('   ❌ Registration failed!');
        console.log('   Response:', registerResponse.data);
      }
    } catch (error) {
      if (error.response) {
        console.log('   ❌ Registration failed!');
        console.log('   Status:', error.response.status);
        console.log('   Error:', error.response.data);
      } else {
        console.log('   ❌ Network error:', error.message);
      }
    }

    console.log('\n');

    // Test 2: Login endpoint
    console.log('🔐 Test 2: POST /api/auth/login');
    console.log('   Payload:', { email: testLogin.email, password: '***' });
    
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: testLogin.email,
        password: testLogin.password
      });

      if (loginResponse.status === 200 && loginResponse.data.success) {
        console.log('   ✅ Login successful!');
        console.log('   Response:', {
          success: loginResponse.data.success,
          message: loginResponse.data.message,
          hasUser: !!loginResponse.data.data?.user,
          hasAccessToken: !!loginResponse.data.data?.accessToken,
          hasRefreshToken: !!loginResponse.data.data?.refreshToken,
          userRole: loginResponse.data.data?.user?.role
        });
      } else {
        console.log('   ❌ Login failed!');
        console.log('   Response:', loginResponse.data);
      }
    } catch (error) {
      if (error.response) {
        console.log('   ❌ Login failed!');
        console.log('   Status:', error.response.status);
        console.log('   Error:', error.response.data);
      } else {
        console.log('   ❌ Network error:', error.message);
      }
    }

    console.log('\n');

    // Test 3: Test with existing admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@educationalweb.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    
    console.log('👤 Test 3: POST /api/auth/login (Admin User)');
    console.log('   Email:', adminEmail);
    
    try {
      const adminLoginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: adminEmail,
        password: adminPassword
      });

      if (adminLoginResponse.status === 200 && adminLoginResponse.data.success) {
        console.log('   ✅ Admin login successful!');
        console.log('   Response:', {
          success: adminLoginResponse.data.success,
          userRole: adminLoginResponse.data.data?.user?.role,
          isEmailVerified: adminLoginResponse.data.data?.user?.isEmailVerified,
          hasAccessToken: !!adminLoginResponse.data.data?.accessToken
        });
      } else {
        console.log('   ❌ Admin login failed!');
        console.log('   Response:', adminLoginResponse.data);
      }
    } catch (error) {
      if (error.response) {
        console.log('   ❌ Admin login failed!');
        console.log('   Status:', error.response.status);
        console.log('   Error:', error.response.data);
        console.log('   ⚠️  Make sure admin user exists. Run: node backend/scripts/createAdmin.js');
      } else {
        console.log('   ❌ Network error:', error.message);
      }
    }

    console.log('\n════════════════════════════════════════');
    console.log('✅ Authentication tests completed!\n');

  } catch (error) {
    console.error('❌ Test error:', error.message);
    process.exit(1);
  }
}

// Run tests
testAuth();

