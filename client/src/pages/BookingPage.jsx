import { useEffect, useMemo, useState } from "react";
import Calendar from "../components/Calendar.jsx";
import ParticipantForm from "../components/ParticipantForm.jsx";
import { createBooking, fetchSlots } from "../services/api.js";

function nextSunday() {
  const d = new Date();
  const diff = (7 - d.getDay()) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function todayIso() {
  const now = new Date();
  return new Date(now - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

function emptyParticipant() {
  return {
    nome: "",
    cognome: "",
    luogoNascita: "",
    dataNascita: "",
    cittaResidenza: "",
    provincia: "",
    indirizzo: "",
    cellulare: "",
    dataCompilazione: todayIso(),
    firma: null,
  };
}

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [bookingDate, setBookingDate] = useState(nextSunday());
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    slotId: "",
    participants: 1,
    rentalCount: 0,
  });

  const [participantsData, setParticipantsData] = useState([
    emptyParticipant(),
  ]);

  // aggiorna array quando cambia il numero partecipanti
  useEffect(() => {
    const n = Number(form.participants);
    setParticipantsData((prev) => {
      if (n > prev.length)
        return [
          ...prev,
          ...Array(n - prev.length)
            .fill(null)
            .map(emptyParticipant),
        ];
      return prev.slice(0, n);
    });
  }, [form.participants]);

  // carica slot quando cambia data
  useEffect(() => {
    async function loadSlots() {
      try {
        setLoadingSlots(true);
        const data = await fetchSlots(bookingDate);
        setSlots(data);
        setForm((f) => ({ ...f, slotId: "" }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingSlots(false);
      }
    }
    loadSlots();
  }, [bookingDate]);

  useEffect(() => {
    // forza il calendario a ricaricare i dati quando arrivi sulla pagina
    window.dispatchEvent(new Event("focus"));
  }, []);
  const availableSlots = useMemo(
    () => slots.filter((s) => s.available),
    [slots],
  );

  function onFormChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function onParticipantChange(index, data) {
    setParticipantsData((prev) => {
      const u = [...prev];
      u[index] = data;
      return u;
    });
  }

  function validateStep1() {
    if (!form.fullName || !form.email || !form.phone || !form.slotId) {
      setError("Compila tutti i campi obbligatori");
      return false;
    }
    if (Number(form.rentalCount) > Number(form.participants)) {
      setError("Il numero di noleggi non può superare i partecipanti");
      return false;
    }
    setError("");
    return true;
  }

  function validateStep2() {
    for (let i = 0; i < participantsData.length; i++) {
      const p = participantsData[i];
      if (
        !p.nome ||
        !p.cognome ||
        !p.luogoNascita ||
        !p.dataNascita ||
        !p.cittaResidenza ||
        !p.provincia ||
        !p.indirizzo ||
        !p.cellulare
      ) {
        setError(`Compila tutti i campi del partecipante ${i + 1}`);
        return false;
      }
      if (!p.firma) {
        setError(`Manca la firma del partecipante ${i + 1}`);
        return false;
      }
    }
    setError("");
    return true;
  }

  async function handleSubmit() {
    if (!validateStep2()) return;
    try {
      setSubmitting(true);
      setError("");
      const formData = new FormData();
      formData.append("fullName", form.fullName);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("bookingDate", bookingDate);
      formData.append("slotId", Number(form.slotId));
      formData.append("participants", Number(form.participants));
      formData.append("rentalCount", Number(form.rentalCount));
      formData.append("liberatorieData", JSON.stringify(participantsData));
      const result = await createBooking(formData);
      setMessage(result.message);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function resetAll() {
    setStep(1);
    setMessage("");
    setError("");
    setForm({
      fullName: "",
      email: "",
      phone: "",
      slotId: "",
      participants: 1,
      rentalCount: 0,
    });
    setParticipantsData([emptyParticipant()]);
    setBookingDate(nextSunday());
  }

  // ── STEP 3: conferma ──────────────────────────────────
  if (step === 3) {
    return (
      <div className="container">
        <div className="confirm-wrap">
          <div className="confirm-icon">✅</div>
          <h2>Prenotazione Inviata</h2>
          <p>{message}</p>
          <p style={{ marginTop: "0.5rem" }}>
            Riceverai conferma a <strong>{form.email}</strong>.
          </p>
          <button
            className="button primary"
            style={{ marginTop: "2rem", width: "100%" }}
            onClick={resetAll}
          >
            Nuova prenotazione
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="panel">
        <div className="step-bar">
          {["Info prenotazione", "Liberatorie partecipanti"].map((label, i) => {
            const st =
              step === i + 1 ? "active" : step > i + 1 ? "done" : "inactive";
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  flex: i < 1 ? "none" : 1,
                }}
              >
                <div className={`step-dot ${st}`}>
                  {st === "done" ? "✓" : i + 1}
                </div>
                <span className={`step-lbl ${st === "active" ? "active" : ""}`}>
                  {label}
                </span>
                {i < 1 && <div className="step-line" />}
              </div>
            );
          })}
        </div>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <>
            <div className="section-label">Prenota il Campo</div>
            <p className="section-sub">
              Sessioni private — domenica mattina 08:00–12:00
            </p>

            <div className="field-group">
              <label>Seleziona una domenica</label>
              <Calendar
                key={bookingDate.slice(0, 7)} // ricarica quando cambia mese
                selectedDate={bookingDate}
                onSelectDate={setBookingDate}
              />
            </div>

            <div className="form-grid" style={{ marginTop: "1.75rem" }}>
              <div className="field-group">
                <label>Nome e cognome organizzatore *</label>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={onFormChange}
                  placeholder="Mario Rossi"
                  required
                />
              </div>
              <div className="field-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onFormChange}
                  placeholder="mario@email.it"
                  required
                />
              </div>
              <div className="field-group">
                <label>Telefono *</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={onFormChange}
                  placeholder="+39 320 0000000"
                  required
                />
              </div>
              <div className="field-group">
                <label>Fascia oraria *</label>
                <select
                  name="slotId"
                  value={form.slotId}
                  onChange={onFormChange}
                  required
                >
                  <option value="">— Seleziona —</option>
                  {loadingSlots ? (
                    <option disabled>Caricamento...</option>
                  ) : availableSlots.length === 0 ? (
                    <option disabled>Nessuno slot disponibile</option>
                  ) : (
                    availableSlots.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label} — {s.start_time.slice(0, 5)} /
                        {s.end_time.slice(0, 5)}
                        {s.remaining < 6
                          ? ` (${s.remaining} posti rimasti)`
                          : ""}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* SINGOLO o GRUPPO */}
              <div className="field-group">
                <label>Tipo di prenotazione *</label>
                <select
                  value={Number(form.participants) === 1 ? "singolo" : "gruppo"}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      participants:
                        e.target.value === "singolo"
                          ? 1
                          : f.participants < 2
                            ? 2
                            : f.participants,
                    }))
                  }
                >
                  <option value="singolo">Singolo partecipante</option>
                  <option value="gruppo">Gruppo</option>
                </select>
              </div>

              {Number(form.participants) > 1 && (
                <div className="field-group">
                  <label>Numero partecipanti *</label>
                  <input
                    type="number"
                    min="2"
                    max="50"
                    name="participants"
                    value={form.participants}
                    onChange={onFormChange}
                    required
                  />
                </div>
              )}

              <div className="field-group">
                <label>Noleggi attrezzatura</label>
                <input
                  type="number"
                  min="0"
                  max={form.participants}
                  name="rentalCount"
                  value={form.rentalCount}
                  onChange={onFormChange}
                />
                <small
                  style={{
                    color: "var(--text-dim)",
                    fontSize: "0.78rem",
                    letterSpacing: "0.04em",
                  }}
                >
                  Quante persone del gruppo necessitano di attrezzatura
                </small>
              </div>
            </div>

            {error && (
              <p className="error" style={{ marginBottom: "1rem" }}>
                {error}
              </p>
            )}

            <button
              className="button primary"
              style={{ marginTop: "0.5rem" }}
              onClick={() => {
                if (validateStep1()) setStep(2);
              }}
            >
              Continua — Liberatorie →
            </button>
          </>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.75rem",
              }}
            >
              <div>
                <div className="section-label">Liberatorie</div>
                <p className="section-sub">
                  {Number(form.participants) === 1
                    ? "Compila i dati e firma il modulo."
                    : `Compila e firma per ognuno dei ${form.participants} partecipanti.`}
                </p>
              </div>
              <button
                className="button secondary"
                onClick={() => {
                  setError("");
                  setStep(1);
                }}
              >
                ← Indietro
              </button>
            </div>

            {participantsData.map((p, i) => (
              <ParticipantForm
                key={i}
                index={i}
                data={p}
                onChange={onParticipantChange}
              />
            ))}

            {error && (
              <p className="error" style={{ marginBottom: "1rem" }}>
                {error}
              </p>
            )}

            <button
              className="button primary"
              style={{ marginTop: "0.5rem", width: "100%" }}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Invio in corso..." : "Invia Prenotazione"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
