/**
 * API Service - Backend Communication
 * Location: frontend/src/services/apiService.js
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Sign PDF with signature
 * @param {string} pdfBase64 - Base64 encoded PDF
 * @param {string} signatureBase64 - Base64 encoded signature image
 * @param {Array} fields - Array of field objects with PDF coordinates
 * @returns {Promise<Object>} Response with signed PDF
 */
export const signPdf = async (pdfBase64, signatureBase64, fields) => {
  try {
    console.log('📤 Sending sign-pdf request to backend...');
    console.log('Fields to process:', fields.length);

    const response = await fetch(`${API_BASE_URL}/pdf/sign-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pdfBase64,
        signatureBase64,
        fields,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to sign PDF');
    }

    console.log('✅ PDF signed successfully');
    console.log('Document ID:', data.data.documentId);
    console.log('Hashes:', {
      original: data.data.originalHash.substring(0, 16) + '...',
      signed: data.data.signedHash.substring(0, 16) + '...',
    });

    return data;
  } catch (error) {
    console.error('❌ Error signing PDF:', error);
    throw error;
  }
};

/**
 * Get document by ID
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} Document data
 */
export const getDocument = async (documentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pdf/${documentId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch document');
    }

    return data;
  } catch (error) {
    console.error('Error fetching document:', error);
    throw error;
  }
};

/**
 * Verify document integrity
 * @param {string} documentId - Document ID
 * @param {string} pdfBase64 - Base64 encoded PDF to verify
 * @returns {Promise<Object>} Verification result
 */
export const verifyDocument = async (documentId, pdfBase64) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pdf/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentId,
        pdfBase64,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to verify document');
    }

    return data;
  } catch (error) {
    console.error('Error verifying document:', error);
    throw error;
  }
};