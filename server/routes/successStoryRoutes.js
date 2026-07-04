import express from 'express';
import {
  getSuccessStories,
  createSuccessStory,
  deleteSuccessStory,
} from '../controllers/successStoryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/',       getSuccessStories);
router.post('/',      protect, authorize('shelter'), createSuccessStory);
router.delete('/:id', protect, authorize('shelter', 'admin'), deleteSuccessStory);

export default router;
