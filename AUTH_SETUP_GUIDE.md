# Authentication Setup Guide

## Problem: Triage submission failing

The triage endpoint requires authentication (`authMiddleware`), but you're not logged in yet.

## Solution: Register and Login

### Option 1: Use Browser Console (Quickest)

1. Open browser console (F12)
2. Navigate to http://localhost:5173
3. Run this code to register and login:

```javascript
// Register a test user
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'student@test.com',
    password: 'password123',
    name: 'Test Student',
    role: 'student',
    ageBracket: '18-24'
  })
})
.then(res => res.json())
.then(data => {
  console.log('Registration:', data);
  // Store the token
  localStorage.setItem('auth_token', data.token);
  console.log('✅ Logged in! Token saved. Reload the page.');
})
.catch(err => {
  console.error('Registration error:', err);
  // If user exists, try logging in
  return fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'student@test.com',
      password: 'password123'
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log('Login:', data);
    localStorage.setItem('auth_token', data.token);
    console.log('✅ Logged in! Token saved. Reload the page.');
  });
});
```

4. Reload the page
5. Try submitting the triage form again

### Option 2: Use curl/PowerShell

**Register:**
```powershell
$body = @{
    email = "student@test.com"
    password = "password123"
    name = "Test Student"
    role = "student"
    ageBracket = "18-24"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

**Login:**
```powershell
$body = @{
    email = "student@test.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
Write-Host "Token: $($response.token)"
```

Then manually add the token to localStorage in browser console:
```javascript
localStorage.setItem('auth_token', 'YOUR_TOKEN_HERE');
```

### Option 3: Create a Login Page (Better for production)

I can create a login page if you'd like, but for testing, Option 1 is fastest.

## Verify Authentication

After logging in, check in browser console:
```javascript
localStorage.getItem('auth_token')
// Should return a JWT token string
```

## Quick Test After Login

1. Make sure you're logged in (token in localStorage)
2. Go to http://localhost:5173/triage
3. Fill out the form:
   - Topic: Loneliness
   - Mood: 2 (Low)
   - Urgency: Low
   - Message: "je suis on depression"
4. Submit
5. Should work! ✅

## Alternative: Remove Auth Requirement (For Testing Only)

If you want to test without auth temporarily, I can modify the triage route to remove authentication. Let me know!
