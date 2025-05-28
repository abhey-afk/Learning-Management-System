const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();

// Enable compression
app.use(compression());

// Serve static files from the client build directory
app.use(express.static(path.join(__dirname, 'client')));

// Serve the backend API
app.use('/api', require('./server'));

// Handle React routing, return all requests to React app
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 