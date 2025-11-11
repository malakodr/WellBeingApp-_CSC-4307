const io = require('socket.io-client');

// Get token from your browser's localStorage
const token = 'YOUR_TOKEN_HERE'; // Replace with actual token

const socket = io('http://localhost:5000', {
  auth: { token },
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);
  
  // Join a room
  socket.emit('joinRoom', {
    slug: 'anxiety-support',
    userId: 'test-user-id',
    displayName: 'Test User'
  });
});

socket.on('joinedRoom', (data) => {
  console.log('✅ Joined room:', data);
  
  // Send a test message
  setTimeout(() => {
    console.log('📤 Sending test message...');
    socket.emit('sendMessage', {
      slug: 'anxiety-support',
      body: 'Test message from script!',
      authorId: 'test-user-id'
    });
  }, 1000);
});

socket.on('receiveMessage', (msg) => {
  console.log('📨 Received message:', msg);
  process.exit(0);
});

socket.on('error', (err) => {
  console.error('❌ Error:', err);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected');
});

setTimeout(() => {
  console.log('⏱️  Timeout - no message received');
  process.exit(1);
}, 5000);
