import { pool } from '../config/db.js';
import { transporter } from '../config/mailer.js';
import { bookingConfirmationEmail } from '../config/emailTemplates.js';
import { fillLiberatoria } from '../config/fillPdf.js';
import fs from 'fs';

export async function getSlots(req, res) {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'La data è obbligatoria' });
    }

    const slotsResult = await pool.query(
      `SELECT id, label, start_time, end_time
       FROM timeslots
       WHERE is_active = TRUE
       ORDER BY start_time`
    );

    const bookedResult = await pool.query(
      `SELECT slot_id
       FROM bookings
       WHERE booking_date = $1
         AND status IN ('in_attesa', 'confermata')`,
      [date]
    );

    const bookedIds = new Set(bookedResult.rows.map((row) => row.slot_id));

    const slots = slotsResult.rows.map((slot) => ({
      ...slot,
      available: !bookedIds.has(slot.id)
    }));

    res.json(slots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore nel recupero degli slot' });
  }
}

export async function createBooking(req, res) {
  const client = await pool.connect();

  try {
    const { fullName, email, phone, bookingDate, slotId, participants, rentalCount, notes } = req.body;
    const files = req.files || [];

    if (!fullName || !email || !phone || !bookingDate || !slotId || !participants) {
      return res.status(400).json({ message: 'Compila tutti i campi obbligatori' });
    }

    const dayOfWeek = new Date(bookingDate).getUTCDay();
    if (dayOfWeek !== 0) {
      return res.status(400).json({ message: 'Le prenotazioni sono disponibili solo la domenica' });
    }

    await client.query('BEGIN');

    const existing = await client.query(
      `SELECT id FROM bookings
       WHERE booking_date = $1 AND slot_id = $2 AND field_id = 1
         AND status IN ('in_attesa', 'confermata')`,
      [bookingDate, slotId]
    );

    if (existing.rowCount > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: 'Questo slot non è più disponibile' });
    }

    const customerResult = await client.query(
      `INSERT INTO customers (full_name, email, phone) VALUES ($1, $2, $3) RETURNING id`,
      [fullName, email, phone]
    );
    const customerId = customerResult.rows[0].id;

    const bookingResult = await client.query(
      `INSERT INTO bookings (customer_id, field_id, booking_date, slot_id, participants, rental_count, notes)
       VALUES ($1, 1, $2, $3, $4, $5, $6) RETURNING *`,
      [customerId, bookingDate, slotId, participants, rentalCount || 0, notes || null]
    );

    const bookingId = bookingResult.rows[0].id;

    // salva le liberatorie
    for (let i = 0; i < files.length; i++) {
      await client.query(
        `INSERT INTO liberatorie (booking_id, participant_index, nome, cognome, file_path)
         VALUES ($1, $2, $3, $4, $5)`,
        [bookingId, i + 1, `Partecipante`, `${i + 1}`, files[i].path]
      );
    }

    await client.query('COMMIT');
    
    const liberatorieData = JSON.parse(req.body.liberatorieData || '[]');

for (let i = 0; i < liberatorieData.length; i++) {
  const dati = liberatorieData[i];
  const pdfBytes = await fillLiberatoria(dati, dati.firma);

  const dir = 'uploads/liberatorie';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filePath = `${dir}/liberatoria_${bookingId}_p${i + 1}.pdf`;
  fs.writeFileSync(filePath, pdfBytes);

  await client.query(
    `INSERT INTO liberatorie (booking_id, participant_index, nome, cognome, file_path)
     VALUES ($1, $2, $3, $4, $5)`,
    [bookingId, i + 1, dati.nome, dati.cognome, filePath]
  );
}
    // email conferma
    const slotResult = await pool.query(
      'SELECT label, start_time, end_time FROM timeslots WHERE id = $1', [slotId]
    );
    const slot = slotResult.rows[0];

    const emailContent = bookingConfirmationEmail({
      fullName, bookingDate,
      slotLabel: slot.label,
      startTime: slot.start_time,
      endTime: slot.end_time,
      participants,
      rentalNeeded: Number(rentalCount) > 0
    });

    transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      ...emailContent
    }).catch((err) => console.error('Errore invio email:', err));

    res.status(201).json({ message: 'Prenotazione inviata con successo', booking: bookingResult.rows[0] });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Errore durante la creazione della prenotazione' });
  } finally {
    client.release();
  }
}

export async function getAdminBookings(req, res) {
  try {
 const result = await pool.query(
  `SELECT
      b.id,
      b.booking_date,
      b.participants,
      b.rental_needed,
      b.notes,
      b.status,
      b.created_at,
      b.liberatoria_path,        -- ← aggiungi questa riga
      c.full_name,
      c.email,
      c.phone,
      t.label AS slot_label,
      t.start_time,
      t.end_time,
      f.name AS field_name
   FROM bookings b
   JOIN customers c ON c.id = b.customer_id
   JOIN timeslots t ON t.id = b.slot_id
   JOIN fields f ON f.id = b.field_id
   ORDER BY b.booking_date DESC, t.start_time ASC`
);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore nel recupero prenotazioni admin' });
  }
}

export async function updateBookingStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['in_attesa', 'confermata', 'annullata'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Stato non valido' });
    }

    const result = await pool.query(
      `UPDATE bookings
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Prenotazione non trovata' });
    }

    res.json({ message: 'Stato aggiornato', booking: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore nell\'aggiornamento stato' });
  }
}

export async function getMonthAvailability(req, res) {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ message: 'Anno e mese obbligatori' });
    }

    const totalSlotsResult = await pool.query(
      `SELECT COUNT(*) FROM timeslots WHERE is_active = TRUE`
    );
    const totalSlots = Number(totalSlotsResult.rows[0].count);

    const result = await pool.query(
      `SELECT booking_date, COUNT(*) as booked_slots
       FROM bookings
       WHERE EXTRACT(YEAR FROM booking_date) = $1
         AND EXTRACT(MONTH FROM booking_date) = $2
         AND status IN ('in_attesa', 'confermata')
       GROUP BY booking_date`,
      [year, month]
    );

    const availability = {};
    result.rows.forEach((row) => {
      const dateKey = row.booking_date.toISOString().slice(0, 10);
      const bookedSlots = Number(row.booked_slots);

      if (bookedSlots >= totalSlots) {
        availability[dateKey] = 'full';
      } else {
        availability[dateKey] = 'partial';
      }
    });

    res.json({ totalSlots, availability });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore nel recupero disponibilità' });
  }
}
