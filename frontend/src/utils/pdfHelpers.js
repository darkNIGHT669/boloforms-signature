import { browserToPdfCoordinates, getRenderedDimensions } from './coordinateTransform';

/**
 * Prepare field data for backend PDF signing
 * Converts all browser coordinates to PDF coordinates
 * 
 * @param {Array} fields - Array of fields with browser coordinates
 * @param {Object} pdfDimensions - PDF dimensions per page
 * @param {HTMLElement} pdfContainer - The PDF container element
 * @returns {Array} Fields with PDF coordinates
 */
export const prepareFieldsForBackend = (fields, pdfDimensions, pdfContainer) => {
  if (!pdfContainer) {
    console.error('PDF container not found');
    return [];
  }

  // Get rendered dimensions from the actual PDF page
  const pdfPageElement = pdfContainer.querySelector('.react-pdf__Page');
  const renderedDims = getRenderedDimensions(pdfPageElement);

  console.log('Preparing fields for backend...');
  console.log('Rendered dimensions:', renderedDims);

  return fields.map(field => {
    const pageDims = pdfDimensions[field.pageNumber];
    
    if (!pageDims) {
      console.error(`No dimensions found for page ${field.pageNumber}`);
      return null;
    }

    // Convert browser coordinates to PDF coordinates
    const pdfCoords = browserToPdfCoordinates(
      {
        x: field.x,
        y: field.y,
        width: field.width,
        height: field.height,
      },
      pageDims,
      renderedDims
    );

    console.log(`Field ${field.id}:`, {
      browser: { x: field.x, y: field.y, width: field.width, height: field.height },
      pdf: pdfCoords,
    });

    return {
      id: field.id,
      type: field.type,
      pageNumber: field.pageNumber,
      coordinates: pdfCoords, // PDF coordinates in points
    };
  }).filter(Boolean); // Remove null entries
};

/**
 * Convert a single image to base64
 * 
 * @param {File} file - Image file
 * @returns {Promise<string>} Base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Calculate SHA-256 hash of a file
 * 
 * @param {File} file - File to hash
 * @returns {Promise<string>} Hex string of hash
 */
export const calculateFileHash = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

/**
 * Validate field positions are within PDF bounds
 * 
 * @param {Array} fields - Fields to validate
 * @param {Object} pdfDimensions - PDF dimensions
 * @returns {Object} Validation result
 */
export const validateFieldPositions = (fields, pdfDimensions) => {
  const errors = [];

  fields.forEach(field => {
    const pageDims = pdfDimensions[field.pageNumber];
    
    if (!pageDims) {
      errors.push(`Field ${field.id}: Page ${field.pageNumber} dimensions not found`);
      return;
    }

    // Check if field is within bounds
    if (field.x < 0 || field.y < 0) {
      errors.push(`Field ${field.id}: Negative coordinates`);
    }

    if (field.x + field.width > pageDims.width) {
      errors.push(`Field ${field.id}: Exceeds page width`);
    }

    if (field.y + field.height > pageDims.height) {
      errors.push(`Field ${field.id}: Exceeds page height`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Create download link for signed PDF
 * 
 * @param {Blob} pdfBlob - PDF blob from backend
 * @param {string} filename - Desired filename
 */
export const downloadPdf = (pdfBlob, filename = 'signed-document.pdf') => {
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Format coordinates for display/debugging
 * 
 * @param {Object} coords - Coordinates object
 * @returns {string} Formatted string
 */
export const formatCoordinates = (coords) => {
  return `(${coords.x.toFixed(2)}, ${coords.y.toFixed(2)}) [${coords.width.toFixed(2)} × ${coords.height.toFixed(2)}]`;
};