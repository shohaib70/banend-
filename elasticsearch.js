const { Client } = require('@elastic/elasticsearch');

// Configure Elasticsearch client with error handling
const createESClient = () => {
  try {
    const esClient = new Client({ 
      node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
      maxRetries: 5,
      requestTimeout: 30000
    });
    
    return esClient;
  } catch (error) {
    console.error('Error creating Elasticsearch client:', error);
    throw error;
  }
};

module.exports = createESClient;