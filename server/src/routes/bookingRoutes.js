import { Router } from 'express';
import {
  createBooking,
  getAdminBookings,
  getSlots,
  getMonthAvailability,
  updateBookingStatus,
  deleteBooking,
  getClosedDates,
  toggleClosedDate
} from '../controllers/bookingController.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { upload } from '../config/upload.js';

// Dichiara prima il router
const router = Router();

// Definisci le rotte
router.get('/admin/closed-dates', adminAuth, getClosedDates);
router.post('/admin/closed-dates', adminAuth, toggleClosedDate);
router.delete('/admin/bookings/:id', adminAuth, deleteBooking);
router.get('/slots', getSlots);
router.get('/availability', getMonthAvailability);
router.post('/bookings', upload.none(), createBooking);
router.get('/admin/bookings', adminAuth, getAdminBookings);
router.patch('/admin/bookings/:id/status', adminAuth, updateBookingStatus);

export default router;