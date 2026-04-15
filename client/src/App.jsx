import { NavLink, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>Sport<span style={{ color: '#7ba36f' }}>&</span>Natura</h1>
          <p className="subtitle">Campo Softair – Prenota la tua sessione</p>
        </div>

        <nav>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/prenota">Prenota</NavLink>
          <NavLink to="/admin">Admin</NavLink>
        </nav>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/prenota" element={<BookingPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
    </div>
  );
}