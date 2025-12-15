/**
 * PDF Controller - Request Handlers
 * Location: backend/controllers/pdfController.js
 */

const { signPdf, addTextField } = require('../services/pdfService');
const { calculateHash } = require('../services/hashService');
const Document = require('../models/Document');
const fs = require('fs').promises;
const path = require('path');

/**
 * Sign PDF with signature
 * POST /api/pdf/sign-pdf
 */
const signPdfHandler = async (req, res) => {
  try {
    console.log('📥 Received sign-pdf request');

    const { pdfBase64, signatureBase64, fields } = req.body;

    // Validate input
    if (!pdfBase64 || !signatureBase64 || !fields || fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: pdfBase64, signatureBase64, or fields',
      });
    }

    // Decode PDF from base64
    const originalPdfBuffer = Buffer.from(pdfBase64, 'base64');
    console.log(`📄 Original PDF size: ${(originalPdfBuffer.length / 1024).toFixed(2)} KB`);

    // Calculate hash of original PDF
    const originalHash = calculateHash(originalPdfBuffer);
    console.log(`🔐 Original PDF hash: ${originalHash.substring(0, 16)}...`);

    // Filter signature fields
    const signatureFields = fields.filter(f => f.type === 'signature');
    console.log(`✍️ Processing ${signatureFields.length} signature field(s)`);

    // Sign the PDF
    const signedPdfBuffer = await signPdf(originalPdfBuffer, {
      imageBase64: signatureBase64,
      fields: signatureFields,
    });

    console.log(`📄 Signed PDF size: ${(signedPdfBuffer.length / 1024).toFixed(2)} KB`);

    // Calculate hash of signed PDF
    const signedHash = calculateHash(signedPdfBuffer);
    console.log(`🔐 Signed PDF hash: ${signedHash.substring(0, 16)}...`);

    // Save to database
    const document = new Document({
      originalFileName: 'document.pdf',
      originalFileHash: originalHash,
      signedFileHash: signedHash,
      signedFileUrl: null, // Will be set if we upload to storage
      fields: fields,
      status: 'signed',
      signedAt: new Date(),
    });

    await document.save();
    console.log(`💾 Document saved to database with ID: ${document._id}`);

    // Convert signed PDF to base64 for response
    const signedPdfBase64 = signedPdfBuffer.toString('base64');

    res.json({
      success: true,
      message: 'PDF signed successfully',
      data: {
        documentId: document._id,
        originalHash: originalHash,
        signedHash: signedHash,
        signedPdfBase64: signedPdfBase64,
        fieldsProcessed: signatureFields.length,
      },
    });
  } catch (error) {
    console.error('❌ Error signing PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sign PDF',
      error: error.message,
    });
  }
};

/**
 * Get document by ID
 * GET /api/pdf/:id
 */
const getDocumentHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    res.json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document',
      error: error.message,
    });
  }
};

/**
 * Verify document integrity
 * POST /api/pdf/verify
 */
const verifyDocumentHandler = async (req, res) => {
  try {
    const { documentId, pdfBase64 } = req.body;

    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Calculate hash of provided PDF
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    const calculatedHash = calculateHash(pdfBuffer);

    // Compare with stored hash
    const isValid = calculatedHash === document.signedFileHash;

    res.json({
      success: true,
      data: {
        isValid: isValid,
        documentId: documentId,
        storedHash: document.signedFileHash,
        calculatedHash: calculatedHash,
        signedAt: document.signedAt,
      },
    });
  } catch (error) {
    console.error('Error verifying document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify document',
      error: error.message,
    });
  }
};

module.exports = {
  signPdfHandler,
  getDocumentHandler,
  verifyDocumentHandler,
};