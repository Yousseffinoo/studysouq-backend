/**
 * Admin Panel Smoke Tests
 * Tests critical admin endpoints to ensure integration is working
 * 
 * Run with: node src/tests/admin-smoke-tests.js
 * Or: npm run test:smoke
 */

import axios from 'axios';

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  total: 0,
  failures: [],
};

// Shared state
let authToken = null;
let createdUserId = null;
let createdLessonId = null;

/**
 * Log test result
 */
function logTest(name, passed, details = null) {
  results.total++;
  if (passed) {
    results.passed++;
    console.log(`${colors.green}✓${colors.reset} ${name}`);
  } else {
    results.failed++;
    console.log(`${colors.red}✗${colors.reset} ${name}`);
    if (details) {
      console.log(`  ${colors.red}${details}${colors.reset}`);
    }
    results.failures.push({ name, details });
  }
}

/**
 * Make API request
 */
async function apiRequest(method, url, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 0,
    };
  }
}

/**
 * Test 1: Health Check
 */
async function testHealthCheck() {
  console.log(`\n${colors.blue}Test 1: Health Check${colors.reset}`);
  
  const result = await apiRequest('GET', '/health');
  
  if (result.success && result.data.success) {
    logTest('Health check passed', true);
    return true;
  } else {
    logTest('Health check failed', false, `Status: ${result.status}`);
    return false;
  }
}

/**
 * Test 2: Admin Login
 */
async function testAdminLogin() {
  console.log(`\n${colors.blue}Test 2: Admin Login${colors.reset}`);
  
  const result = await apiRequest('POST', '/api/auth/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  
  if (result.success && result.data.data && result.data.data.accessToken) {
    authToken = result.data.data.accessToken;
    
    // Check if user is admin
    if (result.data.data.user.role === 'admin') {
      logTest('Admin login successful', true);
      return true;
    } else {
      logTest('Admin login failed', false, 'User is not an admin');
      return false;
    }
  } else {
    logTest('Admin login failed', false, JSON.stringify(result.error));
    return false;
  }
}

/**
 * Test 3: Get Dashboard Stats
 */
async function testDashboardStats() {
  console.log(`\n${colors.blue}Test 3: Dashboard Stats${colors.reset}`);
  
  const result = await apiRequest('GET', '/api/admin/dashboard/stats', null, {
    Authorization: `Bearer ${authToken}`,
  });
  
  if (result.success && result.data.data && result.data.data.counts) {
    logTest('Dashboard stats retrieved', true);
    return true;
  } else {
    logTest('Dashboard stats failed', false, JSON.stringify(result.error));
    return false;
  }
}

/**
 * Test 4: Get Users List
 */
async function testGetUsers() {
  console.log(`\n${colors.blue}Test 4: Get Users List${colors.reset}`);
  
  const result = await apiRequest('GET', '/api/admin/users?page=1&limit=10', null, {
    Authorization: `Bearer ${authToken}`,
  });
  
  if (result.success && result.data.data && result.data.data.users) {
    logTest('Users list retrieved', true);
    return true;
  } else {
    logTest('Users list failed', false, JSON.stringify(result.error));
    return false;
  }
}

/**
 * Test 5: Create Test User
 */
async function testCreateUser() {
  console.log(`\n${colors.blue}Test 5: Create Test User${colors.reset}`);
  
  const testUser = {
    name: 'Smoke Test User',
    email: `smoketest${Date.now()}@example.com`,
    password: 'TestPass123',
    role: 'user',
    isPremium: false,
  };
  
  const result = await apiRequest('POST', '/api/admin/users', testUser, {
    Authorization: `Bearer ${authToken}`,
  });
  
  if (result.success && result.data.data && result.data.data._id) {
    createdUserId = result.data.data._id;
    logTest('Test user created', true);
    return true;
  } else {
    logTest('Create user failed', false, JSON.stringify(result.error));
    return false;
  }
}

/**
 * Test 6: Update Test User
 */
async function testUpdateUser() {
  console.log(`\n${colors.blue}Test 6: Update Test User${colors.reset}`);
  
  if (!createdUserId) {
    logTest('Update user skipped', false, 'No user ID available');
    return false;
  }
  
  const result = await apiRequest(
    'PUT',
    `/api/admin/users/${createdUserId}`,
    { name: 'Updated Smoke Test User' },
    { Authorization: `Bearer ${authToken}` }
  );
  
  if (result.success && result.data.data) {
    logTest('Test user updated', true);
    return true;
  } else {
    logTest('Update user failed', false, JSON.stringify(result.error));
    return false;
  }
}

/**
 * Test 7: Delete Test User
 */
async function testDeleteUser() {
  console.log(`\n${colors.blue}Test 7: Delete Test User${colors.reset}`);
  
  if (!createdUserId) {
    logTest('Delete user skipped', false, 'No user ID available');
    return false;
  }
  
  const result = await apiRequest(
    'DELETE',
    `/api/admin/users/${createdUserId}`,
    null,
    { Authorization: `Bearer ${authToken}` }
  );
  
  if (result.success) {
    logTest('Test user deleted', true);
    return true;
  } else {
    logTest('Delete user failed', false, JSON.stringify(result.error));
    return false;
  }
}

/**
 * Test 8: Get Lessons List
 */
async function testGetLessons() {
  console.log(`\n${colors.blue}Test 8: Get Lessons List${colors.reset}`);
  
  const result = await apiRequest('GET', '/api/admin/lessons?page=1&limit=10', null, {
    Authorization: `Bearer ${authToken}`,
  });
  
  if (result.success && result.data.data && result.data.data.lessons) {
    logTest('Lessons list retrieved', true);
    return true;
  } else {
    logTest('Lessons list failed', false, JSON.stringify(result.error));
    return false;
  }
}

/**
 * Test 9: Get Pricing Plans
 */
async function testGetPricingPlans() {
  console.log(`\n${colors.blue}Test 9: Get Pricing Plans${colors.reset}`);
  
  const result = await apiRequest('GET', '/api/admin/pricing', null, {
    Authorization: `Bearer ${authToken}`,
  });
  
  if (result.success && result.data.data) {
    logTest('Pricing plans retrieved', true);
    return true;
  } else {
    logTest('Pricing plans failed', false, JSON.stringify(result.error));
    return false;
  }
}

/**
 * Test 10: Get AI Configs
 */
async function testGetAIConfigs() {
  console.log(`\n${colors.blue}Test 10: Get AI Configs${colors.reset}`);
  
  const result = await apiRequest('GET', '/api/admin/ai-config', null, {
    Authorization: `Bearer ${authToken}`,
  });
  
  if (result.success && result.data.data) {
    logTest('AI configs retrieved', true);
    return true;
  } else {
    logTest('AI configs failed', false, JSON.stringify(result.error));
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log(`\n${colors.yellow}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.yellow}Admin Panel Smoke Tests${colors.reset}`);
  console.log(`${colors.yellow}API Base URL: ${API_BASE_URL}${colors.reset}`);
  console.log(`${colors.yellow}${'='.repeat(60)}${colors.reset}`);
  
  const tests = [
    testHealthCheck,
    testAdminLogin,
    testDashboardStats,
    testGetUsers,
    testCreateUser,
    testUpdateUser,
    testDeleteUser,
    testGetLessons,
    testGetPricingPlans,
    testGetAIConfigs,
  ];
  
  for (const test of tests) {
    await test();
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Print summary
  console.log(`\n${colors.yellow}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.yellow}Test Summary${colors.reset}`);
  console.log(`${colors.yellow}${'='.repeat(60)}${colors.reset}`);
  console.log(`Total: ${results.total}`);
  console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
  
  if (results.failures.length > 0) {
    console.log(`\n${colors.red}Failed Tests:${colors.reset}`);
    results.failures.forEach((failure, index) => {
      console.log(`${index + 1}. ${failure.name}`);
      if (failure.details) {
        console.log(`   ${failure.details}`);
      }
    });
  }
  
  console.log(`\n${colors.yellow}${'='.repeat(60)}${colors.reset}`);
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  console.error(`\n${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});

