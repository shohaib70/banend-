const express = require('express');
const router = express.Router();

// In-memory storage for companies (replace with database in production)
let companies = [];

// GET all companies
router.get('/', (req, res) => {
  try {
    res.json({ companies });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// GET a single company by id
router.get('/:id', (req, res) => {
  try {
    const company = companies.find(c => c.id === parseInt(req.params.id));
    if (company) {
      res.json(company);
    } else {
      res.status(404).json({ error: 'Company not found' });
    }
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

// POST new company (onboarding)
router.post('/', (req, res) => {
  try {
    const { companyName, services, pricing, testimonials } = req.body;
    
    if (!companyName) {
      return res.status(400).json({ error: 'Company name is required' });
    }
    
    const newCompany = {
      id: companies.length + 1,
      companyName,
      services: services || [],
      pricing: pricing || {},
      testimonials: testimonials || [],
      createdAt: new Date()
    };
    
    companies.push(newCompany);
    res.status(201).json(newCompany);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: 'Failed to create company' });
  }
});

// PUT update company info
router.put('/:id', (req, res) => {
  try {
    const company = companies.find(c => c.id === parseInt(req.params.id));
    if (company) {
      const { companyName, services, pricing, testimonials } = req.body;
      company.companyName = companyName || company.companyName;
      company.services = services || company.services;
      company.pricing = pricing || company.pricing;
      company.testimonials = testimonials || company.testimonials;
      company.updatedAt = new Date();
      
      res.json(company);
    } else {
      res.status(404).json({ error: 'Company not found' });
    }
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ error: 'Failed to update company' });
  }
});

// DELETE a company
router.delete('/:id', (req, res) => {
  try {
    const index = companies.findIndex(c => c.id === parseInt(req.params.id));
    if (index !== -1) {
      companies.splice(index, 1);
      res.json({ message: 'Company deleted successfully' });
    } else {
      res.status(404).json({ error: 'Company not found' });
    }
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ error: 'Failed to delete company' });
  }
});

module.exports = router;