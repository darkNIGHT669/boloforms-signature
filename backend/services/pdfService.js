/**
 * PDF Service - PDF Manipulation and Signing
 * Location: backend/services/pdfService.js
 */

const { PDFDocument, rgb } = require('pdf-lib');

/**
 * Overlay signature image onto PDF at specified coordinates
 * 
 * @param {Buffer} pdfBuffer - Original PDF buffer
 * @param {Object} signatureData - Signature data
 * @param {string} signatureData.imageBase64 - Base64 signature image
 * @param {Array} signatureData.fields - Array of field positions
 * @returns {Promise<Buffer>} Modified PDF buffer
 */
const signPdf = async (pdfBuffer, signatureData) => {
  try {
    // Load the PDF
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    
    // Decode signature image from base64
    let signatureImage;
    try {
      // Determine image type and embed accordingly
      if (signatureData.imageBase64.startsWith('/9j/') || signatureData.imageBase64.includes('data:image/jpeg')) {
        // JPEG image
        const imageData = signatureData.imageBase64.replace(/^data:image\/jpeg;base64,/, '');
        signatureImage = await pdfDoc.embedJpg(Buffer.from(imageData, 'base64'));
      } else {
        // PNG image (default)
        const imageData = signatureData.imageBase64.replace(/^data:image\/png;base64,/, '');
        signatureImage = await pdfDoc.embedPng(Buffer.from(imageData, 'base64'));
      }
    } catch (error) {
      console.error('Error embedding image:', error);
      throw new Error('Invalid image format. Please use PNG or JPEG.');
    }

    // Get image dimensions
    const imgWidth = signatureImage.width;
    const imgHeight = signatureImage.height;
    const imgAspectRatio = imgWidth / imgHeight;

    // Process each field
    for (const field of signatureData.fields) {
      if (field.type !== 'signature') continue; // Only process signature fields

      const pageIndex = field.pageNumber - 1; // Pages are 0-indexed
      const page = pdfDoc.getPages()[pageIndex];

      if (!page) {
        console.warn(`Page ${field.pageNumber} not found`);
        continue;
      }

      // Get PDF coordinates from field
      const { x, y, width, height } = field.coordinates;

      // Calculate field aspect ratio
      const fieldAspectRatio = width / height;

      // Calculate dimensions to fit image within field while maintaining aspect ratio
      let drawWidth, drawHeight, drawX, drawY;

      if (imgAspectRatio > fieldAspectRatio) {
        // Image is wider - fit to width
        drawWidth = width;
        drawHeight = width / imgAspectRatio;
        drawX = x;
        drawY = y + (height - drawHeight) / 2; // Center vertically
      } else {
        // Image is taller - fit to height
        drawHeight = height;
        drawWidth = height * imgAspectRatio;
        drawX = x + (width - drawWidth) / 2; // Center horizontally
        drawY = y;
      }

      // Draw the signature image
      page.drawImage(signatureImage, {
        x: drawX,
        y: drawY,
        width: drawWidth,
        height: drawHeight,
      });

      console.log(`✍️ Signature added to page ${field.pageNumber} at (${x.toFixed(2)}, ${y.toFixed(2)})`);
    }

    // Save the modified PDF
    const modifiedPdfBytes = await pdfDoc.save();
    return Buffer.from(modifiedPdfBytes);
  } catch (error) {
    console.error('Error signing PDF:', error);
    throw error;
  }
};

/**
 * Add text field to PDF
 * 
 * @param {Buffer} pdfBuffer - Original PDF buffer
 * @param {Object} textData - Text field data
 * @returns {Promise<Buffer>} Modified PDF buffer
 */
const addTextField = async (pdfBuffer, textData) => {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    
    for (const field of textData.fields) {
      if (field.type !== 'text') continue;

      const pageIndex = field.pageNumber - 1;
      const page = pdfDoc.getPages()[pageIndex];

      if (!page) continue;

      const { x, y, width, height } = field.coordinates;

      // Draw text box border
      page.drawRectangle({
        x: x,
        y: y,
        width: width,
        height: height,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });

      // Add text if provided
      if (field.value) {
        page.drawText(field.value, {
          x: x + 5,
          y: y + height / 2,
          size: 12,
          color: rgb(0, 0, 0),
        });
      }
    }

    const modifiedPdfBytes = await pdfDoc.save();
    return Buffer.from(modifiedPdfBytes);
  } catch (error) {
    console.error('Error adding text field:', error);
    throw error;
  }
};

module.exports = {
  signPdf,
  addTextField,
};