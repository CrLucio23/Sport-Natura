import { useState } from 'react';
import { login, fetchAdminBookings, updateBookingStatus } from '../services/api.js';

export default function AdminPage() {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('admin_token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

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

  if (!isLoggedIn) {
    return (
      <section className="panel" style={{ maxWidth: 400, margin: '4rem auto' }}>
        <h2>Login admin</h2>
        <form onSubmit={handleLogin}>
          <div className="field-group">
            <label>Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="field-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button className="button primary" type="submit">Accedi</button>
        </form>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="admin-toolbar">
        <h2 style={{ margin: 0 }}>Area admin</h2>
        <div style={{ display: 'flex', gap: '0.75rem', marginLeft: 'auto' }}>
          <button className="button primary" onClick={loadBookings}>
            Carica prenotazioni
          </button>
          <button className="button secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

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

            <p><strong>Data:</strong> {booking.booking_date}</p>
            <p><strong>Fascia:</strong> {booking.slot_label} ({booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)})</p>
            <p><strong>Partecipanti:</strong> {booking.participants}</p>
            <p><strong>Email:</strong> {booking.email}</p>
            <p><strong>Telefono:</strong> {booking.phone}</p>
            <p><strong>Noleggio:</strong> {booking.rental_needed ? 'Sì' : 'No'}</p>
            {booking.notes && (
              <p><strong>Note:</strong> {booking.notes}</p>
            )}

            {/* ← QUI il link alla liberatoria, solo se è stata caricata */}
            {booking.liberatoria_path && (
              <p>
                <strong>Liberatoria:</strong>{' '}
                
                 <a href={`http://localhost:4000/${booking.liberatoria_path.replace(/\\/g, '/')}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#7ba36f' }}
                >
                  Scarica PDF
                </a>
              </p>
            )}

            <div className="status-actions">
              <button onClick={() => handleStatusChange(booking.id, 'confermata')}>Conferma</button>
              <button onClick={() => handleStatusChange(booking.id, 'annullata')}>Annulla</button>
              <button onClick={() => handleStatusChange(booking.id, 'in_attesa')}>Reset</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}