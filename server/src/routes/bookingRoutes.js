import { Router } from 'express';
import {
  createBooking,
  getAdminBookings,
  getSlots,
  getMonthAvailability,
  updateBookingStatus
} from '../controllers/bookingController.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { upload } from '../config/upload.js';

const router = Router();

router.get('/slots', getSlots);
router.get('/availability', getMonthAvailability);
router.post('/bookings', upload.none(), createBooking);router.get('/admin/bookings', adminAuth, getAdminBookings);
router.patch('/admin/bookings/:id/status', adminAuth, updateBookingStatus);

export default router;