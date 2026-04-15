import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import bookingRoutes from './routes/bookingRoutes.js';
import { pool } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));


const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, message: 'Server e database raggiungibili' });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Database non raggiungibile' });
  }
});

app.use('/api', bookingRoutes);
app.use('/api', authRoutes);

app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});
