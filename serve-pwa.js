const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'client', 'build')));

// API endpoint to check if server is running
app.get('/api/status', (req, res) => {
  res.json({ status: 'Server is running', message: 'Library Booking App PWA Server' });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Library Booking App PWA Server is running on port ${PORT}`);
  console.log(`Access the app at: http://localhost:${PORT}`);
  console.log(`To access from mobile device, replace 'localhost' with your computer's IP address`);
});