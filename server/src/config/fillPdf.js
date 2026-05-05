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
  const page2 = pages[1];
  const { height } = page.getSize();
  const { height: h2 } = page2.getSize();

  // helper unificato per entrambe le pagine
  function write(p, text, x, yFromTop, size = 10) {
    const pageH = p === page ? height : h2;
    p.drawText(String(text || ''), {
      x,
      y: pageH - yFromTop,
      size,
      font,
      color: rgb(0, 0, 0)
    });
  }

  // pagina 1 — riga "il sottoscritto / nato a"
  write(page, `${dati.nome} ${dati.cognome}`, 108, 375);
  write(page, dati.luogoNascita, 390, 375);

  // riga "il (data nascita) / residente in"
  write(page, dati.dataNascita, 60, 395);
  write(page, `${dati.cittaResidenza} (${dati.provincia})`, 205, 395);

  // riga "Via / n° / Tel/Cell"
  write(page, dati.indirizzo, 65, 415);
  write(page, dati.cellulare, 390, 415);

  // pagina 2 — data compilazione e firma
  write(page2, dati.dataCompilazione, 80, 710);

  if (firmaBase64) {
    const firmaBytes = Buffer.from(
      firmaBase64.replace(/^data:image\/png;base64,/, ''), 'base64'
    );
    const firmaImg = await pdfDoc.embedPng(firmaBytes);
    page2.drawImage(firmaImg, {
      x: 320,
      y: h2 - 740,
      width: 150,
      height: 45
    });
  }

  return pdfDoc.save();
}