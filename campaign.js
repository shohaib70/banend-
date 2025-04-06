const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// In-memory storage for email campaigns (replace with database in production)
let campaigns = [];

// Setup a nodemailer transporter using environment variables
const createTransporter = () => {
  try {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'user@example.com',
        pass: process.env.SMTP_PASS || 'password'
      }
    });
  } catch (error) {
    console.error('Error creating email transporter:', error);
    throw error;
  }
};

// GET all email campaigns
router.get('/', (req, res) => {
  try {
    res.json({ campaigns });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch email campaigns' });
  }
});

// GET campaign by ID
router.get('/:id', (req, res) => {
  try {
    const campaign = campaigns.find(c => c.id === parseInt(req.params.id));
    if (campaign) {
      res.json(campaign);
    } else {
      res.status(404).json({ error: 'Campaign not found' });
    }
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

// POST create a new email campaign
router.post('/', async (req, res) => {
  try {
    const { subject, content, recipients } = req.body;
    
    // Validate required fields
    if (!subject || !content || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'Subject, content, and at least one recipient are required' });
    }
    
    const newCampaign = {
      id: campaigns.length + 1,
      subject,
      content,
      recipients,
      status: 'pending',
      createdAt: new Date()
    };
    
    campaigns.push(newCampaign);

    // Send emails
    try {
      const transporter = createTransporter();
      
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"FYND" <no-reply@fynd.com>',
        to: recipients.join(', '),
        subject: subject,
        text: content,
        html: content // Support HTML content
      });
      
      newCampaign.status = 'sent';
      newCampaign.sentAt = new Date();
      
      res.status(201).json({ message: 'Campaign created and emails sent', campaign: newCampaign });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      newCampaign.status = 'failed';
      newCampaign.error = emailError.message;
      
      res.status(500).json({ 
        error: 'Email sending failed', 
        details: emailError.message,
        campaign: newCampaign 
      });
    }
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create email campaign' });
  }
});

module.exports = router;