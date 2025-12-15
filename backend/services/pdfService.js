const { PDFDocument, rgb } = require('pdf-lib');

// Embed signature image into the PDF at given coordinates
const signPdf = async (pdfBuffer, signatureData) => {
  const pdfDoc = await PDFDocument.load(pdfBuffer);

  // Decode base64 image and embed it (PNG preferred, JPEG fallback)
  let signatureImg;
  const imgData = signatureData.imageBase64.replace(
    /^data:image\/(jpeg|png);base64,/,
    ''
  );

  try {
    signatureImg = await pdfDoc.embedPng(Buffer.from(imgData, 'base64'));
  } catch {
    try {
      signatureImg = await pdfDoc.embedJpg(Buffer.from(imgData, 'base64'));
    } catch {
      throw new Error('Image format not supported. Use PNG or JPEG.');
    }
  }

  const imgW = signatureImg.width;
  const imgH = signatureImg.height;
  const imgRatio = imgW / imgH;

  for (const field of signatureData.fields) {
    if (field.type !== 'signature') continue;

    const pageIndex = field.pageNumber - 1;
    const page = pdfDoc.getPages()[pageIndex];

    if (!page) {
      console.warn(`Skipping field: page ${field.pageNumber} not found`);
      continue;
    }

    const { x, y, width, height } = field.coordinates;
    const fieldRatio = width / height;

    let drawW, drawH, drawX, drawY;

    // Fit image inside field while preserving aspect ratio
    if (imgRatio > fieldRatio) {
      drawW = width;
      drawH = width / imgRatio;
      drawX = x;
      drawY = y + (height - drawH) / 2;
    } else {
      drawH = height;
      drawW = height * imgRatio;
      drawX = x + (width - drawW) / 2;
      drawY = y;
    }

    page.drawImage(signatureImg, {
      x: drawX,
      y: drawY,
      width: drawW,
      height: drawH,
    });

    console.log(
      `Added signature to page ${field.pageNumber} at (${x.toFixed(
        1
      )}, ${y.toFixed(1)})`
    );
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};

// Draw basic text fields (prototype support)
const addTextField = async (pdfBuffer, textData) => {
  const pdfDoc = await PDFDocument.load(pdfBuffer);

  for (const field of textData.fields) {
    if (field.type !== 'text') continue;

    const pageIndex = field.pageNumber - 1;
    const page = pdfDoc.getPages()[pageIndex];
    if (!page) continue;

    const { x, y, width, height } = field.coordinates;

    page.drawRectangle({
      x,
      y,
      width,
      height,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    if (field.value) {
      page.drawText(field.value, {
        x: x + 5,
        y: y + height / 2,
        size: 12,
        color: rgb(0, 0, 0),
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};

module.exports = {
  signPdf,
  addTextField,
};
