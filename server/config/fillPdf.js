import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = path.join(__dirname, '../../assets/liberatoria_template.pdf');

export async function fillLiberatoria(dati, firmaBase64) {
  const templateBytes = fs.readFileSync(TEMPLATE_PATH);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const page = pages[0];
  const { height } = page.getSize();

  function drawText(text, x, y, size = 10) {
    page.drawText(String(text || ''), {
      x,
      y: height - y, // pdf-lib usa y dal basso, noi dal alto
      size,
      font,
      color: rgb(0, 0, 0)
    });
  }

  // — adatta le coordinate guardando il PDF —
  // riga "il sottoscritto ___"
  drawText(`${dati.nome} ${dati.cognome}`, 108, 142);

  // "nato a ___"
  drawText(dati.luogoNascita, 390, 142);

  // "il ___" (data di nascita)
  drawText(dati.dataNascita, 60, 158);

  // "residente in ___"
  drawText(`${dati.cittaResidenza} (${dati.provincia})`, 270, 158);

  // "Via ___ n° ___"
  drawText(dati.indirizzo, 65, 174);

  // "Tel/Cell ___"
  drawText(dati.cellulare, 390, 174);

  // data compilazione (pagina 2, in fondo)
  const page2 = pages[1];
  const { height: h2 } = page2.getSize();

  page2.drawText(dati.dataCompilazione, 80, h2 - 682, {
    size: 10, font, color: rgb(0, 0, 0)
  });

  // firma
  if (firmaBase64) {
    const firmaBytes = Buffer.from(firmaBase64.replace(/^data:image\/png;base64,/, ''), 'base64');
    const firmaImg = await pdfDoc.embedPng(firmaBytes);
    page2.drawImage(firmaImg, {
      x: 320,
      y: h2 - 710,
      width: 150,
      height: 50
    });
  }

  // debug — mostra una griglia ogni 50px
for (let y = 0; y < height; y += 50) {
  page.drawLine({ start: { x: 0, y }, end: { x: 595, y }, thickness: 0.3, color: rgb(0.8, 0.8, 0.8) });
  page.drawText(`${Math.round(height - y)}`, { x: 0, y, size: 6, font, color: rgb(0.5, 0.5, 0.5) });
}

  return pdfDoc.save();
}