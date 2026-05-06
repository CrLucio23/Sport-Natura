import { Link } from "react-router-dom";

export default function ChiSiamoPage() {
  return (
    <div className="container">
      {/* hero */}
      <div className="page-hero">
        <div className="eyebrow">La nostra storia</div>
        <h1 className="page-title">
          Passione,
          <br />
          Tattica,
          <br />
          Natura.
        </h1>
        <p className="page-lead">
          Dal 1992, l'ASD Sport&Natura Softair Team è un punto di riferimento
          per la comunità softair campana. Non siamo solo un campo — siamo una
          famiglia unita dalla stessa passione.
        </p>
      </div>

      {/* grid */}
      <div className="about-grid">
        <div className="about-text">
          <h3>La Nostra Associazione</h3>
          <p>
            Nati nel 1992 come piccolo gruppo di appassionati, siamo cresciuti
            fino a diventare una delle ASD più attive della Campania. Il nostro
            campo, immerso nel bosco del Monte Faito, offre scenari tattici
            unici e un'esperienza outdoor autentica.
          </p>
          <p>
            Siamo affiliati alla F.I.G.T. – C.S.E.N, garantendo ai nostri
            associati e ospiti le massime coperture assicurative e il rispetto
            di tutti gli standard di sicurezza nazionali.
          </p>
          <p>
            Chiunque è il benvenuto: dall'assoluto principiante a chi ha anni di
            esperienza sul campo. Il nostro staff di arbitri e istruttori
            accreditati sarà al tuo fianco per rendere ogni sessione memorabile.
          </p>
        </div>

        {/* griglia valori */}
        <div className="values-grid">
          <div className="value-cell">
            <span className="value-icon">🎯</span>
            <div className="value-title">Sicurezza prima</div>
            <p className="value-body">
              Protocolli rigorosi, equipaggiamento certificato e personale
              formato per ogni sessione.
            </p>
          </div>
          <div className="value-cell">
            <span className="value-icon">🌲</span>
            <div className="value-title">Ambiente unico</div>
            <p className="value-body">
              Oltre 1150 m² di bosco naturale — un campo che cambia ad ogni
              stagione.
            </p>
          </div>
          <div className="value-cell">
            <span className="value-icon">🤝</span>
            <div className="value-title">Spirito di squadra</div>
            <p className="value-body">
              Il softair insegna problem solving, comunicazione e fiducia
              reciproca sul campo.
            </p>
          </div>
          <div className="value-cell">
            <span className="value-icon">🏅</span>
            <div className="value-title">30+ anni di storia</div>
            <p className="value-body">
              Un'esperienza consolidata al servizio di ogni giocatore,
              amatoriale o agonista.
            </p>
          </div>
        </div>
      </div>

      {/* citazione */}
      <div className="quote-block">
        <blockquote>
          "Non siamo una squadra, siamo fratelli. Ci aiutiamo, ci sorreggiamo a
          vicenda, uniti con un obiettivo preciso: vincere divertendoci."
        </blockquote>
        <cite>— Lo spirito di Sport&Natura</cite>
      </div>

      {/* cosa offriamo */}
      <div style={{ marginBottom: "4rem" }}>
        <div className="eyebrow" style={{ marginBottom: "2rem" }}>
          Cosa offriamo
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1px",
            background: "var(--border)",
            border: "1px solid var(--border)",
          }}
        >
          {[
            {
              icon: "🗓",
              title: "Sessioni Pubbliche",
              desc: "Domeniche mattina (08:00–12:00). Massimo 6 persone. Prenotazione online.",
            },
            {
              icon: "⚙️",
              title: "Noleggio Attrezzatura",
              desc: "Replica ASG, occhiali balistici e paradenti",
            },
            {
              icon: "🛡",
              title: "Copertura Assicurativa",
              desc: "Polizza F.I.G.T. inclusa: morte, invalidità permanente, RSM, diaria.",
            },
            {
              icon: "📸",
              title: "Foto & Video",
              desc: "Documentazione fotografica delle sessioni disponibile su richiesta.",
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="value-cell">
              <span className="value-icon">{icon}</span>
              <div className="value-title">{title}</div>
              <p className="value-body">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="about-cta">
        <h3>Pronto a scendere in campo?</h3>
        <p>
          Prenota la tua sessione e vivi un'esperienza fuori dall'ordinario
          immerso nella natura del Monte Faito.
        </p>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link className="button primary" to="/prenota">
            Prenota ora
          </Link>
          <Link className="button secondary" to="/contatti">
            Contattaci
          </Link>
        </div>
      </div>
    </div>
  );
}
