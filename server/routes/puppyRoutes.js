import express from 'express';
import {
  getPuppies, getPuppyById, createPuppy, updatePuppy, deletePuppy, getMyShelterPuppies,
} from '../controllers/puppyController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getPuppies);
router.get('/mine', protect, authorize('shelter'), getMyShelterPuppies);
router.get('/:id', getPuppyById);
router.post('/', protect, authorize('shelter'), createPuppy);
router.put('/:id', protect, authorize('shelter', 'admin'), updatePuppy);
router.delete('/:id', protect, authorize('shelter', 'admin'), deletePuppy);

export default router;
