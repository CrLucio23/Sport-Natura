import { NavLink, Route, Routes, Link } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import ChiSiamoPage from "./pages/ChiSiamoPage.jsx";
import ContattiPage from "./pages/ContattiPage.jsx";

export default function App() {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <header className="topbar">
        {/* brand — solo img, nessun figlio che sia un <a> */}
        <Link to="/" className="topbar-brand">
          <img src="/logo.png" alt="Sport&Natura" style={{ height: 48 }} />
        </Link>

        {/* nav — fratello del brand, non figlio */}
        <nav>
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/chi-siamo">Chi Siamo</NavLink>
          <NavLink to="/contatti">Contatti</NavLink>
          <NavLink to="/prenota" className="nav-cta">
            Prenota
          </NavLink>
        </nav>
      </header>

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chi-siamo" element={<ChiSiamoPage />} />
          <Route path="/contatti" element={<ContattiPage />} />
          <Route path="/prenota" element={<BookingPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>

      <footer>
        <div className="footer-inner">
          <div>
            <div className="footer-brand-name">
              Sport<em>&</em>Natura
            </div>
            <p className="footer-desc">
              Associazione Sportiva Dilettantistica – Softair Team dal 1992.
              Campo immerso nella natura sul Monte Faito, Napoli.
            </p>
            <div className="footer-socials">
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noreferrer"
                className="social-link"
                title="Instagram"
              >
                📷
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noreferrer"
                className="social-link"
                title="Facebook"
              >
                📘
              </a>
              <a
                href="https://www.tiktok.com"
                target="_blank"
                rel="noreferrer"
                className="social-link"
                title="TikTok"
              >
                🎵
              </a>
              <a
                href="https://wa.me/39"
                target="_blank"
                rel="noreferrer"
                className="social-link"
                title="WhatsApp"
              >
                💬
              </a>
            </div>
          </div>

          <div>
            <div className="footer-col-title">Naviga</div>
            <div className="footer-links">
              <Link to="/">Home</Link>
              <Link to="/chi-siamo">Chi Siamo</Link>
              <Link to="/prenota">Prenota</Link>
              <Link to="/contatti">Contatti</Link>
              <Link to="/admin">Area Admin</Link>
            </div>
          </div>

          <div>
            <div className="footer-col-title">Contatti</div>
            <div className="footer-links">
              <a href="mailto:info@sportnatura.it">info@sportnatura.it</a>
              <a href="tel:+39">+39 — — — — — —</a>
              <span style={{ color: "var(--text-dim)", fontSize: "0.88rem" }}>
                Piazzale dei Capi
                <br />
                Vico Equense (NA) 80069
              </span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} ASD Sport&Natura Softair Team — C.F.
            90023640635
          </span>
          <span>P.IVA / Privacy</span>
        </div>
      </footer>
    </div>
  );
}
