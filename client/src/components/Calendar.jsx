import { useEffect, useState } from 'react';
import { fetchMonthAvailability } from '../services/api.js';

const DAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
const MONTHS = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];

export default function Calendar({ selectedDate, onSelectDate }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchMonthAvailability(viewYear, viewMonth);
        setAvailability(data.availability);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [viewYear, viewMonth]);

  function prevMonth() {
    if (viewMonth === 1) { setViewMonth(12); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 12) { setViewMonth(1); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function buildDays() {
    const firstDay = new Date(viewYear, viewMonth - 1, 1);
    // lunedì = 0, domenica = 6
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }

  function toIso(day) {
    return `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function isPast(day) {
    return new Date(toIso(day)) < new Date(today.toISOString().slice(0, 10));
  }

  function isSunday(day) {
  return new Date(toIso(day)).getDay() === 0;
}

  function statusColor(day) {
    const key = toIso(day);
    const status = availability[key];
    if (status === 'full') return '#5b2929';
    if (status === 'partial') return '#544926';
    return '#294e2f';
  }

  const cells = buildDays();

  return (
    <div style={{ background: 'rgba(20,29,22,0.9)', border: '1px solid rgba(162,192,149,0.18)', borderRadius: 16, padding: '1.25rem' }}>
      {/* Header navigazione */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <button className="button secondary" onClick={prevMonth} style={{ padding: '0.4rem 0.8rem' }}>‹</button>
        <strong>{MONTHS[viewMonth - 1]} {viewYear}</strong>
        <button className="button secondary" onClick={nextMonth} style={{ padding: '0.4rem 0.8rem' }}>›</button>
      </div>

      {/* Intestazione giorni */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.8rem', opacity: 0.6, padding: '0.25rem 0' }}>{d}</div>
        ))}
      </div>

      {/* Griglia giorni */}
      {loading ? (
        <p style={{ textAlign: 'center', opacity: 0.6 }}>Caricamento...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;

            const iso = toIso(day);
          const past = isPast(day) || !isSunday(day);
            const selected = selectedDate === iso;

            return (
              <button
                key={iso}
                disabled={past}
                onClick={() => !past && onSelectDate(iso)}
                style={{
                  background: selected ? '#7ba36f' : statusColor(day),
                  color: selected ? '#081008' : '#f3f5f7',
                  border: selected ? '2px solid #7ba36f' : '1px solid transparent',
                  borderRadius: 8,
                  padding: '0.5rem 0',
                  cursor: past ? 'not-allowed' : 'pointer',
                  opacity: past ? 0.3 : 1,
                  fontWeight: selected ? 700 : 400,
                  fontSize: '0.9rem'
                }}
              >
                {day}
              </button>
            );
          })}
        </div>
      )}

      {/* Legenda */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.8rem', flexWrap: 'wrap' }}>
        {[
          { color: '#294e2f', label: 'Disponibile' },
          { color: '#544926', label: 'Parzialmente occupato' },
          { color: '#5b2929', label: 'Completo' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: color }} />
            <span style={{ opacity: 0.8 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}