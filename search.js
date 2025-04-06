const express = require('express');
const router = express.Router();
const createESClient = require('../config/elasticsearch');

// Initialize Elasticsearch client
const esClient = createESClient();
const INDEX = 'providers';

// Ensure index exists before searching
const initIndex = async () => {
  try {
    const indexExists = await esClient.indices.exists({ index: INDEX });
    
    if (!indexExists) {
      await esClient.indices.create({
        index: INDEX,
        body: {
          mappings: {
            properties: {
              companyName: { type: 'text' },
              services: { type: 'text' },
              pricing: { type: 'text' },
              testimonials: { type: 'text' }
            }
          }
        }
      });
      console.log(`Created index: ${INDEX}`);
    }
  } catch (error) {
    console.error(`Error initializing Elasticsearch index: ${error}`);
  }
};

// Initialize index on startup
initIndex();

router.get('/', async (req, res) => {
  const query = req.query.q || '';
  
  try {
    const esResponse = await esClient.search({
      index: INDEX,
      body: {
        query: {
          multi_match: {
            query: query,
            fields: ['companyName^3', 'services', 'pricing', 'testimonials']
          }
        }
      }
    });

    const results = esResponse.hits.hits.map(hit => hit._source);
    res.json({ results, total: esResponse.hits.total.value });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed', details: error.message });
  }
});

// Add document to index
router.post('/index', async (req, res) => {
  try {
    const document = req.body;
    
    if (!document.companyName) {
      return res.status(400).json({ error: 'Company name is required' });
    }
    
    const result = await esClient.index({
      index: INDEX,
      body: document
    });
    
    res.status(201).json({ message: 'Document indexed successfully', id: result._id });
  } catch (error) {
    console.error('Indexing error:', error);
    res.status(500).json({ error: 'Failed to index document' });
  }
});

module.exports = router;