import express from 'express';
import {
  registerShelter, getShelterById, updateShelter, getShelters, verifyShelter,
} from '../controllers/shelterController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getShelters);
router.get('/:id', getShelterById);
router.post('/', protect, authorize('shelter'), registerShelter);
router.put('/:id', protect, authorize('shelter', 'admin'), updateShelter);
router.put('/:id/verify', protect, authorize('admin'), verifyShelter);

export default router;
