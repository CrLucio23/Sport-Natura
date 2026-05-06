import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <>
      <div className="hero-wrapper">
        <div className="hero-main">
          {/* contenuto sinistro */}
          <div className="hero-content">
            <div className="hero-eyebrow">
              Campo Softair · Monte Faito, Napoli
            </div>
            <h1 className="hero-title">
              Vivi
              <br />
              l'Adrenalina
              <br />
              <em>in Natura</em>
            </h1>
            <p className="hero-body">
              Sessioni di gioco nel cuore del bosco. Attrezzatura certificata,
              scenari tattici unici. Un'esperienza che va oltre il gioco.
            </p>
            <div className="hero-actions">
              <Link className="button primary" to="/prenota">
                Prenota ora
              </Link>
              <Link className="button secondary" to="/chi-siamo">
                Chi siamo
              </Link>
            </div>
          </div>

          {/* pannello destro con statistiche */}
          <div className="hero-panel">
            <div className="hero-stats">
              <div className="stat-cell">
                <div className="stat-number">30+</div>
                <div className="stat-label">Anni di attività</div>
              </div>
              <div className="stat-cell">
                <div className="stat-number">1150M</div>
                <div className="stat-label">m² di campo</div>
              </div>
              <div className="stat-cell">
                <div className="stat-number">100%</div>
                <div className="stat-label">Outdoor</div>
              </div>
              <div className="stat-cell">
                <div className="stat-number">F.I.G.T</div>
                <div className="stat-label">Affiliazione</div>
                <div className="stat-number">C.S.E.N.</div>
                <div className="stat-label">Affiliazione</div>
              </div>
            </div>
          </div>
        </div>

        {/* strip in basso */}
        <div className="hero-strip">
          <div className="strip-item">
            <span className="strip-icon">🎯</span>
            <div className="strip-title">Sessioni Private</div>
            <p className="strip-body">
              Prenota l'intera domenica mattina per te o per il tuo gruppo
            </p>
          </div>
          <div className="strip-item">
            <span className="strip-icon">⚙️</span>
            <div className="strip-title">Noleggio Attrezzatura</div>
            <p className="strip-body">
              Tutto il necessario disponibile sul posto — vieni anche senza
              nulla, pensiamo a tutto noi.
            </p>
          </div>
          <div className="strip-item">
            <span className="strip-icon">📩</span>
            <div className="strip-title">Conferma via Email</div>
            <p className="strip-body">
              Ricevi riepilogo e scarico di responsabilità direttamente nella
              tua casella mail.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
