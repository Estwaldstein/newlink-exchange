const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, degrees, StandardFonts } = require('pdf-lib');

async function addWatermarkToPDF(inputPath, watermarkText = 'Newlink Confidential') {
  const pdfBytes = fs.readFileSync(inputPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  pdfDoc.getPages().forEach(page => {
    const { width, height } = page.getSize();
    page.drawText(watermarkText, {
      x: width / 2 - 100,
      y: height / 2,
      size: 36,
      font: helveticaFont,
      color: rgb(0.7, 0.7, 0.7),
      rotate: degrees(-45),
      opacity: 0.5
    });
  });

  const watermarkedBytes = await pdfDoc.save();
  const outputPath = inputPath.replace('.pdf', '-wm.pdf');
  fs.writeFileSync(outputPath, watermarkedBytes);
  return outputPath;
}

module.exports = addWatermarkToPDF;
