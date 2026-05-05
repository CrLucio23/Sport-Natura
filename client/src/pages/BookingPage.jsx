import { useEffect, useMemo, useState } from 'react';
import Calendar from '../components/Calendar.jsx';
import ParticipantForm from '../components/ParticipantForm.jsx';
import { createBooking, fetchSlots } from '../services/api.js';
import { generaLiberatoriaPDF } from '../services/pdf.js';

function nextSunday() {
  const d = new Date();
  const daysUntilSunday = (7 - d.getDay()) % 7 || 7;
  d.setDate(d.getDate() + daysUntilSunday);
  return d.toISOString().slice(0, 10);
}

function emptyParticipant() {
  return {
    nome: '', cognome: '', luogoNascita: '', dataNascita: '',
    cittaResidenza: '', provincia: '', indirizzo: '',
    cellulare: '', dataCompilazione: nextSunday(), firma: null
  };
}

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [bookingDate, setBookingDate] = useState(nextSunday());
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    slotId: '',
    participants: 1,
    rentalCount: 0,
  });

  const [participantsData, setParticipantsData] = useState([emptyParticipant()]);

  // aggiorna array partecipanti quando cambia il numero
  useEffect(() => {
    setParticipantsData((prev) => {
      const n = Number(form.participants);
      if (n > prev.length) {
        return [...prev, ...Array(n - prev.length).fill(null).map(emptyParticipant)];
      }
      return prev.slice(0, n);
    });
  }, [form.participants]);

  useEffect(() => {
    async function loadSlots() {
      try {
        setLoadingSlots(true);
        const data = await fetchSlots(bookingDate);
        setSlots(data);
        setForm((f) => ({ ...f, slotId: '' }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingSlots(false);
      }
    }
    loadSlots();
  }, [bookingDate]);

  const availableSlots = useMemo(() => slots.filter((s) => s.available), [slots]);

  function onFormChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function onParticipantChange(index, data) {
    setParticipantsData((prev) => {
      const updated = [...prev];
      updated[index] = data;
      return updated;
    });
  }

  function validateStep1() {
    if (!form.fullName || !form.email || !form.phone || !form.slotId) {
      setError('Compila tutti i campi obbligatori');
      return false;
    }
    if (Number(form.rentalCount) > Number(form.participants)) {
      setError('Il numero di noleggi non può superare i partecipanti');
      return false;
    }
    setError('');
    return true;
  }

  function validateStep2() {
    for (let i = 0; i < participantsData.length; i++) {
      const p = participantsData[i];
      if (!p.nome || !p.cognome || !p.luogoNascita || !p.dataNascita ||
          !p.cittaResidenza || !p.provincia || !p.indirizzo || !p.cellulare) {
        setError(`Compila tutti i campi del partecipante ${i + 1}`);
        return false;
      }
      if (!p.firma) {
        setError(`Manca la firma del partecipante ${i + 1}`);
        return false;
      }
    }
    setError('');
    return true;
  }

  async function handleSubmit() {
    if (!validateStep2()) return;

    try {
      setSubmitting(true);
      setError('');

      const formData = new FormData();
      formData.append('fullName', form.fullName);
      formData.append('email', form.email);
      formData.append('phone', form.phone);
      formData.append('bookingDate', bookingDate);
      formData.append('slotId', Number(form.slotId));
      formData.append('participants', Number(form.participants));
      formData.append('rentalCount', Number(form.rentalCount));

      // genera e allega un PDF per ogni partecipante
 formData.append('liberatorieData', JSON.stringify(participantsData));

      const result = await createBooking(formData);
      setMessage(result.message);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // — STEP 3: conferma —
  if (step === 3) {
    return (
      <section className="panel" style={{ maxWidth: 500, margin: '4rem auto', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
        <h2>Prenotazione inviata!</h2>
        <p style={{ opacity: 0.8 }}>{message}</p>
        <p style={{ opacity: 0.6 }}>Riceverai una email di conferma a <strong>{form.email}</strong>.</p>
        <button
          className="button primary"
          style={{ marginTop: '1.5rem' }}
          onClick={() => { setStep(1); setMessage(''); setForm({ fullName: '', email: '', phone: '', slotId: '', participants: 1, rentalCount: 0 }); setParticipantsData([emptyParticipant()]); }}
        >
          Nuova prenotazione
        </button>
      </section>
    );
  }

  return (
    <section className="panel">
      {/* indicatore step */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', alignItems: 'center' }}>
        {['Info prenotazione', 'Liberatorie'].map((label, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem',
              background: step === i + 1 ? '#7ba36f' : step > i + 1 ? '#294e2f' : '#1a2a1a',
              color: step === i + 1 ? '#081008' : '#f3f5f7',
              border: step > i + 1 ? '2px solid #7ba36f' : 'none'
            }}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span style={{ opacity: step === i + 1 ? 1 : 0.5, fontSize: '0.9rem' }}>{label}</span>
            {i < 1 && <div style={{ width: 30, height: 1, background: 'rgba(255,255,255,0.2)' }} />}
          </div>
        ))}
      </div>

      {/* — STEP 1 — */}
      {step === 1 && (
        <>
          <h2>Prenota il campo</h2>

          <div className="field-group">
            <label>Seleziona una data</label>
            <Calendar selectedDate={bookingDate} onSelectDate={setBookingDate} />
          </div>

          <div className="form-grid" style={{ marginTop: '1.5rem' }}>
            <div className="field-group">
              <label>Nome e cognome organizzatore</label>
              <input name="fullName" value={form.fullName} onChange={onFormChange} required />
            </div>

            <div className="field-group">
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={onFormChange} required />
            </div>

            <div className="field-group">
              <label>Telefono</label>
              <input name="phone" value={form.phone} onChange={onFormChange} required />
            </div>

            <div className="field-group">
              <label>Fascia oraria</label>
              <select name="slotId" value={form.slotId} onChange={onFormChange} required>
                <option value="">Seleziona slot</option>
                {loadingSlots
                  ? <option disabled>Caricamento...</option>
                  : availableSlots.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label} – {s.start_time.slice(0, 5)} / {s.end_time.slice(0, 5)}
                    </option>
                  ))
                }
              </select>
            </div>

            <div className="field-group">
              <label>Numero partecipanti</label>
              <input
                type="number" min="1" max="50"
                name="participants" value={form.participants}
                onChange={onFormChange} required
              />
            </div>

            <div className="field-group">
              <label>Di cui con noleggio attrezzatura</label>
              <input
                type="number" min="0" max={form.participants}
                name="rentalCount" value={form.rentalCount}
                onChange={onFormChange}
              />
            </div>
          </div>

          {error && <p className="error">{error}</p>}

          <button
            className="button primary"
            style={{ marginTop: '1rem' }}
            onClick={() => { if (validateStep1()) setStep(2); }}
          >
            Continua →
          </button>
        </>
      )}

      {/* — STEP 2 — */}
      {step === 2 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0 }}>Liberatorie partecipanti</h2>
            <button className="button secondary" onClick={() => { setError(''); setStep(1); }}>
              ← Torna indietro
            </button>
          </div>

          <p style={{ opacity: 0.7, marginBottom: '1.5rem' }}>
            Compila i dati e firma per ognuno dei <strong>{form.participants}</strong> partecipanti.
          </p>

          {participantsData.map((p, i) => (
            <ParticipantForm
              key={i}
              index={i}
              data={p}
              onChange={onParticipantChange}
            />
          ))}

          {error && <p className="error">{error}</p>}

          <button
            className="button primary"
            style={{ marginTop: '1rem', width: '100%' }}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Invio in corso...' : 'Invia prenotazione'}
          </button>
        </>
      )}
    </section>
  );
}