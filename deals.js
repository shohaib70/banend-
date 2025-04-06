const express = require('express');
const router = express.Router();

// In-memory storage for deals and commissions (replace with database in production)
let deals = [];

// GET all deals
router.get('/', (req, res) => {
  try {
    // Optional filtering by company ID
    const companyId = req.query.companyId ? parseInt(req.query.companyId) : null;
    
    if (companyId) {
      const filteredDeals = deals.filter(d => d.companyId === companyId);
      return res.json({ deals: filteredDeals });
    }
    
    res.json({ deals });
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

// GET deal by ID
router.get('/:id', (req, res) => {
  try {
    const deal = deals.find(d => d.id === parseInt(req.params.id));
    if (deal) {
      res.json(deal);
    } else {
      res.status(404).json({ error: 'Deal not found' });
    }
  } catch (error) {
    console.error('Error fetching deal:', error);
    res.status(500).json({ error: 'Failed to fetch deal' });
  }
});

// POST create a new deal
router.post('/', (req, res) => {
  try {
    const { companyId, clientId, ticketSize, commissionRate } = req.body;
    
    // Validate required fields
    if (!companyId || !clientId || !ticketSize) {
      return res.status(400).json({ error: 'Company ID, client ID, and ticket size are required' });
    }
    
    // Calculate commission (default 5% if not specified)
    const rate = commissionRate ? parseFloat(commissionRate) : 0.05;
    const commission = parseFloat(ticketSize) * rate;
    
    const newDeal = {
      id: deals.length + 1,
      companyId: parseInt(companyId),
      clientId: parseInt(clientId),
      ticketSize: parseFloat(ticketSize),
      commissionRate: rate,
      commission,
      status: 'active',
      createdAt: new Date()
    };
    
    deals.push(newDeal);
    res.status(201).json(newDeal);
  } catch (error) {
    console.error('Error creating deal:', error);
    res.status(500).json({ error: 'Failed to create deal' });
  }
});

// PUT update a deal
router.put('/:id', (req, res) => {
  try {
    const deal = deals.find(d => d.id === parseInt(req.params.id));
    if (deal) {
      const { ticketSize, commissionRate, status } = req.body;
      
      // Update fields if provided
      if (ticketSize) {
        deal.ticketSize = parseFloat(ticketSize);
        
        // Recalculate commission if ticket size changes
        if (commissionRate) {
          deal.commissionRate = parseFloat(commissionRate);
        }
        deal.commission = deal.ticketSize * deal.commissionRate;
      }
      
      if (status) deal.status = status;
      
      deal.updatedAt = new Date();
      res.json(deal);
    } else {
      res.status(404).json({ error: 'Deal not found' });
    }
  } catch (error) {
    console.error('Error updating deal:', error);
    res.status(500).json({ error: 'Failed to update deal' });
  }
});

module.exports = router;