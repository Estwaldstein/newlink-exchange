const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts, degrees } = require('pdf-lib');

async function addWatermarkToPDF(inputPath, outputPath, watermarkText = 'Newlink Confidential') {
  try {
    // Read the existing PDF
    const existingPdfBytes = fs.readFileSync(inputPath);

    // Load the PDF document
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Embed the Helvetica font
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Get all pages of the document
    const pages = pdfDoc.getPages();

    // Define watermark properties
    const fontSize = 50;
    const color = rgb(0.75, 0.75, 0.75); // Light gray
    const rotation = degrees(-45); // Diagonal

    // Add watermark to each page
    pages.forEach((page) => {
      const { width, height } = page.getSize();
      page.drawText(watermarkText, {
        x: width / 2 - (fontSize * watermarkText.length) / 4,
        y: height / 2,
        size: fontSize,
        font: helveticaFont,
        color,
        rotate: rotation,
        opacity: 0.5,
      });
    });

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();

    // Write the PDF to a file
    fs.writeFileSync(outputPath, pdfBytes);
  } catch (error) {
    console.error('Error adding watermark:', error);
    throw error;
  }
}

module.exports = { addWatermarkToPDF };
