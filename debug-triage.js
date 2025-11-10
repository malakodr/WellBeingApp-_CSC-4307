// Debug Script - Run this in Browser Console
// Copy all of this and paste into F12 Console

console.clear();
console.log('🔍 Debugging Triage Submission...\n');

// Check 1: Token exists
const token = localStorage.getItem('auth_token');
console.log('1️⃣ Auth Token:', token ? '✅ EXISTS' : '❌ MISSING');
if (token) {
  console.log('   Token preview:', token.substring(0, 20) + '...');
}

// Check 2: Backend is running
console.log('\n2️⃣ Testing Backend Connection...');
fetch('http://localhost:5000/health')
  .then(res => res.json())
  .then(data => {
    console.log('   ✅ Backend is running:', data);
    
    // Check 3: Test authentication
    console.log('\n3️⃣ Testing Authentication...');
    return fetch('http://localhost:5000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  })
  .then(res => {
    if (res.ok) {
      return res.json();
    } else {
      throw new Error(`Auth failed: ${res.status}`);
    }
  })
  .then(data => {
    console.log('   ✅ Authentication valid!');
    console.log('   User:', data.user);
    
    // Check 4: Test triage endpoint
    console.log('\n4️⃣ Testing Triage Endpoint...');
    return fetch('http://localhost:5000/api/triage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: 'Anxiety',
        moodScore: 3,
        urgency: 'Medium',
        message: 'Test message'
      })
    });
  })
  .then(res => {
    console.log('   Response status:', res.status);
    return res.json();
  })
  .then(data => {
    console.log('   ✅ Triage submission works!');
    console.log('   Response:', data);
    console.log('\n✅ ALL TESTS PASSED! The triage form should work.');
  })
  .catch(err => {
    console.error('\n❌ ERROR:', err.message);
    
    if (!token) {
      console.log('\n🔧 SOLUTION: You need to login first!');
      console.log('Run this command to login:\n');
      console.log(`fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'student@test.com',
    password: 'password123'
  })
})
.then(res => res.json())
.then(data => {
  localStorage.setItem('auth_token', data.token);
  location.reload();
});`);
    } else {
      console.log('\n🔧 SOLUTION: Check the error above for details');
    }
  });
