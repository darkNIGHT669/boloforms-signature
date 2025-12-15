// Coordinate math for placing fields correctly on a PDF

export const browserToPdfCoordinates = (
  fieldPosition,
  pdfPageSize,
  displaySize
) => {
  const scaleX = pdfPageSize.width / displaySize.width;
  const scaleY = pdfPageSize.height / displaySize.height;

  const pdfX = fieldPosition.x * scaleX;

  // PDF Y-axis starts from bottom, browser starts from top
  const pdfY =
    pdfPageSize.height -
    (fieldPosition.y + fieldPosition.height) * scaleY;

  return {
    x: pdfX,
    y: pdfY,
    width: fieldPosition.width * scaleX,
    height: fieldPosition.height * scaleY,
  };
};

export const pdfToBrowserCoordinates = (
  pdfPosition,
  pdfPageSize,
  displaySize
) => {
  const scaleX = displaySize.width / pdfPageSize.width;
  const scaleY = displaySize.height / pdfPageSize.height;

  const browserX = pdfPosition.x * scaleX;

  // Flip Y back to browser space
  const browserY =
    (pdfPageSize.height - pdfPosition.y - pdfPosition.height) * scaleY;

  return {
    x: browserX,
    y: browserY,
    width: pdfPosition.width * scaleX,
    height: pdfPosition.height * scaleY,
  };
};

export const getPdfDimensions = (page) => {
  if (!page) {
    return { width: 0, height: 0 };
  }

  return {
    width: page.originalWidth || page.width,
    height: page.originalHeight || page.height,
  };
};

export const getRenderedDimensions = (pdfElement) => {
  if (!pdfElement) {
    return { width: 0, height: 0 };
  }

  const canvas = pdfElement.querySelector('canvas');
  if (!canvas) {
    return { width: 0, height: 0 };
  }

  return {
    width: canvas.clientWidth,
    height: canvas.clientHeight,
  };
};

export const clampCoordinates = (position, bounds) => {
  return {
    x: Math.max(0, Math.min(position.x, bounds.width - position.width)),
    y: Math.max(0, Math.min(position.y, bounds.height - position.height)),
    width: Math.min(position.width, bounds.width),
    height: Math.min(position.height, bounds.height),
  };
};
