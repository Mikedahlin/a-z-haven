const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files (e.g., game assets)
app.use(express.static('public'));

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to Moms Game!');
});

// Start server
app.listen(port, () => {
  console.log(`Moms Game running on port ${port}`);
});
