import express from 'express';
import {
  getStats,
  getAllUsers,
  adminDeleteUser,
  getAllShelters,
  adminDeleteShelter,
  getAllPuppies,
  adminDeletePuppy,
  getAllStories,
  adminDeleteStory,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin role
router.use(protect, authorize('admin'));

router.get('/stats',            getStats);

router.get('/users',            getAllUsers);
router.delete('/users/:id',     adminDeleteUser);

router.get('/shelters',         getAllShelters);
router.delete('/shelters/:id',  adminDeleteShelter);

router.get('/puppies',          getAllPuppies);
router.delete('/puppies/:id',   adminDeletePuppy);

router.get('/stories',          getAllStories);
router.delete('/stories/:id',   adminDeleteStory);

export default router;



// import express from 'express';
// import {
//   getStats,
//   getAllUsers,
//   getAllPuppies,
//   adminDeletePuppy,
// } from '../controllers/adminController.js';
// import { protect, authorize } from '../middleware/auth.js';

// const router = express.Router();

// // All routes here require admin role
// router.use(protect, authorize('admin'));

// router.get('/stats',         getStats);
// router.get('/users',         getAllUsers);
// router.get('/puppies',       getAllPuppies);
// router.delete('/puppies/:id', adminDeletePuppy);

// export default router;
