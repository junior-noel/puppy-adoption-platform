import express from 'express';
import {
  createApplication, getMyApplications, getShelterApplications, updateApplicationStatus,
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('adopter'), createApplication);
router.get('/mine', protect, authorize('adopter'), getMyApplications);
router.get('/shelter', protect, authorize('shelter'), getShelterApplications);
router.put('/:id/status', protect, authorize('shelter'), updateApplicationStatus);

export default router;
