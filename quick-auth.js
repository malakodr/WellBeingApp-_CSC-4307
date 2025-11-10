/**
 * Quick Authentication Script for Testing
 * 
 * Instructions:
 * 1. Open http://localhost:5173 in your browser
 * 2. Open browser console (F12)
 * 3. Copy and paste this entire file
 * 4. Press Enter
 * 5. Wait for "✅ You're now logged in!" message
 * 6. Reload the page
 * 7. Navigate to /triage and test!
 */

(async function quickAuth() {
  const API_URL = 'http://localhost:5000/api';
  
  const testUser = {
    email: 'student@test.com',
    password: 'password123',
    name: 'Test Student',
    role: 'student',
    ageBracket: '18-24'
  };

  console.log('🔐 Attempting authentication...');

  try {
    // Try to register first
    console.log('📝 Registering new user...');
    const registerResponse = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    if (registerResponse.ok) {
      const data = await registerResponse.json();
      localStorage.setItem('auth_token', data.token);
      console.log('✅ Registration successful!');
      console.log('👤 User:', data.user);
      console.log('🎫 Token saved to localStorage');
      console.log('✅ You\'re now logged in!');
      console.log('🔄 Please RELOAD the page to use the app');
      return;
    }

    // If registration fails (user exists), try login
    console.log('👤 User exists, attempting login...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });

    if (loginResponse.ok) {
      const data = await loginResponse.json();
      localStorage.setItem('auth_token', data.token);
      console.log('✅ Login successful!');
      console.log('👤 User:', data.user);
      console.log('🎫 Token saved to localStorage');
      console.log('✅ You\'re now logged in!');
      console.log('🔄 Please RELOAD the page to use the app');
    } else {
      const error = await loginResponse.json();
      console.error('❌ Login failed:', error);
      console.log('💡 Try changing the password in the script');
    }

  } catch (error) {
    console.error('❌ Authentication error:', error);
    console.log('⚠️  Make sure the backend is running on http://localhost:5000');
  }
})();
