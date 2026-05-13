import { pool } from "../config/db.js";
import { transporter } from "../config/mailer.js";
import { bookingConfirmationEmail } from "../config/emailTemplates.js";
import { fillLiberatoria } from "../config/fillPdf.js";
import fs from "fs";

export async function getSlots(req, res) {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "La data è obbligatoria" });
    }

    const slotsResult = await pool.query(
      `SELECT id, label, start_time, end_time
       FROM timeslots
       WHERE is_active = TRUE
       ORDER BY start_time`,
    );

    const bookedResult = await pool.query(
      `SELECT slot_id
       FROM bookings
       WHERE booking_date = $1
         AND status IN ('in_attesa', 'confermata')`,
      [date],
    );

    const bookedIds = new Set(bookedResult.rows.map((row) => row.slot_id));

    const slots = slotsResult.rows.map((slot) => ({
      ...slot,
      available: !bookedIds.has(slot.id),
    }));

    res.json(slots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Errore nel recupero degli slot" });
  }
}

export async function createBooking(req, res) {
  const client = await pool.connect();

  try {
    const {
      fullName,
      email,
      phone,
      bookingDate,
      slotId,
      participants,
      rentalCount,
      notes,
    } = req.body;
    const liberatorieData = JSON.parse(req.body.liberatorieData || "[]");

    if (
      !fullName ||
      !email ||
      !phone ||
      !bookingDate ||
      !slotId ||
      !participants
    ) {
      return res
        .status(400)
        .json({ message: "Compila tutti i campi obbligatori" });
    }

    const dayOfWeek = new Date(bookingDate + "T12:00:00Z").getUTCDay();
    if (dayOfWeek !== 0) {
      return res
        .status(400)
        .json({ message: "Le prenotazioni sono disponibili solo la domenica" });
    }

    const MAX_PARTICIPANTS = 6;
    if (Number(participants) > MAX_PARTICIPANTS) {
      return res.status(400).json({
        message: `Il campo ospita massimo ${MAX_PARTICIPANTS} persone per sessione`,
      });
    }
    if (Number(rentalCount) > Number(participants)) {
      return res.status(400).json({
        message: "Il numero di noleggi non può superare i partecipanti",
      });
    }

    await client.query("BEGIN");

    const existing = await client.query(
      `SELECT id FROM bookings
       WHERE booking_date = $1 AND slot_id = $2 AND field_id = 1
         AND status IN ('in_attesa', 'confermata')`,
      [bookingDate, slotId],
    );

    const closed = await client.query(
      "SELECT id FROM closed_dates WHERE closed_date = $1",
      [bookingDate],
    );

    if (closed.rowCount > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Questa data non è disponibile" });
    }

    if (existing.rowCount > 0) {
      await client.query("ROLLBACK");
      return res
        .status(409)
        .json({ message: "Questo slot non è più disponibile" });
    }

    // Procede con il resto della creazione della prenotazione
    const customerResult = await client.query(
      `INSERT INTO customers (full_name, email, phone) VALUES ($1, $2, $3) RETURNING id`,
      [fullName, email, phone],
    );
    const customerId = customerResult.rows[0].id;

    const bookingResult = await client.query(
      `INSERT INTO bookings (customer_id, field_id, booking_date, slot_id, participants, rental_count, notes)
       VALUES ($1, 1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        customerId,
        bookingDate,
        slotId,
        participants,
        rentalCount || 0,
        notes || null,
      ],
    );

    const bookingId = bookingResult.rows[0].id;

    // genera e salva le liberatorie DENTRO la transazione
    const pdfAttachments = [];

    for (let i = 0; i < liberatorieData.length; i++) {
      const dati = liberatorieData[i];
      const pdfBytes = await fillLiberatoria(dati, dati.firma);
      const filename = `liberatoria_${dati.nome}_${dati.cognome}_p${i + 1}.pdf`;

      pdfAttachments.push({ filename, content: Buffer.from(pdfBytes) });

      await client.query(
        `INSERT INTO liberatorie (booking_id, participant_index, nome, cognome, file_path)
        VALUES ($1, $2, $3, $4, $5)`,
        [bookingId, i + 1, dati.nome, dati.cognome, filename],
      );
    }

    await client.query("COMMIT");

    // Invia email di conferma
    const slotResult = await pool.query(
      "SELECT label, start_time, end_time FROM timeslots WHERE id = $1",
      [slotId],
    );
    const slot = slotResult.rows[0];

    const emailContent = bookingConfirmationEmail({
      fullName,
      bookingDate,
      slotLabel: slot.label,
      startTime: slot.start_time,
      endTime: slot.end_time,
      participants,
      rentalNeeded: Number(rentalCount) > 0,
    });

    transporter
      .sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        ...emailContent,
      })
      .catch((err) => console.error("Errore invio email:", err));

    // email all'admin con PDF allegati
    transporter
      .sendMail({
        from: process.env.SMTP_FROM,
        to: process.env.ADMIN_EMAIL,
        subject: `Nuova prenotazione – ${fullName} – ${bookingDate}`,
        html: `
        <p>Nuova prenotazione ricevuta.</p>
        <ul>
          <li><strong>Nome:</strong> ${fullName}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Telefono:</strong> ${phone}</li>
          <li><strong>Data:</strong> ${bookingDate}</li>
          <li><strong>Partecipanti:</strong> ${participants}</li>
          <li><strong>Noleggi:</strong> ${rentalCount || 0}</li>
        </ul>
        <p>In allegato le liberatorie firmate dei partecipanti.</p>
      `,
        attachments: pdfAttachments,
      })
      .catch((err) => console.error("Errore invio email admin:", err));

    res.status(201).json({
      message: "Prenotazione inviata con successo",
      booking: bookingResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res
      .status(500)
      .json({ message: "Errore durante la creazione della prenotazione" });
  } finally {
    client.release();
  }
}

export async function deleteBooking(req, res) {
  try {
    const { id } = req.params;

    // elimina liberatorie prima (cascade lo fa, ma per sicurezza)
    await pool.query("DELETE FROM liberatorie WHERE booking_id = $1", [id]);

    const result = await pool.query(
      "DELETE FROM bookings WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Prenotazione non trovata" });
    }

    // elimina anche il cliente se non ha altre prenotazioni
    const customerId = result.rows[0].customer_id;
    const others = await pool.query(
      "SELECT id FROM bookings WHERE customer_id = $1",
      [customerId],
    );
    if (others.rowCount === 0) {
      await pool.query("DELETE FROM customers WHERE id = $1", [customerId]);
    }

    res.json({ message: "Prenotazione eliminata" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Errore eliminazione prenotazione" });
  }
}

export async function getAdminBookings(req, res) {
  try {
    const result = await pool.query(
      `SELECT
      b.id,
      b.rental_count,
      b.booking_date,
      b.participants,
      b.notes,
      b.status,
      b.created_at,
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
   ORDER BY b.booking_date DESC, t.start_time ASC`,
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Errore nel recupero prenotazioni admin" });
  }
}

export async function updateBookingStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const validStatuses = ["in_attesa", "confermata", "annullata"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Stato non valido" });
    }

    await pool.query(
      `UPDATE bookings
   SET status = $1::varchar,
       rejection_reason = CASE WHEN $1::varchar = 'annullata' THEN $2::text ELSE rejection_reason END
   WHERE id = $3`,
      [status, rejectionReason || null, id],
    );

    res.json({ message: "Stato aggiornato" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Errore aggiornamento stato" });
  }
}

export async function getMonthAvailability(req, res) {
  try {
    const { year, month } = req.query;
    if (!year || !month)
      return res.status(400).json({ message: "Anno e mese obbligatori" });

    const totalSlotsResult = await pool.query(
      `SELECT COUNT(*) FROM timeslots WHERE is_active = TRUE`,
    );
    const totalSlots = Number(totalSlotsResult.rows[0].count);

    const bookingsResult = await pool.query(
      `SELECT booking_date, COUNT(*) as booked_slots
       FROM bookings
       WHERE EXTRACT(YEAR FROM booking_date) = $1
         AND EXTRACT(MONTH FROM booking_date) = $2
         AND status IN ('in_attesa', 'confermata')
       GROUP BY booking_date`,
      [year, month],
    );

    // date chiuse dall'admin in questo mese
    const closedResult = await pool.query(
      `SELECT closed_date FROM closed_dates
       WHERE EXTRACT(YEAR FROM closed_date) = $1
         AND EXTRACT(MONTH FROM closed_date) = $2`,
      [year, month],
    );

    const availability = {};

    bookingsResult.rows.forEach((row) => {
      const dateKey = row.booking_date.toISOString().slice(0, 10);
      const booked = Number(row.booked_slots);
      // con 1 solo slot attivo: qualsiasi prenotazione = campo pieno
      // se ci fossero più slot in futuro, 'partial' si attiverebbe
      if (booked >= totalSlots) {
        availability[dateKey] = "full";
      } else {
        availability[dateKey] = "partial";
      }
    });

    // le date chiuse sovrascrivono tutto → 'closed'
    closedResult.rows.forEach((row) => {
      const dateKey = row.closed_date.toISOString().slice(0, 10);
      availability[dateKey] = "closed";
    });

    res.json({ totalSlots, availability });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Errore nel recupero disponibilità" });
  }
}

// nuove funzioni admin
export async function getClosedDates(req, res) {
  try {
    const result = await pool.query(
      "SELECT * FROM closed_dates ORDER BY closed_date ASC",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Errore" });
  }
}

export async function toggleClosedDate(req, res) {
  try {
    const { date, reason } = req.body;
    if (!date) return res.status(400).json({ message: "Data obbligatoria" });

    // se esiste → riapre, se non esiste → chiude
    const existing = await pool.query(
      "SELECT id FROM closed_dates WHERE closed_date = $1",
      [date],
    );

    if (existing.rowCount > 0) {
      await pool.query("DELETE FROM closed_dates WHERE closed_date = $1", [
        date,
      ]);
      return res.json({ message: "Data riaperta", open: true });
    } else {
      await pool.query(
        "INSERT INTO closed_dates (closed_date, reason) VALUES ($1, $2)",
        [date, reason || null],
      );
      return res.json({ message: "Data chiusa", open: false });
    }
  } catch (err) {
    res.status(500).json({ message: "Errore" });
  }
}
