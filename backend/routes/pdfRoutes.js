

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


router.post('/sign-pdf', signPdfHandler);


router.get('/:id', getDocumentHandler);

router.post('/verify', verifyDocumentHandler);

module.exports = router;