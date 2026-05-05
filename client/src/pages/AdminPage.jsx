import { useState } from 'react';
import {
  login, fetchAdminBookings, updateBookingStatus,
  deleteBooking, fetchClosedDates, toggleClosedDate
} from '../services/api.js';

function prossimeDomeniche() {
  const sundays = [];
  const today = new Date();
  let d = new Date(today);
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7));
  for (let i = 0; i < 16; i++) {
    sundays.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 7);
  }
  return sundays;
}

export default function AdminPage() {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('admin_token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [closedDates, setClosedDates] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);

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
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem('admin_token');
    setToken('');
    setIsLoggedIn(false);
    setBookings([]);
    setShowCalendar(false);
  }

  async function loadBookings() {
    try {
      setLoading(true);
      setError('');
      const data = await fetchAdminBookings(token);
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id, status) {
    try {
      setError('');
      setMessage('');
      await updateBookingStatus(id, status, token);
      setMessage('Stato prenotazione aggiornato');
      await loadBookings();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Eliminare definitivamente questa prenotazione dal database?')) return;
    try {
      setError('');
      setMessage('');
      await deleteBooking(id, token);
      setMessage('Prenotazione eliminata');
      await loadBookings();
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadClosedDates() {
    try {
      const data = await fetchClosedDates(token);
      setClosedDates(data.map(d => d.closed_date.slice(0, 10)));
    } catch (err) {
      console.error('Errore caricamento date chiuse:', err);
      setError('Errore nel caricamento del calendario');
    }
  }

  async function handleToggleDate(date) {
    try {
      setError('');
      await toggleClosedDate(date, '', token);
      await loadClosedDates();
    } catch (err) {
      console.error('Errore toggle data:', err);
      setError('Errore nella modifica della data');
    }
  }

  function handleToggleCalendar() {
    const opening = !showCalendar;
    setShowCalendar(opening);
    if (opening) loadClosedDates();
  }

  if (!isLoggedIn) {
    return (
      <section className="panel" style={{ maxWidth: 400, margin: '4rem auto' }}>
        <h2>Login admin</h2>
        <form onSubmit={handleLogin}>
          <div className="field-group">
            <label>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="field-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="error">{error}</p>}
          <button className="button primary" type="submit">Accedi</button>
        </form>
      </section>
    );
  }

  return (
    <section className="panel">
      {/* Toolbar */}
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

      {/* Pannello calendario */}
      {showCalendar && (
        <div style={{ marginBottom: '1.5rem', background: 'rgba(20,29,22,0.9)', border: '1px solid rgba(162,192,149,0.18)', borderRadius: 16, padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 1rem' }}>Domeniche — clicca per chiudere/riaprire</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.5rem' }}>
            {prossimeDomeniche().map(date => {
              const closed = closedDates.includes(date);
              return (
                <button
                  key={date}
                  onClick={() => handleToggleDate(date)}
                  style={{
                    padding: '0.6rem',
                    borderRadius: 10,
                    border: 'none',
                    cursor: 'pointer',
                    background: closed ? '#5b2929' : '#294e2f',
                    color: '#f3f5f7',
                    fontSize: '0.85rem'
                  }}
                >
                  {date}<br />
                  <small>{closed ? '🔒 Chiusa' : '✅ Aperta'}</small>
                </button>
              );
            })}
          </div>
          <p style={{ opacity: 0.6, fontSize: '0.8rem', marginTop: '0.75rem' }}>
            Le domeniche chiuse non accettano prenotazioni dal sito.
          </p>
        </div>
      )}

      {loading && <p>Caricamento...</p>}
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <div className="admin-list">
        {bookings.map((booking) => (
          <article key={booking.id} className="booking-card">
            <div className="booking-head">
              <h3>{booking.full_name}</h3>
              <span className={`status ${booking.status}`}>{booking.status}</span>
            </div>

            <p><strong>Data:</strong> {new Date(booking.booking_date).toLocaleDateString('it-IT')}</p>
            <p><strong>Fascia:</strong> {booking.slot_label} ({booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)})</p>
            <p><strong>Partecipanti:</strong> {booking.participants}</p>
            <p><strong>Noleggi:</strong> {booking.rental_count || 0}</p>
            <p><strong>Email:</strong> {booking.email}</p>
            <p><strong>Telefono:</strong> {booking.phone}</p>
            {booking.notes && <p><strong>Note:</strong> {booking.notes}</p>}

            <div className="status-actions">
              <button onClick={() => handleStatusChange(booking.id, 'confermata')}>✓ Conferma</button>
              <button onClick={() => handleStatusChange(booking.id, 'annullata')}>✕ Annulla</button>
              <button onClick={() => handleStatusChange(booking.id, 'in_attesa')}>↺ Reset</button>
              <button
                onClick={() => handleDelete(booking.id)}
                style={{ background: '#5b2929', color: '#f3f5f7' }}
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