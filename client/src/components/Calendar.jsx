import { useEffect, useState } from "react";
import { fetchMonthAvailability } from "../services/api.js";

const DAYS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
const MONTHS = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];

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
        setAvailability(data.availability || {});
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [viewYear, viewMonth]);

  function prevMonth() {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  }

  function toIso(day) {
    return `${viewYear}-${String(viewMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function isPast(day) {
    const todayStr = today.toISOString().slice(0, 10);
    return toIso(day) < todayStr;
  }

  // FIX: usa T12:00:00Z per evitare problemi di fuso orario
  function isSunday(day) {
    return new Date(toIso(day) + "T12:00:00Z").getUTCDay() === 0;
  }

  function getStatus(day) {
    return availability[toIso(day)] || null;
  }

  // FIX PRINCIPALE: isDisabled usato nel render, non la vecchia variabile "past"
  function isDisabled(day) {
    const s = getStatus(day);
    return isPast(day) || !isSunday(day) || s === "closed" || s === "full";
  }

  function cellStyle(day) {
    const iso = toIso(day);
    const selected = selectedDate === iso;
    const disabled = isDisabled(day);
    const status = getStatus(day);

    if (selected)
      return {
        background: "var(--accent)",
        color: "var(--black)",
        border: "2px solid var(--accent)",
        fontWeight: 700,
      };

    let bg = "rgba(58,80,52,0.35)"; // disponibile (domenica libera)
    if (!isSunday(day)) bg = "transparent"; // non domenica
    if (status === "partial") bg = "rgba(140,110,40,0.4)"; // giallo ocra
    if (status === "full") bg = "rgba(140,50,50,0.5)"; // rosso
    if (status === "closed") bg = "rgba(90,40,90,0.45)"; // viola scuro

    return {
      background: bg,
      color: "var(--text)",
      border: "1px solid transparent",
      fontWeight: 400,
      opacity: disabled ? 0.28 : 1,
      cursor: disabled ? "not-allowed" : "pointer",
    };
  }

  function buildDays() {
    const firstDay = new Date(viewYear, viewMonth - 1, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }

  const cells = buildDays();

  return (
    <div className="cal-wrap">
      {/* navigazione mese */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <button
          className="button secondary"
          onClick={prevMonth}
          style={{ padding: "0.35rem 0.75rem" }}
        >
          ‹
        </button>
        <span
          style={{
            fontFamily: "Rajdhani, sans-serif",
            fontWeight: 700,
            letterSpacing: "0.1em",
            fontSize: "0.95rem",
            textTransform: "uppercase",
          }}
        >
          {MONTHS[viewMonth - 1]} {viewYear}
        </span>
        <button
          className="button secondary"
          onClick={nextMonth}
          style={{ padding: "0.35rem 0.75rem" }}
        >
          ›
        </button>
      </div>

      {/* intestazione giorni */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          gap: 3,
          marginBottom: 3,
        }}
      >
        {DAYS.map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              fontSize: "0.68rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--fog)",
              padding: "0.3rem 0",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* griglia giorni */}
      {loading ? (
        <p
          style={{
            textAlign: "center",
            opacity: 0.5,
            padding: "1rem 0",
            fontSize: "0.85rem",
            letterSpacing: "0.1em",
          }}
        >
          CARICAMENTO...
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7,1fr)",
            gap: 3,
          }}
        >
          {cells.map((day, i) => {
            if (!day) return <div key={`e-${i}`} />;

            const iso = toIso(day);
            const status = getStatus(day);
            const disabled = isDisabled(day);
            const sty = cellStyle(day);

            return (
              <button
                key={iso}
                disabled={disabled}
                onClick={() => !disabled && onSelectDate(iso)}
                title={
                  status === "closed"
                    ? "Data chiusa"
                    : status === "full"
                      ? "Completo"
                      : status === "partial"
                        ? "Parzialmente disponibile"
                        : ""
                }
                style={{
                  ...sty,
                  borderRadius: 3,
                  padding: "0.55rem 0",
                  fontSize: "0.88rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  transition: "opacity 0.15s",
                }}
              >
                {day}
                {status === "closed" && (
                  <span style={{ fontSize: "0.5rem", lineHeight: 1 }}>🔒</span>
                )}
                {status === "full" && (
                  <span style={{ fontSize: "0.5rem", lineHeight: 1 }}>●</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* legenda */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginTop: "1rem",
          flexWrap: "wrap",
        }}
      >
        {[
          { color: "rgba(58,80,52,0.7)", label: "Disponibile" },
          { color: "rgba(140,110,40,0.6)", label: "Parziale" },
          { color: "rgba(140,50,50,0.7)", label: "Completo" },
          { color: "rgba(90,40,90,0.6)", label: "Chiusa" },
        ].map(({ color, label }) => (
          <div
            key={label}
            style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: color,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: "0.68rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--fog)",
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
