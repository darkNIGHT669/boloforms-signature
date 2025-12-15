import {
  browserToPdfCoordinates,
  getRenderedDimensions,
} from './coordinateTransform';

// Prepare field data before sending it to the backend
export const prepareFieldsForBackend = (
  fields,
  pdfDimensions,
  pdfContainer
) => {
  if (!pdfContainer) {
    return [];
  }

  const pdfPageElement = pdfContainer.querySelector('.react-pdf__Page');
  const renderedDims = getRenderedDimensions(pdfPageElement);

  return fields
    .map((field) => {
      const pageDims = pdfDimensions[field.pageNumber];
      if (!pageDims) return null;

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

      return {
        id: field.id,
        type: field.type,
        pageNumber: field.pageNumber,
        coordinates: pdfCoords,
      };
    })
    .filter(Boolean);
};

// Convert a file to base64 (used for signature images)
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Generate SHA-256 hash for audit purposes
export const calculateFileHash = async (file) => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

// Validate field placement against PDF bounds
export const validateFieldPositions = (fields, pdfDimensions) => {
  const errors = [];

  fields.forEach((field) => {
    const pageDims = pdfDimensions[field.pageNumber];
    if (!pageDims) {
      errors.push(
        `Field ${field.id}: Page ${field.pageNumber} dimensions missing`
      );
      return;
    }

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

// Trigger browser download for a signed PDF
export const downloadPdf = (
  pdfBlob,
  filename = 'signed-document.pdf'
) => {
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

// Helper for displaying coordinates during debugging
export const formatCoordinates = (coords) => {
  return `(${coords.x.toFixed(2)}, ${coords.y.toFixed(
    2
  )}) [${coords.width.toFixed(2)} × ${coords.height.toFixed(2)}]`;
};
