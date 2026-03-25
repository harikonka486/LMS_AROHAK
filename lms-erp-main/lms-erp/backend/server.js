// Simple server fallback
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'LMS Backend is running!' });
});

app.get('/api', (req, res) => {
  res.json({ 
    message: 'LMS Backend API',
    version: '1.0.0',
    endpoints: ['/api/health', '/api/users', '/api/courses']
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 LMS API → http://localhost:${PORT}/api`);
});
