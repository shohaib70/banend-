const express = require('express');
const cors = require('cors');

// Import routers
const companiesRouter = require('./routes/companies');
const searchRouter = require('./routes/search');
const invoicesRouter = require('./routes/invoices');
const emailCampaignsRouter = require('./routes/emailCampaigns');
const crmRouter = require('./routes/crm');
const dealsRouter = require('./routes/deals');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Mount routers
app.use('/api/companies', companiesRouter);         // For company onboarding and management
app.use('/api/search', searchRouter);               // For search functionality
app.use('/api/invoices', invoicesRouter);           // For invoice creation and management
app.use('/api/email', emailCampaignsRouter);        // For automated email campaignsṇ                   // For CRM endpoints (KPI tracking, meeting scheduling)
app.use('/api/deals', dealsRouter);                 // For managing deal commissions

// Health check endpoint
app.get('/api/info', (req, res) => {
  res.json({ message: 'FYND Backend API is operational.' });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
// Log connected routes for verification
console.log('Connected API routes:');
app._router.stack.forEach(middleware => {
  if(middleware.route) {
    console.log(`${Object.keys(middleware.route.methods)[0].toUpperCase()} ${middleware.route.path}`);
  } else if(middleware.name === 'router') {
    middleware.handle.stack.forEach(handler => {
      if(handler.route) {
        const path = handler.route.path;
        const method = Object.keys(handler.route.methods)[0].toUpperCase();
        console.log(`${method} ${middleware.regexp.toString().split('?')[0].slice(3, -3)}${path}`);
      }
    });
  }
});