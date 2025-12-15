/**
 * PDF Routes
 * Location: backend/routes/pdfRoutes.js
 */

const express = require('express');
const router = express.Router();
const {
  signPdfHandler,
  getDocumentHandler,
  verifyDocumentHandler,
} = require('../controllers/pdfController');

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'PDF routes are working',
    timestamp: new Date().toISOString(),
  });
});

// Sign PDF with signature
router.post('/sign-pdf', signPdfHandler);

// Get document by ID
router.get('/:id', getDocumentHandler);

// Verify document integrity
router.post('/verify', verifyDocumentHandler);

module.exports = router;