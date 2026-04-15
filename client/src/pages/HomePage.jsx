import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <section className="hero">
      <div className="hero-card">
        <span className="badge">Campo Softair</span>
        <h2>Vivi l'esperienza Sport<span style={{ color: '#7ba36f' }}>&</span>Natura</h2>
        <p>
          Prenota sessioni private, gestisci il tuo gruppo e organizza partite
          indimenticabili nel nostro campo immerso nella natura.
        </p>

        <div className="actions">
          <Link className="button primary" to="/prenota">
            Prenota ora
          </Link>
          <Link className="button secondary" to="/admin">
            Area admin
          </Link>
        </div>
      </div>

      <div className="grid-info">
        <article className="info-card">
          <h3>⚙️ Attrezzatura</h3>
          <p>Noleggio disponibile su richiesta — vieni anche senza nulla.</p>
        </article>
        <article className="info-card">
          <h3>📩 Conferma via email</h3>
          <p>Ricevi subito un riepilogo della prenotazione nella tua casella.</p>
        </article>
      </div>
    </section>
  );
}