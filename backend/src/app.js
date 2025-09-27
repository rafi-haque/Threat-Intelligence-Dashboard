require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connect } = require('./db/mongo');
const routes = require('./routes');
const { scheduleIngestion } = require('./services/ingest');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS for frontend access
app.use(express.json()); // JSON parsing

// Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Threat Intelligence Dashboard API',
    version: '0.1.0',
    status: 'running'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Start server
async function startServer() {
  try {
    // Connect to database
    await connect();
    console.log('Database connected successfully');

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });

    // Start ingestion scheduler if in production or explicitly enabled
    if (process.env.NODE_ENV === 'production' || process.env.ENABLE_INGESTION === 'true') {
      const intervalMinutes = parseInt(process.env.INGESTION_INTERVAL_MINUTES, 10) || 60;
      scheduleIngestion(intervalMinutes);
    } else {
      console.log('Ingestion scheduler disabled (set ENABLE_INGESTION=true to enable)');
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = app;