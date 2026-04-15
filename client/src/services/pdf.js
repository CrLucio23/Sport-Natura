import { jsPDF } from 'jspdf';

export function generaLiberatoriaPDF(dati) {
  const doc = new jsPDF();

  // intestazione
  doc.setFontSize(18);
  doc.setTextColor(80, 140, 80);
  doc.text('Sport&Natura – Liberatoria di Partecipazione', 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Il sottoscritto dichiara di partecipare all\'attività sotto la propria responsabilità.', 105, 30, { align: 'center' });

  // linea separatrice
  doc.setDrawColor(80, 140, 80);
  doc.line(15, 35, 195, 35);

  // campi
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);

  const fields = [
    ['Nome', dati.nome],
    ['Cognome', dati.cognome],
    ['Luogo di nascita', dati.luogoNascita],
    ['Data di nascita', dati.dataNascita],
    ['Città di residenza', `${dati.cittaResidenza} (${dati.provincia})`],
    ['Indirizzo', dati.indirizzo],
    ['Cellulare / Telefono', dati.cellulare],
    ['Data di compilazione', dati.dataCompilazione],
  ];

  let y = 50;
  fields.forEach(([label, value]) => {
    doc.setFont(undefined, 'bold');
    doc.text(`${label}:`, 15, y);
    doc.setFont(undefined, 'normal');
    doc.text(value || '—', 75, y);
    doc.setDrawColor(220, 220, 220);
    doc.line(15, y + 3, 195, y + 3);
    y += 14;
  });

  // firma
  if (dati.firma) {
    y += 5;
    doc.setFont(undefined, 'bold');
    doc.text('Firma:', 15, y);
    doc.addImage(dati.firma, 'PNG', 15, y + 5, 80, 30);
    y += 40;
  }

  // footer
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('Sport&Natura – Documento generato automaticamente', 105, 285, { align: 'center' });

  // restituisci come Blob
  return doc.output('blob');
}