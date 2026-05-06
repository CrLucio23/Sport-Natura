import { Link } from "react-router-dom";

export default function ContattiPage() {
  return (
    <div className="container">
      <div className="page-hero">
        <div className="eyebrow">Dove siamo · Come contattarci</div>
        <h1 className="page-title">Contatti</h1>
        <p className="page-lead">
          Hai domande sulle sessioni, sull'attrezzatura? Scrivici o chiamaci —
          risponderemo al più presto.
        </p>
      </div>

      <div className="contacts-grid">
        {/* blocco contatti */}
        <div className="contact-block">
          <div className="contact-item">
            <div className="contact-icon">📍</div>
            <div>
              <div className="contact-label">Indirizzo</div>
              <p className="contact-value">
                Piazzale dei CApi
                <br />
                Vico Equense (NA) — 80069
                <br />
                <span style={{ opacity: 0.65, fontSize: "0.9rem" }}>
                  Campo: Monte Faito, Napoli
                </span>
              </p>
            </div>
          </div>

          <div className="contact-item">
            <div className="contact-icon">✉️</div>
            <div>
              <div className="contact-label">Email</div>
              <p className="contact-value">
                <a href="mailto:info@sportnatura.it">info@sportnatura.it</a>
              </p>
            </div>
          </div>

          <div className="contact-item">
            <div className="contact-icon">📞</div>
            <div>
              <div className="contact-label">Telefono / WhatsApp</div>
              <p className="contact-value">
                <a href="tel:+39">+39 — — — — — —</a>
              </p>
            </div>
          </div>

          <div className="contact-item">
            <div className="contact-icon">🌐</div>
            <div>
              <div className="contact-label">Sito Web</div>
              <p className="contact-value">
                <a
                  href="http://www.sportnatura.it"
                  target="_blank"
                  rel="noreferrer"
                >
                  www.sportnatura.it
                </a>
              </p>
            </div>
          </div>

          {/* social */}
          <div className="socials-section">
            <div className="socials-title">Seguici sui social</div>
            <div className="socials-list">
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noreferrer"
                className="social-pill"
              >
                📷 Instagram
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noreferrer"
                className="social-pill"
              >
                📘 Facebook
              </a>
              <a
                href="https://www.tiktok.com"
                target="_blank"
                rel="noreferrer"
                className="social-pill"
              >
                🎵 TikTok
              </a>
              <a
                href="https://wa.me/39"
                target="_blank"
                rel="noreferrer"
                className="social-pill"
              >
                💬 WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* orari */}
        <div>
          <div className="orari-box">
            <h3>Orari Sessioni</h3>
            <div className="orario-row">
              <span className="orario-day">Lunedì – Sabato</span>
              <span className="orario-time">Chiuso</span>
            </div>
            <div className="orario-row">
              <span className="orario-day">Domenica</span>
              <span className="orario-time">08:00 – 12:00</span>
            </div>
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <div className="orari-box">
              <h3>Come raggiungerci</h3>
              <p
                style={{
                  fontFamily: "Crimson Pro, serif",
                  fontSize: "1rem",
                  lineHeight: "1.7",
                  color: "var(--mist)",
                  marginBottom: "0.75rem",
                }}
              >
                Il campo si trova sul Monte Faito, facilmente raggiungibile in
                auto dalla A3 Napoli–Salerno, uscita Castellammare di Stabia.
              </p>
              <p
                style={{
                  fontFamily: "Crimson Pro, serif",
                  fontSize: "0.92rem",
                  color: "var(--text-dim)",
                  lineHeight: "1.65",
                }}
              >
                È disponibile anche la funivia di Castellammare di Stabia per
                raggiungere la zona del Faito. (AL MOMENTO CHIUSA)
              </p>
            </div>
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <Link
              className="button primary"
              to="/prenota"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Prenota una sessione
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
