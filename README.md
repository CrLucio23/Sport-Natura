# Sport & Natura

## Stack
- Frontend: React + Vite + React Router
- Backend: Node.js + Express
- Database: PostgreSQL
- Tooling: pgAdmin, Git

## Funzioni incluse
- Home page in stile dark/militare
- Pagina prenotazione campo
- Form per richieste ospiti
- Area admin base per vedere le prenotazioni
- API Express pronte
- Script SQL per creare database e dati demo

## Struttura
- `client/` frontend React
- `server/` backend Express
- `database/` script SQL

## Avvio backend
```bash
cd server
npm install
npm run dev
```

## Avvio frontend
```bash
cd client
npm install
npm run dev
```

Il frontend parte di default su `http://localhost:5173` e usa il backend su `http://localhost:4000`.

## API principali
- `GET /api/health`
- `GET /api/slots?date=2026-04-20`
- `POST /api/bookings`
- `GET /api/admin/bookings`
- `PATCH /api/admin/bookings/:id/status`

## Header admin
Per le chiamate admin usa l'header:

```http
x-admin-token: ***supersegreto***
```

## Idee per step successivi
- Ridifinizione area ADMIN
- Generazione messaggio wz alla conferma/rifiuto della prenotazion
- Generazione pdf migliore 
- Area Utente
- Eliminazioni prenotazioni dopo 15 gg 
- Stile avanzato
