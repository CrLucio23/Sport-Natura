import { useState } from 'react';
import {
  login, fetchAdminBookings, updateBookingStatus,
  deleteBooking, fetchClosedDates, toggleClosedDate
} from '../services/api.js';

// FIX: usa data locale, non UTC
function prossimeDomeniche() {
  const sundays = [];
  const today = new Date();
  let d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = (7 - d.getDay()) % 7 || 7;
  d.setDate(d.getDate() + diff);
  for (let i = 0; i < 16; i++) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const g = String(d.getDate()).padStart(2, '0');
    sundays.push(`${y}-${m}-${g}`);
    d.setDate(d.getDate() + 7);
  }
  return sundays;
}

function formatData(dateStr) {
  return new Date(dateStr + 'T12:00:00Z').toLocaleDateString('it-IT', {
    weekday: 'long', day: '2-digit', month: 'long'
  });
}

export default function AdminPage() {
  const [token,       setToken]       = useState(localStorage.getItem('admin_token') || '');
  const [isLoggedIn,  setIsLoggedIn]  = useState(!!localStorage.getItem('admin_token'));
  const [username,    setUsername]    = useState('');
  const [password,    setPassword]    = useState('');
  const [bookings,    setBookings]    = useState([]);
  const [error,       setError]       = useState('');
  const [message,     setMessage]     = useState('');
  const [loading,     setLoading]     = useState(false);
  const [closedDates, setClosedDates] = useState([]);
  const [showCalendar,setShowCalendar]= useState(false);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason,setRejectReason]= useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await login(username, password);
      localStorage.setItem('admin_token', data.token);
      setToken(data.token);
      setIsLoggedIn(true);
      setUsername('');
      setPassword('');
    } catch (err) { setError(err.message); }
  }

  function handleLogout() {
    localStorage.removeItem('admin_token');
    setToken(''); setIsLoggedIn(false);
    setBookings([]); setShowCalendar(false);
  }

  async function loadBookings() {
    try {
      setLoading(true); setError('');
      const data = await fetchAdminBookings(token);
      setBookings(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function loadClosedDates() {
    try {
      const data = await fetchClosedDates(token);
      // spread forzato per triggerare il re-render
      setClosedDates([...data.map(d => d.closed_date.slice(0, 10))]);
    } catch (err) {
      console.error(err);
      setError('Errore nel caricamento del calendario');
    }
  }

  async function handleToggleDate(date) {
    const isClosed = closedDates.includes(date);
    const msg = isClosed
      ? `Vuoi riaprire la domenica ${formatData(date)}?`
      : `Sei sicuro di voler chiudere la giocata del ${formatData(date)}?`;

    if (!confirm(msg)) return;

    try {
      setError('');
      await toggleClosedDate(date, '', token);
      // aggiornamento ottimistico immediato
      setClosedDates(prev =>
        isClosed ? prev.filter(d => d !== date) : [...prev, date]
      );
    } catch (err) {
      console.error(err);
      setError('Errore nella modifica della data');
      // in caso di errore ricarica lo stato reale
      await loadClosedDates();
    }
  }

  function handleToggleCalendar() {
    const opening = !showCalendar;
    setShowCalendar(opening);
    if (opening) loadClosedDates();
  }

  function openWhatsApp(phone, text) {
    const cleaned = phone.replace(/\D/g, '');
    const number  = cleaned.startsWith('39') ? cleaned : '39' + cleaned;
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, '_blank');
  }

  async function handleConfirm(booking) {
    try {
      setError(''); setMessage('');
      await updateBookingStatus(booking.id, 'confermata', token);
      setMessage('Prenotazione confermata');
      await loadBookings();
      openWhatsApp(booking.phone,
        `Ciao ${booking.full_name}! ✅ La tua prenotazione presso Sport&Natura per ${formatData(booking.booking_date)} è stata *CONFERMATA*.\n\nCi vediamo domenica alle 08:00! 🎯\n\n— Sport&Natura Softair Team`
      );
    } catch (err) { setError(err.message); }
  }

  async function handleRejectSubmit() {
    if (!rejectModal) return;
    try {
      setError(''); setMessage('');
      await updateBookingStatus(rejectModal.id, 'annullata', token, rejectReason);
      setMessage('Prenotazione annullata');
      const motivazione = rejectReason ? `\n\nMotivazione: _${rejectReason}_` : '';
      openWhatsApp(rejectModal.phone,
        `Ciao ${rejectModal.full_name}, purtroppo la tua prenotazione per ${formatData(rejectModal.booking_date)} è stata *RIFIUTATA*.${motivazione}\n\nPer info contattaci su questo numero.\n\n— Sport&Natura Softair Team`
      );
      setRejectModal(null); setRejectReason('');
      await loadBookings();
    } catch (err) { setError(err.message); }
  }

  async function handleReset(id) {
    try {
      setError(''); setMessage('');
      await updateBookingStatus(id, 'in_attesa', token);
      setMessage('Stato reimpostato');
      await loadBookings();
    } catch (err) { setError(err.message); }
  }

  async function handleDelete(id) {
    if (!confirm('Eliminare definitivamente questa prenotazione dal database?')) return;
    try {
      setError(''); setMessage('');
      await deleteBooking(id, token);
      setMessage('Prenotazione eliminata');
      await loadBookings();
    } catch (err) { setError(err.message); }
  }

  // ── LOGIN ──────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <section className="panel" style={{ maxWidth: 400, margin: '4rem auto' }}>
        <h2>Login admin</h2>
        <form onSubmit={handleLogin}>
          <div className="field-group">
            <label>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="field-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <p className="error">{error}</p>}
          <button className="button primary" type="submit">Accedi</button>
        </form>
      </section>
    );
  }

  // ── AREA ADMIN ─────────────────────────────────────────
  return (
    <section className="panel">

      {/* ── MODALE RIFIUTO ── */}
      {rejectModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.78)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{
            background: 'var(--forest)', border: '1px solid var(--border)',
            borderRadius: 4, padding: '2rem', width: '100%', maxWidth: 460
          }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#d88888', marginBottom: '0.5rem' }}>
              Rifiuta prenotazione
            </div>
            <h3 style={{ marginBottom: '0.25rem' }}>{rejectModal.full_name}</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {formatData(rejectModal.booking_date)}
            </p>
            <div className="field-group">
              <label>Motivazione (opzionale — verrà inviata via WhatsApp)</label>
              <textarea
                rows={3}
                placeholder="es. Campo non disponibile per manutenzione..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                className="button primary"
                onClick={handleRejectSubmit}
                style={{ background: 'rgba(140,40,40,0.9)' }}
              >
                ✕ Rifiuta e invia WhatsApp
              </button>
              <button className="button secondary" onClick={() => { setRejectModal(null); setRejectReason(''); }}>
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOOLBAR ── */}
      <div className="admin-toolbar">
        <h2 style={{ margin: 0 }}>Area admin</h2>
        <div style={{ display: 'flex', gap: '0.75rem', marginLeft: 'auto' }}>
          <button className="button secondary" onClick={handleToggleCalendar}>
            {showCalendar ? '✕ Chiudi calendario' : '📅 Gestisci domeniche'}
          </button>
          <button className="button primary" onClick={loadBookings}>
            Carica prenotazioni
          </button>
          <button className="button secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* ── PANNELLO CALENDARIO ── */}
      {showCalendar && (
        <div style={{ marginBottom: '1.5rem', background: 'var(--forest)', border: '1px solid var(--border)', borderRadius: 3, padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--sand)', marginBottom: '0.25rem' }}>
              Gestione Calendario
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-dim)' }}>
              Clicca su una domenica per chiuderla o riaprirla.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.5rem' }}>
            {prossimeDomeniche().map(date => {
              const closed = closedDates.includes(date);
              return (
                <button
                  key={date}
                  onClick={() => handleToggleDate(date)}
                  style={{
                    padding: '0.75rem', borderRadius: 3,
                    border: `1px solid ${closed ? 'rgba(140,50,140,0.5)' : 'rgba(58,80,52,0.5)'}`,
                    background: closed ? 'rgba(75,28,75,0.65)' : 'rgba(48,74,42,0.55)',
                    color: 'var(--text)', cursor: 'pointer',
                    fontFamily: 'Rajdhani, sans-serif', fontWeight: 600,
                    fontSize: '0.82rem', textAlign: 'left',
                    transition: 'all 0.18s',
                  }}
                >
                  <div style={{ fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: closed ? '#c090c0' : 'var(--accent)', marginBottom: '0.25rem' }}>
                    {closed ? '🔒 Chiusa' : '✅ Aperta'}
                  </div>
                  {formatData(date)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {loading && <p>Caricamento...</p>}
      {message && <p className="success">{message}</p>}
      {error   && <p className="error">{error}</p>}

      {/* ── LISTA PRENOTAZIONI ── */}
      <div className="admin-list">
        {bookings.map(booking => (
          <article key={booking.id} className="booking-card">
            <div className="booking-head">
              <h3>{booking.full_name}</h3>
              <span className={`status ${booking.status}`}>{booking.status}</span>
            </div>
            <p><strong>Data:</strong> {formatData(booking.booking_date)}</p>
            <p><strong>Fascia:</strong> {booking.slot_label} ({booking.start_time.slice(0,5)} - {booking.end_time.slice(0,5)})</p>
            <p><strong>Partecipanti:</strong> {booking.participants}</p>
            <p><strong>Noleggi:</strong> {booking.rental_count || 0}</p>
            <p><strong>Email:</strong> {booking.email}</p>
            <p><strong>Telefono:</strong> {booking.phone}</p>
            {booking.notes && <p><strong>Note:</strong> {booking.notes}</p>}
            {booking.rejection_reason && (
              <p><strong>Motivazione rifiuto:</strong> {booking.rejection_reason}</p>
            )}
            <div className="status-actions">
              <button onClick={() => handleConfirm(booking)}>✓ Conferma + WhatsApp</button>
              <button onClick={() => { setRejectModal(booking); setRejectReason(''); }}>✕ Rifiuta</button>
              <button onClick={() => handleReset(booking.id)}>↺ Reset</button>
              <button
                onClick={() => handleDelete(booking.id)}
                style={{ background: 'rgba(140,40,40,0.3)', borderColor: 'rgba(140,40,40,0.5)' }}
              >
                🗑 Elimina
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}