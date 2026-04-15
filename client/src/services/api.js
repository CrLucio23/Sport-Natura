const API_URL = 'http://localhost:4000/api';

export async function login(username, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Errore login');
  return data;
}

export async function fetchSlots(date) {
  const response = await fetch(`${API_URL}/slots?date=${date}`);
  if (!response.ok) throw new Error('Errore nel caricamento slot');
  return response.json();
}

export async function createBooking(formData) {
  const response = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    body: formData   // niente headers, il browser imposta multipart automaticamente
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Errore prenotazione');
  return data;
}

function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
}

export async function fetchAdminBookings(token) {
  const response = await fetch(`${API_URL}/admin/bookings`, {
    headers: authHeaders(token)
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Errore caricamento admin');
  return data;
}

export async function updateBookingStatus(id, status, token) {
  const response = await fetch(`${API_URL}/admin/bookings/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ status })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Errore aggiornamento stato');
  return data;
}

export async function fetchMonthAvailability(year, month) {
  const response = await fetch(`${API_URL}/availability?year=${year}&month=${month}`);
  if (!response.ok) throw new Error('Errore nel caricamento disponibilità');
  return response.json();
}