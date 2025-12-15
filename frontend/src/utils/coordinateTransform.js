/**
 * Coordinate Transformation Utility
 * 
 * This is the CRITICAL piece that converts between browser and PDF coordinate systems.
 * 
 * BROWSER SYSTEM:
 * - Origin: Top-Left (0, 0)
 * - Units: CSS Pixels
 * - Y-axis: Increases DOWNWARD
 * 
 * PDF SYSTEM:
 * - Origin: Bottom-Left (0, 0)
 * - Units: Points (1 point = 1/72 inch)
 * - Y-axis: Increases UPWARD
 */

/**
 * Convert browser coordinates to PDF coordinates
 * 
 * @param {Object} browserCoords - Coordinates in browser space
 * @param {number} browserCoords.x - X position in pixels
 * @param {number} browserCoords.y - Y position in pixels
 * @param {number} browserCoords.width - Width in pixels
 * @param {number} browserCoords.height - Height in pixels
 * @param {Object} pdfDimensions - Actual PDF page dimensions
 * @param {number} pdfDimensions.width - PDF width in points
 * @param {number} pdfDimensions.height - PDF height in points
 * @param {Object} renderedDimensions - How PDF is rendered in browser
 * @param {number} renderedDimensions.width - Rendered width in pixels
 * @param {number} renderedDimensions.height - Rendered height in pixels
 * @returns {Object} PDF coordinates in points
 */
export const browserToPdfCoordinates = (
  browserCoords,
  pdfDimensions,
  renderedDimensions
) => {
  // Calculate scale factors
  // How many PDF points per browser pixel?
  const scaleX = pdfDimensions.width / renderedDimensions.width;
  const scaleY = pdfDimensions.height / renderedDimensions.height;

  // Convert X coordinate (same direction in both systems)
  const pdfX = browserCoords.x * scaleX;

  // Convert Y coordinate (FLIP the Y-axis)
  // In browser: Y=0 is top, increases downward
  // In PDF: Y=0 is bottom, increases upward
  // Formula: PDF_Y = PDF_Height - (Browser_Y + Field_Height) * Scale
  const pdfY = pdfDimensions.height - ((browserCoords.y + browserCoords.height) * scaleY);

  // Convert dimensions
  const pdfWidth = browserCoords.width * scaleX;
  const pdfHeight = browserCoords.height * scaleY;

  return {
    x: pdfX,
    y: pdfY,
    width: pdfWidth,
    height: pdfHeight,
  };
};

/**
 * Convert PDF coordinates back to browser coordinates
 * (Useful for loading saved fields)
 * 
 * @param {Object} pdfCoords - Coordinates in PDF space
 * @param {Object} pdfDimensions - Actual PDF dimensions
 * @param {Object} renderedDimensions - Rendered dimensions in browser
 * @returns {Object} Browser coordinates in pixels
 */
export const pdfToBrowserCoordinates = (
  pdfCoords,
  pdfDimensions,
  renderedDimensions
) => {
  // Calculate scale factors (inverse of browser-to-pdf)
  const scaleX = renderedDimensions.width / pdfDimensions.width;
  const scaleY = renderedDimensions.height / pdfDimensions.height;

  // Convert X coordinate
  const browserX = pdfCoords.x * scaleX;

  // Convert Y coordinate (FLIP back)
  // PDF_Y is measured from bottom, browser Y from top
  const browserY = (pdfDimensions.height - pdfCoords.y - pdfCoords.height) * scaleY;

  // Convert dimensions
  const browserWidth = pdfCoords.width * scaleX;
  const browserHeight = pdfCoords.height * scaleY;

  return {
    x: browserX,
    y: browserY,
    width: browserWidth,
    height: browserHeight,
  };
};

/**
 * Get PDF page dimensions from react-pdf
 * 
 * @param {Object} page - The PDF page object from react-pdf
 * @returns {Object} PDF dimensions in points
 */
export const getPdfDimensions = (page) => {
  if (!page) {
    return { width: 0, height: 0 };
  }

  // react-pdf provides original dimensions in points
  return {
    width: page.originalWidth || page.width,
    height: page.originalHeight || page.height,
  };
};

/**
 * Get rendered dimensions of PDF in the browser
 * 
 * @param {HTMLElement} pdfPageElement - The DOM element containing the PDF canvas
 * @returns {Object} Rendered dimensions in pixels
 */
export const getRenderedDimensions = (pdfPageElement) => {
  if (!pdfPageElement) {
    return { width: 0, height: 0 };
  }

  const canvas = pdfPageElement.querySelector('canvas');
  if (!canvas) {
    return { width: 0, height: 0 };
  }

  return {
    width: canvas.clientWidth,
    height: canvas.clientHeight,
  };
};

/**
 * Validate coordinates are within PDF bounds
 * 
 * @param {Object} coords - Coordinates to validate
 * @param {Object} bounds - Maximum bounds (PDF dimensions)
 * @returns {Object} Clamped coordinates
 */
export const clampCoordinates = (coords, bounds) => {
  return {
    x: Math.max(0, Math.min(coords.x, bounds.width - coords.width)),
    y: Math.max(0, Math.min(coords.y, bounds.height - coords.height)),
    width: Math.min(coords.width, bounds.width),
    height: Math.min(coords.height, bounds.height),
  };
};

/**
 * Example usage in your components:
 * 
 * // When user drops a field on PDF:
 * const pdfDims = getPdfDimensions(pdfPage);
 * const renderedDims = getRenderedDimensions(pdfElement);
 * 
 * const browserCoords = { x: 100, y: 200, width: 150, height: 40 };
 * const pdfCoords = browserToPdfCoordinates(browserCoords, pdfDims, renderedDims);
 * 
 * // Now pdfCoords contains the exact position in PDF points
 * // This is what you send to the backend for signing
 */