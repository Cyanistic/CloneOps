// Simple test to verify that authentication endpoints work
const axios = require('axios');

// Test configuration - assumes backend is running on port 6969
const API_BASE_URL = 'http://localhost:6969';

async function testAuthEndpoints() {
    console.log('Testing authentication endpoints...');
    
    // Test user credentials
    const testUser = {
        username: 'testuser_' + Date.now(), // Unique username
        password: 'testpassword123'
    };
    
    console.log(`\n1. Testing registration with user: ${testUser.username}`);
    try {
        const registerResponse = await axios.post(`${API_BASE_URL}/api/register`, {
            username: testUser.username,
            password: testUser.password
        });
        console.log('✅ Registration successful:', registerResponse.status);
    } catch (error) {
        console.log('❌ Registration failed:', error.response?.data || error.message);
        return;
    }
    
    console.log('\n2. Testing login with registered user');
    try {
        const loginResponse = await axios.post(`${API_BASE_URL}/api/login`, {
            username: testUser.username,
            password: testUser.password
        });
        console.log('✅ Login successful:', loginResponse.status);
        
        // Check if cookies are set
        const setCookieHeaders = loginResponse.headers['set-cookie'];
        if (setCookieHeaders) {
            console.log('✅ Session cookies set:', setCookieHeaders.length, 'cookies returned');
        } else {
            console.log('⚠️ No cookies returned');
        }
    } catch (error) {
        console.log('❌ Login failed:', error.response?.data || error.message);
        return;
    }
    
    console.log('\n✅ All authentication tests passed!');
}

// Check if axios is available, otherwise provide instructions
try {
    testAuthEndpoints().catch(console.error);
} catch (e) {
    console.log('Please install axios to run this test:');
    console.log('npm install axios');
    console.log('\nOr run this command in the project root:');
    console.log('npm install axios && node test_auth.js');
}