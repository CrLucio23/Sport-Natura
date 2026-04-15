import jwt from 'jsonwebtoken';

export function adminAuth(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token mancante' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
} catch (err) {
  console.log('JWT error:', err.message);
  return res.status(401).json({ message: 'Token non valido o scaduto' });
}
}